import { describe, expect, it } from "vitest";
import type { Extracted } from "@synapai/shared";
import { computeSnapshot, type ScoringAnswer, type ScoringPrompt } from "../src/services/scoring.js";
import { classifyEntity, isCompetitorRow, isGenericPhrase } from "../src/services/entityClass.js";
import { computeIntentCounts, isBrandedPrompt } from "../src/services/promptGen.js";

/**
 * §14 controlled end-to-end fixture, modelled on the reported Qulpynai case:
 * a custom-cake business in Almaty. Nothing here leaks into production logic —
 * these names exist only as test data.
 */
const TARGET = "Qulpynai";

const prompts: ScoringPrompt[] = [
  // Eligible unbranded discovery prompts.
  { id: "u1", intent: "category", branded: false },
  { id: "u2", intent: "best_of", branded: false },
  { id: "u3", intent: "purchase", branded: false },
  { id: "u4", intent: "comparison", branded: false },
  // Branded diagnostics: must never enter the primary score.
  { id: "b1", intent: "branded", branded: true },
  { id: "b2", intent: "branded", branded: true },
];

const extracted = (mentioned: boolean, brands: string[] = [], position?: number): Extracted => ({
  mentioned,
  sentiment: mentioned ? "pos" : "na",
  position: position ?? null,
  brands: brands.map((name, i) => ({ name, position: i + 1 })),
});

const answer = (
  promptId: string,
  engine: "chatgpt" | "gemini" | "perplexity",
  mentioned: boolean,
  brands: string[] = [],
  failed = false,
): ScoringAnswer => ({
  promptId,
  engine,
  failed,
  extracted: extracted(mentioned, brands),
  citations: [],
});

const snapshotOf = (answers: ScoringAnswer[]) =>
  computeSnapshot({
    brandName: TARGET,
    configuredCompetitors: [],
    prompts,
    answers,
  });

describe("§3 Visibility Score uses eligible unbranded prompts only", () => {
  it("branded prompts cannot inflate the primary score", () => {
    // Present in EVERY branded answer, absent from EVERY unbranded one.
    const snap = snapshotOf([
      answer("u1", "chatgpt", false, ["Lalu Cakes"]),
      answer("u2", "chatgpt", false, ["Maksweets"]),
      answer("u3", "chatgpt", false, ["Lalu Cakes"]),
      answer("u4", "chatgpt", false, ["Maksweets"]),
      answer("b1", "chatgpt", true),
      answer("b2", "chatgpt", true),
    ]);
    expect(snap.overall).toBe(0);
  });

  it("one missed eligible unbranded mention prevents a perfect score", () => {
    const perfect = snapshotOf([
      answer("u1", "chatgpt", true),
      answer("u2", "chatgpt", true),
      answer("u3", "chatgpt", true),
      answer("u4", "chatgpt", true),
    ]);
    expect(perfect.overall).toBe(100);

    const oneMiss = snapshotOf([
      answer("u1", "chatgpt", true),
      answer("u2", "chatgpt", true),
      answer("u3", "chatgpt", true),
      answer("u4", "chatgpt", false, ["Lalu Cakes"]), // absent here
    ]);
    expect(oneMiss.overall).toBeLessThan(100);
  });

  it("a failed provider request is excluded from both numerator and denominator", () => {
    const withFailure = snapshotOf([
      answer("u1", "chatgpt", true),
      answer("u2", "chatgpt", true),
      answer("u3", "chatgpt", true),
      answer("u4", "chatgpt", true),
      answer("u1", "gemini", false, [], true), // failed: must not count as a miss
    ]);
    expect(withFailure.overall).toBe(100);
  });

  it("per-engine cards use the same eligibility rules as the main score", () => {
    const snap = snapshotOf([
      answer("u1", "chatgpt", true),
      answer("u2", "chatgpt", false, ["Lalu Cakes"]),
      answer("b1", "chatgpt", true), // branded: excluded from the card too
    ]);
    const card = snap.perEngine.find((e) => e.engine === "chatgpt");
    // 1 of 2 eligible unbranded answers mentioned us, NOT 2 of 3.
    expect(card?.mentionRate).toBeCloseTo(0.5, 5);
  });

  it("is deterministic for the same input", () => {
    const answers = [answer("u1", "chatgpt", true), answer("u2", "chatgpt", false, ["Lalu Cakes"])];
    expect(snapshotOf(answers).overall).toBe(snapshotOf(answers).overall);
  });
});

