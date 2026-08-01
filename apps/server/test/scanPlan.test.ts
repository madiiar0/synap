import { describe, expect, it } from "vitest";
import { EXTRACTION_BATCH_SIZE, FREE_SCAN, FREE_SCAN_CALLS } from "@synapai/shared";
import { extractionCallCount } from "../src/services/extraction.js";
import {
  computeIntentCounts,
  generateTemplatePrompts,
  selectCoreIndices,
  type PromptGenBrand,
} from "../src/services/promptGen.js";

const brand: PromptGenBrand = {
  name: "Coffee Boom",
  category: "кофейня",
  city: "Алматы",
  market: "kz",
  competitors: [
    { name: "Nurly Coffee", aliases: [] },
    { name: "Vega Roasters", aliases: [] },
  ],
};

describe("scan plan (§2.1)", () => {
  it("free scan is exactly 43 provider calls: 9 core × 3 engines + 16 tail (§2 Stage C)", () => {
    const coreCalls = FREE_SCAN.corePrompts * FREE_SCAN.coreEngines.length;
    const tailCalls = FREE_SCAN.prompts - FREE_SCAN.corePrompts;
    expect(coreCalls).toBe(27);
    expect(tailCalls).toBe(16);
    expect(coreCalls + tailCalls).toBe(43);
    expect(FREE_SCAN_CALLS).toBe(43);
  });

  it("tail prompts go to the KZ-popular engines only", () => {
    expect(FREE_SCAN.tailEngines).toEqual(["chatgpt", "gemini"]);
    // 16 tail prompts dealt round-robin over 2 engines = 8 each.
    const perEngine = (FREE_SCAN.prompts - FREE_SCAN.corePrompts) / FREE_SCAN.tailEngines.length;
    expect(perEngine).toBe(8);
  });

  it("full scan is 125 calls: 25 prompts × 5 engines", () => {
    expect(FREE_SCAN.prompts * 5).toBe(125);
  });

  it("25-prompt mix keeps branded at 3 of 25 so 88% is unbranded (§2)", () => {
    const counts = computeIntentCounts(25, true);
    expect(counts).toEqual({
      branded: 3,
      comparison: 3,
      category: 5,
      best_of: 5,
      purchase: 5,
      informational: 4,
    });
    expect(1 - counts.branded / 25).toBeGreaterThanOrEqual(0.8);
  });

  it("core-9 always contains every branded prompt (§2 Stage C)", () => {
    const prompts = generateTemplatePrompts(brand, 25);
    const core = selectCoreIndices(prompts, FREE_SCAN.corePrompts);
    expect(core.size).toBe(9);
    prompts.forEach((p, i) => {
      if (p.intent === "branded") {
        expect(core.has(i), `branded prompt ${i} must be core`).toBe(true);
      }
    });
    // comparison prompts fill the remaining core slots
    const coreIntents = [...core].map((i) => prompts[i].intent);
    expect(coreIntents.filter((x) => x === "comparison").length).toBe(3);
  });

  it("extraction adds at most ceil(calls/10) LLM calls (§4)", () => {
    expect(extractionCallCount(43)).toBe(Math.ceil(43 / EXTRACTION_BATCH_SIZE));
    const totalProviderCalls = 43 + extractionCallCount(43);
    expect(totalProviderCalls).toBeLessThanOrEqual(43 + Math.ceil(43 / 10));
  });
});
