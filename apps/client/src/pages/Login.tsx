import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { SessionUserDto } from "@synapai/shared";
import BookCallButton, { useAppConfig } from "../components/BookCallButton";
import Logo from "../components/Logo";
import QuoteCarousel from "../components/QuoteCarousel";
import { apiPost } from "../lib/api";
import {
  authErrorKey,
  firebaseEmailSignIn,
  firebaseEmailSignUp,
  firebaseGoogleSignIn,
} from "../lib/firebaseClient";
import { currentLocale, localizedPath } from "../lib/i18n";

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

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const next = params.get("next") ?? "/app";

  const createSession = async (payload: { idToken?: string; email?: string }): Promise<void> => {
    const user = await apiPost<SessionUserDto>("/api/auth/session", {
      ...payload,
      locale: currentLocale(),
    });
    navigate(user.role === "admin" ? "/admin" : next);
  };

  const submit = async (): Promise<void> => {
    setErrorKey(null);
    setBusy(true);
    try {
      if (mock) {
        await createSession({ email });
      } else {
        const idToken =
          mode === "signup"
            ? await firebaseEmailSignUp(email, password)
            : await firebaseEmailSignIn(email, password);
        await createSession({ idToken });
      }
    } catch (err) {
      setErrorKey(mock ? "auth.errors.generic" : authErrorKey(err));
    } finally {
      setBusy(false);
    }
  };

  const google = async (): Promise<void> => {
    setErrorKey(null);
    setBusy(true);
    try {
      const idToken = await firebaseGoogleSignIn();
      await createSession({ idToken });
    } catch (err) {
      setErrorKey(authErrorKey(err));
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    "h-12 w-full rounded-xl border border-line bg-base px-4 text-sm text-ink outline-none transition-colors placeholder:text-sub focus:border-ink focus-visible:ring-2 focus-visible:ring-ink/20";

  return (
    <div className="grid min-h-screen bg-base text-ink lg:grid-cols-2">
      {/* Left: the auth card (§2.3) */}
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-[440px]">
          <Link to={localizedPath("/")} aria-label="SynapAI">
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
            {mock && <p className="text-xs text-sub">{t("auth.mockHint")}</p>}
            {errorKey && <p className="text-sm text-red-500">{t(errorKey)}</p>}
            <button
              type="submit"
              disabled={busy || !email.includes("@") || (!mock && password.length < 6)}
              className="h-12 w-full rounded-full bg-ink text-sm font-semibold text-white transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ink/40 disabled:opacity-40"
            >
              {mode === "signup" ? t("auth.signUp") : t("auth.signIn")}
            </button>
          </form>

          {!mock && (
            <button
              type="button"
              onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
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

      {/* Right: quote panel (hidden below lg, §2.3) */}
      <div
        className="hidden items-center justify-center bg-[#F4F4F4] px-10 lg:flex"
        style={{
          backgroundImage: "radial-gradient(rgba(0,0,0,0.07) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      >
        <QuoteCarousel />
      </div>
    </div>
  );
}
