import { Router } from "express";
import {
  normalizedKey,
  publicScanRequestSchema,
  SCAN_CACHE_DAYS,
  unlockRequestSchema,
  type ScanProgressDto,
} from "@synapai/shared";
import { env } from "../../config/env.js";
import { AppError } from "../../lib/errors.js";
import { sendScanReadyEmail } from "../../mail/emails.js";
import { Brand } from "../../models/Brand.js";
import { Lead } from "../../models/Lead.js";
import { Scan } from "../../models/Scan.js";
import { ScoreSnapshot } from "../../models/ScoreSnapshot.js";
import { enqueue } from "../../queue/index.js";
import { createMagicLink } from "../../services/auth.js";
import { getBudgetState } from "../../services/usage.js";
import { buildTeaser } from "../../services/views.js";
import {
  authLimiter,
  consumePublicScanQuota,
  publicScanGlobalLimit,
  publicScanIpLimit,
} from "../middleware/rateLimits.js";

export const publicRouter = Router();

publicRouter.post("/scan", publicScanIpLimit, publicScanGlobalLimit, async (req, res, next) => {
  try {
    const input = publicScanRequestSchema.parse(req.body);

    // Same brand+category+city completed within 7 days → serve the cached scan.
    const normKey = normalizedKey(input.brandName, input.category, input.city);
    const cacheCutoff = new Date(Date.now() - SCAN_CACHE_DAYS * 24 * 60 * 60 * 1000);
    const brandIds = (await Brand.find({ normKey }, { _id: 1 }).limit(200)).map((b) => b._id);
    if (brandIds.length > 0) {
      const cachedScans = await Scan.find({
        brandId: { $in: brandIds },
        status: { $in: ["done", "partial"] },
        finishedAt: { $gte: cacheCutoff },
      })
        .sort({ finishedAt: -1 })
        .limit(5);
      for (const cached of cachedScans) {
        if (await ScoreSnapshot.exists({ scanId: cached._id })) {
          res.json({ scanId: String(cached._id), cached: true });
          return;
        }
      }
    }

    const budget = await getBudgetState();
    if (budget.paused) {
      throw new AppError("SCANS_PAUSED", 503, "Scanning is temporarily paused");
    }

    // Only an actually-created scan consumes the per-IP daily quota.
    consumePublicScanQuota(req.ip);

    const brand = await Brand.create({
      name: input.brandName,
      website: input.website,
      category: input.category,
      city: input.city,
      market: input.market,
      competitors: (input.competitors ?? []).map((name) => ({ name, aliases: [] })),
      locale: input.locale ?? "ru",
      normKey,
    });
    const scan = await Scan.create({
      brandId: brand._id,
      tier: "free",
      engines: env.ENGINES_FREE,
      trigger: "public",
    });
    await enqueue("runScan", { scanId: String(scan._id) });
    res.json({ scanId: String(scan._id), cached: false });
  } catch (err) {
    next(err);
  }
});

publicRouter.get("/scan/:id/progress", async (req, res, next) => {
  try {
    const scan = await Scan.findById(req.params.id).catch(() => null);
    if (!scan) throw new AppError("NOT_FOUND", 404, "Scan not found");
    const brand = await Brand.findById(scan.brandId);
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

publicRouter.get("/scan/:id/teaser", async (req, res, next) => {
  try {
    res.json(await buildTeaser(req.params.id));
  } catch (err) {
    next(err);
  }
});

// authLimiter: this endpoint sends email — cap it like the other mail senders.
publicRouter.post("/scan/:id/unlock", authLimiter, async (req, res, next) => {
  try {
    const { email, locale } = unlockRequestSchema.parse(req.body);
    const scan = await Scan.findById(req.params.id).catch(() => null);
    if (!scan) throw new AppError("NOT_FOUND", 404, "Scan not found");
    const brand = await Brand.findById(scan.brandId);
    if (!brand) throw new AppError("NOT_FOUND", 404, "Brand not found");

    await Lead.create({
      type: "scan_email",
      email,
      brandName: brand.name,
      scanId: scan._id,
      source: "report",
    });

    const { user, link } = await createMagicLink(email, locale ?? brand.locale);
    // Public scans are shared: every unlocker gets dashboard access, the
    // first one also becomes the nominal owner.
    if (!brand.userId) brand.userId = user._id;
    if (!brand.claimedBy.some((id) => String(id) === String(user._id))) {
      brand.claimedBy.push(user._id);
    }
    await brand.save();
    const snapshot = await ScoreSnapshot.findOne({ scanId: scan._id });
    await sendScanReadyEmail(email, user.locale, brand.name, snapshot?.overall ?? 0, link);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