describe("§5 competitor entities", () => {
  const named = (name: string, appearances = 2) =>
    classifyEntity({ name, promptAppearances: appearances, inRecommendation: true });

  it("detects real named businesses from recommendation answers", () => {
    for (const name of ["Lalu Cakes", "Maksweets"]) {
      const verdict = named(name);
      expect(verdict.type).toBe("direct_competitor");
      expect(isCompetitorRow(verdict)).toBe(true);
    }
  });

  it("classifies 2GIS as a directory, never a direct competitor", () => {
    const verdict = named("2GIS");
    expect(verdict.type).toBe("directory");
    expect(isCompetitorRow(verdict)).toBe(false);
    // and its Russian spelling
    expect(named("2ГИС").type).toBe("directory");
  });

  it("keeps marketplaces, search engines and social platforms out of the table", () => {
    for (const name of ["Yandex", "Google Maps", "Instagram", "Wolt", "Kaspi"]) {
      expect(isCompetitorRow(named(name))).toBe(false);
    }
  });

  it("never turns a descriptive phrase into a competitor row", () => {
    for (const phrase of [
      "Другие локальные кондитерские",
      "Local cake companies",
      "Other nearby providers",
      "Small independent bakeries",
    ]) {
      expect(isGenericPhrase(phrase)).toBe(true);
      expect(isCompetitorRow(named(phrase))).toBe(false);
    }
  });

  it("trusts a competitor the owner typed even if heuristics would not", () => {
    const verdict = classifyEntity({ name: "2GIS", userCompetitors: ["2GIS"] });
    expect(verdict.type).toBe("direct_competitor");
  });

  it("requires evidence before promoting a one-off name outside a recommendation", () => {
    const weak = classifyEntity({ name: "Sweet Corner Studio", promptAppearances: 1 });
    expect(weak.type).toBe("unknown");
    expect(isCompetitorRow(weak)).toBe(false);
  });

  it("a leading quantifier marks prose even when a company suffix follows", () => {
    // "Some Bakery LLP" reads as a description, not a specific business.
    expect(isGenericPhrase("Some Bakery LLP")).toBe(true);
  });
});

describe("§6 Share of Voice", () => {
  it("counts an entity once per answer and excludes directories", () => {
    const snap = snapshotOf([
      // 2GIS repeated inside one answer, plus two real competitors.
      answer("u1", "chatgpt", false, ["Lalu Cakes", "2GIS", "2GIS", "Maksweets"]),
      answer("u2", "chatgpt", false, ["Lalu Cakes"]),
    ]);
    const names = snap.shareOfVoice.map((e) => e.name);
    expect(names).toContain("Lalu Cakes");
    expect(names).toContain("Maksweets");
    expect(names).not.toContain("2GIS");
  });

  it("ignores branded answers so the target cannot manufacture a share", () => {
    const snap = snapshotOf([
      answer("u1", "chatgpt", false, ["Lalu Cakes"]),
      answer("b1", "chatgpt", true, ["Maksweets"]), // branded: excluded
    ]);
    expect(snap.shareOfVoice.map((e) => e.name)).not.toContain("Maksweets");
  });

  it("shares never exceed 100% in total", () => {
    const snap = snapshotOf([
      answer("u1", "chatgpt", false, ["Lalu Cakes", "Maksweets"]),
      answer("u2", "chatgpt", false, ["Lalu Cakes"]),
    ]);
    const total = snap.shareOfVoice.reduce((sum, e) => sum + e.pct, 0);
    expect(total).toBeLessThanOrEqual(100.5); // rounding tolerance
  });
});

describe("§2 prompt mix", () => {
  it("keeps at least 80% of a scan unbranded", () => {
    const counts = computeIntentCounts(25, true);
    const branded = counts.branded;
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    expect(total).toBe(25);
    expect(branded / total).toBeLessThanOrEqual(0.2);
    expect(1 - branded / total).toBeGreaterThanOrEqual(0.8);
  });

  it("recognises the business name in a prompt regardless of case or spacing", () => {
    expect(isBrandedPrompt("Что такое Qulpynai?", TARGET)).toBe(true);
    expect(isBrandedPrompt("QULPYNAI отзывы", TARGET)).toBe(true);
    expect(isBrandedPrompt("Лучшие кондитерские в Алматы", TARGET)).toBe(false);
  });

  it("treats a known alias as branded", () => {
    expect(isBrandedPrompt("Кульпынай цены", TARGET, ["Кульпынай"])).toBe(true);
  });
});
