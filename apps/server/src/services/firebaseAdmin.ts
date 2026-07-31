import { env } from "../config/env.js";
import { AppError } from "../lib/errors.js";

export interface VerifiedIdentity {
  firebaseUid: string;
  email: string;
  name?: string;
  photoUrl?: string;
}

let appPromise: Promise<typeof import("firebase-admin/auth")> | null = null;
let initialized = false;

async function getAdminAuth(): Promise<typeof import("firebase-admin/auth")> {
  if (!appPromise) {
    appPromise = (async () => {
      const { initializeApp, cert, applicationDefault } = await import("firebase-admin/app");
      const authModule = await import("firebase-admin/auth");
      if (!initialized) {
        if (env.FIREBASE_SERVICE_ACCOUNT_JSON) {
          const json = JSON.parse(
            Buffer.from(env.FIREBASE_SERVICE_ACCOUNT_JSON, "base64").toString("utf8"),
          ) as Record<string, string>;
          initializeApp({ credential: cert(json) });
        } else {
          // GOOGLE_APPLICATION_CREDENTIALS path
          initializeApp({ credential: applicationDefault() });
        }
        initialized = true;
      }
      return authModule;
    })();
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
  };
}
