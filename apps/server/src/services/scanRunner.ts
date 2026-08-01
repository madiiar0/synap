import { Types } from "mongoose";
import type { EngineId } from "@synapai/shared";
import type { EngineAnswer } from "../engines/types.js";
import { env } from "../config/env.js";
import { NoProviderError, resolveEngines } from "../engines/registry.js";
import { BudgetExceededError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";
import { sendScanReadyEmail } from "../mail/emails.js";
import { AnswerResult } from "../models/AnswerResult.js";
import { Brand, type BrandDoc } from "../models/Brand.js";
import { GeneratedPrompt, type GeneratedPromptDoc } from "../models/GeneratedPrompt.js";
import { Scan, type EngineCost, type ScanDoc } from "../models/Scan.js";
import { ScoreSnapshot } from "../models/ScoreSnapshot.js";
import { User } from "../models/User.js";
import { batchLlmExtract, demoExtract, deterministicExtract } from "./extraction.js";
import { researchBusiness } from "./research.js";
import { generatePrompts, selectCoreIndices } from "./promptGen.js";
import { computeSnapshot, type ScoringAnswer } from "./scoring.js";
import { Semaphore } from "../engines/semaphore.js";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * §2 Stage A: fold research findings into the business record without ever
 * overwriting what the owner typed. Competitors found by research are added as
 * detected entries only when they are genuinely new.
 */
async function mergeResearchIntoBrand(
  brand: BrandDoc,
  research: { aliases: string[]; likelyCompetitors: string[] },
): Promise<void> {
  const known = new Set(
    [brand.name, ...brand.aliases, ...brand.competitors.map((c) => c.name)].map((n) =>
      n.trim().toLowerCase(),
    ),
  );
  let changed = false;

  for (const alias of research.aliases) {
    const key = alias.trim().toLowerCase();
    if (!key || known.has(key)) continue;
    brand.aliases.push(alias.trim());
    known.add(key);
    changed = true;
  }
  for (const name of research.likelyCompetitors) {
    const key = name.trim().toLowerCase();
    if (!key || known.has(key)) continue;
    if (brand.competitors.length >= 12) break;
    brand.competitors.push({ name: name.trim(), aliases: [] });
    known.add(key);
    changed = true;
  }
  if (changed) await brand.save();
}

async function ensurePrompts(scan: ScanDoc, brand: BrandDoc): Promise<GeneratedPromptDoc[]> {
  const existing = await GeneratedPrompt.find({ scanId: scan._id });
  if (existing.length > 0) return existing;

  // --- Stage A: research the business before writing any prompts (§2).
  scan.progress.stage = "research";
  await scan.save();
  const outcome = await researchBusiness({
    name: brand.name,
    category: brand.category,
    city: brand.city,
    market: brand.market,
    website: brand.website,
    competitors: brand.competitors.map((c) => c.name),
  });
  scan.research = outcome.research;
  scan.stageCosts = [
    ...scan.stageCosts.filter((c) => c.stage !== "research"),
    { stage: "research", calls: outcome.calls, costUsd: outcome.costUsd },
  ];
  await scan.save();
  await mergeResearchIntoBrand(brand, outcome.research);

  // --- Stage B: generate prompts grounded in the research (§2).
  scan.progress.stage = "prompts";
  await scan.save();
  const specs = await generatePrompts(
    {
      name: brand.name,
      category: brand.category,
      city: brand.city,
      market: brand.market,
      competitors: brand.competitors,
      disabledPrompts: brand.disabledPrompts,
      website: brand.website,
      research: outcome.research,
    },
    env.FREE_SCAN_PROMPTS,
  );
  // Full scans run every prompt on every engine, so everything is "core".
  const coreIdx =
    scan.tier === "full"
      ? new Set(specs.map((_, i) => i))
      : selectCoreIndices(specs, env.FREE_CORE_PROMPTS);
  return GeneratedPrompt.insertMany(
    specs.map((spec, i) => ({ scanId: scan._id, ...spec, core: coreIdx.has(i) })),
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

  // §8 cost instrumentation: totals + per-engine breakdown.
  const perEngine = new Map<EngineId, EngineCost>();
  for (const a of answers) {
    const entry =
      perEngine.get(a.engine) ??
      ({ engine: a.engine, calls: 0, tokensIn: 0, tokensOut: 0, searchFees: 0, costUsd: 0 });
    entry.calls += 1;
    entry.tokensIn += a.tokensIn;
    entry.tokensOut += a.tokensOut;
    entry.searchFees += a.searchFeeUsd ?? 0;
    entry.costUsd += a.costUsd;
    perEngine.set(a.engine, entry);
  }
  const round = (n: number): number => Math.round(n * 100000) / 100000;
  scan.engineCosts = [...perEngine.values()].map((e) => ({
    ...e,
    searchFees: round(e.searchFees),
    costUsd: round(e.costUsd),
  }));
  scan.totals = {
    prompts: prompts.length,
    calls: answers.length,
    tokensIn: answers.reduce((s, a) => s + a.tokensIn, 0),
    tokensOut: answers.reduce((s, a) => s + a.tokensOut, 0),
    searchFees: round(answers.reduce((s, a) => s + (a.searchFeeUsd ?? 0), 0)),
    costUsd: round(answers.reduce((s, a) => s + a.costUsd, 0)),
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
      corePromptIds: prompts.filter((p) => p.core).map((p) => String(p._id)),
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

  // §8: one-line cost summary per scan.
  logger.info(
    {
      scanId: String(scan._id),
      tier: scan.tier,
      status: scan.status,
      calls: scan.totals.calls,
      tokensIn: scan.totals.tokensIn,
      tokensOut: scan.totals.tokensOut,
      searchFeesUsd: scan.totals.searchFees,
      totalCostUsd: scan.totals.costUsd,
      overall: snapshotOverall,
    },
    "scan cost summary",
  );

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

/** Execute a scan end-to-end: prompts → live engine calls → extraction → snapshot. */
export async function runScan(scanId: string): Promise<void> {
  // Atomic claim: exactly one runner may take a scan out of a runnable state.
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

  // §1.2: no provider configured is a visible scan failure, never fixtures.
  let engines;
  try {
    engines = await resolveEngines(scan.engines);
  } catch (err) {
    logger.error({ err }, "scan cannot run: no usable provider");
    scan.status = "failed";
    scan.error = err instanceof NoProviderError ? err.code : "SCAN_FAILED";
    await scan.save();
    return;
  }
  if (engines.length === 0) {
    scan.status = "failed";
    scan.error = "SCAN_FAILED";
    await scan.save();
    return;
  }
  const byId = new Map(engines.map((e) => [e.id, e]));

  const prompts = await ensurePrompts(scan, brand);
  // Failed answers are retried on resume; successful ones are kept (they are
  // from THIS scan — reuse across scans never happens, §2.4).
  await AnswerResult.deleteMany({ scanId: scan._id, failed: true });
  const existing = await AnswerResult.find({ scanId: scan._id }, { promptId: 1, engine: 1 });
  const doneKeys = new Set(existing.map((a) => `${a.promptId}|${a.engine}`));

  // §2: plan — core prompts fan out to core engines, tail prompts to the
  // tail engine only. Full scans send everything everywhere.
  const coreEngineIds = (
    scan.tier === "full" ? scan.engines : scan.plan.coreEngines
  ).filter((id) => byId.has(id));
  // §2 Stage C: tail prompts are dealt evenly across the tail engines
  // (chatgpt, gemini), so KZ-popular assistants get the wider coverage.
  const tailEngineIds =
    scan.tier === "full" ? [] : scan.plan.tailEngines.filter((id) => byId.has(id));

  const items: { prompt: GeneratedPromptDoc; engineId: EngineId }[] = [];
  let tailIndex = 0;
  for (const prompt of prompts) {
    let engineIds: EngineId[];
    if (prompt.core) {
      engineIds = coreEngineIds;
    } else if (tailEngineIds.length > 0) {
      engineIds = [tailEngineIds[tailIndex % tailEngineIds.length]];
      tailIndex += 1;
    } else {
      engineIds = [];
    }
    for (const engineId of engineIds) {
      if (!doneKeys.has(`${prompt._id}|${engineId}`)) {
        items.push({ prompt, engineId });
      }
    }
  }

  const total = existing.length + items.length;
  scan.startedAt = scan.startedAt ?? new Date();
  scan.progress = { done: existing.length, total, currentPrompt: null, stage: "engines" };
  await scan.save();

  const target = {
    brand: { name: brand.name, aliases: brand.aliases },
    competitors: brand.competitors,
  };
  // §2.4: within-scan dedup only — identical (engine, promptText) executes once.
  const answerCache = new Map<string, EngineAnswer>();
  const pool = new Semaphore(env.DEMO_MODE ? 1 : 4);
  const delayPer = env.DEMO_MODE && items.length > 0 ? env.DEMO_SCAN_TOTAL_MS / items.length : 0;
  let budgetPaused = false;

  await Promise.all(
    items.map((item) =>
      pool.run(async () => {
        if (budgetPaused) return;
        const engine = byId.get(item.engineId);
        if (!engine) return;
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
          const extracted = env.DEMO_MODE
            ? demoExtract(answer.text, target)
            : deterministicExtract(answer.text, target);
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
            searchFeeUsd: answer.searchFeeUsd,
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

  // §4: one batched LLM pass over all answers (≤10 per call, non-search model).
  if (!env.DEMO_MODE && !budgetPaused) {
    const stored = await AnswerResult.find({ scanId: scan._id, failed: false });
    const merged = await batchLlmExtract(
      stored.map((a) => ({
        id: String(a._id),
        text: a.rawAnswer,
        deterministic: a.extracted,
      })),
      target,
    );
    for (const [id, extracted] of merged) {
      await AnswerResult.updateOne({ _id: id }, { $set: { extracted } });
    }
  }

  const fresh = await Scan.findById(scan._id);
  if (fresh) await finalizeScan(fresh, brand, prompts, budgetPaused);
}

/**
 * Crash recovery: scans stuck in `queued` for 2+ minutes, plus `running`
 * scans untouched for 10+ minutes (reset to queued; resume skips answered
 * pairs from THIS scan only).
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
