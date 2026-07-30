import { describe, expect, it } from "vitest";
import { normalizedKey } from "@synapai/shared";
import {
  computeIntentCounts,
  generateTemplatePrompts,
  ruShare,
  type PromptGenBrand,
} from "../src/services/promptGen.js";

const brand: PromptGenBrand = {
  name: "Astra Dental",
  category: "стоматология",
  city: "Алматы",
  market: "kz",
  competitors: [
    { name: "Дента Люкс", aliases: [] },
    { name: "SmileCity", aliases: [] },
    { name: "Doctor Dent", aliases: [] },
  ],
};

describe("computeIntentCounts", () => {
  it("matches the documented mix exactly for n=100", () => {
    expect(computeIntentCounts(100, true)).toEqual({
      branded: 15,
      category: 25,
      best_of: 20,
      comparison: 15,
      informational: 15,
      purchase: 10,
    });
  });

  it("always sums to n", () => {
    for (const n of [10, 25, 33, 47, 100]) {
      const counts = computeIntentCounts(n, true);
      expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(n);
    }
  });

  it("folds comparison into category when there are no competitors", () => {
    const counts = computeIntentCounts(100, false);
    expect(counts.comparison).toBe(0);
    expect(counts.category).toBe(40);
    expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(100);
  });
});

describe("generateTemplatePrompts", () => {
  it("produces exactly n unique prompts for a full scan", () => {
    const prompts = generateTemplatePrompts(brand, 100);
    expect(prompts).toHaveLength(100);
    const keys = new Set(prompts.map((p) => normalizedKey(p.text)));
    expect(keys.size).toBe(100);
  });

  it("respects the kz-market language mix (~70% RU)", () => {
    const prompts = generateTemplatePrompts(brand, 100);
    const ru = prompts.filter((p) => p.language === "ru").length;
    expect(ru).toBeGreaterThanOrEqual(60);
    expect(ru).toBeLessThanOrEqual(80);
  });

  it("round-robins competitors in comparison prompts", () => {
    const prompts = generateTemplatePrompts(brand, 100);
    const comparisons = prompts.filter((p) => p.intent === "comparison");
    expect(comparisons.length).toBeGreaterThan(0);
    for (const comp of brand.competitors) {
      expect(comparisons.some((p) => p.text.includes(comp.name))).toBe(true);
    }
  });

  it("still hits n when the competitor list is tiny (comparison pool capped)", () => {
    const small: PromptGenBrand = {
      ...brand,
      competitors: [{ name: "Дента Люкс", aliases: [] }],
    };
    const prompts = generateTemplatePrompts(small, 100);
    expect(prompts).toHaveLength(100);
  });

  it("excludes disabled prompts", () => {
    const first = generateTemplatePrompts(brand, 25)[0];
    const withDisabled = generateTemplatePrompts(
      { ...brand, disabledPrompts: [first.text] },
      25,
    );
    expect(withDisabled.some((p) => normalizedKey(p.text) === normalizedKey(first.text))).toBe(
      false,
    );
  });

  it("global market flips the mix to mostly English", () => {
    const prompts = generateTemplatePrompts({ ...brand, market: "global", city: undefined }, 50);
    const en = prompts.filter((p) => p.language === "en").length;
    expect(en).toBeGreaterThanOrEqual(30);
  });
});

describe("ruShare", () => {
  it("follows the market mixes", () => {
    expect(ruShare(10, "kz")).toBe(7);
    expect(ruShare(10, "ru")).toBe(9);
    expect(ruShare(10, "global")).toBe(2);
  });
});
