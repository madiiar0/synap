import OpenAI from "openai";
import { env } from "../config/env.js";
import { computeCost, estimateTokens } from "./cost.js";
import { CONSUMER_SYSTEM_PROMPT, domainOf, type EngineAdapter } from "./types.js";
import type { Citation } from "@synapai/shared";

let client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!client) client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  return client;
}

/** Pull url_citation annotations out of Responses API output items. */
function collectCitations(output: unknown): Citation[] {
  const citations: Citation[] = [];
  const seen = new Set<string>();
  if (!Array.isArray(output)) return citations;
  for (const item of output as { type?: string; content?: unknown }[]) {
    if (item.type !== "message" || !Array.isArray(item.content)) continue;
    for (const part of item.content as { annotations?: unknown }[]) {
      if (!Array.isArray(part.annotations)) continue;
      for (const ann of part.annotations as { type?: string; url?: string; title?: string }[]) {
        if (ann.type === "url_citation" && ann.url && !seen.has(ann.url)) {
          seen.add(ann.url);
          citations.push({ url: ann.url, domain: domainOf(ann.url), title: ann.title });
        }
      }
    }
  }
  return citations;
}

export function createChatgptAdapter(): EngineAdapter {
  return {
    id: "chatgpt",
    available: () => Boolean(env.OPENAI_API_KEY),
    async query(prompt) {
      const resp = await getClient().responses.create({
        model: env.OPENAI_MODEL,
        instructions: CONSUMER_SYSTEM_PROMPT,
        input: prompt,
        tools: [{ type: "web_search_preview" }],
      });
      const text = resp.output_text ?? "";
      const tokensIn = resp.usage?.input_tokens ?? estimateTokens(prompt);
      const tokensOut = resp.usage?.output_tokens ?? estimateTokens(text);
      return {
        text,
        citations: collectCitations(resp.output),
        model: env.OPENAI_MODEL,
        tokensIn,
        tokensOut,
        costUsd: computeCost(env.OPENAI_MODEL, tokensIn, tokensOut),
      };
    },
  };
}
