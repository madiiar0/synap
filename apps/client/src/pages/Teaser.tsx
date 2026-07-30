import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { ENGINE_LABELS, type TeaserDto } from "@synapai/shared";
import BookCallButton from "../components/BookCallButton";
import { apiGet, apiPost } from "../lib/api";
import { currentLocale } from "../lib/i18n";

function ScoreRing({ value }: { value: number }): JSX.Element {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const filled = (value / 100) * circumference;
  return (
    <svg width="180" height="180" viewBox="0 0 180 180" role="img" aria-label={`${value}/100`}>
      <circle cx="90" cy="90" r={radius} fill="none" stroke="#E7E7E7" strokeWidth="10" />
      <circle
        cx="90"
        cy="90"
        r={radius}
        fill="none"
        stroke="#2563EB"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circumference - filled}`}
        transform="rotate(-90 90 90)"
      />
      <text
        x="90"
        y="98"
        textAnchor="middle"
        className="fill-ink"
        style={{ fontSize: "42px", fontWeight: 600, letterSpacing: "-0.02em" }}
      >
        {value}
      </text>
    </svg>
  );
}

export default function Teaser(): JSX.Element {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [email, setEmail] = useState("");

  const { data } = useQuery({
    queryKey: ["teaser", id],
    queryFn: () => apiGet<TeaserDto>(`/api/public/scan/${id}/teaser`),
    enabled: Boolean(id),
  });

  const unlock = useMutation({
    mutationFn: () =>
      apiPost(`/api/public/scan/${id}/unlock`, { email, locale: currentLocale() }),
  });

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sub">
        {t("common.loading")}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base">
      <main className="mx-auto max-w-3xl px-6 py-16">
        {data.demo && (
          <span className="mb-6 inline-block rounded-full border border-line bg-surface px-3 py-1 text-xs text-sub">
            {t("common.demoBadge")}
          </span>
        )}
        <div className="rounded-2xl border border-line bg-surface p-10 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">{t("teaser.title")}</h1>
          <p className="mt-1 text-sm text-sub">{data.brandName}</p>
          <div className="mt-6 flex justify-center">
            <ScoreRing value={data.overall} />
          </div>
          <p className="text-sm text-sub">{t("teaser.outOf")}</p>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {data.engines.map((engine) => (
              <div key={engine.engine} className="rounded-xl border border-line p-4">
                <p className="text-xs text-sub">{ENGINE_LABELS[engine.engine]}</p>
                <p className="mt-1 text-lg font-semibold">
                  {Math.round(engine.mentionRate * 100)}%
                </p>
                <div className="mt-2 h-1.5 w-full rounded bg-base">
                  <div
                    className="h-1.5 rounded bg-accent"
                    style={{ width: `${Math.round(engine.mentionRate * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-sm text-sub">
            {t("teaser.competitorsDetected", { count: data.competitorsDetected })}
          </p>

          {data.sampleAnswer && (
            <div className="mt-8 rounded-xl border border-line bg-base p-6 text-left">
              <p className="text-xs font-semibold text-sub">{t("teaser.sampleTitle")}</p>
              <p className="mt-1 text-xs text-sub">«{data.sampleAnswer.prompt}»</p>
              <p className="mt-3 select-none text-sm leading-relaxed text-ink blur-sm">
                {data.sampleAnswer.snippet}…
              </p>
              <p className="mt-2 text-xs text-sub">{t("teaser.lockedNote")}</p>
            </div>
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-line bg-surface p-8">
          {unlock.isSuccess ? (
            <p className="text-center text-sm">{t("teaser.unlockSent")}</p>
          ) : (
            <>
              <h2 className="text-lg font-semibold tracking-tight">{t("teaser.unlockTitle")}</h2>
              <p className="mt-1 text-sm text-sub">{t("teaser.unlockText")}</p>
              <div className="mt-4 flex gap-3">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("common.emailPlaceholder")}
                  type="email"
                  className="flex-1 rounded-xl border border-line bg-base px-4 py-3 text-sm outline-none focus:border-ink"
                />
                <button
                  type="button"
                  disabled={unlock.isPending || !email.includes("@")}
                  onClick={() => unlock.mutate()}
                  className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white disabled:opacity-40"
                >
                  {t("teaser.unlockButton")}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between rounded-2xl bg-dark p-8 text-darktext">
          <p className="max-w-sm text-sm">{t("teaser.bookBanner")}</p>
          <BookCallButton source="report" scanId={data.scanId} brandName={data.brandName} variant="dark" />
        </div>
      </main>
    </div>
  );
}
