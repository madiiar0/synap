import { z } from "zod";
import {
  LOCALES,
  MARKETS,
  MAX_USER_COMPETITORS,
  PROMPT_INTENTS,
} from "./constants.js";

const trimmed = (min: number, max: number) => z.string().trim().min(min).max(max);

export const scanRequestSchema = z.object({
  brandName: trimmed(2, 80),
  website: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  category: trimmed(2, 60),
  city: trimmed(2, 60).optional().or(z.literal("").transform(() => undefined)),
  market: z.enum(MARKETS).default("kz"),
  competitors: z.array(trimmed(2, 80)).max(MAX_USER_COMPETITORS).optional(),
  locale: z.enum(LOCALES).optional(),
  /** §2.4 idempotency: same key within 60s returns the existing scanId. */
  idempotencyKey: trimmed(8, 64).optional(),
});
export type ScanRequest = z.infer<typeof scanRequestSchema>;

/** Optional text field where an empty/blank string means "not provided". */
const optionalText = (min: number, max: number) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    trimmed(min, max).optional(),
  );

export const bookCallLeadSchema = z.object({
  name: optionalText(1, 80),
  email: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().trim().toLowerCase().email().max(120).optional(),
  ),
  phone: optionalText(5, 40),
  message: optionalText(1, 1000),
  brandName: optionalText(1, 80),
  scanId: optionalText(1, 64),
  source: z.enum(["landing", "dashboard", "report"]).default("landing"),
  /** true when the modal was merely opened (Calendly may complete off-site). */
  opened: z.boolean().optional(),
});

export const brandSettingsSchema = z.object({
  name: trimmed(2, 80).optional(),
  aliases: z.array(trimmed(1, 80)).max(20).optional(),
  website: z.string().trim().max(200).optional(),
  category: trimmed(2, 60).optional(),
  city: trimmed(2, 60).nullable().optional(),
  market: z.enum(MARKETS).optional(),
  competitors: z
    .array(z.object({ name: trimmed(2, 80), aliases: z.array(trimmed(1, 80)).max(10) }))
    .max(MAX_USER_COMPETITORS)
    .optional(),
  locale: z.enum(LOCALES).optional(),
});

export const promptToggleSchema = z.object({
  promptId: z.string().max(64),
  disabled: z.boolean(),
});

/** §4: one batched extraction call returns an array with one item per answer. */
export const llmBatchExtractionSchema = z.array(
  z.object({
    index: z.number().int().min(0),
    mentioned: z.boolean(),
    matchedAlias: z.string().nullable().optional(),
    position: z.number().int().min(1).max(50).nullable().optional(),
    sentiment: z.enum(["pos", "neu", "neg", "na"]).default("na"),
    brands: z
      .array(
        z.object({
          name: z.string().min(1).max(120),
          position: z.number().int().min(1).max(50).nullable().optional(),
        }),
      )
      .default([]),
  }),
);
export type LlmBatchExtraction = z.infer<typeof llmBatchExtractionSchema>;

/** Strict JSON the extraction LLM must return. */
export const llmExtractionSchema = z.object({
  mentioned: z.boolean(),
  matchedAlias: z.string().nullable().optional(),
  position: z.number().int().min(1).max(50).nullable().optional(),
  sentiment: z.enum(["pos", "neu", "neg", "na"]).default("na"),
  brands: z
    .array(
      z.object({
        name: z.string().min(1).max(120),
        position: z.number().int().min(1).max(50).nullable().optional(),
      }),
    )
    .default([]),
});
export type LlmExtraction = z.infer<typeof llmExtractionSchema>;

/** Strict JSON the prompt-generation LLM must return. */
export const llmPromptGenSchema = z.object({
  prompts: z
    .array(
      z.object({
        text: z.string().min(5).max(300),
        language: z.enum(LOCALES),
        intent: z.enum(PROMPT_INTENTS),
      }),
    )
    .min(1),
});

/**
 * §2 Stage A: strict JSON the business-research call must return. Every field
 * is optional-tolerant so a partial answer still yields usable research
 * instead of failing the whole scan.
 */
export const businessResearchSchema = z.object({
  summary: z.string().max(1200).default(""),
  services: z.array(z.string().min(1).max(160)).max(20).default([]),
  audience: z.string().max(600).default(""),
  differentiators: z.array(z.string().min(1).max(200)).max(20).default([]),
  likelyCompetitors: z.array(z.string().min(1).max(160)).max(20).default([]),
  aliases: z.array(z.string().min(1).max(160)).max(20).default([]),
  confidence: z.enum(["high", "medium", "low"]).default("low"),
  sourcesUsed: z.array(z.string().max(600)).max(30).default([]),
});
export type BusinessResearch = z.infer<typeof businessResearchSchema>;

/** §2 Stage B: strict JSON for generated prompts. */
export const generatedPromptsSchema = z.array(
  z.object({
    text: z.string().min(5).max(300),
    language: z.enum(["ru", "en"]),
    intent: z.enum(["branded", "category", "best_of", "comparison", "informational", "purchase"]),
    scope: z.string().max(120).optional(),
  }),
);
export type GeneratedPromptSpecs = z.infer<typeof generatedPromptsSchema>;
