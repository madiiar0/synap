import type { Citation, CompetitorRef, EngineId, PromptIntent, PromptLanguage } from "@synapai/shared";

/** Context the demo (fixture) engine needs to fill realistic answers. */
export interface DemoContext {
  scanSeed: string;
  brandName: string;
  competitors: CompetitorRef[];
  category: string;
  city?: string;
  intent: PromptIntent;
}

export interface EngineQueryOptions {
  language: PromptLanguage;
  demo?: DemoContext;
}

export interface EngineAnswer {
  text: string;
  citations: Citation[];
  model: string;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
  /** Portion of costUsd that is the web_search tool fee. */
  searchFeeUsd: number;
}

export interface EngineAdapter {
  id: EngineId;
  available(): boolean;
  query(prompt: string, opts?: EngineQueryOptions): Promise<EngineAnswer>;
}

/** Rough token estimate for responses that carry no usage block. */
export function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

export const CONSUMER_SYSTEM_PROMPT =
  "Answer naturally as you would for a consumer, in the language of the question.";

export function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0] ?? url;
  }
}
