import {
  detectBrands,
  llmExtractionSchema,
  type BrandLike,
  type CompetitorRef,
  type Extracted,
  type LlmExtraction,
  type Sentiment,
} from "@synapai/shared";
import { env } from "../config/env.js";
import { DEMO_DETECTED_COMPETITORS } from "../engines/fixtures.js";
import { extractionAdapter } from "../engines/registry.js";
import { logger } from "../lib/logger.js";

const POSITIVE_MARKERS = [
  "хвалят", "рекоменд", "положительн", "довольн", "качествен", "надёжн", "надежн",
  "отличн", "предпочтительнее", "сильный сервис",
  "recommend", "praised", "reliable", "excellent", "positive", "preferable", "strong service",
];

const NEGATIVE_MARKERS = [
  "жалоб", "жалуе", "негатив", "недовол", "проблем", "хуже", "неоднородн", "разные отзывы",
  "complaint", "negative", "issues", "worse", "mixed", "vary",
];

/** Whole-answer tone heuristic; used as the deterministic sentiment fallback. */
export function keywordSentiment(text: string): Sentiment {
  const lower = text.toLowerCase();
  const pos = POSITIVE_MARKERS.some((m) => lower.includes(m));
  const neg = NEGATIVE_MARKERS.some((m) => lower.includes(m));
  if (pos && neg) return "neu";
  if (pos) return "pos";
  if (neg) return "neg";
  return "neu";
}

export interface ExtractionTarget {
  brand: BrandLike;
  competitors: CompetitorRef[];
  /** Additional known names to scan for (demo detected pool). */
  extraNames?: string[];
}

/** Stage 1: deterministic alias matching. Its `mentioned=true` always wins. */
export function deterministicExtract(text: string, target: ExtractionTarget): Extracted {
  const candidates: BrandLike[] = [
    { name: target.brand.name, aliases: target.brand.aliases ?? [] },
    ...target.competitors,
    ...(target.extraNames ?? []).map((name) => ({ name })),
  ];
  const detected = detectBrands(text, candidates);
  const us = detected.find((d) => d.name === target.brand.name);
  return {
    mentioned: Boolean(us),
    matchedAlias: us ? target.brand.name : undefined,
    position: us?.position,
    sentiment: us ? keywordSentiment(text) : "na",
    brands: detected.map((d) => ({ name: d.name, position: d.position })),
  };
}

/** Strip code fences / prose around a JSON object and parse defensively. */
export function parseLlmJson(raw: string): LlmExtraction | null {
  try {
    let cleaned = raw.trim();
    const fence = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence) cleaned = fence[1].trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return null;
    const parsed: unknown = JSON.parse(cleaned.slice(start, end + 1));
    const result = llmExtractionSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

function buildLlmPrompt(text: string, target: ExtractionTarget): string {
  const competitors = target.competitors.map((c) => c.name).join(", ") || "none listed";
  return [
    `You are a strict information extractor. Analyze the AI answer below.`,
    `Target brand: "${target.brand.name}" (aliases: ${(target.brand.aliases ?? []).join(", ") || "none"}).`,
    `Known competitors: ${competitors}.`,
    `Return ONLY minified JSON, no prose, exactly this shape:`,
    `{"mentioned":boolean,"matchedAlias":string|null,"position":number|null,"sentiment":"pos"|"neu"|"neg"|"na","brands":[{"name":string,"position":number|null}]}`,
    `"brands" lists every company/brand named in the answer in order of first mention (position 1 = first).`,
    `"position" is the target brand's position among them, null if absent. "sentiment" refers to the target brand only.`,
    `ANSWER:\n"""${text.slice(0, 6000)}"""`,
  ].join("\n");
}

function mergeExtractions(det: Extracted, llm: LlmExtraction): Extracted {
  const byName = new Map<string, { name: string; position?: number }>();
  for (const b of [...det.brands, ...llm.brands.map((b) => ({ name: b.name, position: b.position ?? undefined }))]) {
    const key = b.name.toLowerCase();
    const existing = byName.get(key);
    if (!existing) byName.set(key, { name: b.name, position: b.position });
    else if (b.position && (!existing.position || b.position < existing.position)) {
      existing.position = b.position;
    }
  }
  return {
    // Deterministic mentioned=true always wins; LLM can only add a mention.
    mentioned: det.mentioned || llm.mentioned,
    matchedAlias: det.matchedAlias ?? llm.matchedAlias ?? undefined,
    position: det.position ?? llm.position ?? undefined,
    sentiment: llm.sentiment !== "na" ? llm.sentiment : det.sentiment,
    brands: [...byName.values()],
  };
}

/**
 * Two-stage extraction: deterministic matcher first, then (outside demo mode)
 * an LLM pass via EXTRACTION_PROVIDER for sentiment + unknown-brand discovery.
 * Any LLM failure degrades to stage 1.
 */
export async function extractAnswer(text: string, target: ExtractionTarget): Promise<Extracted> {
  if (env.DEMO_MODE) {
    return deterministicExtract(text, {
      ...target,
      extraNames: [...(target.extraNames ?? []), ...DEMO_DETECTED_COMPETITORS],
    });
  }
  const det = deterministicExtract(text, target);
  const adapter = extractionAdapter();
  if (!adapter) return det;
  try {
    const resp = await adapter.query(buildLlmPrompt(text, target), { language: "en" });
    const llm = parseLlmJson(resp.text);
    if (!llm) {
      logger.warn({ engine: adapter.id }, "extraction LLM returned unparseable JSON");
      return det;
    }
    return mergeExtractions(det, llm);
  } catch (err) {
    logger.warn({ err }, "extraction LLM failed; using deterministic result");
    return det;
  }
}
