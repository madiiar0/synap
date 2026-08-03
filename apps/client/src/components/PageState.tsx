import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import BookCallButton from "./BookCallButton";
import { Card, Skeleton } from "./ui";

/**
 * §4: every dashboard page resolves to exactly one of loading / empty / error /
 * content. An unresolved query and an empty result must never look the same,
 * and a query that never resolves must not spin forever.
 */
export type PageStatus = "loading" | "empty" | "error" | "ready";

/** Flips to true once `ms` have passed while still loading (§4: 10s cap). */
export function useLoadTimeout(active: boolean, ms = 10_000): boolean {
  const [expired, setExpired] = useState(false);
  useEffect(() => {
    if (!active) {
      setExpired(false);
      return undefined;
    }
    const id = setTimeout(() => setExpired(true), ms);
    return () => clearTimeout(id);
  }, [active, ms]);
  return expired;
}

interface ResolveInput {
  isPending: boolean;
  isError: boolean;
  isEmpty: boolean;
  timedOut: boolean;
  /** The query never runs (no business yet), which is empty, not loading. */
  disabled?: boolean;
}

export function resolvePageStatus({
  isPending,
  isError,
  isEmpty,
  timedOut,
  disabled = false,
}: ResolveInput): PageStatus {
  // A disabled React Query stays `isPending` forever; without this it renders
  // an endless loading shell instead of the empty state (§4).
  if (disabled) return "empty";
  if (isError) return "error";
  if (isPending) return timedOut ? "error" : "loading";
  return isEmpty ? "empty" : "ready";
}

interface QueryLike {
  isPending: boolean;
  isError: boolean;
  error?: unknown;
  refetch: () => unknown;
}

/** One call per dashboard page: gives the status plus a retry handler. */
export function usePageState(
  query: QueryLike,
  options: { isEmpty: boolean; disabled?: boolean },
): { status: PageStatus; error: unknown; retry: () => void } {
  const active = query.isPending && !options.disabled && !query.isError;
  const timedOut = useLoadTimeout(active);
  const status = resolvePageStatus({
    isPending: query.isPending,
    isError: query.isError,
    isEmpty: options.isEmpty,
    timedOut,
    disabled: options.disabled,
  });
  return {
    status,
    error: query.error,
    retry: () => {
      void query.refetch();
    },
  };
}

/** Content-shaped skeletons so the page does not collapse while loading. */
export function CardsSkeleton({ rows = 3 }: { rows?: number }): JSX.Element {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }, (_, i) => (
        <Card key={i} className="p-5">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="mt-3 h-3 w-2/3" />
          <Skeleton className="mt-2 h-3 w-1/2" />
        </Card>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }): JSX.Element {
  return (
    <Card className="overflow-hidden p-5" aria-busy="true">
      <Skeleton className="h-4 w-40" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-3 flex-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function OverviewSkeleton(): JSX.Element {
  return (
    <div className="mx-auto max-w-5xl space-y-6" aria-busy="true" aria-live="polite">
      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <Card className="flex flex-col items-center gap-4 p-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-40 w-40 rounded-full" />
        </Card>
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-3 h-6 w-16" />
            </Card>
          ))}
        </div>
      </div>
      <CardsSkeleton rows={2} />
    </div>
  );
}

/**
 * §4 empty state: never a dead end. The primary action always leads to a check.
 */
export function EmptyPanel({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <Card className="mx-auto max-w-lg p-10 text-center">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {hint && <p className="mt-2 text-sm text-sub">{hint}</p>}
      <button
        type="button"
        onClick={() => navigate("/app/onboarding")}
        className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-85"
      >
        {t("nav.checkBrand")}
      </button>
    </Card>
  );
}

/**
 * §4 error state: a localized message, a retry, and a human fallback. The raw
 * error goes to the console for the owner, never to the customer.
 */
export function ErrorPanel({
  error,
  onRetry,
}: {
  error?: unknown;
  onRetry: () => void;
}): JSX.Element {
  const { t } = useTranslation();
  useEffect(() => {
    if (error) console.error("[Synap] dashboard query failed:", error);
  }, [error]);

  return (
    <Card className="mx-auto max-w-lg p-10 text-center">
      <h2 className="text-lg font-semibold tracking-tight">{t("states.errorTitle")}</h2>
      <p className="mt-2 text-sm text-sub">{t("states.errorBody")}</p>
      <div className="mt-6 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-85"
        >
          {t("states.retry")}
        </button>
        <BookCallButton source="dashboard" variant="secondary" label={t("states.support")} />
      </div>
    </Card>
  );
}
