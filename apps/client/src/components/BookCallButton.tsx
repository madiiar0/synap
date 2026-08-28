import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { apiGet, apiPost, type AppConfig } from "../lib/api";
import type { LeadSource } from "@synapai/shared";
import { trackPublicEvent } from "../lib/publicAnalytics";

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

const WHATSAPP_BOOKING_NUMBER = "77757138329";

export function useAppConfig(): AppConfig | undefined {
  const { data } = useQuery({
    queryKey: ["config"],
    queryFn: () => apiGet<AppConfig>("/api/config"),
    staleTime: Infinity,
  });
  return data;
}

/** The product's single conversion action: open a prefilled WhatsApp chat. */
export default function BookCallButton({
  source,
  scanId,
  brandName,
  variant = "primary",
  label,
  className = "",
}: BookCallButtonProps): JSX.Element {
  const { t } = useTranslation();
  const message = t("bookCall.whatsappMessage");
  const whatsappUrl = `https://wa.me/${WHATSAPP_BOOKING_NUMBER}?text=${encodeURIComponent(message)}`;

  const handleClick = (): void => {
    trackPublicEvent("contact_intent");
    void apiPost("/api/leads", {
      opened: true,
      source,
      scanId,
      brandName,
      message,
    }).catch(() => undefined);
  };

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 py-3 text-sm font-semibold transition-colors ${VARIANT_CLASSES[variant]} ${className}`}
    >
      <MessageCircle size={16} aria-hidden />
      {label ?? t("bookCall.button")}
    </a>
  );
}
