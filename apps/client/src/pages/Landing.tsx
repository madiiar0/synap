import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import type { Market } from "@synapai/shared";
import BookCallButton from "../components/BookCallButton";
import { ApiError, apiPost } from "../lib/api";
import { currentLocale, setLocale } from "../lib/i18n";

/** P1 minimal landing: nav + dark hero + inline scan form. Full §12 design lands in P3. */
export default function Landing(): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [brandName, setBrandName] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [market, setMarket] = useState<Market>("kz");
  const [competitors, setCompetitors] = useState("");
  const [error, setError] = useState<string | null>(null);

  const scan = useMutation({
    mutationFn: () =>
      apiPost<{ scanId: string }>("/api/public/scan", {
        brandName,
        category,
        city: city || undefined,
        market,
        competitors: competitors
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
          .slice(0, 5),
        locale: currentLocale(),
      }),
    onSuccess: (data) => navigate(`/scan/${data.scanId}`),
    onError: (err) => {
      if (err instanceof ApiError && err.status === 429) {
        setError(t("landing.form.rateLimited"));
      } else {
        setError(t("common.error"));
      }
    },
  });

  const submit = (): void => {
    setError(null);
    if (brandName.trim().length < 2 || category.trim().length < 2) {
      setError(t("landing.form.validation"));
      return;
    }
    scan.mutate();
  };

  const inputCls =
    "w-full rounded-xl border border-darkline bg-black/40 px-4 py-3 text-sm text-darktext outline-none placeholder:text-sub focus:border-darktext";

  return (
    <div className="min-h-screen bg-dark text-darktext">
      <nav className="sticky top-0 z-40 border-b border-darkline bg-dark/80 backdrop-blur">
        <div className="mx-auto flex max-w-container items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-bold tracking-tight">
            {t("common.brand")}
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <button
              type="button"
              onClick={() => setLocale(currentLocale() === "ru" ? "en" : "ru")}
              className="text-sub hover:text-darktext"
            >
              {currentLocale() === "ru" ? "EN" : "RU"}
            </button>
            <Link to="/login" className="text-sub hover:text-darktext">
              {t("nav.login")}
            </Link>
            <a
              href="#scan-form"
              className="rounded-full bg-white px-5 py-2 font-semibold text-ink"
            >
              {t("nav.checkBrand")}
            </a>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-container px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            {t("landing.heroLine1")}
            <br />
            <span className="text-sub">ChatGPT · Claude · Gemini · Perplexity</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-sub">
            {t("landing.heroSub1")} {t("landing.heroSub2")}
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <a
              href="#scan-form"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink"
            >
              {t("landing.ctaCheckFree")}
            </a>
            <BookCallButton source="landing" variant="secondary" className="!border-darkline !text-darktext hover:!bg-black" />
          </div>
        </div>

        <div
          id="scan-form"
          className="mx-auto mt-16 max-w-xl rounded-2xl border border-darkline p-8"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs text-sub">{t("landing.form.brandLabel")}</label>
              <input
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder={t("landing.form.brandPlaceholder")}
                className={inputCls}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-sub">
                  {t("landing.form.categoryLabel")}
                </label>
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder={t("landing.form.categoryPlaceholder")}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-sub">{t("landing.form.cityLabel")}</label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={t("landing.form.cityPlaceholder")}
                  className={inputCls}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-sub">
                  {t("landing.form.marketLabel")}
                </label>
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
                <label className="mb-1 block text-xs text-sub">
                  {t("landing.form.competitorsLabel")}
                </label>
                <input
                  value={competitors}
                  onChange={(e) => setCompetitors(e.target.value)}
                  placeholder={t("landing.form.competitorsPlaceholder")}
                  className={inputCls}
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="button"
              disabled={scan.isPending}
              onClick={submit}
              className="w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink disabled:opacity-50"
            >
              {scan.isPending ? t("landing.form.submitting") : t("landing.form.submit")}
            </button>
          </div>
        </div>
      </main>

      <footer className="border-t border-darkline py-8 text-center text-xs text-sub">
        {t("common.trademarkNote")}
      </footer>
    </div>
  );
}
