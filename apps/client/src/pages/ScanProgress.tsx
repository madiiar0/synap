import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import type { ScanProgressDto } from "@synapai/shared";
import { apiGet } from "../lib/api";

/** Radar-style scan progress screen (visual polish lands in P3). */
export default function ScanProgress(): JSX.Element {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ["progress", id],
    queryFn: () => apiGet<ScanProgressDto>(`/api/public/scan/${id}/progress`),
    refetchInterval: 1500,
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (data && (data.status === "done" || data.status === "partial")) {
      navigate(`/scan/${id}/teaser`, { replace: true });
    }
  }, [data, id, navigate]);

  const failed = data?.status === "failed";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-dark px-6 text-center text-darktext">
      <div className="relative mb-12 flex h-48 w-48 items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-darkline" />
        <div className="absolute inset-6 rounded-full border border-darkline" />
        <div className="absolute inset-12 rounded-full border border-darkline" />
        <div
          className="absolute inset-0 animate-spin rounded-full"
          style={{
            animationDuration: "3s",
            background:
              "conic-gradient(from 0deg, transparent 0deg, transparent 300deg, rgba(245,245,245,0.25) 360deg)",
          }}
        />
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl font-bold text-white">
          {(data?.currentPrompt ?? "S").charAt(0).toUpperCase()}
        </div>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {failed ? t("progress.failed") : t("progress.title")}
      </h1>

      {!failed && (
        <>
          <p className="mt-6 min-h-[3rem] max-w-md text-sub">
            {data?.currentPrompt ? `«${data.currentPrompt}»` : t("progress.queued")}
          </p>
          <p className="mt-8 text-sm text-sub">
            {t("progress.counter", { done: data?.done ?? 0, total: data?.total ?? 0 })}
          </p>
        </>
      )}
    </div>
  );
}
