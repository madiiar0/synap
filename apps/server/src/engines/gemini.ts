import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";
import { computeCost, estimateTokens } from "./cost.js";
import { CONSUMER_SYSTEM_PROMPT, domainOf, type EngineAdapter } from "./types.js";
import type { Citation } from "@synapai/shared";

let client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  if (!client) client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  return client;
}

export function createGeminiAdapter(): EngineAdapter {
  return {
    id: "gemini",
    available: () => Boolean(env.GEMINI_API_KEY),
    async query(prompt) {
      const resp = await getClient().models.generateContent({
        model: env.GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction: CONSUMER_SYSTEM_PROMPT,
          tools: [{ googleSearch: {} }],
        },
      });
      const text = resp.text ?? "";

      const citations: Citation[] = [];
      const seen = new Set<string>();
      const chunks = resp.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
      for (const chunk of chunks) {
        const uri = chunk.web?.uri;
        if (uri && !seen.has(uri)) {
          seen.add(uri);
          citations.push({ url: uri, domain: domainOf(uri), title: chunk.web?.title });
        }
      }

      const tokensIn = resp.usageMetadata?.promptTokenCount ?? estimateTokens(prompt);
      const tokensOut = resp.usageMetadata?.candidatesTokenCount ?? estimateTokens(text);
      return {
        text,
        citations,
        model: env.GEMINI_MODEL,
        tokensIn,
        tokensOut,
        costUsd: computeCost(env.GEMINI_MODEL, tokensIn, tokensOut),
      };
    },
  };
}
