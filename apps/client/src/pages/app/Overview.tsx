import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ENGINE_IDS, type EngineId, type OverviewDto } from "@synapai/shared";
import BookCallButton from "../../components/BookCallButton";
import EngineMark from "../../components/EngineMark";
import ScoreRing from "../../components/ScoreRing";
import {
  EmptyPanel,
  ErrorPanel,
  OverviewSkeleton,
  usePageState,
} from "../../components/PageState";
import { Card, EmptyState, HighlightedText, Skeleton, TrendArrow } from "../../components/ui";
import { useAnswers, useOverview } from "../../lib/queries";
import { useActiveBrand } from "./AppShell";

function DeltaChip({ overview }: { overview: OverviewDto }): JSX.Element | null {
  const { t } = useTranslation();
  if (!overview.snapshot || !overview.previous) return null;
  const delta = overview.snapshot.overall - overview.previous.overall;
  const positive = delta >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ${
        positive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
      }`}
    >
      {positive ? "+" : ""}
      {delta} <span className="font-normal text-sub">{t("dashboard.delta")}</span>
    </span>
  );
}

function LoseRow({
  text,
  engine,
  competitorNames,
  answerId,
  brandName,
}: {
  text: string;
  engine: EngineId;
  competitorNames: string[];
  answerId: string;
  brandName: string;
}): JSX.Element {
  const brand = useActiveBrand();
  const [open, setOpen] = useState(false);
  const { data: answers } = useAnswers(open ? brand?.id : undefined, {});
  const answer = answers?.find((a) => a.id === answerId);

  return (
    <div className="border-b border-line last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-1 py-3 text-left"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">«{text}»</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-sub">
            <EngineMark engine={engine} size={12} />
            <span>·</span>
            <span className="truncate">{competitorNames.join(", ")}</span>
          </p>
        </div>
        <ChevronDown
          size={16}
          className={`shrink-0 text-sub transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="mb-3 rounded-xl bg-base p-4 text-sm leading-relaxed">
          {answer ? (
            <HighlightedText
              text={answer.rawAnswer}
              names={[brandName, ...competitorNames]}
              usName={brandName}
            />
          ) : (
            <Skeleton className="h-16 w-full" />
          )}
        </div>
      )}
    </div>
  );
}

export default function Overview(): JSX.Element {
  const { t } = useTranslation();
  const brand = useActiveBrand();
  const query = useOverview(brand?.id);
  const overview = query.data;
  const { status, error, retry } = usePageState(query, {
    isEmpty: !overview?.snapshot,
    disabled: !brand,
  });

  if (status === "loading") return <OverviewSkeleton />;
  if (status === "error") return <ErrorPanel error={error} onRetry={retry} />;
  // §3: a business with no completed scan lands here, so the first check is
  // the single prominent action.
  if (status === "empty" || !overview?.snapshot || !brand) {
    return (
      <EmptyPanel title={t("dashboard.empty.noScan")} hint={t("dashboard.empty.runFirst")} />
    );
  }

  const snapshot = overview.snapshot;
  const prevEngines = new Map(
    (overview.previous?.perEngine ?? []).map((e) => [e.engine, e.mentionRate]),
  );
  const totalSov = Math.max(...snapshot.shareOfVoice.map((e) => e.pct), 1);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Hero: score + engines */}
      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <Card className="flex flex-col items-center px-10 py-8">
          <p className="text-sm font-medium text-sub">{t("dashboard.score")}</p>
          <ScoreRing value={snapshot.overall} size={190} />
          <DeltaChip overview={overview} />
        </Card>
        {/* Engine cards: only measured engines show numbers; anything not
            queried in this scan shows a dash + "not checked" (§2.3). */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ENGINE_IDS.map((engineId) => {
            const queried = overview.scan.engines.includes(engineId);
            const entry = snapshot.perEngine.find((e) => e.engine === engineId);
            if (!queried || !entry) {
              return (
                <Card key={engineId} className="flex flex-col justify-between p-5 opacity-60">
                  <div className="flex items-center justify-between text-sm text-sub">
                    <EngineMark engine={engineId} size={15} />
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-semibold tracking-tight text-sub">-</p>
                    <p className="mt-0.5 text-xs text-sub">{t("dashboard.notChecked")}</p>
                  </div>
                </Card>
              );
            }
            const prev = prevEngines.get(engineId);
            const trend =
              prev !== undefined ? Math.round((entry.mentionRate - prev) * 1000) / 10 : null;
            return (
              <Card key={engineId} className="flex flex-col justify-between p-5">
                <div className="flex items-center justify-between text-sm text-sub">
                  <EngineMark engine={engineId} size={15} />
                  <TrendArrow value={trend} />
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-semibold tracking-tight">
                    {Math.round(entry.mentionRate * 100)}%
                  </p>
                  <p className="mt-0.5 text-xs text-sub">{t("dashboard.mentionRate")}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Share of voice */}
      <Card className="p-6">
        <h2 className="mb-4 text-sm font-semibold">{t("dashboard.shareOfVoice")}</h2>
        <div className="space-y-3">
          {snapshot.shareOfVoice.slice(0, 8).map((entry) => (
            <div key={entry.name} className="flex items-center gap-3">
              <div className="w-40 shrink-0 truncate text-sm">
                <span className={entry.isUs ? "font-semibold text-accent" : ""}>{entry.name}</span>
                {entry.isUs && (
                  <span className="ml-1.5 rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] text-accent">
                    {t("dashboard.usTag")}
                  </span>
                )}
                {entry.detected && (
                  <span className="ml-1.5 rounded-full border border-line px-1.5 py-0.5 text-[10px] text-sub">
                    {t("dashboard.detectedTag")}
                  </span>
                )}
              </div>
              <div className="h-2.5 flex-1 rounded-full bg-base">
                <div
                  className={`h-2.5 rounded-full ${entry.isUs ? "bg-accent" : "bg-ink/25"}`}
                  style={{ width: `${(entry.pct / totalSov) * 100}%` }}
                />
              </div>
              <span className="w-12 shrink-0 text-right text-sm text-sub">{entry.pct}%</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Where you lose */}
      <Card className="p-6">
        <h2 className="text-sm font-semibold">{t("dashboard.whereYouLose")}</h2>
        <p className="mb-2 text-xs text-sub">{t("dashboard.whereYouLoseText")}</p>
        {overview.losePrompts.length === 0 ? (
          <EmptyState title={t("common.notAvailable")} />
        ) : (
          overview.losePrompts.map((lose) => (
            <LoseRow
              key={`${lose.promptId}-${lose.engine}`}
              text={lose.text}
              engine={lose.engine}
              competitorNames={lose.competitorNames}
              answerId={lose.answerId}
              brandName={brand.name}
            />
          ))
        )}
      </Card>

      {/* Persistent book-a-call banner (CTA cards are the only dark surfaces) */}
      <div
        className="flex flex-col items-start justify-between gap-4 rounded-2xl p-8 text-darktext sm:flex-row sm:items-center"
        style={{
          background: "linear-gradient(105deg, #0A0A0A 0%, #141414 55%, #2A2A2A 100%)",
        }}
      >
        <p className="max-w-md text-sm leading-relaxed">{t("dashboard.bookBanner")}</p>
        <BookCallButton source="dashboard" brandName={brand.name} variant="dark" />
      </div>

      <p className="text-center text-[11px] text-sub">{t("common.trademarkNote")}</p>
    </div>
  );
}
