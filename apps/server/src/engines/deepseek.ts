import { env } from "../config/env.js";
import { EngineHttpError } from "../lib/errors.js";
import { computeCost, estimateTokens } from "./cost.js";
import { CONSUMER_SYSTEM_PROMPT, type EngineAdapter } from "./types.js";

interface DeepSeekResponse {
  choices?: { message?: { content?: string } }[];
  usage?: { prompt_tokens?: number; completion_tokens?: number };
}

/** DeepSeek chat API (platform.deepseek.com) — OpenAI-compatible, no web search. */
export function createDeepseekAdapter(): EngineAdapter {
  return {
    id: "deepseek",
    available: () => Boolean(env.DEEPSEEK_API_KEY),
    async query(prompt) {
      const res = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: env.DEEPSEEK_MODEL,
          messages: [
            { role: "system", content: CONSUMER_SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
        }),
        signal: AbortSignal.timeout(55_000),
      });
      if (!res.ok) throw new EngineHttpError(res.status, `deepseek http ${res.status}`);
      const data = (await res.json()) as DeepSeekResponse;
      const text = data.choices?.[0]?.message?.content ?? "";
      const tokensIn = data.usage?.prompt_tokens ?? estimateTokens(prompt);
      const tokensOut = data.usage?.completion_tokens ?? estimateTokens(text);
      return {
        text,
        citations: [],
        model: env.DEEPSEEK_MODEL,
        tokensIn,
        tokensOut,
        costUsd: computeCost(env.DEEPSEEK_MODEL, tokensIn, tokensOut),
      };
    },
  };
}
