import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { EmptyPanel, ErrorPanel, TableSkeleton, usePageState } from "../../components/PageState";
import { Card, SentimentChip, TrendArrow } from "../../components/ui";
import { useCompetitors } from "../../lib/queries";
import { useActiveBrand } from "./AppShell";

/** Rankings-style leaderboard: Brand | Visibility % | Sentiment | Avg position | Trend. */
export default function Competitors(): JSX.Element {
  const { t } = useTranslation();
  const brand = useActiveBrand();
  const query = useCompetitors(brand?.id);
  const rows = query.data;
  const { status, error, retry } = usePageState(query, {
    isEmpty: !rows || rows.length === 0,
    disabled: !brand,
  });

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">
          {t("dashboard.competitors.title")}
        </h1>
        <Link
          to={brand ? `/app/settings` : "#"}
          className="rounded-full border border-line bg-surface px-4 py-1.5 text-sm"
        >
          {t("dashboard.competitors.edit")}
        </Link>
      </div>

      {status === "loading" && <TableSkeleton rows={5} />}
      {status === "error" && <ErrorPanel error={error} onRetry={retry} />}
      {status === "empty" && (
        <EmptyPanel title={t("states.emptyTitle")} hint={t("dashboard.competitors.empty")} />
      )}
      {/* §5: below md every row becomes a labelled card, so nothing scrolls sideways. */}
      {status === "ready" && rows && (
        <div className="space-y-3 md:hidden">
          {rows.map((row, index) => (
            <Card key={row.name} className={`p-4 ${row.isUs ? "bg-accent/5" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 break-words text-sm font-semibold">
                  <span className="mr-1.5 text-sub">{index + 1}.</span>
                  {row.name}
                </p>
                <TrendArrow value={row.trend} />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                <div>
                  <dt className="text-sub">{t("dashboard.competitors.colVisibility")}</dt>
                  <dd className="mt-0.5 font-medium">{Math.round(row.visibilityPct)}%</dd>
                </div>
                <div>
                  <dt className="text-sub">{t("dashboard.competitors.colPosition")}</dt>
                  <dd className="mt-0.5 font-medium">{row.avgPosition ?? "-"}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-sub">{t("dashboard.competitors.colSentiment")}</dt>
                  <dd className="mt-1">
                    <SentimentChip value={row.sentiment} />
                  </dd>
                </div>
              </dl>
            </Card>
          ))}
        </div>
      )}
      {status === "ready" && rows && (
      <Card className="hidden overflow-x-auto md:block">
        {(
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-sub">
                <th className="px-5 py-3 font-medium">#</th>
                <th className="px-2 py-3 font-medium">{t("dashboard.competitors.colBrand")}</th>
                <th className="px-2 py-3 font-medium">
                  {t("dashboard.competitors.colVisibility")}
                </th>
                <th className="px-2 py-3 font-medium">
                  {t("dashboard.competitors.colSentiment")}
                </th>
                <th className="px-2 py-3 font-medium">{t("dashboard.competitors.colPosition")}</th>
                <th className="px-5 py-3 text-right font-medium">
                  {t("dashboard.competitors.colTrend")}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.name}
                  className={`border-b border-line last:border-b-0 ${
                    row.isUs ? "bg-accent/5" : ""
                  }`}
                >
                  <td className="px-5 py-3 text-sub">{index + 1}</td>
                  <td className="px-2 py-3">
                    <span className={row.isUs ? "font-semibold text-accent" : "font-medium"}>
                      {row.name}
                    </span>
                    {row.isUs && (
                      <span className="ml-1.5 rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] text-accent">
                        {t("dashboard.usTag")}
                      </span>
                    )}
                    {row.detected && (
                      <span className="ml-1.5 rounded-full border border-line px-1.5 py-0.5 text-[10px] text-sub">
                        {t("dashboard.detectedTag")}
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 rounded-full bg-base">
                        <div
                          className={`h-1.5 rounded-full ${row.isUs ? "bg-accent" : "bg-ink/30"}`}
                          style={{ width: `${Math.min(100, row.visibilityPct)}%` }}
                        />
                      </div>
                      <span>{row.visibilityPct}%</span>
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <SentimentChip value={row.sentiment} />
                  </td>
                  <td className="px-2 py-3 text-sub">
                    {row.avgPosition ?? t("common.notAvailable")}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <TrendArrow value={row.trend} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
      )}
    </div>
  );
}
