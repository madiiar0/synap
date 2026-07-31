/**
 * §1.4 engine registry: every engine is one model routed through Perplexity's
 * Agent API (single provider, single PERPLEXITY_API_KEY).
 *
 * Model IDs and rates verified against docs.perplexity.ai on 2026-08-01
 * (see BUILDLOG.md): cheapest current model per provider. Weights reflect
 * assistant popularity in Kazakhstan and are used for scoring ONLY — never
 * for deciding which prompts go where.
 */
export const ENGINES = {
  chatgpt: { label: "ChatGPT", model: "openai/gpt-5.4-nano", weight: 0.3 },
  gemini: { label: "Gemini", model: "google/gemini-3.1-flash-lite", weight: 0.25 },
  perplexity: { label: "Perplexity", model: "perplexity/sonar", weight: 0.2 },
  claude: { label: "Claude", model: "anthropic/claude-haiku-4-5", weight: 0.15 },
  grok: { label: "Grok", model: "xai/grok-4.3", weight: 0.1 },
} as const;

export type EngineId = keyof typeof ENGINES;

export const ENGINE_IDS = Object.keys(ENGINES) as EngineId[];

export const ENGINE_LABELS: Record<EngineId, string> = Object.fromEntries(
  ENGINE_IDS.map((id) => [id, ENGINES[id].label]),
) as Record<EngineId, string>;

/** Renormalized over whatever subset a given scan actually used. */
export const ENGINE_WEIGHTS: Record<EngineId, number> = Object.fromEntries(
  ENGINE_IDS.map((id) => [id, ENGINES[id].weight]),
) as Record<EngineId, number>;

/** Cheap NON-search model for batched extraction and prompt generation. */
export const EXTRACTION_MODEL = "openai/gpt-5.4-nano";

/**
 * Agent API web_search tool fee: $2.50 per 1000 invocations, flat
 * (search_context_size does not change it). Verified 2026-08-01.
 */
export const SEARCH_FEE_PER_CALL_USD = 0.0025;

/**
 * Fallback $/1M token rates for when a response carries no usage.cost
 * (normally it does; provider-reported cost always wins). Verified 2026-08-01.
 */
export const FALLBACK_RATES: Record<string, { in: number; out: number }> = {
  "openai/gpt-5.4-nano": { in: 0.2, out: 1.25 },
  "google/gemini-3.1-flash-lite": { in: 0.25, out: 1.5 },
  "perplexity/sonar": { in: 0.25, out: 2.5 },
  "anthropic/claude-haiku-4-5": { in: 1.0, out: 5.0 },
  "xai/grok-4.3": { in: 1.25, out: 2.5 },
  default: { in: 1, out: 3 },
};
