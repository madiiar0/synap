import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { CompetitorRef, Locale, Market } from "@synapai/shared";
import { MAX_USER_COMPETITORS } from "@synapai/shared";
import { EmptyPanel } from "../../components/PageState";
import { Card } from "../../components/ui";
import { useSaveBrand } from "../../lib/queries";
import { setLocale } from "../../lib/i18n";
import { useActiveBrand } from "./AppShell";

export default function SettingsPage(): JSX.Element {
  const { t } = useTranslation();
  const brand = useActiveBrand();
  const save = useSaveBrand(brand?.id);

  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [market, setMarket] = useState<Market>("kz");
  const [aliases, setAliases] = useState("");
  const [competitors, setCompetitors] = useState<CompetitorRef[]>([]);
  const [locale, setLocaleState] = useState<Locale>("ru");

  useEffect(() => {
    if (!brand) return;
    setName(brand.name);
    setWebsite(brand.website ?? "");
    setCategory(brand.category);
    setCity(brand.city ?? "");
    setMarket(brand.market);
    setAliases(brand.aliases.join("\n"));
    setCompetitors(brand.competitors.filter((c) => !c.detected));
    setLocaleState(brand.locale ?? "ru");
  }, [brand]);

  // #3: with no business yet there is nothing loading, so show the same
  // first-audit empty state the other tabs use instead of a forever-skeleton.
  if (!brand) {
    return <EmptyPanel title={t("dashboard.empty.noScan")} hint={t("dashboard.empty.runFirst")} />;
  }

  const inputCls =
    "w-full rounded-xl border border-line bg-base px-4 py-2.5 text-sm outline-none focus:border-ink";
  const labelCls = "mb-1 block text-xs font-medium text-sub";

  const submit = (): void => {
    save.mutate({
      name: name.trim() || undefined,
      website: website.trim(),
      category: category.trim() || undefined,
      city: city.trim() || null,
      market,
      aliases: aliases
        .split("\n")
        .map((a) => a.trim())
        .filter(Boolean),
      competitors: competitors
        .filter((c) => c.name.trim().length >= 2)
        .slice(0, MAX_USER_COMPETITORS)
        .map((c) => ({ name: c.name.trim(), aliases: c.aliases })),
      locale,
    });
    setLocale(locale);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-lg font-semibold tracking-tight">{t("dashboard.settings.title")}</h1>
      <Card className="space-y-5 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>{t("landing.form.brandLabel")}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{t("landing.form.websiteLabel")}</label>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>{t("landing.form.categoryLabel")}</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>{t("landing.form.cityLabel")}</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{t("dashboard.settings.market")}</label>
            <select
              value={market}
              onChange={(e) => setMarket(e.target.value as Market)}
              className={inputCls}
            >
              <option value="kz">{t("landing.form.marketKz")}</option>
              <option value="ru">{t("landing.form.marketRu")}</option>
              <option value="global">{t("landing.form.marketGlobal")}</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>{t("dashboard.settings.locale")}</label>
            <select
              value={locale}
              onChange={(e) => setLocaleState(e.target.value as Locale)}
              className={inputCls}
            >
              <option value="ru">{t("common.langRu")}</option>
              <option value="en">{t("common.langEn")}</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>{t("dashboard.settings.aliases")}</label>
          <textarea
            value={aliases}
            onChange={(e) => setAliases(e.target.value)}
            rows={3}
            className={inputCls}
          />
          <p className="mt-1 text-xs text-sub">{t("dashboard.settings.aliasesHint")}</p>
        </div>

        <div>
          <label className={labelCls}>{t("dashboard.settings.competitors")}</label>
          <div className="space-y-2">
            {competitors.map((competitor, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  value={competitor.name}
                  placeholder={t("dashboard.settings.competitorName")}
                  onChange={(e) =>
                    setCompetitors((list) =>
                      list.map((c, i) => (i === index ? { ...c, name: e.target.value } : c)),
                    )
                  }
                  className={inputCls}
                />
                <button
                  type="button"
                  aria-label={t("dashboard.settings.removeCompetitor")}
                  onClick={() => setCompetitors((list) => list.filter((_, i) => i !== index))}
                  className="shrink-0 rounded-xl border border-line p-2.5 text-sub hover:text-red-500"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            {competitors.length < MAX_USER_COMPETITORS && (
              <button
                type="button"
                onClick={() => setCompetitors((list) => [...list, { name: "", aliases: [] }])}
                className="inline-flex items-center gap-1.5 text-sm text-accent"
              >
                <Plus size={14} />
                {t("dashboard.settings.addCompetitor")}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-line pt-4">
          <button
            type="button"
            disabled={save.isPending}
            onClick={submit}
            className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            {t("common.save")}
          </button>
          {save.isSuccess && <span className="text-sm text-emerald-600">{t("common.saved")}</span>}
          {save.isError && <span className="text-sm text-red-500">{t("common.error")}</span>}
        </div>
      </Card>
    </div>
  );
}
