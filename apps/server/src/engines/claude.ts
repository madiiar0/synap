import Anthropic from "@anthropic-ai/sdk";
import { env } from "../config/env.js";
import { computeCost, estimateTokens } from "./cost.js";
import { CONSUMER_SYSTEM_PROMPT, type EngineAdapter } from "./types.js";

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  return client;
}

export function createClaudeAdapter(): EngineAdapter {
  return {
    id: "claude",
    available: () => Boolean(env.ANTHROPIC_API_KEY),
    async query(prompt) {
      const msg = await getClient().messages.create({
        model: env.ANTHROPIC_MODEL,
        max_tokens: 1024,
        system: CONSUMER_SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }],
      });
      const text = msg.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("\n");
      const tokensIn = msg.usage?.input_tokens ?? estimateTokens(prompt);
      const tokensOut = msg.usage?.output_tokens ?? estimateTokens(text);
      return {
        text,
        citations: [], // Claude answers without web search here
        model: env.ANTHROPIC_MODEL,
        tokensIn,
        tokensOut,
        costUsd: computeCost(env.ANTHROPIC_MODEL, tokensIn, tokensOut),
      };
    },
  };
}
