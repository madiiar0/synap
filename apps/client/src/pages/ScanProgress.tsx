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
    queryFn: () => apiGet<ScanProgressDto>(`/api/public/scan/${id}/progress`),
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
      // Blur-transition into the teaser (§12.10). No cleanup on purpose:
      // the state change re-runs this effect and a cleanup would cancel
      // the pending navigation.
      leavingRef.current = true;
      setLeaving(true);
      setTimeout(() => navigate(`/scan/${id}/teaser`, { replace: true }), 550);
    }
  }, [data, id, navigate]);

  const failed = data?.status === "failed" || isError;
  const brandInitial = (data?.brandName || "S").charAt(0).toUpperCase();
  const fraction = data && data.total > 0 ? data.done / data.total : 0;
  const filledDots = Math.round(fraction * 5);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-dark px-6 text-center text-darktext transition-all duration-500"
      style={leaving ? { opacity: 0, filter: "blur(14px)" } : undefined}
    >
      {/* Radar */}
      <div className="relative mb-14 h-56 w-56">
        <div className="absolute inset-0 rounded-full border border-darkline" />
        <div className="absolute inset-8 rounded-full border border-darkline" />
        <div className="absolute inset-16 rounded-full border border-darkline" />
        <div
          className="radar-sweep absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, transparent 290deg, rgba(245,245,245,0.16) 360deg)",
          }}
        />
        {RING_DOTS.map((dot, index) => (
          <span
            key={index}
            className="radar-dot absolute h-1.5 w-1.5 rounded-full bg-emerald-400/80"
            style={{ top: dot.top, left: dot.left, animationDelay: dot.delay }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl font-bold text-white ring-4 ring-dark">
            {brandInitial}
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {failed ? t("progress.failed") : t("progress.title")}
      </h1>

      {failed ? (
        <Link to="/" className="mt-6 text-sm text-sub underline hover:text-darktext">
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

          {/* progress dots + counter */}
          <div className="mt-8 flex items-center gap-2.5">
            {Array.from({ length: 5 }).map((_, index) => (
              <span
                key={index}
                className={`h-2.5 w-2.5 rounded-full transition-colors duration-500 ${
                  index < filledDots
                    ? "bg-emerald-400"
                    : index === filledDots
                      ? "bg-white"
                      : "bg-darkline"
                }`}
              />
            ))}
          </div>
          <p className="mt-4 text-sm text-sub">
            {t("progress.counter", { done: data?.done ?? 0, total: data?.total ?? 0 })}
          </p>
        </>
      )}
    </div>
  );
}
