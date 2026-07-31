import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type { Market, SessionUserDto } from "@synapai/shared";
import { ApiError, apiGet, apiPost } from "../../lib/api";
import { currentLocale, localizedPath } from "../../lib/i18n";

const STASH_KEY = "synapai_scan_stash";

interface ScanStash {
  brandName: string;
  category: string;
  city: string;
  market: Market;
  competitors: string;
  autoRun: boolean;
}

function readStash(): ScanStash | null {
  try {
    const raw = sessionStorage.getItem(STASH_KEY);
    return raw ? (JSON.parse(raw) as ScanStash) : null;
  } catch {
    return null;
  }
}

/**
 * §5.2: scanning requires an account. The form stashes its data through the
 * auth redirect (nothing is retyped) and auto-runs after sign-in.
 */
export default function ScanForm(): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const stash = useRef(readStash());
  const [brandName, setBrandName] = useState(stash.current?.brandName ?? "");
  const [category, setCategory] = useState(stash.current?.category ?? "");
  const [city, setCity] = useState(stash.current?.city ?? "");
  const [market, setMarket] = useState<Market>(stash.current?.market ?? "kz");
  const [competitors, setCompetitors] = useState(stash.current?.competitors ?? "");
  const [error, setError] = useState<string | null>(null);

  const { data: me, isFetched } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiGet<SessionUserDto>("/api/auth/me"),
    retry: false,
  });

  const scan = useMutation({
    mutationFn: (input: { brandName: string; category: string; city: string; market: Market; competitors: string }) =>
      apiPost<{ scanId: string }>("/api/scan", {
        brandName: input.brandName,
        category: input.category,
        city: input.city || undefined,
        market: input.market,
        competitors: input.competitors
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
          .slice(0, 5),
        locale: currentLocale(),
        idempotencyKey: crypto.randomUUID(),
      }),
    onSuccess: (data) => {
      sessionStorage.removeItem(STASH_KEY);
      navigate(`/scan/${data.scanId}`);
    },
    onError: (err) => {
      if (err instanceof ApiError && err.code === "QUOTA_EXCEEDED") {
        setError(null); // the global modal handles it
      } else if (err instanceof ApiError && err.status === 429) {
        setError(t("landing.form.rateLimited"));
      } else {
        setError(t("common.error"));
      }
    },
  });

  // After returning from sign-in with stashed data, run the scan once.
  const autoRan = useRef(false);
  useEffect(() => {
    const stashed = stash.current;
    if (!autoRan.current && isFetched && me && stashed?.autoRun && stashed.brandName) {
      autoRan.current = true;
      scan.mutate({
        brandName: stashed.brandName,
        category: stashed.category,
        city: stashed.city,
        market: stashed.market,
        competitors: stashed.competitors,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetched, me]);

  const submit = (e: React.FormEvent): void => {
    e.preventDefault();
    setError(null);
    if (brandName.trim().length < 2 || category.trim().length < 2) {
      setError(t("landing.form.validation"));
      return;
    }
    if (!me) {
      // Carry the form through the auth redirect (§5.2).
      const payload: ScanStash = { brandName, category, city, market, competitors, autoRun: true };
      sessionStorage.setItem(STASH_KEY, JSON.stringify(payload));
      navigate(`${localizedPath("/login")}?next=${encodeURIComponent(localizedPath("/scan"))}`);
      return;
    }
    scan.mutate({ brandName, category, city, market, competitors });
  };

  const inputCls =
    "h-12 w-full rounded-xl border border-line bg-base px-4 text-sm text-ink outline-none transition-colors placeholder:text-sub focus:border-ink";
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
          <div className="relative">
            <select
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
          <label className={labelCls}>{t("landing.form.competitorsLabel")}</label>
          <input
            value={competitors}
            onChange={(e) => setCompetitors(e.target.value)}
            placeholder={t("landing.form.competitorsPlaceholder")}
            className={inputCls}
          />
        </div>
      </div>
      {!me && isFetched && (
        <p className="mt-3 text-xs text-sub">{t("landing.scanPage.authNote")}</p>
      )}
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
