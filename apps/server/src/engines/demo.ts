import type { EngineId } from "@synapai/shared";
import { buildDemoAnswer } from "./fixtures.js";
import { estimateTokens, type EngineAdapter } from "./types.js";

// Test instrumentation: lets the freshness test assert that every scan
// issues a complete, fresh set of provider calls (§2.4).
let demoCallCount = 0;
export function getDemoCallCount(): number {
  return demoCallCount;
}
export function resetDemoCallCount(): void {
  demoCallCount = 0;
}

/**
 * Fixture engine used when DEMO_MODE=true: deterministic, free, offline.
 * Usage is still recorded (with zero cost) so the admin panel shows volumes.
 */
export function createDemoAdapter(id: EngineId): EngineAdapter {
  return {
    id,
    available: () => true,
    async query(prompt, opts) {
      demoCallCount += 1;
      if (!opts?.demo) {
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
        searchFeeUsd: 0,
      };
    },
  };
}
