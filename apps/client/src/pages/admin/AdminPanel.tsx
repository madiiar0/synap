import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Play, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, Route, Routes } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ENGINE_LABELS,
  type BudgetStateDto,
  type EngineId,
  type LeadRowDto,
  type ScanListItemDto,
  type UsageDayDto,
} from "@synapai/shared";
import { apiGet, apiPatch, apiPost } from "../../lib/api";
import { Card, EmptyState, Skeleton } from "../../components/ui";

const PROVIDER_COLORS = ["#2563EB", "#171717", "#737373", "#A3A3A3", "#D4D4D4"];

function AdminLeads(): JSX.Element {
  const { t } = useTranslation();
  const [type, setType] = useState("");
  const { data: leads, isLoading } = useQuery({
    queryKey: ["admin-leads", type],
    queryFn: () => apiGet<LeadRowDto[]>(`/api/admin/leads${type ? `?type=${type}` : ""}`),
  });

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex items-center justify-between">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-xl border border-line bg-surface px-3 py-1.5 text-sm outline-none"
        >
          <option value="">{t("admin.leads.filterAll")}</option>
          <option value="scan_email">{t("admin.leads.typeScanEmail")}</option>
          <option value="book_call">{t("admin.leads.typeBookCall")}</option>
        </select>
        <a
          href="/api/admin/leads.csv"
          className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 text-sm"
        >
          <Download size={14} />
          {t("admin.leads.exportCsv")}
        </a>
      </div>
      <Card className="overflow-x-auto">
        {isLoading ? (
          <Skeleton className="m-4 h-48" />
        ) : !leads || leads.length === 0 ? (
          <EmptyState title={t("common.notAvailable")} />
        ) : (
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-sub">
                <th className="px-5 py-3 font-medium">{t("admin.leads.colType")}</th>
                <th className="px-2 py-3 font-medium">{t("admin.leads.colContact")}</th>
                <th className="px-2 py-3 font-medium">{t("admin.leads.colBrand")}</th>
                <th className="px-2 py-3 font-medium">{t("admin.leads.colSource")}</th>
                <th className="px-2 py-3 font-medium">{t("admin.leads.colMessage")}</th>
                <th className="px-5 py-3 text-right font-medium">{t("admin.leads.colDate")}</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-line align-top last:border-b-0">
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        lead.type === "book_call"
                          ? "bg-accent/10 text-accent"
                          : "bg-base text-sub"
                      }`}
                    >
                      {lead.type === "book_call"
                        ? t("admin.leads.typeBookCall")
                        : t("admin.leads.typeScanEmail")}
                    </span>
                  </td>
                  <td className="px-2 py-3">
                    {[lead.name, lead.email, lead.phone].filter(Boolean).join(" · ") || "-"}
                  </td>
                  <td className="px-2 py-3">{lead.brandName || "-"}</td>
                  <td className="px-2 py-3 text-sub">{lead.source}</td>
                  <td className="max-w-[220px] px-2 py-3 text-sub">{lead.message || "-"}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-right text-sub">
                    {new Date(lead.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function AdminScans(): JSX.Element {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: scans, isLoading } = useQuery({
    queryKey: ["admin-scans"],
    queryFn: () => apiGet<ScanListItemDto[]>("/api/admin/scans"),
    refetchInterval: 5000,
  });
  const rerun = useMutation({
    mutationFn: (scanId: string) => apiPost(`/api/admin/scans/${scanId}/rerun`),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-scans"] }),
  });
  const fullScan = useMutation({
    mutationFn: (brandId: string) => apiPost(`/api/admin/brands/${brandId}/full-scan`),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-scans"] }),
  });

  return (
    <Card className="mx-auto max-w-5xl overflow-x-auto">
      {isLoading ? (
        <Skeleton className="m-4 h-48" />
      ) : !scans || scans.length === 0 ? (
        <EmptyState title={t("common.notAvailable")} />
      ) : (
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-sub">
              <th className="px-5 py-3 font-medium">{t("admin.scans.colBrand")}</th>
              <th className="px-2 py-3 font-medium">{t("admin.scans.colTier")}</th>
              <th className="px-2 py-3 font-medium">{t("admin.scans.colStatus")}</th>
              <th className="px-2 py-3 font-medium">{t("admin.scans.colScore")}</th>
              <th className="px-2 py-3 font-medium">{t("admin.scans.colCost")}</th>
              <th className="px-2 py-3 font-medium">{t("admin.scans.colDate")}</th>
              <th className="px-5 py-3 text-right font-medium" />
            </tr>
          </thead>
          <tbody>
            {scans.map((scan) => (
              <tr key={scan.id} className="border-b border-line last:border-b-0">
                <td className="px-5 py-3 font-medium">{scan.brandName}</td>
                <td className="px-2 py-3 uppercase text-sub">{scan.tier}</td>
                <td className="px-2 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      scan.status === "done"
                        ? "bg-emerald-50 text-emerald-700"
                        : scan.status === "failed"
                          ? "bg-red-50 text-red-600"
                          : "bg-base text-sub"
                    }`}
                  >
                    {scan.status}
                  </span>
                </td>
                <td className="px-2 py-3">{scan.overall ?? "-"}</td>
                <td className="px-2 py-3 text-sub">${scan.costUsd.toFixed(3)}</td>
                <td className="whitespace-nowrap px-2 py-3 text-sub">
                  {new Date(scan.createdAt).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => rerun.mutate(scan.id)}
                    disabled={rerun.isPending}
                    title={t("admin.scans.rerun")}
                    className="mr-2 inline-flex items-center gap-1 rounded-full border border-line px-3 py-1 text-xs"
                  >
                    <RefreshCw size={12} />
                    {t("admin.scans.rerun")}
                  </button>
                  <button
                    type="button"
                    onClick={() => fullScan.mutate(scan.brandId)}
                    disabled={fullScan.isPending}
                    title={t("admin.scans.triggerFull")}
                    className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1 text-xs text-white"
                  >
                    <Play size={12} />
                    {t("admin.scans.triggerFull")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

interface UsageResponse {
  series: UsageDayDto[];
  budget: BudgetStateDto;
}

interface AdminUserRow {
  id: string;
  email: string;
  name?: string;
  role: string;
  emailVerified: boolean;
  freeScansUsed: number;
  freeScanLimit: number;
  unlimitedScans: boolean;
  createdAt: string;
}

/** §7 Users: search, grant/revoke unlimited, reset counters, adjust limits. */
function AdminUsers(): JSX.Element {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users", q],
    queryFn: () => apiGet<AdminUserRow[]>(`/api/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  });
  const patch = useMutation({
    mutationFn: (input: { id: string; body: Record<string, unknown> }) =>
      apiPatch(`/api/admin/users/${input.id}`, input.body),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("admin.users.search")}
        className="h-11 w-full max-w-sm rounded-xl border border-line bg-surface px-4 text-sm outline-none focus:border-ink"
      />
      <Card className="overflow-x-auto">
        {isLoading ? (
          <Skeleton className="m-4 h-48" />
        ) : !users || users.length === 0 ? (
          <EmptyState title={t("common.notAvailable")} />
        ) : (
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-sub">
                <th className="px-5 py-3 font-medium">{t("admin.users.colEmail")}</th>
                <th className="px-2 py-3 font-medium">{t("admin.users.colUsed")}</th>
                <th className="px-2 py-3 font-medium">{t("admin.users.colLimit")}</th>
                <th className="px-2 py-3 font-medium">{t("admin.users.colUnlimited")}</th>
                <th className="px-5 py-3 text-right font-medium" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-line last:border-b-0">
                  <td className="px-5 py-3">
                    <span className="font-medium">{u.email}</span>
                    {u.role === "admin" && (
                      <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] text-accent">
                        admin
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-3">{u.freeScansUsed}</td>
                  <td className="px-2 py-3">
                    <input
                      type="number"
                      defaultValue={u.freeScanLimit}
                      min={0}
                      onBlur={(e) => {
                        const v = Number(e.target.value);
                        if (Number.isFinite(v) && v !== u.freeScanLimit) {
                          patch.mutate({ id: u.id, body: { freeScanLimit: v } });
                        }
                      }}
                      className="w-16 rounded-lg border border-line bg-base px-2 py-1 text-sm outline-none"
                    />
                  </td>
                  <td className="px-2 py-3">{u.unlimitedScans ? "∞" : "-"}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => patch.mutate({ id: u.id, body: { freeScansUsed: 0 } })}
                      className="mr-2 rounded-full border border-line px-3 py-1 text-xs"
                    >
                      {t("admin.users.reset")}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        patch.mutate({ id: u.id, body: { unlimitedScans: !u.unlimitedScans } })
                      }
                      className="rounded-full bg-ink px-3 py-1 text-xs text-white"
                    >
                      {u.unlimitedScans ? t("admin.users.revoke") : t("admin.users.grant")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

interface CostsResponse {
  scans: {
    id: string;
    brandName: string;
    tier: string;
    status: string;
    calls: number;
    tokensIn: number;
    tokensOut: number;
    searchFees: number;
    costUsd: number;
    createdAt: string;
  }[];
  todaySpendUsd: number;
  monthSpendUsd: number;
  budget: BudgetStateDto;
}

/** §7/§8 cost dashboard: spend cards, per-scan costs, provider chart. */
function AdminUsage(): JSX.Element {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-usage"],
    queryFn: () => apiGet<UsageResponse>("/api/admin/usage?days=14"),
  });
  const { data: costs } = useQuery({
    queryKey: ["admin-costs"],
    queryFn: () => apiGet<CostsResponse>("/api/admin/costs"),
  });
  const resume = useMutation({
    mutationFn: () => apiPost("/api/admin/usage/resume"),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-usage"] }),
  });

  const providers = [...new Set((data?.series ?? []).map((r) => r.provider))];
  const byDate = new Map<string, Record<string, number | string>>();
  for (const row of data?.series ?? []) {
    const entry = byDate.get(row.date) ?? { date: row.date };
    entry[row.provider] = row.costUsd;
    byDate.set(row.date, entry);
  }
  const chartData = [...byDate.values()].sort((a, b) =>
    String(a.date).localeCompare(String(b.date)),
  );

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="p-5">
          <p className="text-xs text-sub">{t("admin.costs.today")}</p>
          <p className="mt-1 text-2xl font-semibold">
            ${(costs?.todaySpendUsd ?? 0).toFixed(2)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-sub">{t("admin.costs.month")}</p>
          <p className="mt-1 text-2xl font-semibold">
            ${(costs?.monthSpendUsd ?? 0).toFixed(2)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-sub">{t("admin.usage.budget")}</p>
          <p className="mt-1 text-2xl font-semibold">
            ${data?.budget.dailyBudgetUsd.toFixed(2) ?? "-"}
          </p>
        </Card>
        <Card className="flex items-center justify-between p-5">
          {data?.budget.paused ? (
            <>
              <p className="text-sm text-red-600">{t("admin.usage.paused")}</p>
              <button
                type="button"
                onClick={() => resume.mutate()}
                disabled={resume.isPending}
                className="rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-white"
              >
                {t("admin.usage.resume")}
              </button>
            </>
          ) : (
            <p className="text-sm text-emerald-600">OK</p>
          )}
        </Card>
      </div>

      {/* §8 per-scan cost breakdown */}
      <Card className="overflow-x-auto">
        {costs && costs.scans.length > 0 ? (
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-sub">
                <th className="px-5 py-3 font-medium">{t("admin.costs.colScan")}</th>
                <th className="px-2 py-3 font-medium">{t("admin.costs.colCalls")}</th>
                <th className="px-2 py-3 font-medium">{t("admin.costs.colTokens")}</th>
                <th className="px-2 py-3 font-medium">{t("admin.costs.colSearch")}</th>
                <th className="px-5 py-3 text-right font-medium">{t("admin.costs.colCost")}</th>
              </tr>
            </thead>
            <tbody>
              {costs.scans.slice(0, 30).map((s) => (
                <tr key={s.id} className="border-b border-line last:border-b-0">
                  <td className="px-5 py-3">
                    <span className="font-medium">{s.brandName}</span>
                    <span className="ml-2 text-xs uppercase text-sub">{s.tier}</span>
                    <span className="ml-2 text-xs text-sub">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-2 py-3">{s.calls}</td>
                  <td className="px-2 py-3 text-sub">{s.tokensIn + s.tokensOut}</td>
                  <td className="px-2 py-3 text-sub">${s.searchFees.toFixed(4)}</td>
                  <td className="px-5 py-3 text-right font-medium">${s.costUsd.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState title={t("common.notAvailable")} />
        )}
      </Card>

      <Card className="p-5">
        {isLoading ? (
          <Skeleton className="h-64" />
        ) : chartData.length === 0 ? (
          <EmptyState title={t("common.notAvailable")} />
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E7E7" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                {providers.map((provider, index) => (
                  <Bar
                    key={provider}
                    dataKey={provider}
                    stackId="cost"
                    fill={PROVIDER_COLORS[index % PROVIDER_COLORS.length]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}

interface EngineStatusRow {
  engine: EngineId;
  keyPresent: boolean;
  enabled: boolean;
}

function AdminEngines(): JSX.Element {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: engines, isLoading } = useQuery({
    queryKey: ["admin-engines"],
    queryFn: () => apiGet<EngineStatusRow[]>("/api/admin/engines"),
  });
  const toggle = useMutation({
    mutationFn: (input: { engine: EngineId; enabled: boolean }) =>
      apiPatch("/api/admin/engines", input),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-engines"] }),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <p className="text-sm text-sub">{t("admin.engines.hint")}</p>
      <Card>
        {isLoading ? (
          <Skeleton className="m-4 h-40" />
        ) : (
          (engines ?? []).map((engine) => (
            <div
              key={engine.engine}
              className="flex items-center justify-between border-b border-line px-5 py-4 last:border-b-0"
            >
              <div>
                <p className="text-sm font-medium">{ENGINE_LABELS[engine.engine]}</p>
                {!engine.keyPresent && (
                  <p className="text-xs text-sub">{t("admin.engines.keyMissing")}</p>
                )}
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={engine.enabled}
                disabled={toggle.isPending}
                onClick={() => toggle.mutate({ engine: engine.engine, enabled: !engine.enabled })}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  engine.enabled ? "bg-accent" : "bg-line"
                }`}
              >
                <span
                  className={`absolute left-0 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    engine.enabled ? "translate-x-[22px]" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}

export default function AdminPanel(): JSX.Element {
  return (
    <Routes>
      <Route index element={<AdminLeads />} />
      <Route path="scans" element={<AdminScans />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="usage" element={<AdminUsage />} />
      <Route path="engines" element={<AdminEngines />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
