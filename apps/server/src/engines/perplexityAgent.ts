import {
  ENGINES,
  EXTRACTION_MODEL,
  FALLBACK_RATES,
  SEARCH_FEE_PER_CALL_USD,
  supportsReasoning,
  type EngineId,
} from "@synapai/shared";
import type { Citation } from "@synapai/shared";
import { env } from "../config/env.js";
import { EngineHttpError } from "../lib/errors.js";
import { CONSUMER_SYSTEM_PROMPT, domainOf, estimateTokens, type EngineAdapter, type EngineAnswer } from "./types.js";

/**
 * §1: the ONLY provider integration. Every engine is a model routed through
 * Perplexity's Agent API (POST /v1/agent, verified 2026-08-01). One
 * PERPLEXITY_API_KEY; models addressed as provider/model strings.
 */

const AGENT_URL = "https://api.perplexity.ai/v1/agent";

interface AgentUsage {
  input_tokens?: number;
  output_tokens?: number;
  tool_calls_details?: Record<string, number>;
  cost?: {
    total_cost?: number;
    tool_calls_cost?: number;
  };
}

interface AgentResponse {
  output_text?: string;
  output?: {
    type?: string;
    content?: {
      type?: string;
      text?: string;
      annotations?: { type?: string; url?: string; title?: string }[];
    }[];
  }[];
  citations?: string[];
  usage?: AgentUsage;
}

function extractText(resp: AgentResponse): string {
  if (typeof resp.output_text === "string" && resp.output_text.length > 0) {
    return resp.output_text;
  }
  const parts: string[] = [];
  for (const item of resp.output ?? []) {
    if (item.type !== "message") continue;
    for (const part of item.content ?? []) {
      if (typeof part.text === "string") parts.push(part.text);
    }
  }
  return parts.join("\n");
}

function extractCitations(resp: AgentResponse): Citation[] {
  const seen = new Set<string>();
  const out: Citation[] = [];
  const push = (url: string, title?: string): void => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    out.push({ url, domain: domainOf(url), title });
  };
  for (const item of resp.output ?? []) {
    for (const part of item.content ?? []) {
      for (const ann of part.annotations ?? []) {
        if (ann.type === "url_citation" && ann.url) push(ann.url, ann.title);
      }
    }
  }
  for (const url of resp.citations ?? []) push(url);
  return out;
}

export interface AgentCallOptions {
  model: string;
  webSearch: boolean;
  maxOutputTokens: number;
  /** Overrides the consumer persona (Stage A research uses its own). */
  instructions?: string;
  /** Let the model read specific pages (Stage A uses it on the website). */
  fetchUrl?: boolean;
}

export async function agentCallRaw(
  prompt: string,
  opts: AgentCallOptions,
): Promise<EngineAnswer> {
  const body: Record<string, unknown> = {
    model: opts.model,
    input: prompt,
    instructions: opts.instructions ?? CONSUMER_SYSTEM_PROMPT,
    max_output_tokens: opts.maxOutputTokens,
  };
  // §1.5: single-step consumer answers, minimal reasoning. Sonar rejects the
  // field outright, so it is only sent to models that accept it.
  if (supportsReasoning(opts.model)) {
    body.reasoning = { effort: "minimal" };
  }
  const tools: Record<string, unknown>[] = [];
  if (opts.webSearch) tools.push({ type: "web_search", search_context_size: "low" });
  if (opts.fetchUrl) tools.push({ type: "fetch_url" });
  if (tools.length > 0) body.tools = tools;

  const res = await fetch(AGENT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(55_000),
  });
  if (!res.ok) {
    // §1.3: surface the provider's own message — a 400 on a model id is
    // otherwise indistinguishable from a transport failure.
    const detail = await res.text().catch(() => "");
    throw new EngineHttpError(
      res.status,
      `perplexity-agent http ${res.status} (model ${opts.model})${detail ? `: ${detail.slice(0, 400)}` : ""}`,
    );
  }
  const data = (await res.json()) as AgentResponse;

  const text = extractText(data);
  const tokensIn = data.usage?.input_tokens ?? estimateTokens(prompt);
  const tokensOut = data.usage?.output_tokens ?? estimateTokens(text);
  const searchCalls = Object.values(data.usage?.tool_calls_details ?? {}).reduce(
    (sum, n) => sum + n,
    0,
  );

  // Provider-reported cost always wins; fall back to verified rates.
  const searchFeeUsd =
    data.usage?.cost?.tool_calls_cost ?? searchCalls * SEARCH_FEE_PER_CALL_USD;
  const rates = FALLBACK_RATES[opts.model] ?? FALLBACK_RATES.default;
  const costUsd =
    data.usage?.cost?.total_cost ??
    (tokensIn * rates.in + tokensOut * rates.out) / 1_000_000 + searchFeeUsd;

  return {
    text,
    citations: extractCitations(data),
    model: opts.model,
    tokensIn,
    tokensOut,
    costUsd,
    searchFeeUsd,
  };
}

/** One adapter instance per engine ID, model from the shared registry (§1.6). */
export function createAgentEngineAdapter(id: EngineId): EngineAdapter {
  const model = ENGINES[id].model;
  return {
    id,
    available: () => Boolean(env.PERPLEXITY_API_KEY),
    query: (prompt) => agentCallRaw(prompt, { model, webSearch: true, maxOutputTokens: 500 }),
  };
}

/**
 * §4: cheap NON-search call for batched extraction / prompt generation —
 * the answer text is already in the prompt, so no web_search and no search fee.
 */
export function extractionModelCall(prompt: string, maxOutputTokens = 1800): Promise<EngineAnswer> {
  return agentCallRaw(prompt, { model: EXTRACTION_MODEL, webSearch: false, maxOutputTokens });
}

export function extractionAvailable(): boolean {
  return Boolean(env.PERPLEXITY_API_KEY);
}
