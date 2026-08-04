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
      logger.error(
        { reason: error instanceof Error ? error.message : "unknown" },
        "firebase admin initialization failed",
      );
      throw new AppError(
        "AUTH_SERVICE_UNAVAILABLE",
        503,
        "Sign-in service is not configured correctly",
      );
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
