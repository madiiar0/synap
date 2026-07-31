export const ENGINE_IDS = [
  "perplexity",
  "chatgpt",
  "gemini",
  "claude",
  "deepseek",
  "grok",
] as const;
export type EngineId = (typeof ENGINE_IDS)[number];

export const ENGINE_LABELS: Record<EngineId, string> = {
  perplexity: "Perplexity",
  chatgpt: "ChatGPT",
  gemini: "Gemini",
  claude: "Claude",
  deepseek: "DeepSeek",
  grok: "Grok",
};

/**
 * Cross-engine weights used when averaging per-engine scores into the overall
 * Visibility Score. Renormalized over the engines actually enabled for a scan.
 */
export const ENGINE_WEIGHTS: Record<EngineId, number> = {
  chatgpt: 0.25,
  perplexity: 0.2,
  gemini: 0.15,
  deepseek: 0.15,
  grok: 0.15,
  claude: 0.1,
};

/**
 * overall = round(0.35·branded + 0.45·category + 0.20·comparison), where each
 * subscore is a 0–100 mention rate over its intent group (see scoring.ts).
 */
export const SUBSCORE_WEIGHTS = {
  branded: 0.35,
  category: 0.45,
  comparison: 0.2,
} as const;

/**
 * When the brand's average mention position (across answers where it appears)
 * is ≤ maxAvgPosition, the overall score gets the +15% bonus, capped at 100.
 */
export const POSITION_BONUS = { maxAvgPosition: 2, multiplier: 1.15 } as const;

export const PROMPT_INTENTS = [
  "branded",
  "category",
  "best_of",
  "comparison",
  "informational",
  "purchase",
] as const;
export type PromptIntent = (typeof PROMPT_INTENTS)[number];

/** Share of each intent in a generated prompt set (sums to 1). */
export const INTENT_MIX: Record<PromptIntent, number> = {
  branded: 0.15,
  category: 0.25,
  best_of: 0.2,
  comparison: 0.15,
  informational: 0.15,
  purchase: 0.1,
};

/** Intents that make up the "category" subscore group. */
export const CATEGORY_GROUP: readonly PromptIntent[] = [
  "category",
  "best_of",
  "purchase",
];

export const MARKETS = ["kz", "ru", "global"] as const;
export type Market = (typeof MARKETS)[number];

/** Share of RU-language prompts per market (rest are EN). */
export const LANGUAGE_MIX: Record<Market, { ru: number; en: number }> = {
  kz: { ru: 0.7, en: 0.3 },
  ru: { ru: 0.9, en: 0.1 },
  global: { ru: 0.2, en: 0.8 },
};

/**
 * USD per 1M tokens, in/out. ESTIMATES as of 2026-07 — re-verify against
 * provider pricing pages when real keys are added (see MANUAL_SETUP.md).
 * Unknown models fall back to `default`.
 */
export const COST_PER_MTOK: Record<string, { in: number; out: number }> = {
  sonar: { in: 1, out: 1 },
  "gpt-4o-mini": { in: 0.15, out: 0.6 },
  "claude-haiku-4-5": { in: 1, out: 5 },
  "gemini-2.5-flash": { in: 0.3, out: 2.5 },
  // api-docs.deepseek.com/quick_start/pricing (cache-miss rate)
  "deepseek-chat": { in: 0.27, out: 1.1 },
  // docs.x.ai pricing; grok-3-mini is the cheap tier (live search billed extra per source)
  "grok-3-mini": { in: 0.3, out: 0.5 },
  default: { in: 1, out: 3 },
};

/** A non-configured brand seen in at least this many answers becomes a "detected" competitor. */
export const AUTO_COMPETITOR_MIN_MENTIONS = 3;

export const MAX_USER_COMPETITORS = 5;

/** Completed scan younger than this is served from cache for identical public requests. */
export const SCAN_CACHE_DAYS = 7;

/** Free-tier user re-scans allowed per rolling week. */
export const FREE_RESCANS_PER_WEEK = 1;

export const LOCALES = ["ru", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ru";
