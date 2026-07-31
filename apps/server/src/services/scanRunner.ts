import { Types } from "mongoose";
import type { EngineAnswer } from "../engines/types.js";
import { env } from "../config/env.js";
import { resolveEngines } from "../engines/registry.js";
import { BudgetExceededError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";
import { sendScanReadyEmail } from "../mail/emails.js";
import { AnswerResult } from "../models/AnswerResult.js";
import { Brand, type BrandDoc } from "../models/Brand.js";
import { GeneratedPrompt, type GeneratedPromptDoc } from "../models/GeneratedPrompt.js";
import { Scan, type ScanDoc } from "../models/Scan.js";
import { ScoreSnapshot } from "../models/ScoreSnapshot.js";
import { User } from "../models/User.js";
import { extractAnswer } from "./extraction.js";
import { generatePrompts } from "./promptGen.js";
import { computeSnapshot, type ScoringAnswer } from "./scoring.js";
import { Semaphore } from "../engines/semaphore.js";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensurePrompts(scan: ScanDoc, brand: BrandDoc): Promise<GeneratedPromptDoc[]> {
  const existing = await GeneratedPrompt.find({ scanId: scan._id });
  if (existing.length > 0) return existing;
  const n = scan.tier === "free" ? env.SCAN_PROMPTS_FREE : env.SCAN_PROMPTS_FULL;
  const specs = await generatePrompts(
    {
      name: brand.name,
      category: brand.category,
      city: brand.city,
      market: brand.market,
      competitors: brand.competitors,
      disabledPrompts: brand.disabledPrompts,
    },
    n,
  );
  return GeneratedPrompt.insertMany(
    specs.map((spec) => ({ scanId: scan._id, ...spec })),
  );
}

async function finalizeScan(
  scan: ScanDoc,
  brand: BrandDoc,
  prompts: GeneratedPromptDoc[],
  budgetPaused: boolean,
): Promise<void> {
  const answers = await AnswerResult.find({ scanId: scan._id });
  const failedCount = answers.filter((a) => a.failed).length;

  scan.totals = {
    prompts: prompts.length,
    calls: answers.length,
    tokensIn: answers.reduce((s, a) => s + a.tokensIn, 0),
    tokensOut: answers.reduce((s, a) => s + a.tokensOut, 0),
    costUsd: Math.round(answers.reduce((s, a) => s + a.costUsd, 0) * 10000) / 10000,
  };

  let snapshotOverall: number | null = null;
  const usable = answers.filter((a) => !a.failed);
  if (usable.length > 0) {
    const snapshot = computeSnapshot({
      brandName: brand.name,
      configuredCompetitors: brand.competitors.map((c) => c.name),
      prompts: prompts.map((p) => ({ id: String(p._id), intent: p.intent })),
      answers: answers.map(
        (a): ScoringAnswer => ({
          promptId: String(a.promptId),
          engine: a.engine,
          failed: a.failed,
          extracted: a.extracted,
          citations: a.citations,
        }),
      ),
    });
    snapshotOverall = snapshot.overall;
    await ScoreSnapshot.findOneAndUpdate(
      { scanId: scan._id },
      { brandId: brand._id, scanId: scan._id, date: new Date(), ...snapshot },
      { upsert: true },
    );
  }

  if (budgetPaused) {
    scan.status = "partial";
    scan.pausedReason = "budget";
  } else if (answers.length === 0) {
    scan.status = "failed";
    scan.error = "NO_ANSWERS";
  } else {
    scan.status = failedCount > 0 ? "partial" : "done";
    scan.pausedReason = null;
  }
  scan.finishedAt = new Date();
  scan.progress.currentPrompt = null;
  await scan.save();

  // Report-ready email for claimed brands (button links to sign-in).
  if (brand.userId && snapshotOverall !== null && !budgetPaused) {
    const user = await User.findById(brand.userId);
    if (user) {
      try {
        const loginLink = `${env.CLIENT_URL}/login?email=${encodeURIComponent(user.email)}`;
        await sendScanReadyEmail(user.email, user.locale, brand.name, snapshotOverall, loginLink);
      } catch (err) {
        logger.error({ err }, "failed to send scan-ready email");
      }
    }
  }
}

/** Execute a scan end-to-end: prompts → engines → extraction → snapshot. */
export async function runScan(scanId: string): Promise<void> {
  // Atomic claim: exactly one runner may take a scan out of a runnable state.
  // Duplicate enqueues (admin rerun, sweeper, multiple workers) become no-ops.
  const scan = await Scan.findOneAndUpdate(
    { _id: scanId, status: { $in: ["queued", "partial", "failed"] } },
    { $set: { status: "running" } },
    { new: true },
  ).catch(() => null);
  if (!scan) return;
  const brand = await Brand.findById(scan.brandId);
  if (!brand) {
    scan.status = "failed";
    scan.error = "BRAND_NOT_FOUND";
    await scan.save();
    return;
  }

  const engines = await resolveEngines(scan.engines);
  if (engines.length === 0) {
    scan.status = "failed";
    scan.error = "NO_ENGINES";
    await scan.save();
    return;
  }

  const prompts = await ensurePrompts(scan, brand);
  // Failed answers are retried on resume: clear them so the unique index
  // doesn't block the replacement rows.
  await AnswerResult.deleteMany({ scanId: scan._id, failed: true });
  const existing = await AnswerResult.find({ scanId: scan._id }, { promptId: 1, engine: 1 });
  const doneKeys = new Set(existing.map((a) => `${a.promptId}|${a.engine}`));

  const total = prompts.length * engines.length;
  scan.startedAt = scan.startedAt ?? new Date();
  scan.progress = { done: existing.length, total, currentPrompt: null };
  await scan.save();

  const items: { prompt: GeneratedPromptDoc; engineIndex: number }[] = [];
  for (const prompt of prompts) {
    for (let e = 0; e < engines.length; e++) {
      if (!doneKeys.has(`${prompt._id}|${engines[e].id}`)) {
        items.push({ prompt, engineIndex: e });
      }
    }
  }

  const target = {
    brand: { name: brand.name, aliases: brand.aliases },
    competitors: brand.competitors,
  };
  const answerCache = new Map<string, EngineAnswer>();
  const pool = new Semaphore(env.DEMO_MODE ? 1 : 4);
  const delayPer = env.DEMO_MODE && items.length > 0 ? env.DEMO_SCAN_TOTAL_MS / items.length : 0;
  let budgetPaused = false;

  await Promise.all(
    items.map((item) =>
      pool.run(async () => {
        if (budgetPaused) return;
        const engine = engines[item.engineIndex];
        if (delayPer > 0) await sleep(delayPer);
        const started = Date.now();
        try {
          const cacheKey = `${engine.id}|${item.prompt.text}`;
          let answer = answerCache.get(cacheKey);
          if (!answer) {
            answer = await engine.query(item.prompt.text, {
              language: item.prompt.language,
              demo: env.DEMO_MODE
                ? {
                    scanSeed: String(scan._id),
                    brandName: brand.name,
                    competitors: brand.competitors,
                    category: brand.category,
                    city: brand.city,
                    intent: item.prompt.intent,
                  }
                : undefined,
            });
            answerCache.set(cacheKey, answer);
          }
          const extracted = await extractAnswer(answer.text, target);
          await AnswerResult.create({
            scanId: scan._id,
            promptId: item.prompt._id,
            engine: engine.id,
            model: answer.model,
            rawAnswer: answer.text,
            citations: answer.citations,
            extracted,
            latencyMs: Date.now() - started,
            tokensIn: answer.tokensIn,
            tokensOut: answer.tokensOut,
            costUsd: answer.costUsd,
            failed: false,
          });
        } catch (err) {
          if (err instanceof BudgetExceededError) {
            budgetPaused = true;
            logger.warn({ scanId }, "scan paused: daily budget exceeded");
            return;
          }
          logger.error({ err, engine: engine.id, prompt: item.prompt.text }, "engine call failed");
          await AnswerResult.create({
            scanId: scan._id,
            promptId: item.prompt._id,
            engine: engine.id,
            failed: true,
            errorCode: "ENGINE_ERROR",
            latencyMs: Date.now() - started,
            extracted: { mentioned: false, sentiment: "na", brands: [] },
          }).catch(() => undefined);
        }
        await Scan.updateOne(
          { _id: scan._id },
          { $inc: { "progress.done": 1 }, $set: { "progress.currentPrompt": item.prompt.text } },
        );
      }),
    ),
  );

  const fresh = await Scan.findById(scan._id);
  if (fresh) await finalizeScan(fresh, brand, prompts, budgetPaused);
}

/**
 * Crash recovery: scans stuck in `queued` for 2+ minutes, plus `running`
 * scans whose doc hasn't been touched for 10+ minutes (progress updates
 * touch updatedAt on every answer, so staleness means the runner died).
 * Stale running scans are atomically reset to queued so runScan can
 * re-claim them; resume skips already-answered pairs.
 */
export async function findStuckScans(): Promise<string[]> {
  const queuedCutoff = new Date(Date.now() - 2 * 60 * 1000);
  const runningCutoff = new Date(Date.now() - 10 * 60 * 1000);

  const staleRunning = await Scan.find(
    { status: "running", updatedAt: { $lt: runningCutoff } },
    { _id: 1 },
  ).limit(10);
  for (const scan of staleRunning) {
    await Scan.updateOne(
      { _id: scan._id, status: "running", updatedAt: { $lt: runningCutoff } },
      { $set: { status: "queued" } },
    );
  }

  const stuck = await Scan.find(
    { status: "queued", createdAt: { $lt: queuedCutoff } },
    { _id: 1 },
  ).limit(10);
  return stuck.map((s) => String(s._id as Types.ObjectId));
}
