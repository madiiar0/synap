import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { apiPost } from "../lib/api";
import { onEmailNotVerified } from "../lib/quotaModal";
import { useMe } from "../lib/queries";
import { currentLocale } from "../lib/i18n";

type State = "idle" | "sending" | "sent" | "checking" | "error";

/**
 * §5: the first scan requires a verified email. Opened centrally whenever the
 * API rejects with EMAIL_NOT_VERIFIED, so the user can resend the link and
 * confirm without leaving the page.
 */
export default function VerifyEmailModal(): JSX.Element | null {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: user } = useMe();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<State>("idle");

  useEffect(
    () =>
      onEmailNotVerified(() => {
        setState("idle");
        setOpen(true);
      }),
    [],
  );

  if (!open) return null;

  const resend = async (): Promise<void> => {
    setState("sending");
    try {
      await (await import("../lib/firebaseClient")).firebaseResendVerification();
      setState("sent");
    } catch {
      setState("error");
    }
  };

  const recheck = async (): Promise<void> => {
    setState("checking");
    try {
      // The verified flag lives in the ID token, so mint a fresh one and
      // hand it back to the server, which updates the account.
      const idToken = await (await import("../lib/firebaseClient")).firebaseRefreshIdToken();
      if (!idToken) {
        setState("error");
        return;
      }
      await apiPost("/api/auth/session", { idToken, locale: currentLocale() });
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      setOpen(false);
    } catch {
      setState("error");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="verify-title"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-line bg-surface p-8 shadow-xl">
        <button
          type="button"
          aria-label={t("verify.close")}
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 text-sub hover:text-ink"
        >
          <X size={20} />
        </button>
        <h2 id="verify-title" className="text-xl font-semibold tracking-tight">
          {t("verify.title")}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-sub">
          {t("verify.body", { email: user?.email ?? "" })}
        </p>
        {state === "sent" && <p className="mt-3 text-sm text-ink">{t("verify.resent")}</p>}
        {state === "error" && <p className="mt-3 text-sm text-ink">{t("verify.error")}</p>}
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            disabled={state === "checking"}
            onClick={() => void recheck()}
            className="rounded-full bg-ink px-6 py-3 text-center text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {t("verify.done")}
          </button>
          <button
            type="button"
            disabled={state === "sending"}
            onClick={() => void resend()}
            className="rounded-full border border-line bg-surface px-6 py-3 text-center text-sm font-medium text-ink transition-colors hover:border-[#D4D4D4] disabled:opacity-50"
          >
            {t("verify.resend")}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-sm text-sub underline underline-offset-4 hover:text-ink"
          >
            {t("verify.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
