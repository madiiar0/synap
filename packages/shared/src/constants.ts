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

/**
 * Share of each intent in a generated prompt set (sums to 1). Tuned so the
 * 25-prompt scan yields exactly: branded 6, comparison 2, category 5,
 * best_of 4, purchase 4, informational 4 (§3). Branded + comparison form
 * the core-8 that every core engine answers.
 */
export const INTENT_MIX: Record<PromptIntent, number> = {
  branded: 0.24,
  comparison: 0.08,
  category: 0.2,
  best_of: 0.16,
  purchase: 0.16,
  informational: 0.16,
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

/** A non-configured brand seen in at least this many answers becomes a "detected" competitor. */
export const AUTO_COMPETITOR_MIN_MENTIONS = 3;

export const MAX_USER_COMPETITORS = 5;

export const LOCALES = ["ru", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ru";
