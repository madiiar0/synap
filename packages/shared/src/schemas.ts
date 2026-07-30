import { z } from "zod";
import {
  LOCALES,
  MARKETS,
  MAX_USER_COMPETITORS,
  PROMPT_INTENTS,
} from "./constants.js";

const trimmed = (min: number, max: number) => z.string().trim().min(min).max(max);

export const publicScanRequestSchema = z.object({
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
});
export type PublicScanRequest = z.infer<typeof publicScanRequestSchema>;

export const unlockRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(120),
  locale: z.enum(LOCALES).optional(),
});

export const requestLinkSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(120),
  locale: z.enum(LOCALES).optional(),
});

export const verifyTokenSchema = z.object({ token: z.string().min(10).max(2000) });

export const adminLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(120),
  password: z.string().min(8).max(200),
});

export const bookCallLeadSchema = z.object({
  name: trimmed(1, 80).optional(),
  email: z.string().trim().toLowerCase().email().max(120).optional(),
  phone: trimmed(5, 40).optional(),
  message: z.string().trim().max(1000).optional(),
  brandName: trimmed(1, 80).optional(),
  scanId: z.string().max(64).optional(),
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
