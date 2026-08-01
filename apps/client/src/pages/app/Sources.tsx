import { Check, Minus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { EmptyPanel, ErrorPanel, TableSkeleton, usePageState } from "../../components/PageState";
import { Card } from "../../components/ui";
import { useSources } from "../../lib/queries";
import { useActiveBrand } from "./AppShell";

/** Cited-domains table: the "sales weapon" page for the call. */
export default function Sources(): JSX.Element {
  const { t } = useTranslation();
  const brand = useActiveBrand();
  const query = useSources(brand?.id);
  const sources = query.data;
  const { status, error, retry } = usePageState(query, {
    isEmpty: !sources || sources.length === 0,
    disabled: !brand,
  });

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <h1 className="text-lg font-semibold tracking-tight">{t("dashboard.sources.title")}</h1>
      <p className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-sub">
        {t("dashboard.sources.insight")}
      </p>

      {status === "loading" && <TableSkeleton rows={6} />}
      {status === "error" && <ErrorPanel error={error} onRetry={retry} />}
      {status === "empty" && (
        <EmptyPanel title={t("states.emptyTitle")} hint={t("dashboard.sources.empty")} />
      )}
      {status === "ready" && sources && (
      <Card className="overflow-x-auto">
        {(
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-sub">
                <th className="px-5 py-3 font-medium">{t("dashboard.sources.colDomain")}</th>
                <th className="px-2 py-3 font-medium">{t("dashboard.sources.colCitations")}</th>
                <th className="px-5 py-3 text-right font-medium">
                  {t("dashboard.sources.colMentionsUs")}
                </th>
              </tr>
            </thead>
            <tbody>
              {sources.map((source) => (
                <tr key={source.domain} className="border-b border-line last:border-b-0">
                  <td className="px-5 py-3 font-medium">{source.domain}</td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-28 rounded-full bg-base">
                        <div
                          className="h-1.5 rounded-full bg-ink/30"
                          style={{
                            width: `${Math.min(100, (source.citations / (sources[0]?.citations || 1)) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-sub">{source.citations}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {source.mentionsUs ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600">
                        <Check size={14} /> {t("dashboard.sources.yes")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-sub">
                        <Minus size={14} /> {t("dashboard.sources.no")}
                      </span>
                    )}
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
