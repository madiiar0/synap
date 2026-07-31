import { env } from "../config/env.js";
import { EngineHttpError } from "../lib/errors.js";
import { computeCost, estimateTokens } from "./cost.js";
import { CONSUMER_SYSTEM_PROMPT, domainOf, type EngineAdapter } from "./types.js";
import type { Citation } from "@synapai/shared";

interface GrokResponse {
  choices?: { message?: { content?: string } }[];
  usage?: { prompt_tokens?: number; completion_tokens?: number };
  citations?: string[];
}

/**
 * Grok via the xAI API (docs.x.ai) — OpenAI-compatible chat endpoint.
 * Live Search is requested with search_parameters mode "auto"; when the
 * model searches, cited URLs come back in `citations`.
 */
export function createGrokAdapter(): EngineAdapter {
  return {
    id: "grok",
    available: () => Boolean(env.XAI_API_KEY),
    async query(prompt) {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.XAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: env.GROK_MODEL,
          messages: [
            { role: "system", content: CONSUMER_SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
          search_parameters: { mode: "auto", return_citations: true },
        }),
        signal: AbortSignal.timeout(55_000),
      });
      if (!res.ok) throw new EngineHttpError(res.status, `grok http ${res.status}`);
      const data = (await res.json()) as GrokResponse;
      const text = data.choices?.[0]?.message?.content ?? "";

      const seen = new Set<string>();
      const citations: Citation[] = (data.citations ?? [])
        .filter((url) => url && !seen.has(url) && seen.add(url))
        .map((url) => ({ url, domain: domainOf(url) }));

      const tokensIn = data.usage?.prompt_tokens ?? estimateTokens(prompt);
      const tokensOut = data.usage?.completion_tokens ?? estimateTokens(text);
      return {
        text,
        citations,
        model: env.GROK_MODEL,
        tokensIn,
        tokensOut,
        costUsd: computeCost(env.GROK_MODEL, tokensIn, tokensOut),
      };
    },
  };
}
