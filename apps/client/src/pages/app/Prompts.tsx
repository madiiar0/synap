import { useTranslation } from "react-i18next";
import { ENGINE_LABELS } from "@synapai/shared";
import { Card, EmptyState, Skeleton } from "../../components/ui";
import { usePrompts, useTogglePrompt } from "../../lib/queries";
import { useActiveBrand } from "./AppShell";

export default function Prompts(): JSX.Element {
  const { t } = useTranslation();
  const brand = useActiveBrand();
  const { data: prompts, isLoading } = usePrompts(brand?.id);
  const toggle = useTogglePrompt(brand?.id);

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{t("dashboard.prompts.title")}</h1>
        <p className="mt-1 text-sm text-sub">{t("dashboard.prompts.disableHint")}</p>
      </div>

      <Card>
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !prompts || prompts.length === 0 ? (
          <EmptyState title={t("dashboard.empty.noScan")} />
        ) : (
          prompts.map((prompt) => (
            <div
              key={prompt.promptId}
              className={`flex items-center justify-between gap-4 border-b border-line px-4 py-3 last:border-b-0 ${
                prompt.disabled ? "opacity-50" : ""
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm">«{prompt.text}»</p>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-sub">
                  <span className="rounded-full border border-line px-1.5 py-0.5">
                    {t(`dashboard.prompts.intent.${prompt.intent}`)}
                  </span>
                  <span className="uppercase">{prompt.language}</span>
                  {prompt.engines.map((engine) => (
                    <span
                      key={engine.engine}
                      title={ENGINE_LABELS[engine.engine]}
                      className={`inline-block h-2 w-2 rounded-full ${
                        engine.failed
                          ? "bg-line"
                          : engine.mentioned
                            ? "bg-emerald-500"
                            : "bg-red-300"
                      }`}
                    />
                  ))}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={!prompt.disabled}
                disabled={toggle.isPending}
                onClick={() =>
                  toggle.mutate({ promptId: prompt.promptId, disabled: !prompt.disabled })
                }
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  prompt.disabled ? "bg-line" : "bg-accent"
                }`}
              >
                <span
                  className={`absolute left-0 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    prompt.disabled ? "translate-x-0.5" : "translate-x-[22px]"
                  }`}
                />
                <span className="sr-only">
                  {prompt.disabled ? t("dashboard.prompts.disabled") : t("dashboard.prompts.enabled")}
                </span>
              </button>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
