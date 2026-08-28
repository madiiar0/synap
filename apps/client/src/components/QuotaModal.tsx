import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import BookCallButton from "./BookCallButton";
import { onQuotaExceeded } from "../lib/quotaModal";

/**
 * §6.4 end-of-trial modal: no prices, no plans, no payment anything.
 * Book a call is the only conversion action.
 */
export default function QuotaModal(): JSX.Element | null {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  useEffect(
    () =>
      onQuotaExceeded(() => {
        setOpen(true);
        // The scans-left chip reads the session; refresh it so it shows 0.
        void queryClient.invalidateQueries({ queryKey: ["me"] });
      }),
    [queryClient],
  );

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quota-title"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-line bg-surface p-8 shadow-xl">
        <button
          type="button"
          aria-label={t("quota.close")}
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 text-sub hover:text-ink"
        >
          <X size={20} />
        </button>
        <h2 id="quota-title" className="text-xl font-semibold tracking-tight">
          {t("quota.title")}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-sub">{t("quota.body")}</p>
        <div className="mt-6 flex flex-col gap-3">
          <BookCallButton source="dashboard" variant="primary" label={t("quota.cta")} />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-sm text-sub underline underline-offset-4 hover:text-ink"
          >
            {t("quota.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
