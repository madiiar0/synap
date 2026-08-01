import { ChevronDown, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ENGINE_IDS, ENGINE_LABELS, PROMPT_INTENTS, type AnswerRowDto } from "@synapai/shared";
import EngineMark from "../../components/EngineMark";
import { EmptyPanel, ErrorPanel, TableSkeleton, usePageState } from "../../components/PageState";
import { Card, EmptyState, HighlightedText, SentimentChip } from "../../components/ui";
import { useAnswers, type AnswerFilterState } from "../../lib/queries";
import { useActiveBrand } from "./AppShell";

function AnswerRow({ row, brandName }: { row: AnswerRowDto; brandName: string }): JSX.Element {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const names = [brandName, ...row.extracted.brands.map((b) => b.name)];

  return (
    <div className="border-b border-line last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="grid w-full grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 text-left hover:bg-base/60"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">«{row.promptText}»</p>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-sub">
            <EngineMark engine={row.engine} size={12} />
            <span className="rounded-full border border-line px-1.5 py-0.5">
              {t(`dashboard.prompts.intent.${row.intent}`)}
            </span>
            <span className="uppercase">{row.language}</span>
            <span
              className={`rounded-full px-1.5 py-0.5 ${
                row.extracted.mentioned
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-500"
              }`}
            >
              {row.extracted.mentioned
                ? t("dashboard.answers.mentionedYes")
                : t("dashboard.answers.mentionedNo")}
            </span>
            {row.extracted.mentioned && <SentimentChip value={row.extracted.sentiment} />}
          </p>
        </div>
        <ChevronDown
          size={16}
          className={`text-sub transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="mx-4 mb-4 rounded-xl bg-base p-5">
          <p className="whitespace-pre-line text-sm leading-relaxed">
            <HighlightedText text={row.rawAnswer} names={names} usName={brandName} />
          </p>
          {row.citations.length > 0 && (
            <div className="mt-4 border-t border-line pt-3">
              <p className="mb-2 text-xs font-semibold text-sub">
                {t("dashboard.answers.citations")}
              </p>
              <div className="flex flex-wrap gap-2">
                {row.citations.map((citation) => (
                  <a
                    key={citation.url}
                    href={citation.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1 text-xs text-sub hover:text-ink"
                  >
                    <ExternalLink size={11} />
                    {citation.domain}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Answers(): JSX.Element {
  const { t } = useTranslation();
  const brand = useActiveBrand();
  const [filters, setFilters] = useState<AnswerFilterState>({});
  const query = useAnswers(brand?.id, filters);
  const answers = query.data;
  // An active filter that matches nothing is not the same as "no scan yet":
  // only the unfiltered empty result should offer to run a check.
  const filtered = Object.values(filters).some(Boolean);
  const { status, error, retry } = usePageState(query, {
    isEmpty: !answers || answers.length === 0,
    disabled: !brand,
  });

  const selectCls =
    "rounded-xl border border-line bg-surface px-3 py-1.5 text-sm outline-none";

  const set = (key: keyof AnswerFilterState) => (e: React.ChangeEvent<HTMLSelectElement>) =>
    setFilters((f) => ({ ...f, [key]: e.target.value || undefined }));

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex flex-wrap gap-2">
        <select value={filters.engine ?? ""} onChange={set("engine")} className={selectCls}>
          <option value="">{t("dashboard.answers.filterEngine")}: {t("dashboard.answers.all")}</option>
          {ENGINE_IDS.map((id) => (
            <option key={id} value={id}>
              {ENGINE_LABELS[id]}
            </option>
          ))}
        </select>
        <select value={filters.language ?? ""} onChange={set("language")} className={selectCls}>
          <option value="">{t("dashboard.answers.filterLanguage")}: {t("dashboard.answers.all")}</option>
          <option value="ru">RU</option>
          <option value="en">EN</option>
        </select>
        <select value={filters.intent ?? ""} onChange={set("intent")} className={selectCls}>
          <option value="">{t("dashboard.answers.filterIntent")}: {t("dashboard.answers.all")}</option>
          {PROMPT_INTENTS.map((intent) => (
            <option key={intent} value={intent}>
              {t(`dashboard.prompts.intent.${intent}`)}
            </option>
          ))}
        </select>
        <select value={filters.mentioned ?? ""} onChange={set("mentioned")} className={selectCls}>
          <option value="">{t("dashboard.answers.filterMentioned")}: {t("dashboard.answers.all")}</option>
          <option value="true">{t("dashboard.answers.mentionedYes")}</option>
          <option value="false">{t("dashboard.answers.mentionedNo")}</option>
        </select>
      </div>

      {status === "loading" && <TableSkeleton rows={6} />}
      {status === "error" && <ErrorPanel error={error} onRetry={retry} />}
      {status === "empty" &&
        (filtered ? (
          <Card>
            <EmptyState title={t("dashboard.answers.empty")} />
          </Card>
        ) : (
          <EmptyPanel title={t("states.emptyTitle")} hint={t("states.emptyAnswers")} />
        ))}
      {status === "ready" && answers && brand && (
      <Card>
        {answers.map((row) => <AnswerRow key={row.id} row={row} brandName={brand.name} />)}
      </Card>
      )}
    </div>
  );
}
