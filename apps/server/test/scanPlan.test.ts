import { describe, expect, it } from "vitest";
import { EXTRACTION_BATCH_SIZE, FREE_SCAN } from "@synapai/shared";
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
  it("free scan is exactly 41 provider calls: 8 core × 3 engines + 17 tail", () => {
    const coreCalls = FREE_SCAN.corePrompts * FREE_SCAN.coreEngines.length;
    const tailCalls = FREE_SCAN.prompts - FREE_SCAN.corePrompts;
    expect(coreCalls + tailCalls).toBe(41);
  });

  it("full scan is 125 calls: 25 prompts × 5 engines", () => {
    expect(FREE_SCAN.prompts * 5).toBe(125);
  });

  it("25-prompt intent mix is branded 6 / comparison 2 / category 5 / best_of 4 / purchase 4 / informational 4 (§3)", () => {
    expect(computeIntentCounts(25, true)).toEqual({
      branded: 6,
      comparison: 2,
      category: 5,
      best_of: 4,
      purchase: 4,
      informational: 4,
    });
  });

  it("core-8 always contains every branded prompt (§2.1)", () => {
    const prompts = generateTemplatePrompts(brand, 25);
    const core = selectCoreIndices(prompts, FREE_SCAN.corePrompts);
    expect(core.size).toBe(8);
    prompts.forEach((p, i) => {
      if (p.intent === "branded") {
        expect(core.has(i), `branded prompt ${i} must be core`).toBe(true);
      }
    });
    // comparison prompts fill the remaining core slots
    const coreIntents = [...core].map((i) => prompts[i].intent);
    expect(coreIntents.filter((x) => x === "comparison").length).toBe(2);
  });

  it("extraction adds at most ceil(calls/10) LLM calls (§4)", () => {
    expect(extractionCallCount(41)).toBe(Math.ceil(41 / EXTRACTION_BATCH_SIZE));
    const totalProviderCalls = 41 + extractionCallCount(41);
    expect(totalProviderCalls).toBeLessThanOrEqual(41 + Math.ceil(41 / 10));
  });
});
