import { useMutation } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import type { Market } from "@synapai/shared";
import BookCallButton from "../../components/BookCallButton";
import Logo from "../../components/Logo";
import { ApiError, apiPost } from "../../lib/api";
import { currentLocale } from "../../lib/i18n";
import {
  clearPendingBusiness,
  readPendingBusiness,
  skipOnboarding,
} from "../../lib/pendingBusiness";
import { useMe } from "../../lib/queries";

/**
 * §3: the first business. This replaces the deleted public scan page, so it is
 * only ever reached by an authenticated user, and it prefills whatever was
 * typed on the landing before sign-in.
 */
export default function Onboarding(): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pending = useRef(readPendingBusiness());
  const { data: me } = useMe();

  const [brandName, setBrandName] = useState(pending.current?.brandName ?? "");
  const [category, setCategory] = useState(pending.current?.category ?? "");
  const [city, setCity] = useState(pending.current?.city ?? "");
  const [market, setMarket] = useState<Market>(pending.current?.market ?? "kz");
  const [competitors, setCompetitors] = useState(pending.current?.competitors ?? "");
  // #5: the same business identity fields Settings collects, so the audit is
  // grounded in the full picture from the very first run.
  const [website, setWebsite] = useState(pending.current?.website ?? "");
  const [aliases, setAliases] = useState(pending.current?.aliases ?? "");
  const [error, setError] = useState<string | null>(null);

  const start = useMutation({
    mutationFn: () =>
      apiPost<{ scanId: string }>("/api/scan", {
        brandName: brandName.trim(),
        category: category.trim(),
        city: city.trim() || undefined,
        market,
        website: website.trim() || undefined,
        aliases: aliases
          .split(/[\n,]/)
          .map((a) => a.trim())
          .filter(Boolean)
          .slice(0, 20),
        competitors: competitors
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
          .slice(0, 5),
        locale: currentLocale(),
        idempotencyKey: crypto.randomUUID(),
      }),
    onSuccess: (data) => {
      clearPendingBusiness();
      navigate(`/scan/${data.scanId}`);
    },
    onError: (err) => {
      if (err instanceof ApiError && (err.code === "QUOTA_EXCEEDED" || err.code === "EMAIL_NOT_VERIFIED")) {
        setError(null); // handled by the global modals
      } else if (err instanceof ApiError && err.status === 429) {
        setError(t("landing.form.rateLimited"));
      } else {
        setError(t("common.error"));
      }
    },
  });

  const submit = (e: React.FormEvent): void => {
    e.preventDefault();
    setError(null);
    if (brandName.trim().length < 2 || category.trim().length < 2) {
      setError(t("landing.form.validation"));
      return;
    }
    start.mutate();
  };

  const inputCls =
    "h-12 w-full rounded-xl border border-line bg-base px-4 text-sm text-ink outline-none transition-colors placeholder:text-sub focus:border-ink";
  const labelCls = "mb-1.5 block text-xs text-sub";
  const scansLeft = me?.scansLeft ?? null;
  // #7/#8: the same allowance the backend enforces, so the form never invites
  // an audit that will be rejected.
  const blocked = me ? !me.canScan : false;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base px-4 py-12">
      <Link to="/" aria-label="SynapAI" className="mb-8">
        <Logo size={20} className="text-lg" />
      </Link>
      <div className="w-full max-w-2xl rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {t("onboarding.title")}
        </h1>
        <p className="mt-2 text-sm text-sub">{t("onboarding.subtitle")}</p>

        <form onSubmit={submit} className="mt-7">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-3">
              <label htmlFor="ob-brand" className={labelCls}>
                {t("landing.form.brandLabel")}
              </label>
              <input
                id="ob-brand"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder={t("landing.form.brandPlaceholder")}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="ob-category" className={labelCls}>
                {t("landing.form.categoryLabel")}
              </label>
              <input
                id="ob-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder={t("landing.form.categoryPlaceholder")}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="ob-city" className={labelCls}>
                {t("landing.form.cityLabel")}
              </label>
              <input
                id="ob-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={t("landing.form.cityPlaceholder")}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="ob-market" className={labelCls}>
                {t("landing.form.marketLabel")}
              </label>
              <div className="relative">
                <select
                  id="ob-market"
                  value={market}
                  onChange={(e) => setMarket(e.target.value as Market)}
                  className={`${inputCls} appearance-none pr-12`}
                >
                  <option value="kz">{t("landing.form.marketKz")}</option>
                  <option value="ru">{t("landing.form.marketRu")}</option>
                  <option value="global">{t("landing.form.marketGlobal")}</option>
                </select>
                <ChevronDown
                  size={16}
                  aria-hidden
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sub"
                />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="ob-website" className={labelCls}>
                {t("landing.form.websiteLabel")}
              </label>
              <input
                id="ob-website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder={t("landing.form.websitePlaceholder")}
                inputMode="url"
                className={inputCls}
              />
              <p className="mt-1 text-xs text-sub">{t("landing.form.websiteHint")}</p>
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="ob-aliases" className={labelCls}>
                {t("dashboard.settings.aliases")}
              </label>
              <input
                id="ob-aliases"
                value={aliases}
                onChange={(e) => setAliases(e.target.value)}
                placeholder={t("landing.form.aliasesPlaceholder")}
                className={inputCls}
              />
              <p className="mt-1 text-xs text-sub">{t("dashboard.settings.aliasesHint")}</p>
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="ob-competitors" className={labelCls}>
                {t("landing.form.competitorsLabel")}
              </label>
              <input
                id="ob-competitors"
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
            disabled={start.isPending || blocked}
            className="mt-5 flex min-h-[48px] w-full items-center justify-center rounded-full bg-ink px-6 text-sm font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {start.isPending ? t("landing.form.submitting") : t("onboarding.submit")}
          </button>
        </form>

        {/* #8: a permanent limit, never "comes back tomorrow". */}
        {blocked && (
          <div className="mt-4 rounded-xl border border-line bg-base p-4 text-center">
            <p className="text-sm text-ink">
              {me?.limitReason === "ip_limit" ? t("quota.ipBody") : t("quota.body")}
            </p>
            <div className="mt-3 flex justify-center">
              <BookCallButton source="dashboard" variant="primary" label={t("quota.cta")} />
            </div>
          </div>
        )}

        {/* §3: remaining free checks, hidden for admin and unlimited accounts. */}
        {!blocked && scansLeft !== null && (
          <p className="mt-4 text-center text-xs text-sub">
            {t("dashboard.scansLeft", { count: scansLeft })}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => {
          skipOnboarding();
          navigate("/app");
        }}
        className="mt-6 text-sm text-sub underline underline-offset-4 transition-colors hover:text-ink"
      >
        {t("onboarding.later")}
      </button>
    </div>
  );
}
