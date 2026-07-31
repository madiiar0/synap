import { Router, type Request } from "express";
import {
  brandSettingsSchema,
  normalizedKey,
  promptToggleSchema,
  type EngineId,
} from "@synapai/shared";
import { AppError } from "../../lib/errors.js";
import { Brand, type BrandDoc } from "../../models/Brand.js";
import { Scan } from "../../models/Scan.js";
import { GeneratedPrompt } from "../../models/GeneratedPrompt.js";
import {
  buildAnswers,
  buildOverview,
  buildPromptRows,
  competitorRowsForScan,
  latestScoredScan,
  toBrandDto,
  type AnswerFilters,
} from "../../services/views.js";
import { requireAuth } from "../middleware/auth.js";

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth);

async function loadOwnedBrand(req: Request): Promise<BrandDoc> {
  const brand = await Brand.findById(req.params.id).catch(() => null);
  if (!brand) throw new AppError("NOT_FOUND", 404, "Brand not found");
  const user = req.user;
  if (!user) throw new AppError("UNAUTHORIZED", 401, "Sign in required");
  const uid = String(user._id);
  const hasAccess =
    user.role === "admin" ||
    String(brand.userId) === uid ||
    brand.claimedBy.some((id) => String(id) === uid);
  if (!hasAccess) {
    throw new AppError("FORBIDDEN", 403, "Not your brand");
  }
  return brand;
}

dashboardRouter.get("/brands", async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new AppError("UNAUTHORIZED", 401);
    const query =
      user.role === "admin"
        ? {}
        : { $or: [{ userId: user._id }, { claimedBy: user._id }] };
    const brands = await Brand.find(query).sort({ createdAt: -1 }).limit(50);
    res.json(brands.map(toBrandDto));
  } catch (err) {
    next(err);
  }
});

dashboardRouter.get("/brands/:id/overview", async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new AppError("UNAUTHORIZED", 401);
    res.json(await buildOverview(await loadOwnedBrand(req), user));
  } catch (err) {
    next(err);
  }
});

dashboardRouter.get("/brands/:id/answers", async (req, res, next) => {
  try {
    const brand = await loadOwnedBrand(req);
    const latest = await latestScoredScan(String(brand._id));
    if (!latest) {
      res.json([]);
      return;
    }
    const filters: AnswerFilters = {};
    if (typeof req.query.engine === "string") filters.engine = req.query.engine as EngineId;
    if (req.query.language === "ru" || req.query.language === "en") {
      filters.language = req.query.language;
    }
    if (typeof req.query.intent === "string") filters.intent = req.query.intent;
    if (req.query.mentioned === "true") filters.mentioned = true;
    if (req.query.mentioned === "false") filters.mentioned = false;
    res.json(await buildAnswers(String(latest.scan._id), filters));
  } catch (err) {
    next(err);
  }
});

dashboardRouter.get("/brands/:id/competitors", async (req, res, next) => {
  try {
    const brand = await loadOwnedBrand(req);
    const latest = await latestScoredScan(String(brand._id));
    if (!latest) {
      res.json([]);
      return;
    }
    const rows = await competitorRowsForScan(String(latest.scan._id), brand);

    // Trend vs the previous scored scan, when one exists.
    const prevScan = await Scan.find({
      brandId: brand._id,
      _id: { $ne: latest.scan._id },
      status: { $in: ["done", "partial"] },
      createdAt: { $lt: latest.scan.createdAt },
    })
      .sort({ createdAt: -1 })
      .limit(1);
    if (prevScan[0]) {
      const prevRows = await competitorRowsForScan(String(prevScan[0]._id), brand);
      const prevByName = new Map(prevRows.map((r) => [r.name.toLowerCase(), r.visibilityPct]));
      for (const row of rows) {
        const prev = prevByName.get(row.name.toLowerCase());
        if (prev !== undefined) {
          row.trend = Math.round((row.visibilityPct - prev) * 10) / 10;
        }
      }
    }
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

dashboardRouter.get("/brands/:id/sources", async (req, res, next) => {
  try {
    const brand = await loadOwnedBrand(req);
    const latest = await latestScoredScan(String(brand._id));
    res.json(latest?.snapshot.topSources ?? []);
  } catch (err) {
    next(err);
  }
});

dashboardRouter.get("/brands/:id/prompts", async (req, res, next) => {
  try {
    const brand = await loadOwnedBrand(req);
    const latest = await latestScoredScan(String(brand._id));
    if (!latest) {
      res.json([]);
      return;
    }
    res.json(await buildPromptRows(String(latest.scan._id), brand));
  } catch (err) {
    next(err);
  }
});

dashboardRouter.patch("/brands/:id", async (req, res, next) => {
  try {
    const brand = await loadOwnedBrand(req);
    const input = brandSettingsSchema.parse(req.body);
    if (input.name !== undefined) brand.name = input.name;
    if (input.aliases !== undefined) brand.aliases = input.aliases;
    if (input.website !== undefined) brand.website = input.website;
    if (input.category !== undefined) brand.category = input.category;
    if (input.city !== undefined) brand.city = input.city ?? undefined;
    if (input.market !== undefined) brand.market = input.market;
    if (input.competitors !== undefined) brand.competitors = input.competitors;
    if (input.locale !== undefined) brand.locale = input.locale;
    brand.normKey = normalizedKey(brand.name, brand.category, brand.city);
    await brand.save();
    res.json(toBrandDto(brand));
  } catch (err) {
    next(err);
  }
});

dashboardRouter.post("/brands/:id/prompts/toggle", async (req, res, next) => {
  try {
    const brand = await loadOwnedBrand(req);
    const { promptId, disabled } = promptToggleSchema.parse(req.body);
    const prompt = await GeneratedPrompt.findById(promptId).catch(() => null);
    if (!prompt) throw new AppError("NOT_FOUND", 404, "Prompt not found");
    const key = prompt.text;
    const normalized = normalizedKey(key);
    const has = brand.disabledPrompts.some((p) => normalizedKey(p) === normalized);
    if (disabled && !has) brand.disabledPrompts.push(key);
    if (!disabled && has) {
      brand.disabledPrompts = brand.disabledPrompts.filter(
        (p) => normalizedKey(p) !== normalized,
      );
    }
    await brand.save();
    res.json({ ok: true, disabled });
  } catch (err) {
    next(err);
  }
});

// Re-scans go through POST /api/scan (same quota pool, always live calls).
