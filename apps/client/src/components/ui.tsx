import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { Sentiment } from "@synapai/shared";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <div className={`rounded-2xl border border-line bg-surface ${className}`}>{children}</div>
  );
}

export function Skeleton({ className = "" }: { className?: string }): JSX.Element {
  return <div className={`animate-pulse rounded-lg bg-line/60 ${className}`} />;
}

export function EmptyState({ title, hint }: { title: string; hint?: string }): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <p className="text-sm font-medium text-ink">{title}</p>
      {hint && <p className="max-w-sm text-sm text-sub">{hint}</p>}
    </div>
  );
}

export function DemoBadge(): JSX.Element {
  const { t } = useTranslation();
  return (
    <span className="rounded-full border border-line bg-surface px-2.5 py-0.5 text-[11px] text-sub">
      {t("common.demoBadge")}
    </span>
  );
}

export function TrendArrow({ value }: { value: number | null }): JSX.Element {
  if (value === null || Math.abs(value) < 0.05) {
    return <Minus size={14} className="inline text-sub" aria-label="0" />;
  }
  return value > 0 ? (
    <span className="inline-flex items-center gap-0.5 text-emerald-600">
      <ArrowUpRight size={14} />
      <span className="text-xs">{Math.abs(value)}</span>
    </span>
  ) : (
    <span className="inline-flex items-center gap-0.5 text-red-500">
      <ArrowDownRight size={14} />
      <span className="text-xs">{Math.abs(value)}</span>
    </span>
  );
}

const SENTIMENT_STYLES: Record<Sentiment, string> = {
  pos: "bg-emerald-50 text-emerald-700 border-emerald-200",
  neu: "bg-base text-sub border-line",
  neg: "bg-red-50 text-red-600 border-red-200",
  na: "bg-base text-sub border-line",
};

export function SentimentChip({ value }: { value: Sentiment }): JSX.Element {
  const { t } = useTranslation();
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[11px] ${SENTIMENT_STYLES[value]}`}>
      {t(`dashboard.answers.sentiment.${value}`)}
    </span>
  );
}

/** Wrap known brand names in the text with highlight marks. */
export function HighlightedText({
  text,
  names,
  usName,
}: {
  text: string;
  names: string[];
  usName: string;
}): JSX.Element {
  const unique = [...new Set(names.filter((n) => n.length >= 2))].sort(
    (a, b) => b.length - a.length,
  );
  if (unique.length === 0) return <>{text}</>;
  const pattern = new RegExp(
    `(${unique.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "giu",
  );
  const parts = text.split(pattern);
  const usLower = usName.toLowerCase();
  return (
    <>
      {parts.map((part, i) =>
        unique.some((n) => n.toLowerCase() === part.toLowerCase()) ? (
          <mark
            key={i}
            className={
              part.toLowerCase() === usLower
                ? "rounded bg-accent/15 px-0.5 font-semibold text-accent"
                : "rounded bg-amber-100 px-0.5 font-medium text-amber-800"
            }
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}
