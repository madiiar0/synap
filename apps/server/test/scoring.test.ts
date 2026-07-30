import { describe, expect, it } from "vitest";
import type { EngineId, Extracted } from "@synapai/shared";
import { computeSnapshot, type ScoringAnswer, type ScoringPrompt } from "../src/services/scoring.js";

function answer(
  promptId: string,
  engine: EngineId,
  mentioned: boolean,
  extra: Partial<Extracted> = {},
  citations: { url: string; domain: string }[] = [],
): ScoringAnswer {
  return {
    promptId,
    engine,
    failed: false,
    extracted: { mentioned, sentiment: mentioned ? "neu" : "na", brands: [], ...extra },
    citations,
  };
}

const BRAND = "Astra Dental";

describe("computeSnapshot", () => {
  it("computes the documented weighted formula on one engine", () => {
    const prompts: ScoringPrompt[] = [
      { id: "b1", intent: "branded" },
      { id: "b2", intent: "branded" },
      { id: "c1", intent: "category" },
      { id: "c2", intent: "best_of" },
      { id: "c3", intent: "purchase" },
      { id: "c4", intent: "category" },
      { id: "m1", intent: "comparison" },
      { id: "m2", intent: "comparison" },
    ];
    const answers = [
      answer("b1", "perplexity", true),
      answer("b2", "perplexity", false),
      answer("c1", "perplexity", true),
      answer("c2", "perplexity", false),
      answer("c3", "perplexity", false),
      answer("c4", "perplexity", false),
      answer("m1", "perplexity", true),
      answer("m2", "perplexity", false),
    ];
    const snap = computeSnapshot({
      brandName: BRAND,
      configuredCompetitors: [],
      prompts,
      answers,
    });
    // branded 50, category 25, comparison 50 → 0.35·50 + 0.45·25 + 0.20·50 = 38.75 → 39
    expect(snap.subscores.branded).toBe(50);
    expect(snap.subscores.category).toBe(25);
    expect(snap.subscores.comparison).toBe(50);
    expect(snap.overall).toBe(39);
  });

  it("applies the +15% position bonus when avg position ≤ 2", () => {
    const prompts: ScoringPrompt[] = [
      { id: "b1", intent: "branded" },
      { id: "b2", intent: "branded" },
      { id: "c1", intent: "category" },
      { id: "c2", intent: "category" },
      { id: "c3", intent: "category" },
      { id: "c4", intent: "category" },
      { id: "m1", intent: "comparison" },
      { id: "m2", intent: "comparison" },
    ];
    const answers = [
      answer("b1", "perplexity", true, { position: 1 }),
      answer("b2", "perplexity", false),
      answer("c1", "perplexity", true, { position: 2 }),
      answer("c2", "perplexity", false),
      answer("c3", "perplexity", false),
      answer("c4", "perplexity", false),
      answer("m1", "perplexity", true, { position: 1 }),
      answer("m2", "perplexity", false),
    ];
    const snap = computeSnapshot({
      brandName: BRAND,
      configuredCompetitors: [],
      prompts,
      answers,
    });
    // Same base as above (38.75) with avgPosition ≈ 1.3 → ×1.15 = 44.56 → 45
    expect(snap.avgPosition).toBeLessThanOrEqual(2);
    expect(snap.overall).toBe(45);
  });

  it("renormalizes engine weights over enabled engines", () => {
    const prompts: ScoringPrompt[] = [
      { id: "b1", intent: "branded" },
      { id: "c1", intent: "category" },
      { id: "m1", intent: "comparison" },
    ];
    const answers = [
      // perplexity (weight .30): mentions everything → subscores 100
      answer("b1", "perplexity", true),
      answer("c1", "perplexity", true),
      answer("m1", "perplexity", true),
      // claude (weight .15): mentions nothing → subscores 0
      answer("b1", "claude", false),
      answer("c1", "claude", false),
      answer("m1", "claude", false),
    ];
    const snap = computeSnapshot({
      brandName: BRAND,
      configuredCompetitors: [],
      prompts,
      answers,
    });
    // (100·.30 + 0·.15) / .45 = 66.67 per subscore → overall 67 (no positions → no bonus)
    expect(snap.overall).toBe(67);
    expect(snap.perEngine).toHaveLength(2);
    expect(snap.perEngine.find((e) => e.engine === "perplexity")?.mentionRate).toBe(1);
  });

  it("drops absent intent groups from the weighting (free scan without comparison)", () => {
    const prompts: ScoringPrompt[] = [
      { id: "b1", intent: "branded" },
      { id: "c1", intent: "category" },
    ];
    const answers = [
      answer("b1", "perplexity", true),
      answer("c1", "perplexity", false),
    ];
    const snap = computeSnapshot({
      brandName: BRAND,
      configuredCompetitors: [],
      prompts,
      answers,
    });
    // branded=100, category=0; weights .35/.45 renormalized → 100·(.35/.80) = 43.75 → 44
    expect(snap.overall).toBe(44);
  });

  it("share of voice includes configured competitors always, detected ones at ≥3 mentions", () => {
    const prompts: ScoringPrompt[] = [{ id: "c1", intent: "category" }];
    const brands = (names: string[]): Partial<Extracted> => ({
      brands: names.map((name, i) => ({ name, position: i + 1 })),
    });
    const answers = [
      answer("c1", "perplexity", false, brands(["Denta Lux", "Nurly"])),
      answer("c1", "chatgpt", false, brands(["Nurly"])),
      answer("c1", "gemini", false, brands(["Nurly", "Rare One"])),
      answer("c1", "claude", false, brands(["Rare One"])),
    ];
    const snap = computeSnapshot({
      brandName: BRAND,
      configuredCompetitors: ["Denta Lux", "SmileCity"],
      prompts,
      answers,
    });
    const names = snap.shareOfVoice.map((e) => e.name);
    expect(names).toContain("Nurly"); // 3 mentions → detected
    expect(names).toContain("Denta Lux"); // configured
    expect(names).toContain("SmileCity"); // configured, zero mentions
    expect(names).toContain(BRAND); // us, zero mentions
    expect(names).not.toContain("Rare One"); // 2 mentions, not configured
    expect(snap.shareOfVoice.find((e) => e.name === "Nurly")?.detected).toBe(true);
    expect(snap.shareOfVoice.find((e) => e.name === BRAND)?.isUs).toBe(true);
  });

  it("ranks top sources and flags domains whose answers mention us", () => {
    const prompts: ScoringPrompt[] = [
      { id: "c1", intent: "category" },
      { id: "c2", intent: "category" },
    ];
    const answers = [
      answer("c1", "perplexity", true, {}, [
        { url: "https://2gis.kz/a", domain: "2gis.kz" },
        { url: "https://yandex.kz/b", domain: "yandex.kz" },
      ]),
      answer("c2", "perplexity", false, {}, [
        { url: "https://yandex.kz/c", domain: "yandex.kz" },
      ]),
    ];
    const snap = computeSnapshot({
      brandName: BRAND,
      configuredCompetitors: [],
      prompts,
      answers,
    });
    expect(snap.topSources[0]).toEqual({ domain: "yandex.kz", citations: 2, mentionsUs: true });
    expect(snap.topSources.find((s) => s.domain === "2gis.kz")?.mentionsUs).toBe(true);
  });

  it("ignores failed answers everywhere", () => {
    const prompts: ScoringPrompt[] = [{ id: "b1", intent: "branded" }];
    const answers: ScoringAnswer[] = [
      { ...answer("b1", "perplexity", true), failed: true },
      answer("b1", "chatgpt", false),
    ];
    const snap = computeSnapshot({
      brandName: BRAND,
      configuredCompetitors: [],
      prompts,
      answers,
    });
    expect(snap.subscores.branded).toBe(0);
  });
});
