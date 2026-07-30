import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { normalizedKey } from "@synapai/shared";
import { Brand } from "../models/Brand.js";
import { Scan } from "../models/Scan.js";
import { ScoreSnapshot } from "../models/ScoreSnapshot.js";
import { User } from "../models/User.js";
import { runScan } from "./scanRunner.js";

export interface SeedResult {
  adminEmail: string;
  adminPassword: string;
  demoEmail: string;
  brandName: string;
  overall: number | null;
}

/**
 * Demo dataset: admin + demo users, «Astra Dental» with an old fixture
 * snapshot (trends) and a fresh FULL fixture scan run through the real
 * pipeline. Idempotent; the admin password is regenerated on every run.
 */
export async function seedDemoData(): Promise<SeedResult> {
  const adminEmail = "admin@synapai.app";
  const adminPassword = `synapai-${crypto.randomBytes(4).toString("hex")}`;
  await User.findOneAndUpdate(
    { email: adminEmail },
    {
      email: adminEmail,
      role: "admin",
      locale: "ru",
      passwordHash: await bcrypt.hash(adminPassword, 10),
      name: "Admin",
    },
    { upsert: true },
  );

  const demoEmail = "demo@synapai.app";
  const demoUser = await User.findOneAndUpdate(
    { email: demoEmail },
    { email: demoEmail, role: "user", locale: "ru", name: "Demo" },
    { upsert: true, new: true },
  );

  const brandName = "Astra Dental";
  let brand = await Brand.findOne({ name: brandName, userId: demoUser._id });
  if (!brand) {
    brand = await Brand.create({
      userId: demoUser._id,
      name: brandName,
      aliases: ["Астра Дентал"],
      category: "стоматология",
      city: "Алматы",
      country: "KZ",
      market: "kz",
      locale: "ru",
      competitors: [
        { name: "Дента Люкс", aliases: ["Denta Lux"] },
        { name: "SmileCity", aliases: ["Смайл Сити"] },
        { name: "Doctor Dent", aliases: ["Доктор Дент"] },
      ],
      normKey: normalizedKey(brandName, "стоматология", "Алматы"),
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
        progress: { done: 400, total: 400, currentPrompt: null },
        engines: ["perplexity", "chatgpt", "gemini", "claude"],
        trigger: "admin",
        startedAt: monthAgo,
        finishedAt: monthAgo,
        totals: { prompts: 100, calls: 400, tokensIn: 52000, tokensOut: 118000, costUsd: 0 },
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
        { engine: "perplexity", mentionRate: 0.18, score: 22 },
        { engine: "chatgpt", mentionRate: 0.15, score: 20 },
        { engine: "gemini", mentionRate: 0.12, score: 19 },
        { engine: "claude", mentionRate: 0.1, score: 17 },
      ],
      shareOfVoice: [
        { name: "Дента Люкс", mentions: 96, pct: 31.2, isUs: false, detected: false },
        { name: "SmileCity", mentions: 74, pct: 24.1, isUs: false, detected: false },
        { name: "Nurly", mentions: 52, pct: 16.9, isUs: false, detected: true },
        { name: "Doctor Dent", mentions: 41, pct: 13.3, isUs: false, detected: false },
        { name: "Astra Dental", mentions: 28, pct: 9.1, isUs: true, detected: false },
        { name: "Vega", mentions: 16, pct: 5.2, isUs: false, detected: true },
      ],
      topSources: [
        { domain: "2gis.kz", citations: 141, mentionsUs: true },
        { domain: "yandex.kz", citations: 118, mentionsUs: false },
        { domain: "prodoctorov.kz", citations: 74, mentionsUs: false },
        { domain: "instagram.com", citations: 51, mentionsUs: true },
        { domain: "otzovik.com", citations: 33, mentionsUs: false },
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
      engines: ["perplexity", "chatgpt", "gemini", "claude"],
      trigger: "user",
    });
    await runScan(String(scan._id));
    overall = (await ScoreSnapshot.findOne({ scanId: scan._id }))?.overall ?? null;
  } else {
    overall = (await ScoreSnapshot.findOne({ scanId: freshDone._id }))?.overall ?? null;
  }

  return { adminEmail, adminPassword, demoEmail, brandName, overall };
}
