import {
  BarChart3,
  Globe2,
  LayoutDashboard,
  ListChecks,
  LogOut,
  MessageSquareText,
  RefreshCw,
  Settings,
  Swords,
} from "lucide-react";
import { createContext, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import type { BrandDto } from "@synapai/shared";
import Logo from "../../components/Logo";
import { apiPost } from "../../lib/api";
import { nextLocale, setLocale } from "../../lib/i18n";
import { onboardingSkipped, readPreferredBrand } from "../../lib/pendingBusiness";
import { useBrands, useMe, useOverview, useStartScan } from "../../lib/queries";
import { DemoBadge, Skeleton } from "../../components/ui";
import { ErrorPanel } from "../../components/PageState";
import { PrivatePageMetadata } from "../../components/PageMetadata";
import AdminPanel from "../admin/AdminPanel";
import Answers from "./Answers";
import Competitors from "./Competitors";
import Overview from "./Overview";
import Prompts from "./Prompts";
import SettingsPage from "./SettingsPage";

interface BrandContextValue {
  brand: BrandDto | undefined;
}

const BrandContext = createContext<BrandContextValue>({ brand: undefined });

export function useActiveBrand(): BrandDto | undefined {
  return useContext(BrandContext).brand;
}

const NAV_ITEMS = [
  { to: "", key: "overview", icon: LayoutDashboard, end: true },
  { to: "answers", key: "answers", icon: MessageSquareText, end: false },
  { to: "competitors", key: "competitors", icon: Swords, end: false },
  { to: "prompts", key: "prompts", icon: ListChecks, end: false },
  { to: "settings", key: "settings", icon: Settings, end: false },
] as const;

export default function AppShell({ admin = false }: { admin?: boolean }): JSX.Element {
  const { t } = useTranslation();
  const location = useLocation();
  const { data: user, isLoading: meLoading, isError } = useMe();
  const brandsQuery = useBrands();
  const { data: brands, isLoading: brandsLoading } = brandsQuery;
  const [brandId, setBrandId] = useState<string | null>(null);

  const brand = useMemo(() => {
    if (!brands || brands.length === 0) return undefined;
    // §3.2: after a scan, select the business that was just scanned.
    const preferred = brandId ?? readPreferredBrand();
    return brands.find((b) => b.id === preferred) ?? brands[0];
  }, [brands, brandId]);

  const { data: overview } = useOverview(admin ? undefined : brand?.id);
  const rescan = useStartScan(brand);
  const navigate = useNavigate();

  if (isError) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  if (meLoading || brandsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <Skeleton className="h-8 w-40" />
      </div>
    );
  }

  if (admin && user?.role !== "admin") return <Navigate to="/app" replace />;

  // §3.3: only ever redirect on a query that SUCCESSFULLY resolved to an empty
  // list. A pending or failed brands query must render a skeleton instead, or a
  // stale/failed response sends a user with results back to the form.
  const brandsResolvedEmpty = brandsQuery.isSuccess && (brands?.length ?? 0) === 0;
  if (!admin && brandsQuery.isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base p-4">
        <ErrorPanel error={brandsQuery.error} onRetry={() => void brandsQuery.refetch()} />
      </div>
    );
  }
  if (!admin && brandsResolvedEmpty && !onboardingSkipped()) {
    return <Navigate to="/app/onboarding" replace />;
  }

  const base = admin ? "/admin" : "/app";
  const scansLeft = user?.scansLeft ?? null;

  return (
    <BrandContext.Provider value={{ brand }}>
      <PrivatePageMetadata title={admin ? t("admin.title") : t("nav.dashboard")} />
      <div className="flex min-h-screen bg-base">
        {/* Sidebar */}
        <aside
          /* §10: sticky, full viewport height, its own column layout. Without
             this the sidebar grew with the main content and the logout button
             was pushed below the fold on long pages. */
          className="sticky top-0 hidden h-[100dvh] w-56 shrink-0 flex-col border-r border-line bg-surface px-3 py-6 md:flex"
        >
          <Link to="/" className="mb-8 px-3" aria-label="Akrux">
            <Logo size={18} className="text-lg" />
          </Link>
          <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
            {admin ? (
              <p className="px-3 text-xs font-semibold uppercase tracking-wide text-sub">
                {t("admin.title")}
              </p>
            ) : (
              NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.key}
                  to={`${base}/${item.to}`}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
                      isActive ? "bg-base font-semibold text-ink" : "text-sub hover:text-ink"
                    }`
                  }
                >
                  <item.icon size={16} />
                  {t(`dashboard.nav.${item.key}`)}
                </NavLink>
              ))
            )}
            {admin && (
              <>
                <NavLink to="/admin" end className={adminNavCls}>
                  <BarChart3 size={16} />
                  {t("admin.nav.leads")}
                </NavLink>
                <NavLink to="/admin/scans" className={adminNavCls}>
                  <RefreshCw size={16} />
                  {t("admin.nav.scans")}
                </NavLink>
                <NavLink to="/admin/users" className={adminNavCls}>
                  <Settings size={16} />
                  {t("admin.nav.users")}
                </NavLink>
                <NavLink to="/admin/usage" className={adminNavCls}>
                  <BarChart3 size={16} />
                  {t("admin.nav.usage")}
                </NavLink>
                <NavLink to="/admin/engines" className={adminNavCls}>
                  <Globe2 size={16} />
                  {t("admin.nav.engines")}
                </NavLink>
              </>
            )}
          </nav>
          <div className="mt-auto shrink-0 px-3 pt-4">
            <button
              type="button"
              onClick={() => {
                void apiPost("/api/auth/logout").then(() => {
                  window.location.href = "/";
                });
              }}
              className="flex items-center gap-2 text-sm text-sub hover:text-ink"
            >
              <LogOut size={15} />
              {t("common.logout")}
            </button>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-2 border-b border-line bg-base/80 px-3 py-2.5 backdrop-blur sm:gap-3 sm:px-8 sm:py-3">
            <div className="flex items-center gap-3">
              {!admin && brands && brands.length > 0 && (
                <select
                  value={brand?.id ?? ""}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="max-w-[45vw] truncate rounded-xl border border-line bg-surface px-2.5 py-1.5 text-sm font-medium outline-none sm:max-w-none sm:px-3"
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              )}
              {overview?.demo && <DemoBadge />}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* §6.3 remaining-runs indicator: hidden for admin/unlimited */}
              {!admin && scansLeft !== null && (
                <span
                  className="rounded-full border border-line bg-surface px-2.5 py-1 text-xs text-sub"
                  title={t("dashboard.scansLeft", { count: scansLeft })}
                >
                  <span className="sm:hidden">{scansLeft}</span>
                  <span className="hidden sm:inline">
                    {t("dashboard.scansLeft", { count: scansLeft })}
                  </span>
                </span>
              )}
              {!admin && brand && (
                <button
                  type="button"
                  disabled={rescan.isPending}
                  onClick={() =>
                    rescan.mutate(undefined, {
                      onSuccess: (data) => navigate(`/scan/${data.scanId}`),
                    })
                  }
                  aria-label={t("dashboard.rescan")}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-line bg-surface px-3 text-sm font-medium disabled:opacity-40 sm:min-h-0 sm:px-4 sm:py-1.5"
                >
                  <RefreshCw size={14} className={rescan.isPending ? "animate-spin" : ""} />
                  <span className="hidden sm:inline">{t("dashboard.rescan")}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setLocale(nextLocale())}
                className="flex h-11 w-11 items-center justify-center text-sm text-sub hover:text-ink sm:h-auto sm:w-auto"
              >
                {nextLocale().toUpperCase()}
              </button>
            </div>
          </header>

          <main className="min-w-0 flex-1 px-3 pb-24 pt-5 sm:px-8 sm:pb-6 sm:pt-6 md:pb-6">
            {admin ? (
              <AdminPanel />
            ) : (
              <Routes>
                <Route index element={<Overview />} />
                <Route path="answers" element={<Answers />} />
                <Route path="competitors" element={<Competitors />} />
                <Route path="prompts" element={<Prompts />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to={base} replace />} />
              </Routes>
            )}
          </main>

          {/* §5: the sidebar becomes a bottom tab bar below md. */}
          {!admin && (
            <nav
              className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-surface md:hidden"
              style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            >
              {NAV_ITEMS.filter((i) => i.key !== "settings").map((item) => (
                <NavLink
                  key={item.key}
                  to={`${base}/${item.to}`}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex min-h-[56px] flex-col items-center justify-center gap-0.5 px-0.5 text-[10px] ${
                      isActive ? "font-semibold text-ink" : "text-sub"
                    }`
                  }
                >
                  <item.icon size={17} />
                  <span className="max-w-full truncate">{t(`dashboard.nav.${item.key}`)}</span>
                </NavLink>
              ))}
              <NavLink
                to={`${base}/settings`}
                className={({ isActive }) =>
                  `flex min-h-[56px] flex-col items-center justify-center gap-0.5 px-0.5 text-[10px] ${
                    isActive ? "font-semibold text-ink" : "text-sub"
                  }`
                }
              >
                <Settings size={17} />
                <span className="max-w-full truncate">{t("dashboard.nav.settings")}</span>
              </NavLink>
            </nav>
          )}
        </div>
      </div>
    </BrandContext.Provider>
  );
}

function adminNavCls({ isActive }: { isActive: boolean }): string {
  return `flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
    isActive ? "bg-base font-semibold text-ink" : "text-sub hover:text-ink"
  }`;
}
