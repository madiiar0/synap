import { useQueryClient } from "@tanstack/react-query";
import { MailCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { apiPost } from "../lib/api";
import { currentLocale, localizedPath } from "../lib/i18n";
import {
  firebaseRefreshIdToken,
  firebaseResendVerification,
  firebaseSignOut,
} from "../lib/firebaseClient";
import { useMe } from "../lib/queries";
import { PrivatePageMetadata } from "../components/PageMetadata";

const RESEND_COOLDOWN_SECONDS = 60;

/**
 * §2.3: after sign-up the account exists but cannot scan until the address is
 * confirmed. Resend is rate limited to once a minute with a visible countdown.
 */
export default function VerifyEmail(): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: me } = useMe();

  const [cooldown, setCooldown] = useState(0);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<"sent" | "notYet" | "error" | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  // Already verified (for example a Google account): nothing to do here.
  useEffect(() => {
    if (me?.emailVerified) navigate("/app", { replace: true });
  }, [me?.emailVerified, navigate]);

  const resend = async (): Promise<void> => {
    if (cooldown > 0 || busy) return;
    setBusy(true);
    setNotice(null);
    try {
      await firebaseResendVerification();
      setNotice("sent");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch {
      setNotice("error");
    } finally {
      setBusy(false);
    }
  };

  const confirm = async (): Promise<void> => {
    setBusy(true);
    setNotice(null);
    try {
      const idToken = await firebaseRefreshIdToken();
      if (!idToken) {
        setNotice("error");
        return;
      }
      const user = await apiPost<{ emailVerified: boolean }>("/api/auth/session", {
        idToken,
        locale: currentLocale(),
      });
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      if (user.emailVerified) {
        navigate("/app", { replace: true });
      } else {
        setNotice("notYet");
      }
    } catch {
      setNotice("error");
    } finally {
      setBusy(false);
    }
  };

  const changeEmail = async (): Promise<void> => {
    await firebaseSignOut().catch(() => undefined);
    await apiPost("/api/auth/logout").catch(() => undefined);
    queryClient.clear();
    navigate(`${localizedPath("/login")}?mode=signup`, { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base px-4 py-12 text-ink">
      <PrivatePageMetadata title={t("verifyPage.title")} />
      <a href={localizedPath("/")} aria-label="Akrux" className="mb-8">
        <Logo size={20} className="text-lg" />
      </a>
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 text-center shadow-sm">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-base">
          <MailCheck size={22} aria-hidden />
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">{t("verifyPage.title")}</h1>
        <p className="mt-3 text-sm leading-relaxed text-sub">
          {t("verifyPage.body", { email: me?.email ?? "" })}
        </p>

        {notice === "sent" && <p className="mt-4 text-sm text-ink">{t("verify.resent")}</p>}
        {notice === "notYet" && <p className="mt-4 text-sm text-ink">{t("verifyPage.notYet")}</p>}
        {notice === "error" && <p className="mt-4 text-sm text-red-500">{t("verify.error")}</p>}

        <div className="mt-7 flex flex-col gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void confirm()}
            className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {t("verify.done")}
          </button>
          <button
            type="button"
            disabled={busy || cooldown > 0}
            onClick={() => void resend()}
            className="rounded-full border border-line bg-surface px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-[#D4D4D4] disabled:opacity-50"
          >
            {cooldown > 0
              ? t("verifyPage.resendIn", { seconds: cooldown })
              : t("verify.resend")}
          </button>
          <button
            type="button"
            onClick={() => void changeEmail()}
            className="text-sm text-sub underline underline-offset-4 transition-colors hover:text-ink"
          >
            {t("verifyPage.changeEmail")}
          </button>
        </div>
      </div>
    </div>
  );
}
