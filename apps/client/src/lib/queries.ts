import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MAX_USER_COMPETITORS } from "@synapai/shared";
import type {
  AnswerRowDto,
  BrandDto,
  CompetitorRowDto,
  OverviewDto,
  PromptRowDto,
  SessionUserDto,
} from "@synapai/shared";
import { apiGet, apiPatch, apiPost } from "./api";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => apiGet<SessionUserDto>("/api/auth/me"),
    retry: false,
    // #7: the audit allowance lives here and must never be served stale, or the
    // form and the dashboard show different numbers.
    staleTime: 0,
  });
}

export type SessionState = "loading" | "signedIn" | "signedOut";

/**
 * §1: shared auth state for the public pages. `loading` is a distinct state so
 * the navbar can render a neutral placeholder instead of flashing the
 * signed-out CTAs before the session resolves.
 */
export function useSession(): { state: SessionState; user: SessionUserDto | undefined } {
  const { data, isPending, isError } = useMe();
  // Prerender public navigation and CTAs as signed-out links. No account data
  // is fetched or embedded during SSR, and crawlers still receive real links.
  if (typeof window === "undefined") return { state: "signedOut", user: undefined };
  if (isPending) return { state: "loading", user: undefined };
  if (isError || !data) return { state: "signedOut", user: undefined };
  return { state: "signedIn", user: data };
}

export function useBrands() {
  return useQuery({
    queryKey: ["brands"],
    queryFn: () => apiGet<BrandDto[]>("/api/brands"),
  });
}

export function useOverview(brandId: string | undefined) {
  return useQuery({
    queryKey: ["overview", brandId],
    queryFn: () => apiGet<OverviewDto>(`/api/brands/${brandId}/overview`),
    enabled: Boolean(brandId),
  });
}

export interface AnswerFilterState {
  engine?: string;
  language?: string;
  intent?: string;
  mentioned?: string;
}

export function useAnswers(brandId: string | undefined, filters: AnswerFilterState) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return useQuery({
    queryKey: ["answers", brandId, qs],
    queryFn: () => apiGet<AnswerRowDto[]>(`/api/brands/${brandId}/answers${qs ? `?${qs}` : ""}`),
    enabled: Boolean(brandId),
  });
}

export function useCompetitors(brandId: string | undefined) {
  return useQuery({
    queryKey: ["competitors", brandId],
    queryFn: () => apiGet<CompetitorRowDto[]>(`/api/brands/${brandId}/competitors`),
    enabled: Boolean(brandId),
  });
}

export function usePrompts(brandId: string | undefined) {
  return useQuery({
    queryKey: ["prompts", brandId],
    queryFn: () => apiGet<PromptRowDto[]>(`/api/brands/${brandId}/prompts`),
    enabled: Boolean(brandId),
  });
}

/** Re-scan = a fresh authed scan of the same business (same quota pool). */
export function useStartScan(brand: BrandDto | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiPost<{ scanId: string }>("/api/scan", {
        brandName: brand?.name,
        category: brand?.category,
        city: brand?.city || undefined,
        market: brand?.market,
        website: brand?.website || undefined,
        // #11: only the owner's own competitors round-trip. Research-detected
        // ones live on the brand and would blow past MAX_USER_COMPETITORS.
        competitors: (brand?.competitors ?? [])
          .filter((c) => !c.detected)
          .map((c) => c.name)
          .slice(0, MAX_USER_COMPETITORS),
        idempotencyKey: crypto.randomUUID(),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["overview", brand?.id] });
      void queryClient.invalidateQueries({ queryKey: ["brands"] });
      void queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useTogglePrompt(brandId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { promptId: string; disabled: boolean }) =>
      apiPost(`/api/brands/${brandId}/prompts/toggle`, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["prompts", brandId] });
    },
  });
}

type BrandSettingsInput = Partial<Omit<BrandDto, "id" | "city" | "country">> & {
  city?: string | null;
};

export function useSaveBrand(brandId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BrandSettingsInput) => apiPatch<BrandDto>(`/api/brands/${brandId}`, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["brands"] });
      void queryClient.invalidateQueries({ queryKey: ["overview", brandId] });
    },
  });
}
