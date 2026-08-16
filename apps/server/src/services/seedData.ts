import { ENGINE_IDS, normalizedKey } from "@synapai/shared";
import { Brand } from "../models/Brand.js";
import { Scan } from "../models/Scan.js";
import { ScoreSnapshot } from "../models/ScoreSnapshot.js";
import { User } from "../models/User.js";
import { runScan } from "./scanRunner.js";

export interface SeedResult {
  adminEmail: string;
  demoEmail: string;
  brandName: string;
  overall: number | null;
}

/**
 * Demo dataset: admin + demo users, «Aroma Coffee» with an old fixture
 * snapshot (trends) and a fresh FULL fixture scan run through the real
 * pipeline. Idempotent. Auth: in mock mode either user signs in with just
 * the email; with Firebase, the role comes from this Mongo document (see
 * MANUAL_SETUP.md for granting admin).
 */
export async function seedDemoData(): Promise<SeedResult> {
  const adminEmail = "admin@akrux.app";
  await User.findOneAndUpdate(
    { email: adminEmail },
    { email: adminEmail, role: "admin", locale: "ru", name: "Admin" },
    { upsert: true },
  );

  const demoEmail = "demo@akrux.app";
  const demoUser = await User.findOneAndUpdate(
    { email: demoEmail },
    { email: demoEmail, role: "user", locale: "ru", name: "Demo" },
    { upsert: true, new: true },
  );

  // Fictional demo business (coffee niche): competitors are fictional too.
  const brandName = "Aroma Coffee";
  let brand = await Brand.findOne({ name: brandName, userId: demoUser._id });
  if (!brand) {
    brand = await Brand.create({
      userId: demoUser._id,
      name: brandName,
      aliases: ["Арома Кофе"],
      category: "кофейня",
      city: "Алматы",
      country: "KZ",
      market: "kz",
      locale: "ru",
      competitors: [
        { name: "Nurly Coffee", aliases: ["Нурлы Кофе"] },
        { name: "Vega Roasters", aliases: ["Вега Ростерс"] },
        { name: "Orion", aliases: ["Орион"] },
      ],
      normKey: normalizedKey(brandName, "кофейня", "Алматы"),
    });
  }

  // Older full scan + snapshot (fixture history so deltas/trends render).
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const hasOld = await Scan.findOne({ brandId: brand._id, trigger: "admin", tier: "full" });
  if (!hasOld) {
    const oldScanId = (
      await Scan.collection.insertOne({
        brandId: brand._id,
        tier: "full",
        status: "done",
        progress: { done: 125, total: 125, currentPrompt: null },
        engines: [...ENGINE_IDS],
        plan: { coreEngines: [...ENGINE_IDS], tailEngine: "perplexity" },
        trigger: "admin",
        startedAt: monthAgo,
        finishedAt: monthAgo,
        totals: {
          prompts: 25,
          calls: 125,
          tokensIn: 62000,
          tokensOut: 41000,
          searchFees: 0,
          costUsd: 0,
        },
        engineCosts: [],
        pausedReason: null,
        createdAt: monthAgo,
        updatedAt: monthAgo,
      })
    ).insertedId;
    await ScoreSnapshot.create({
      brandId: brand._id,
      scanId: oldScanId,
      date: monthAgo,
      overall: 21,
      subscores: { branded: 46.2, category: 8.1, comparison: 16.7 },
      perEngine: [
        { engine: "chatgpt", mentionRate: 0.15, score: 20 },
        { engine: "gemini", mentionRate: 0.12, score: 19 },
        { engine: "perplexity", mentionRate: 0.18, score: 22 },
        { engine: "claude", mentionRate: 0.1, score: 17 },
        { engine: "grok", mentionRate: 0.13, score: 18 },
      ],
      shareOfVoice: [
        { name: "Nurly Coffee", mentions: 132, pct: 30.8, isUs: false, detected: false },
        { name: "Vega Roasters", mentions: 104, pct: 24.2, isUs: false, detected: false },
        { name: "Astra", mentions: 76, pct: 17.7, isUs: false, detected: true },
        { name: "Orion", mentions: 58, pct: 13.5, isUs: false, detected: false },
        { name: "Aroma Coffee", mentions: 39, pct: 9.1, isUs: true, detected: false },
        { name: "Polaris", mentions: 20, pct: 4.7, isUs: false, detected: true },
      ],
      topSources: [
        { domain: "2gis.kz", citations: 205, mentionsUs: true },
        { domain: "yandex.kz", citations: 171, mentionsUs: false },
        { domain: "instagram.com", citations: 84, mentionsUs: true },
        { domain: "tripadvisor.com", citations: 66, mentionsUs: false },
        { domain: "otzovik.com", citations: 47, mentionsUs: false },
      ],
      avgPosition: 2.7,
    });
  }

  // Fresh FULL fixture scan through the real pipeline.
  let overall: number | null = null;
  const freshDone = await Scan.findOne({
    brandId: brand._id,
    tier: "full",
    trigger: "user",
    status: { $in: ["done", "partial"] },
  });
  if (!freshDone) {
    const scan = await Scan.create({
      brandId: brand._id,
      tier: "full",
      engines: [...ENGINE_IDS],
      plan: { coreEngines: [...ENGINE_IDS], tailEngine: "perplexity" },
      trigger: "user",
    });
    await runScan(String(scan._id));
    overall = (await ScoreSnapshot.findOne({ scanId: scan._id }))?.overall ?? null;
  } else {
    overall = (await ScoreSnapshot.findOne({ scanId: freshDone._id }))?.overall ?? null;
  }

  return { adminEmail, demoEmail, brandName, overall };
}
