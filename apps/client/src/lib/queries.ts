import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AnswerRowDto,
  BrandDto,
  CompetitorRowDto,
  OverviewDto,
  PromptRowDto,
  SessionUserDto,
  TopSource,
} from "@synapai/shared";
import { apiGet, apiPatch, apiPost } from "./api";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => apiGet<SessionUserDto>("/api/auth/me"),
    retry: false,
  });
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

export function useSources(brandId: string | undefined) {
  return useQuery({
    queryKey: ["sources", brandId],
    queryFn: () => apiGet<TopSource[]>(`/api/brands/${brandId}/sources`),
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

export function useRescan(brandId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiPost<{ scanId: string }>(`/api/brands/${brandId}/rescan`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["overview", brandId] });
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
