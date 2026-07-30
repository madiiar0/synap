import type { EngineId } from "@synapai/shared";
import { estimateTokens } from "./cost.js";
import { buildDemoAnswer } from "./fixtures.js";
import type { EngineAdapter } from "./types.js";

/**
 * Fixture engine used when DEMO_MODE=true: deterministic, free, offline.
 * Usage is still recorded (with zero cost) so the admin panel shows volumes.
 */
export function createDemoAdapter(id: EngineId): EngineAdapter {
  return {
    id,
    available: () => true,
    async query(prompt, opts) {
      if (!opts.demo) {
        throw new Error("demo adapter requires a DemoContext");
      }
      const { text, citations } = buildDemoAnswer(id, prompt, opts.language, opts.demo);
      return {
        text,
        citations,
        model: `demo-${id}`,
        tokensIn: estimateTokens(prompt),
        tokensOut: estimateTokens(text),
        costUsd: 0,
      };
    },
  };
}
