import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { SessionUserDto } from "@synapai/shared";
import BookCallButton, { useAppConfig } from "../components/BookCallButton";
import Logo from "../components/Logo";
import QuoteCarousel from "../components/QuoteCarousel";
import { PublicPageMetadata } from "../components/PageMetadata";
import { ApiError, apiPost } from "../lib/api";
import { currentLocale, localizedPath } from "../lib/i18n";

// Firebase is needed only after the sign-in page hydrates or the visitor acts.
// Keeping it behind this import avoids shipping the auth SDK with public pages.
const loadFirebase = () => import("../lib/firebaseClient");

/** Official multicolor Google "G" mark (inline SVG). */
function GoogleMark(): JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

export default function Login(): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const config = useAppConfig();
  const mock = config?.authMode === "mock";

  const [mode, setMode] = useState<"signin" | "signup">(
    params.get("mode") === "signup" ? "signup" : "signin",
  );
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const next = params.get("next") ?? "/app";
  // §2.2: sign-up needs 8+ characters and a matching confirmation.
  const passwordTooShort = mode === "signup" && password.length > 0 && password.length < 8;
  const mismatch = mode === "signup" && confirm.length > 0 && confirm !== password;

  const createSession = async (payload: { idToken?: string; email?: string }): Promise<void> => {
    const user = await apiPost<SessionUserDto>("/api/auth/session", {
      ...payload,
      locale: currentLocale(),
    });
    // §2.3: an unverified account goes to the verify screen, not the dashboard.
    // #9: admin accounts are exempt and go straight through.
    if (!user.emailVerified && user.role !== "admin") {
      navigate("/verify-email", { replace: true });
      return;
    }
    navigate(user.role === "admin" ? "/admin" : next);
  };

  const trySharedAdminSession = async (): Promise<boolean> => {
    try {
      const user = await apiPost<SessionUserDto>("/api/auth/admin-session", { email, password });
      navigate(user.role === "admin" ? "/admin" : next, { replace: true });
      return true;
    } catch (err) {
      // A missing/wrong shared credential is expected for ordinary Firebase
      // users. Rate limiting this optional gate must not block their login.
      if (
        err instanceof ApiError &&
        (err.code === "ADMIN_CREDENTIALS_INVALID" || err.status === 429)
      ) {
        return false;
      }
      throw err;
    }
  };

  // §2.1: finish a redirect-based Google sign-in when the page loads back.
  useEffect(() => {
    if (mock) return;
    void loadFirebase()
      .then((firebase) => firebase.consumeGoogleRedirect())
      .then((idToken) => {
        if (idToken) return createSession({ idToken });
        return undefined;
      })
      .catch((err) => void loadFirebase().then((firebase) => setErrorKey(firebase.authErrorKey(err))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mock]);

  const submit = async (): Promise<void> => {
    setErrorKey(null);
    if (mode === "signup" && password !== confirm) {
      setConfirmTouched(true);
      setErrorKey("auth.errors.passwordMismatch");
      return;
    }
    setBusy(true);
    try {
      if (mock) {
        await createSession({ email });
      } else {
        const firebase = await loadFirebase();
        if (mode === "signin" && (await trySharedAdminSession())) return;
        const idToken = mode === "signup"
          ? await firebase.firebaseEmailSignUp(email, password)
          : await firebase.firebaseEmailSignIn(email, password);
        await createSession({ idToken });
      }
    } catch (err) {
      setErrorKey(mock ? "auth.errors.generic" : (await loadFirebase()).authErrorKey(err));
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (): void => {
    setMode((m) => (m === "signin" ? "signup" : "signin"));
    setPassword("");
    setConfirm("");
    setConfirmTouched(false);
    setErrorKey(null);
  };

  const google = async (): Promise<void> => {
    setErrorKey(null);
    setBusy(true);
    try {
      const idToken = await (await loadFirebase()).firebaseGoogleSignIn();
      await createSession({ idToken });
    } catch (err) {
      setErrorKey((await loadFirebase()).authErrorKey(err));
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    "h-12 w-full rounded-xl border border-line bg-base px-4 text-sm text-ink outline-none transition-colors placeholder:text-sub focus:border-ink focus-visible:ring-2 focus-visible:ring-ink/20";

  return (
    <main className="grid min-h-screen bg-base text-ink lg:grid-cols-2">
      <PublicPageMetadata path="/login" locale={currentLocale()} />
      {/* Left: the auth card (§2.3) */}
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-[440px]">
          <Link to={localizedPath("/")} aria-label="Synap">
            <Logo size={20} className="text-lg" />
          </Link>
          <h1 className="mt-8 text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("auth.title")}
          </h1>
          <p className="mt-2 text-sm text-sub">{t("auth.subtitle")}</p>

          {!mock && (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => void google()}
                className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-full border border-line bg-white text-sm font-medium transition-colors hover:border-[#D4D4D4] focus-visible:ring-2 focus-visible:ring-ink/20 disabled:opacity-50"
              >
                <GoogleMark />
                {t("auth.google")}
              </button>
              <div className="mt-6 flex items-center gap-4 text-xs text-sub">
                <span className="h-px flex-1 bg-line" />
                {t("auth.or")}
                <span className="h-px flex-1 bg-line" />
              </div>
            </>
          )}

          <form
            className="mt-6 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              name="email"
              autoComplete="email"
              placeholder={t("common.emailPlaceholder")}
              aria-label={t("common.email")}
              className={inputCls}
            />
            {!mock && (
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                name="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                placeholder={t("auth.password")}
                aria-label={t("auth.password")}
                className={inputCls}
              />
            )}
            {!mock && mode === "signup" && (
              <>
                <input
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onBlur={() => setConfirmTouched(true)}
                  type="password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder={t("auth.confirmPassword")}
                  aria-label={t("auth.confirmPassword")}
                  className={inputCls}
                />
                {confirmTouched && mismatch && (
                  <p className="text-sm text-red-500">{t("auth.errors.passwordMismatch")}</p>
                )}
                <p className="text-xs text-sub">
                  {passwordTooShort ? t("auth.passwordTooShort") : t("auth.passwordHint")}
                </p>
              </>
            )}
            {mock && <p className="text-xs text-sub">{t("auth.mockHint")}</p>}
            {/* #12: a concise message only. The raw provider code goes to the
                development console, never to the interface. */}
            {errorKey && <p className="text-sm text-red-500">{t(errorKey)}</p>}
            <button
              type="submit"
              disabled={
                busy ||
                !email.includes("@") ||
                (!mock && password.length < (mode === "signup" ? 8 : 6)) ||
                (mode === "signup" && !mock && (confirm.length === 0 || mismatch))
              }
              className="h-12 w-full rounded-full bg-ink text-sm font-semibold text-white transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ink/40 disabled:opacity-40"
            >
              {mode === "signup" ? t("auth.signUp") : t("auth.signIn")}
            </button>
          </form>

          {!mock && (
            <button
              type="button"
              onClick={switchMode}
              className="mt-4 text-sm text-sub underline underline-offset-4 hover:text-ink"
            >
              {mode === "signin" ? t("auth.toggleToSignUp") : t("auth.toggleToSignIn")}
            </button>
          )}

          <div className="mt-8">
            <BookCallButton source="landing" variant="link" label={t("auth.bookCallLink")} />
          </div>
        </div>
      </div>

      {/* Right on desktop, stacked below the form on smaller screens: ONE
          carousel instance either way (§2). */}
      <div
        className="flex items-center justify-center bg-[#F4F4F4] px-4 py-12 sm:px-8 lg:px-6 lg:py-10 xl:px-10"
        style={{
          backgroundImage: "radial-gradient(rgba(0,0,0,0.07) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      >
        <QuoteCarousel />
      </div>
    </main>
  );
}
