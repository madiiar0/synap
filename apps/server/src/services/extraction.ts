import {
  detectBrands,
  EXTRACTION_BATCH_SIZE,
  llmBatchExtractionSchema,
  type BrandLike,
  type CompetitorRef,
  type Extracted,
  type LlmBatchExtraction,
  type Sentiment,
} from "@synapai/shared";
import { env } from "../config/env.js";
import { DEMO_DETECTED_COMPETITORS } from "../engines/fixtures.js";
import { extractionAvailable, extractionModelCall } from "../engines/perplexityAgent.js";
import { logger } from "../lib/logger.js";
import { recordUsage } from "./usage.js";

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

/** Stage 1: deterministic alias matching, free. Its `mentioned=true` always wins. */
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

/** Demo-mode extraction: deterministic only, with the fixture detected pool. */
export function demoExtract(text: string, target: ExtractionTarget): Extracted {
  return deterministicExtract(text, {
    ...target,
    extraNames: [...(target.extraNames ?? []), ...DEMO_DETECTED_COMPETITORS],
  });
}

/** Strip code fences / prose around a JSON array and parse defensively. */
export function parseLlmBatch(raw: string): LlmBatchExtraction | null {
  try {
    let cleaned = raw.trim();
    const fence = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence) cleaned = fence[1].trim();
    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]");
    if (start === -1 || end === -1 || end <= start) return null;
    const parsed: unknown = JSON.parse(cleaned.slice(start, end + 1));
    const result = llmBatchExtractionSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

function buildBatchPrompt(texts: string[], target: ExtractionTarget): string {
  const competitors = target.competitors.map((c) => c.name).join(", ") || "none listed";
  const answersBlock = texts
    .map((text, i) => `--- ANSWER ${i} ---\n${text.slice(0, 3500)}`)
    .join("\n\n");
  return [
    `You are a strict information extractor. Below are ${texts.length} AI answers, numbered from 0.`,
    `Target brand: "${target.brand.name}" (aliases: ${(target.brand.aliases ?? []).join(", ") || "none"}).`,
    `Known competitors: ${competitors}.`,
    `For EACH answer return one object. Reply with ONLY a minified JSON array, no prose:`,
    `[{"index":number,"mentioned":boolean,"matchedAlias":string|null,"position":number|null,"sentiment":"pos"|"neu"|"neg"|"na","brands":[{"name":string,"position":number|null}]}]`,
    `"brands" lists every company named in that answer in order of first mention (position 1 = first).`,
    `"position" is the target brand's position among them, null if absent. "sentiment" refers to the target brand only.`,
    ``,
    answersBlock,
  ].join("\n");
}

function mergeExtractions(det: Extracted, llm: LlmBatchExtraction[number]): Extracted {
  const byName = new Map<string, { name: string; position?: number }>();
  for (const b of [
    ...det.brands,
    ...llm.brands.map((b) => ({ name: b.name, position: b.position ?? undefined })),
  ]) {
    const key = b.name.toLowerCase();
    const existing = byName.get(key);
    if (!existing) byName.set(key, { name: b.name, position: b.position });
    else if (b.position && (!existing.position || b.position < existing.position)) {
      existing.position = b.position;
    }
  }
  return {
    // Deterministic mentioned=true always wins; the LLM can only add a mention.
    mentioned: det.mentioned || llm.mentioned,
    matchedAlias: det.matchedAlias ?? llm.matchedAlias ?? undefined,
    position: det.position ?? llm.position ?? undefined,
    sentiment: llm.sentiment !== "na" ? llm.sentiment : det.sentiment,
    brands: [...byName.values()],
  };
}

export interface BatchItem {
  id: string;
  text: string;
  deterministic: Extracted;
}

/** How many extraction calls a scan of `answerCount` answers needs (§4 test). */
export function extractionCallCount(answerCount: number): number {
  return Math.ceil(answerCount / EXTRACTION_BATCH_SIZE);
}

/**
 * §4: batched LLM extraction — up to 10 answers per call to a cheap
 * NON-search model. Returns id → merged Extracted; items the LLM missed
 * keep their deterministic result. No-op in demo mode / without a key.
 */
export async function batchLlmExtract(
  items: BatchItem[],
  target: ExtractionTarget,
): Promise<Map<string, Extracted>> {
  const merged = new Map<string, Extracted>();
  if (env.DEMO_MODE || !extractionAvailable() || items.length === 0) return merged;

  for (let offset = 0; offset < items.length; offset += EXTRACTION_BATCH_SIZE) {
    const chunk = items.slice(offset, offset + EXTRACTION_BATCH_SIZE);
    try {
      const resp = await extractionModelCall(
        buildBatchPrompt(chunk.map((c) => c.text), target),
      );
      await recordUsage("extraction", resp);
      const parsed = parseLlmBatch(resp.text);
      if (!parsed) {
        logger.warn("batched extraction returned unparseable JSON; keeping deterministic");
        continue;
      }
      for (const entry of parsed) {
        const item = chunk[entry.index];
        if (!item) continue;
        merged.set(item.id, mergeExtractions(item.deterministic, entry));
      }
    } catch (err) {
      logger.warn({ err }, "batched extraction call failed; keeping deterministic results");
    }
  }
  return merged;
}
