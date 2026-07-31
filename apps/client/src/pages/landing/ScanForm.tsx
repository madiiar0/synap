import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type { Market } from "@synapai/shared";
import { ApiError, apiPost } from "../../lib/api";
import { currentLocale } from "../../lib/i18n";

/** The scan form — a single hairline card on the light /scan page. */
export default function ScanForm(): JSX.Element {
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
      setError(
        err instanceof ApiError && err.status === 429
          ? t("landing.form.rateLimited")
          : t("common.error"),
      );
    },
  });

  const submit = (e: React.FormEvent): void => {
    e.preventDefault();
    setError(null);
    if (brandName.trim().length < 2 || category.trim().length < 2) {
      setError(t("landing.form.validation"));
      return;
    }
    scan.mutate();
  };

  const inputCls =
    "w-full rounded-xl border border-line bg-base px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-sub focus:border-ink";
  const labelCls = "mb-1.5 block text-xs text-sub";

  return (
    <form
      id="scan-form"
      onSubmit={submit}
      className="mx-auto w-full max-w-2xl rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-3">
          <label className={labelCls}>{t("landing.form.brandLabel")}</label>
          <input
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder={t("landing.form.brandPlaceholder")}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>{t("landing.form.categoryLabel")}</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder={t("landing.form.categoryPlaceholder")}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>{t("landing.form.cityLabel")}</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={t("landing.form.cityPlaceholder")}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>{t("landing.form.marketLabel")}</label>
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
        <div className="sm:col-span-3">
          <label className={labelCls}>{t("landing.form.competitorsLabel")}</label>
          <input
            value={competitors}
            onChange={(e) => setCompetitors(e.target.value)}
            placeholder={t("landing.form.competitorsPlaceholder")}
            className={inputCls}
          />
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={scan.isPending}
        className="mt-5 w-full rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-50"
      >
        {scan.isPending ? t("landing.form.submitting") : t("landing.form.submit")}
      </button>
    </form>
  );
}
