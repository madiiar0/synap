import { useQuery } from "@tanstack/react-query";
import { MessageCircle, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiGet, apiPost, type AppConfig } from "../lib/api";
import type { LeadSource } from "@synapai/shared";

interface BookCallButtonProps {
  source: LeadSource;
  scanId?: string;
  brandName?: string;
  variant?: "primary" | "secondary" | "dark" | "dark-outline" | "link";
  label?: string;
  className?: string;
}

const VARIANT_CLASSES: Record<NonNullable<BookCallButtonProps["variant"]>, string> = {
  primary: "bg-ink text-white hover:bg-black",
  secondary: "bg-surface border border-line text-ink hover:border-[#D4D4D4]",
  dark: "bg-white text-ink hover:bg-darktext",
  "dark-outline": "bg-transparent border border-darkline text-darktext hover:bg-white/5",
  link: "!px-0 !py-0 bg-transparent text-sub underline underline-offset-4 hover:text-ink !font-normal",
};

export function useAppConfig(): AppConfig | undefined {
  const { data } = useQuery({
    queryKey: ["config"],
    queryFn: () => apiGet<AppConfig>("/api/config"),
    staleTime: Infinity,
  });
  return data;
}

/**
 * The product's single conversion action. Every open is logged as a lead
 * (Calendly may complete off-site); the fallback form posts a full lead.
 */
export default function BookCallButton({
  source,
  scanId,
  brandName,
  variant = "primary",
  label,
  className = "",
}: BookCallButtonProps): JSX.Element {
  const { t } = useTranslation();
  const config = useAppConfig();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const phoneValid = phone.trim().length >= 5;

  const handleOpen = useCallback(() => {
    setOpen(true);
    // Log the click itself as a lead even if Calendly completes off-site.
    void apiPost("/api/leads", { opened: true, source, scanId, brandName }).catch(() => undefined);
  }, [source, scanId, brandName]);

  const submit = useCallback(async () => {
    if (phone.trim().length < 5) return;
    setSubmitting(true);
    setFailed(false);
    try {
      await apiPost("/api/leads", { name, phone, message, source, scanId, brandName });
      setSent(true);
    } catch {
      setFailed(true); // never fake success: the user can retry or use WhatsApp
    } finally {
      setSubmitting(false);
    }
  }, [name, phone, message, source, scanId, brandName]);

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={`rounded-full px-6 py-3 text-sm font-semibold transition-colors ${VARIANT_CLASSES[variant]} ${className}`}
      >
        {label ?? t("bookCall.button")}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-line bg-surface p-8 shadow-xl">
            <button
              type="button"
              aria-label={t("common.close")}
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 text-sub hover:text-ink"
            >
              <X size={20} />
            </button>

            {config?.calendlyUrl ? (
              <div>
                <h3 className="mb-4 text-xl font-semibold tracking-tight">{t("bookCall.title")}</h3>
                <iframe
                  title="Calendly"
                  src={config.calendlyUrl}
                  className="h-[560px] w-full rounded-xl border border-line"
                />
              </div>
            ) : sent ? (
              <div className="py-8 text-center">
                <h3 className="mb-2 text-xl font-semibold tracking-tight">
                  {t("bookCall.thanks")}
                </h3>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-semibold tracking-tight">{t("bookCall.title")}</h3>
                <p className="mb-6 mt-1 text-sm text-sub">{t("bookCall.subtitle")}</p>
                <div className="space-y-3">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("bookCall.name")}
                    className="w-full rounded-xl border border-line bg-base px-4 py-3 text-sm outline-none focus:border-ink"
                  />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t("bookCall.phone")}
                    className="w-full rounded-xl border border-line bg-base px-4 py-3 text-sm outline-none focus:border-ink"
                  />
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t("bookCall.comment")}
                    rows={3}
                    className="w-full rounded-xl border border-line bg-base px-4 py-3 text-sm outline-none focus:border-ink"
                  />
                  {failed && <p className="text-sm text-red-500">{t("common.error")}</p>}
                  <button
                    type="button"
                    disabled={submitting || !phoneValid}
                    onClick={() => void submit()}
                    className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-black disabled:opacity-40"
                  >
                    {t("bookCall.submit")}
                  </button>
                </div>
              </div>
            )}

            {config?.whatsappUrl && !sent && (
              <a
                href={config.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm text-sub hover:text-ink"
              >
                <MessageCircle size={16} />
                {t("bookCall.whatsapp")}
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}
