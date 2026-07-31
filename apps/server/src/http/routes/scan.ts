import { Router } from "express";
import {
  IDEMPOTENCY_WINDOW_MS,
  isDisposableEmail,
  normalizedKey,
  scanRequestSchema,
  type ScanProgressDto,
} from "@synapai/shared";
import { authMode, env } from "../../config/env.js";
import { AppError } from "../../lib/errors.js";
import { sendMail } from "../../mail/mailer.js";
import { Brand } from "../../models/Brand.js";
import { Scan } from "../../models/Scan.js";
import { getSettings } from "../../models/Settings.js";
import { User } from "../../models/User.js";
import { enqueue } from "../../queue/index.js";
import { getBudgetState, todayKey } from "../../services/usage.js";
import { requireAuth } from "../middleware/auth.js";
import { scanStartIpLimit } from "../middleware/rateLimits.js";
import { logger } from "../../lib/logger.js";

export const scanRouter = Router();

// §2.4 idempotency: same user+key within 60s returns the existing scanId.
const idempotencyCache = new Map<string, { scanId: string; ts: number }>();

function idempotencyLookup(userId: string, key: string | undefined): string | null {
  if (!key) return null;
  const hit = idempotencyCache.get(`${userId}|${key}`);
  if (hit && Date.now() - hit.ts < IDEMPOTENCY_WINDOW_MS) return hit.scanId;
  return null;
}

function idempotencyStore(userId: string, key: string | undefined, scanId: string): void {
  if (!key) return;
  idempotencyCache.set(`${userId}|${key}`, { scanId, ts: Date.now() });
  // opportunistic pruning
  if (idempotencyCache.size > 1000) {
    const cutoff = Date.now() - IDEMPOTENCY_WINDOW_MS;
    for (const [k, v] of idempotencyCache) {
      if (v.ts < cutoff) idempotencyCache.delete(k);
    }
  }
}

/** §6.2 quota: the server is the only authority. */
export function quotaAllows(user: {
  role: string;
  unlimitedScans: boolean;
  freeScansUsed: number;
  freeScanLimit: number;
}): boolean {
  return user.role === "admin" || user.unlimitedScans || user.freeScansUsed < user.freeScanLimit;
}

async function notifyScanCap(count: number): Promise<void> {
  const settings = await getSettings();
  if (settings.scanCapNotifiedDate === todayKey()) return;
  settings.scanCapNotifiedDate = todayKey();
  await settings.save();
  await sendMail(
    env.ADMIN_EMAIL,
    "SynapAI: daily scan cap reached",
    `<p>The daily scan cap (${env.DAILY_SCAN_CAP}) was reached with ${count} scans today. New scans are paused until tomorrow.</p>`,
  ).catch((err) => logger.error({ err }, "scan-cap email failed"));
}

/**
 * §5.2 + §6: scanning requires an account; quota, abuse controls and the
 * daily caps are enforced here, server-side.
 */
scanRouter.post("/", requireAuth, scanStartIpLimit, async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new AppError("UNAUTHORIZED", 401);
    const input = scanRequestSchema.parse(req.body);

    // Idempotent replay (double-click protection, not data reuse).
    const existing = idempotencyLookup(String(user._id), input.idempotencyKey);
    if (existing) {
      res.json({ scanId: existing, deduplicated: true });
      return;
    }

    // §6.5 abuse controls.
    if (isDisposableEmail(user.email)) {
      throw new AppError("DISPOSABLE_EMAIL", 403, "Disposable email addresses cannot run scans");
    }
    if (authMode === "firebase" && !user.emailVerified && user.role !== "admin") {
      throw new AppError("EMAIL_NOT_VERIFIED", 403, "Verify your email before the first scan");
    }

    // §6.2 quota (admin/unlimited bypass).
    if (!quotaAllows(user)) {
      throw new AppError("QUOTA_EXCEEDED", 402, "Free scans are used up");
    }

    // Global daily cap + budget guard pause the whole queue.
    const startOfDay = new Date(`${todayKey()}T00:00:00.000Z`);
    const todayCount = await Scan.countDocuments({ createdAt: { $gte: startOfDay } });
    if (todayCount >= env.DAILY_SCAN_CAP) {
      await notifyScanCap(todayCount);
      throw new AppError("SCANS_PAUSED", 503, "Scanning is paused for today");
    }
    const budget = await getBudgetState();
    if (budget.paused) {
      throw new AppError("SCANS_PAUSED", 503, "Scanning is temporarily paused");
    }

    // Re-scans of the same business reuse the user's Brand document (the
    // scan itself is always fresh — §2.4 forbids reusing any answer).
    const normKey = normalizedKey(input.brandName, input.category, input.city);
    let brand = await Brand.findOne({ userId: user._id, normKey });
    if (!brand) {
      brand = await Brand.create({
        userId: user._id,
        claimedBy: [user._id],
        name: input.brandName,
        website: input.website,
        category: input.category,
        city: input.city,
        market: input.market,
        competitors: (input.competitors ?? []).map((name) => ({ name, aliases: [] })),
        locale: input.locale ?? user.locale,
        normKey,
      });
    }

    const engines = [
      ...new Set([...env.FREE_CORE_ENGINES, env.FREE_TAIL_ENGINE]),
    ];
    const scan = await Scan.create({
      brandId: brand._id,
      tier: "free",
      engines,
      plan: { coreEngines: env.FREE_CORE_ENGINES, tailEngine: env.FREE_TAIL_ENGINE },
      trigger: "user",
    });

    // Increment the quota counter at scan start (§6.2).
    if (user.role !== "admin" && !user.unlimitedScans) {
      await User.updateOne({ _id: user._id }, { $inc: { freeScansUsed: 1 } });
    }

    idempotencyStore(String(user._id), input.idempotencyKey, String(scan._id));
    await enqueue("runScan", { scanId: String(scan._id) });
    res.json({ scanId: String(scan._id) });
  } catch (err) {
    next(err);
  }
});

scanRouter.get("/:id/progress", requireAuth, async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new AppError("UNAUTHORIZED", 401);
    const scan = await Scan.findById(req.params.id).catch(() => null);
    if (!scan) throw new AppError("NOT_FOUND", 404, "Scan not found");
    const brand = await Brand.findById(scan.brandId);
    const uid = String(user._id);
    const owns =
      user.role === "admin" ||
      String(brand?.userId) === uid ||
      Boolean(brand?.claimedBy.some((id) => String(id) === uid));
    if (!owns) throw new AppError("FORBIDDEN", 403, "Not your scan");
    const dto: ScanProgressDto = {
      scanId: String(scan._id),
      status: scan.status,
      done: scan.progress.done,
      total: scan.progress.total,
      currentPrompt: scan.progress.currentPrompt,
      brandName: brand?.name ?? "",
    };
    res.json(dto);
  } catch (err) {
    next(err);
  }
});
