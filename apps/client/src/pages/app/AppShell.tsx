import {
  BarChart3,
  Globe2,
  LayoutDashboard,
  Link2,
  ListChecks,
  LogOut,
  MessageSquareText,
  RefreshCw,
  Settings,
  Swords,
} from "lucide-react";
import { createContext, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import type { BrandDto } from "@synapai/shared";
import { apiPost } from "../../lib/api";
import { currentLocale, setLocale } from "../../lib/i18n";
import { useBrands, useMe, useOverview, useRescan } from "../../lib/queries";
import { DemoBadge, Skeleton } from "../../components/ui";
import AdminPanel from "../admin/AdminPanel";
import Answers from "./Answers";
import Competitors from "./Competitors";
import Overview from "./Overview";
import Prompts from "./Prompts";
import SettingsPage from "./SettingsPage";
import Sources from "./Sources";

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
  { to: "sources", key: "sources", icon: Link2, end: false },
  { to: "prompts", key: "prompts", icon: ListChecks, end: false },
  { to: "settings", key: "settings", icon: Settings, end: false },
] as const;

export default function AppShell({ admin = false }: { admin?: boolean }): JSX.Element {
  const { t } = useTranslation();
  const location = useLocation();
  const { data: user, isLoading: meLoading, isError } = useMe();
  const { data: brands, isLoading: brandsLoading } = useBrands();
  const [brandId, setBrandId] = useState<string | null>(null);

  const brand = useMemo(() => {
    if (!brands || brands.length === 0) return undefined;
    return brands.find((b) => b.id === brandId) ?? brands[0];
  }, [brands, brandId]);

  const { data: overview } = useOverview(admin ? undefined : brand?.id);
  const rescan = useRescan(brand?.id);

  if (isError) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  if (meLoading || brandsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <Skeleton className="h-8 w-40" />
      </div>
    );
  }

  if (admin && user?.role !== "admin") return <Navigate to="/app" replace />;

  const base = admin ? "/admin" : "/app";
  const rescanBlocked = Boolean(overview?.rescanAvailableAt);

  return (
    <BrandContext.Provider value={{ brand }}>
      <div className="flex min-h-screen bg-base">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 flex-col border-r border-line bg-surface px-3 py-6 md:flex">
          <Link to="/" className="mb-8 px-3 text-lg font-bold tracking-tight">
            {t("common.brand")}
          </Link>
          <nav className="flex flex-col gap-1">
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
          <div className="mt-auto px-3">
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
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-base/80 px-4 py-3 backdrop-blur sm:px-8">
            <div className="flex items-center gap-3">
              {!admin && brands && brands.length > 0 && (
                <select
                  value={brand?.id ?? ""}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="rounded-xl border border-line bg-surface px-3 py-1.5 text-sm font-medium outline-none"
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
            <div className="flex items-center gap-3">
              {!admin && brand && (
                <button
                  type="button"
                  disabled={rescan.isPending || rescanBlocked}
                  title={
                    rescanBlocked && overview?.rescanAvailableAt
                      ? t("dashboard.rescanUnavailable", {
                          date: new Date(overview.rescanAvailableAt).toLocaleDateString(),
                        })
                      : undefined
                  }
                  onClick={() => rescan.mutate()}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 text-sm font-medium disabled:opacity-40"
                >
                  <RefreshCw size={14} className={rescan.isPending ? "animate-spin" : ""} />
                  {t("dashboard.rescan")}
                </button>
              )}
              <button
                type="button"
                onClick={() => setLocale(currentLocale() === "ru" ? "en" : "ru")}
                className="text-sm text-sub hover:text-ink"
              >
                {currentLocale() === "ru" ? "EN" : "RU"}
              </button>
            </div>
          </header>

          <main className="min-w-0 flex-1 px-4 py-6 sm:px-8">
            {admin ? (
              <AdminPanel />
            ) : (
              <Routes>
                <Route index element={<Overview />} />
                <Route path="answers" element={<Answers />} />
                <Route path="competitors" element={<Competitors />} />
                <Route path="sources" element={<Sources />} />
                <Route path="prompts" element={<Prompts />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to={base} replace />} />
              </Routes>
            )}
          </main>
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
