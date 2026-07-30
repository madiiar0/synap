import { env } from "../config/env.js";
import { EngineHttpError } from "../lib/errors.js";
import { computeCost, estimateTokens } from "./cost.js";
import { CONSUMER_SYSTEM_PROMPT, domainOf, type EngineAdapter } from "./types.js";

interface PerplexityResponse {
  choices?: { message?: { content?: string } }[];
  citations?: string[];
  search_results?: { url?: string; title?: string }[];
  usage?: { prompt_tokens?: number; completion_tokens?: number };
}

export function createPerplexityAdapter(): EngineAdapter {
  return {
    id: "perplexity",
    available: () => Boolean(env.PERPLEXITY_API_KEY),
    async query(prompt) {
      const res = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: env.PERPLEXITY_MODEL,
          messages: [
            { role: "system", content: CONSUMER_SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
        }),
        signal: AbortSignal.timeout(55_000),
      });
      if (!res.ok) throw new EngineHttpError(res.status, `perplexity http ${res.status}`);
      const data = (await res.json()) as PerplexityResponse;
      const text = data.choices?.[0]?.message?.content ?? "";

      const seen = new Set<string>();
      const citations = [
        ...(data.search_results ?? []).map((r) => ({ url: r.url ?? "", title: r.title })),
        ...(data.citations ?? []).map((url) => ({ url, title: undefined })),
      ]
        .filter((c) => c.url && !seen.has(c.url) && seen.add(c.url))
        .map((c) => ({ url: c.url, domain: domainOf(c.url), title: c.title }));

      const tokensIn = data.usage?.prompt_tokens ?? estimateTokens(prompt);
      const tokensOut = data.usage?.completion_tokens ?? estimateTokens(text);
      return {
        text,
        citations,
        model: env.PERPLEXITY_MODEL,
        tokensIn,
        tokensOut,
        costUsd: computeCost(env.PERPLEXITY_MODEL, tokensIn, tokensOut),
      };
    },
  };
}
