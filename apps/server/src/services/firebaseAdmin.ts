import { env } from "../config/env.js";
import { AppError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";

export interface VerifiedIdentity {
  firebaseUid: string;
  email: string;
  name?: string;
  photoUrl?: string;
  emailVerified: boolean;
}

let appPromise: Promise<typeof import("firebase-admin/auth")> | null = null;

type ServiceAccountJson = Record<string, unknown>;

type FirebaseAdminInitFailure = {
  code:
    | "FIREBASE_SERVICE_ACCOUNT_INVALID"
    | "FIREBASE_SERVICE_ACCOUNT_INCOMPLETE"
    | "FIREBASE_PRIVATE_KEY_INVALID"
    | "FIREBASE_CREDENTIAL_INVALID"
    | "FIREBASE_ADMIN_INIT_FAILED";
  message: string;
};

/** Convert Firebase/Node initialization errors into a useful response without
 * returning the credential, private key, or provider error text to the client. */
export function classifyFirebaseAdminInitError(error: unknown): FirebaseAdminInitFailure {
  const providerCode =
    error && typeof error === "object" && "code" in error && typeof error.code === "string"
      ? error.code
      : "";
  const providerMessage = error instanceof Error ? error.message : "";
  const reason = `${providerCode} ${providerMessage}`.toLowerCase();

  if (reason.includes("valid json or base64-encoded json") || reason.includes("json object")) {
    return {
      code: "FIREBASE_SERVICE_ACCOUNT_INVALID",
      message: "Firebase service-account JSON is malformed",
    };
  }
  if (reason.includes("missing project_id, client_email, or private_key")) {
    return {
      code: "FIREBASE_SERVICE_ACCOUNT_INCOMPLETE",
      message: "Firebase service-account JSON is missing required fields",
    };
  }
  if (
    reason.includes("private key") ||
    reason.includes("private_key") ||
    reason.includes("pem") ||
    reason.includes("decoder") ||
    reason.includes("asn1") ||
    reason.includes("asn.1")
  ) {
    return {
      code: "FIREBASE_PRIVATE_KEY_INVALID",
      message: "Firebase service-account private key is invalid",
    };
  }
  if (
    reason.includes("credential") ||
    reason.includes("service account") ||
    reason.includes("project id") ||
    reason.includes("client email")
  ) {
    return {
      code: "FIREBASE_CREDENTIAL_INVALID",
      message: "Firebase service-account credential is invalid",
    };
  }
  return {
    code: "FIREBASE_ADMIN_INIT_FAILED",
    message: "Firebase Admin failed to initialize",
  };
}

function parsedJson(value: string): unknown {
  const parsed = JSON.parse(value) as unknown;
  return typeof parsed === "string" ? JSON.parse(parsed) as unknown : parsed;
}

/** Vercel supports multiline secrets, while local setup historically used a
 * one-line base64 value. Accept both without ever logging the credential. */
export function parseFirebaseServiceAccount(value: string): ServiceAccountJson {
  const trimmed = value.trim();
  let parsed: unknown;
  try {
    parsed = trimmed.startsWith("{") || trimmed.startsWith('"')
      ? parsedJson(trimmed)
      : parsedJson(Buffer.from(trimmed.replace(/\s/g, ""), "base64").toString("utf8"));
  } catch {
    throw new Error("Firebase service account must be valid JSON or base64-encoded JSON");
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Firebase service account must be a JSON object");
  }
  const account = parsed as ServiceAccountJson;
  const projectId = account.project_id ?? account.projectId;
  const clientEmail = account.client_email ?? account.clientEmail;
  const privateKey = account.private_key ?? account.privateKey;
  if (
    typeof projectId !== "string" ||
    typeof clientEmail !== "string" ||
    typeof privateKey !== "string"
  ) {
    throw new Error("Firebase service account is missing project_id, client_email, or private_key");
  }
  return account;
}

async function getAdminAuth(): Promise<typeof import("firebase-admin/auth")> {
  if (!appPromise) {
    appPromise = (async () => {
      const { initializeApp, cert, applicationDefault, getApps } = await import("firebase-admin/app");
      const authModule = await import("firebase-admin/auth");
      if (getApps().length === 0) {
        if (env.FIREBASE_SERVICE_ACCOUNT_JSON) {
          const json = parseFirebaseServiceAccount(env.FIREBASE_SERVICE_ACCOUNT_JSON);
          initializeApp({ credential: cert(json) });
        } else {
          // GOOGLE_APPLICATION_CREDENTIALS path
          initializeApp({ credential: applicationDefault() });
        }
      }
      return authModule;
    })().catch((error: unknown) => {
      // Do not permanently cache a rejected initialization in a warm function.
      appPromise = null;
      const failure = classifyFirebaseAdminInitError(error);
      logger.error(
        {
          category: failure.code,
          reason: error instanceof Error ? error.message : "unknown",
        },
        "firebase admin initialization failed",
      );
      throw new AppError(failure.code, 503, failure.message);
    });
  }
  return appPromise;
}

/** Verify a Firebase ID token and normalize the identity. */
export async function verifyFirebaseToken(idToken: string): Promise<VerifiedIdentity> {
  const { getAuth } = await getAdminAuth();
  const decoded = await getAuth()
    .verifyIdToken(idToken)
    .catch(() => {
      throw new AppError("INVALID_TOKEN", 401, "Invalid or expired sign-in token");
    });
  if (!decoded.email) {
    throw new AppError("EMAIL_REQUIRED", 400, "The account has no email");
  }
  return {
    firebaseUid: decoded.uid,
    email: decoded.email.toLowerCase(),
    name: typeof decoded.name === "string" ? decoded.name : undefined,
    photoUrl: typeof decoded.picture === "string" ? decoded.picture : undefined,
    emailVerified: decoded.email_verified === true,
  };
}
