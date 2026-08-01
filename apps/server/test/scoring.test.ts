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
      { id: "b1", intent: "branded", branded: true },
      { id: "b2", intent: "branded", branded: true },
      { id: "c1", intent: "category", branded: false },
      { id: "c2", intent: "best_of", branded: false },
      { id: "c3", intent: "purchase", branded: false },
      { id: "c4", intent: "category", branded: false },
      { id: "m1", intent: "comparison", branded: false },
      { id: "m2", intent: "comparison", branded: false },
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
    // §3: branded prompts are excluded entirely. category 25, comparison 50
    // → 0.6·25 + 0.4·50 = 35
    expect(snap.subscores.category).toBe(25);
    expect(snap.subscores.comparison).toBe(50);
    expect(snap.overall).toBe(35);
  });

  it("applies the +15% position bonus when avg position ≤ 2", () => {
    const prompts: ScoringPrompt[] = [
      { id: "b1", intent: "branded", branded: true },
      { id: "b2", intent: "branded", branded: true },
      { id: "c1", intent: "category", branded: false },
      { id: "c2", intent: "category", branded: false },
      { id: "c3", intent: "category", branded: false },
      { id: "c4", intent: "category", branded: false },
      { id: "m1", intent: "comparison", branded: false },
      { id: "m2", intent: "comparison", branded: false },
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
    // §3: unbranded only. category 25, comparison 50 → 35, ×1.15 = 40.25 → 40
    expect(snap.avgPosition).toBeLessThanOrEqual(2);
    expect(snap.overall).toBe(40);
  });

  it("renormalizes engine weights over enabled engines", () => {
    const prompts: ScoringPrompt[] = [
      { id: "b1", intent: "branded", branded: true },
      { id: "c1", intent: "category", branded: false },
      { id: "m1", intent: "comparison", branded: false },
    ];
    const answers = [
      // perplexity (weight .20): mentions everything → subscores 100
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
    // (100·.20 + 0·.15) / .35 = 57.14 per subscore → overall 57 (no positions → no bonus)
    expect(snap.overall).toBe(57);
    // §3: the branded prompt contributed nothing to the number above.
    expect(snap.perEngine).toHaveLength(2);
    expect(snap.perEngine.find((e) => e.engine === "perplexity")?.mentionRate).toBe(1);
  });

  it("drops absent intent groups from the weighting (free scan without comparison)", () => {
    const prompts: ScoringPrompt[] = [
      { id: "b1", intent: "branded", branded: true },
      { id: "c1", intent: "category", branded: false },
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
    // §3: branded is excluded, so only the category group remains → 0.
    expect(snap.overall).toBe(0);
  });

  it("share of voice includes configured competitors always, plus classified detected ones", () => {
    const prompts: ScoringPrompt[] = [{ id: "c1", intent: "category", branded: false }];
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
    expect(names).toContain("Nurly");
    expect(names).toContain("Denta Lux"); // configured
    expect(names).toContain("SmileCity"); // configured, zero mentions
    expect(names).toContain(BRAND); // us, zero mentions
    // §5: a real named business now qualifies on classification, not on a raw
    // mention threshold, which is what kept genuine competitors off the tab.
    expect(names).toContain("Rare One");
    expect(snap.shareOfVoice.find((e) => e.name === "Nurly")?.detected).toBe(true);
    expect(snap.shareOfVoice.find((e) => e.name === BRAND)?.isUs).toBe(true);
  });

  it("ranks top sources and flags domains whose answers mention us", () => {
    const prompts: ScoringPrompt[] = [
      { id: "c1", intent: "category", branded: false },
      { id: "c2", intent: "category", branded: false },
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

  it("restricts per-engine comparison metrics to the shared core prompt set (§2.3)", () => {
    const prompts: ScoringPrompt[] = [
      { id: "core1", intent: "branded" },
      { id: "tail1", intent: "category", branded: false },
      { id: "tail2", intent: "category", branded: false },
    ];
    const answers = [
      // Both engines answered the core prompt and mentioned us.
      answer("core1", "perplexity", true),
      answer("core1", "chatgpt", true),
      // Only perplexity ran the tail prompts (both misses).
      answer("tail1", "perplexity", false),
      answer("tail2", "perplexity", false),
    ];
    const snap = computeSnapshot({
      brandName: BRAND,
      configuredCompetitors: [],
      prompts,
      answers,
      corePromptIds: ["core1"],
    });
    // Fair comparison: perplexity's tail misses must NOT drag its display
    // mention rate below chatgpt's — both are 1/1 over the shared core set.
    const px = snap.perEngine.find((e) => e.engine === "perplexity");
    const gpt = snap.perEngine.find((e) => e.engine === "chatgpt");
    expect(px?.mentionRate).toBe(1);
    expect(gpt?.mentionRate).toBe(1);
    // The overall score still uses every measured answer (tail misses count).
    expect(snap.subscores.category).toBe(0);
  });

  it("ignores failed answers everywhere", () => {
    const prompts: ScoringPrompt[] = [{ id: "b1", intent: "branded", branded: true }];
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
    // Only a branded prompt existed, and branded is excluded, so nothing scored.
    expect(snap.overall).toBe(0);
  });
});
