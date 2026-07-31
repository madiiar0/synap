import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  type Auth,
} from "firebase/auth";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

export const firebaseConfigured = Boolean(
  config.apiKey && config.authDomain && config.projectId && config.appId,
);

let app: FirebaseApp | null = null;

function auth(): Auth {
  if (!app) {
    app = initializeApp({
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      appId: config.appId,
    });
  }
  return getAuth(app);
}

export async function firebaseEmailSignIn(email: string, password: string): Promise<string> {
  const cred = await signInWithEmailAndPassword(auth(), email, password);
  return cred.user.getIdToken();
}

export async function firebaseEmailSignUp(email: string, password: string): Promise<string> {
  const cred = await createUserWithEmailAndPassword(auth(), email, password);
  return cred.user.getIdToken();
}

/** Google popup with a redirect fallback when the popup is blocked (§2.2). */
export async function firebaseGoogleSignIn(): Promise<string> {
  const provider = new GoogleAuthProvider();
  try {
    const cred = await signInWithPopup(auth(), provider);
    return await cred.user.getIdToken();
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "auth/popup-blocked" || code === "auth/operation-not-supported-in-this-environment") {
      await signInWithRedirect(auth(), provider); // navigates away
      return new Promise<string>(() => undefined); // never resolves; page redirects
    }
    throw err;
  }
}

/** Map Firebase error codes to localized message keys (§2.2). */
export function authErrorKey(err: unknown): string {
  const code = (err as { code?: string }).code ?? "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "auth.errors.wrongPassword";
    case "auth/email-already-in-use":
      return "auth.errors.emailInUse";
    case "auth/weak-password":
      return "auth.errors.weakPassword";
    case "auth/invalid-email":
      return "auth.errors.invalidEmail";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "auth.errors.popupClosed";
    case "auth/popup-blocked":
      return "auth.errors.popupBlocked";
    case "auth/network-request-failed":
      return "auth.errors.network";
    default:
      return "auth.errors.generic";
  }
}
