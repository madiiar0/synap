import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { ScanProgressDto } from "@synapai/shared";
import { apiGet } from "../lib/api";

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

  useEffect(() => {
    if (!leavingRef.current && data && (data.status === "done" || data.status === "partial")) {
      // Blur-transition into the dashboard. No cleanup on purpose: the state
      // change re-runs this effect and a cleanup would cancel the navigation.
      leavingRef.current = true;
      setLeaving(true);
      setTimeout(() => navigate("/app", { replace: true }), 550);
    }
  }, [data, id, navigate]);

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
      <div className="relative mb-14 h-56 w-56">
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
        <Link to="/" className="mt-6 text-sm text-sub underline hover:text-ink">
          {t("common.back")}
        </Link>
      ) : (
        <>
          {/* currentPrompt, swapped with the blur transition */}
          <p className="mt-6 flex min-h-[3.5rem] max-w-md items-center justify-center text-sub">
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
