import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { BrandDto, OverviewDto, ScanProgressDto } from "@synapai/shared";
import { apiGet } from "../lib/api";
import { setPreferredBrand } from "../lib/pendingBusiness";

/** Pulsing dots sitting on the radar rings. */
const RING_DOTS = [
  { top: "12%", left: "50%", delay: "0s" },
  { top: "58%", left: "88%", delay: "0.7s" },
  { top: "78%", left: "26%", delay: "1.3s" },
  { top: "34%", left: "10%", delay: "1.9s" },
];

/** §12.10: dark radar progress screen with the live currentPrompt. */
export default function ScanProgress(): JSX.Element {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [leaving, setLeaving] = useState(false);
  const leavingRef = useRef(false);

  const { data, isError } = useQuery({
    queryKey: ["progress", id],
    queryFn: () => apiGet<ScanProgressDto>(`/api/scan/${id}/progress`),
    // Stop polling on terminal states and on fetch errors (dead scan id).
    refetchInterval: (query) => {
      if (query.state.error) return false;
      const status = query.state.data?.status;
      return status === "done" || status === "partial" || status === "failed" ? false : 1500;
    },
    retry: 1,
    enabled: Boolean(id) && !leaving,
    meta: { silent: true },
  });

  // §3.2: a finished scan lands on ITS business's dashboard, deterministically.
  // The brand/overview/session queries are refetched and awaited BEFORE
  // navigating, so the shell never sees a stale empty list and bounces the
  // user back to onboarding. No cleanup on purpose: the state change re-runs
  // this effect and a cleanup would cancel the navigation.
  useEffect(() => {
    if (leavingRef.current || !data) return;
    if (data.status !== "done" && data.status !== "partial") return;

    leavingRef.current = true;
    setLeaving(true);
    // Remember which business to show, so the shell selects the scanned one.
    if (data.brandId) setPreferredBrand(data.brandId);

    void (async () => {
      // #4: `refetchQueries({type:"active"})` was a no-op here, because the
      // brands query is not mounted on this page. The shell then read the
      // pre-scan empty list from cache and bounced back to onboarding.
      // fetchQuery bypasses the cache and RESOLVES before we navigate.
      queryClient.removeQueries({ queryKey: ["brands"] });
      queryClient.removeQueries({ queryKey: ["overview"] });
      try {
        const brands = await queryClient.fetchQuery({
          queryKey: ["brands"],
          queryFn: () => apiGet<BrandDto[]>("/api/brands"),
          staleTime: 0,
        });
        // Only route once the scanned business is actually present.
        const target = brands.find((b) => b.id === data.brandId) ?? brands[0];
        if (target) {
          await queryClient
            .fetchQuery({
              queryKey: ["overview", target.id],
              queryFn: () => apiGet<OverviewDto>(`/api/brands/${target.id}/overview`),
              staleTime: 0,
            })
            .catch(() => undefined);
        }
      } catch {
        // A failed prefetch must not strand the user on the radar screen;
        // the dashboard has its own loading and error states.
      }
      // #7: the audit balance must be current the moment the dashboard renders.
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      navigate("/app", { replace: true });
    })();
  }, [data, id, navigate, queryClient]);

  const failed = data?.status === "failed" || isError;
  const brandInitial = (data?.brandName || "S").charAt(0).toUpperCase();
  // §2.5: a percentage only, never prompt/call/engine counts.
  const pct = data && data.total > 0 ? Math.round((data.done / data.total) * 100) : 0;

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-base px-6 text-center text-ink transition-all duration-500"
      style={leaving ? { opacity: 0, filter: "blur(14px)" } : undefined}
    >
      {/* Radar: light theme: gray rings, black sweep/accents (§Global) */}
      <div className="relative mb-10 h-[min(56vw,14rem)] w-[min(56vw,14rem)] sm:mb-14">
        <div className="absolute inset-0 rounded-full border border-line" />
        <div className="absolute inset-8 rounded-full border border-line" />
        <div className="absolute inset-16 rounded-full border border-line" />
        <div
          className="radar-sweep absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, transparent 290deg, rgba(0,0,0,0.12) 360deg)",
          }}
        />
        {RING_DOTS.map((dot, index) => (
          <span
            key={index}
            className="radar-dot absolute h-1.5 w-1.5 rounded-full bg-ink/40"
            style={{ top: dot.top, left: dot.left, animationDelay: dot.delay }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink text-2xl font-bold text-white ring-4 ring-base">
            {brandInitial}
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {failed ? t("progress.failed") : t("progress.title")}
      </h1>

      {failed ? (
        <>
          <p className="mt-4 max-w-md text-sm text-sub">
            {data?.error === "SCAN_FAILED"
              ? t("progress.failedProvider")
              : t("progress.failedBody")}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/app/onboarding")}
              className="min-h-[44px] rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-85"
            >
              {t("states.retry")}
            </button>
            <Link
              to="/app"
              className="min-h-[44px] rounded-full border border-line bg-surface px-6 py-3 text-sm font-medium text-ink"
            >
              {t("nav.dashboard")}
            </Link>
          </div>
        </>
      ) : (
        <>
          {/* currentPrompt, swapped with the blur transition */}
          {/* §2: stage label, so the wait reads as intentional. */}
          <p className="mt-3 text-sm font-medium text-sub">
            {t(`progress.stage.${data?.stage ?? "research"}`)}
          </p>

          <p className="mt-4 flex min-h-[3.5rem] max-w-md items-center justify-center break-words px-2 text-sub">
            <span key={data?.currentPrompt ?? "queued"} className="blur-in">
              {data?.currentPrompt ? `«${data.currentPrompt}»` : t("progress.queued")}
            </span>
          </p>

          {/* §2.5: percentage only */}
          <p className="mt-8 text-3xl font-semibold tracking-tight">{pct}%</p>
        </>
      )}
    </div>
  );
}
