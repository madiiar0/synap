/**
 * §3: subscore weights for the PRIMARY visibility score. Branded prompts are
 * excluded from it entirely (reported separately), so these weights cover only
 * unbranded discovery groups and sum to 1.
 *
 * Previous weights were branded .35 / category .45 / comparison .20, i.e. 55%
 * of the score came from prompts that named the business.
 */
export const SUBSCORE_WEIGHTS = {
  category: 0.6,
  comparison: 0.4,
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
 * §2: the visibility scan must represent customers who do NOT already know the
 * business. Branded prompts (which name it) are capped at 12%; comparison
 * prompts are now written between third-party alternatives and carry no brand
 * name, so >= 88% of every scan is unbranded.
 * Largest-remainder allocation yields 3 branded, 3 comparison, 5 category,
 * 5 best-of, 5 purchase and 4 informational prompts in the default set of 25.
 *
 * Previous mix put branded at 24% and comparison at 8% (both named the
 * business) = 32% branded, which is what inflated the score.
 */
export const INTENT_MIX: Record<PromptIntent, number> = {
  branded: 0.12,
  comparison: 0.12,
  category: 0.2,
  best_of: 0.2,
  purchase: 0.2,
  informational: 0.16,
};

/** §2: intents whose prompts name the target business. */
export const BRANDED_INTENTS: readonly PromptIntent[] = ["branded"];

/** §2: the minimum share of a scan that must be unbranded. */
export const MIN_UNBRANDED_SHARE = 0.8;

/**
 * §12: bump when the scoring or extraction methodology changes, so historical
 * scans are never silently compared against incompatible numbers.
 */
export const METRIC_VERSION = 2;

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
