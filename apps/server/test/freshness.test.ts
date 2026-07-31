/**
 * §2.4 freshness guarantee: two sequential scans of the same business must
 * issue two full, independent sets of provider calls. No answer, extraction,
 * or score from one scan may ever be reused by another.
 *
 * Env is pinned BEFORE any app import (dotenv never overrides existing keys),
 * so all app modules are loaded dynamically below.
 */
process.env.DEMO_MODE = "true";
process.env.DEMO_SCAN_TOTAL_MS = "0";
process.env.MONGODB_URI = "";
process.env.AUTH_MODE = "mock";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

const { connectDb, disconnectDb } = await import("../src/db/connect.js");
const { Brand } = await import("../src/models/Brand.js");
const { Scan } = await import("../src/models/Scan.js");
const { AnswerResult } = await import("../src/models/AnswerResult.js");
const { GeneratedPrompt } = await import("../src/models/GeneratedPrompt.js");
const { ScoreSnapshot } = await import("../src/models/ScoreSnapshot.js");
const { runScan } = await import("../src/services/scanRunner.js");
const { getDemoCallCount, resetDemoCallCount } = await import("../src/engines/demo.js");
const { env } = await import("../src/config/env.js");

const FREE_CALLS =
  env.FREE_CORE_PROMPTS * env.FREE_CORE_ENGINES.length +
  (env.FREE_SCAN_PROMPTS - env.FREE_CORE_PROMPTS);

async function createFreeScan(brandId: unknown): Promise<string> {
  const scan = await Scan.create({
    brandId,
    tier: "free",
    engines: [...new Set([...env.FREE_CORE_ENGINES, env.FREE_TAIL_ENGINE])],
    plan: { coreEngines: env.FREE_CORE_ENGINES, tailEngine: env.FREE_TAIL_ENGINE },
    trigger: "user",
  });
  return String(scan._id);
}

describe("freshness (§2.4): every scan queries live, nothing is reused", () => {
  let brandId: unknown;

  beforeAll(async () => {
    await connectDb();
    const brand = await Brand.create({
      name: "Aroma Coffee",
      category: "кофейня",
      city: "Алматы",
      market: "kz",
      locale: "ru",
      normKey: "aroma coffee|кофейня|алматы",
      competitors: [{ name: "Nurly Coffee", aliases: [] }],
    });
    brandId = brand._id;
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it("two sequential scans of the same business issue two full sets of provider calls", async () => {
    resetDemoCallCount();

    const scan1 = await createFreeScan(brandId);
    await runScan(scan1);
    expect(getDemoCallCount(), "scan 1 must issue a full set of live calls").toBe(FREE_CALLS);

    const scan2 = await createFreeScan(brandId);
    await runScan(scan2);
    expect(getDemoCallCount(), "scan 2 must issue its own full set, reusing nothing").toBe(
      FREE_CALLS * 2,
    );

    // Both scans completed with their own answer sets and snapshots.
    for (const id of [scan1, scan2]) {
      const scan = await Scan.findById(id);
      expect(scan?.status).toBe("done");
      expect(scan?.totals.calls).toBe(FREE_CALLS);
      expect(await AnswerResult.countDocuments({ scanId: id })).toBe(FREE_CALLS);
      expect(await GeneratedPrompt.countDocuments({ scanId: id })).toBe(env.FREE_SCAN_PROMPTS);
      expect(await ScoreSnapshot.countDocuments({ scanId: id })).toBe(1);
    }

    // No answer document is shared between the two scans.
    const shared = await AnswerResult.aggregate([
      { $group: { _id: "$_id", scans: { $addToSet: "$scanId" } } },
      { $match: { "scans.1": { $exists: true } } },
    ]);
    expect(shared).toHaveLength(0);
  });

  it("the free plan is the documented 41-call plan (§2.1)", () => {
    expect(FREE_CALLS).toBe(41);
  });
});
