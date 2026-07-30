import { Router } from "express";
import { ENGINE_IDS, type EngineId, type LeadRowDto, type ScanListItemDto } from "@synapai/shared";
import { z } from "zod";
import { env } from "../../config/env.js";
import { engineStatus } from "../../engines/registry.js";
import { AppError } from "../../lib/errors.js";
import { ApiUsage } from "../../models/ApiUsage.js";
import { Brand } from "../../models/Brand.js";
import { Lead } from "../../models/Lead.js";
import { Scan } from "../../models/Scan.js";
import { ScoreSnapshot } from "../../models/ScoreSnapshot.js";
import { getSettings } from "../../models/Settings.js";
import { enqueue } from "../../queue/index.js";
import { getBudgetState, todayKey } from "../../services/usage.js";
import { requireAdmin } from "../middleware/auth.js";

export const adminRouter = Router();
adminRouter.use(requireAdmin);

function leadToRow(lead: InstanceType<typeof Lead>): LeadRowDto {
  return {
    id: String(lead._id),
    type: lead.type,
    email: lead.email,
    phone: lead.phone,
    name: lead.name,
    brandName: lead.brandName,
    scanId: lead.scanId ? String(lead.scanId) : undefined,
    message: lead.message,
    source: lead.source,
    createdAt: lead.createdAt.toISOString(),
  };
}

adminRouter.get("/leads", async (req, res, next) => {
  try {
    const query =
      req.query.type === "scan_email" || req.query.type === "book_call"
        ? { type: req.query.type }
        : {};
    const leads = await Lead.find(query).sort({ createdAt: -1 }).limit(500);
    res.json(leads.map(leadToRow));
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/leads.csv", async (_req, res, next) => {
  try {
    const leads = await Lead.find({}).sort({ createdAt: -1 }).limit(2000);
    const escape = (v: string | undefined): string => {
      let cell = (v ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ");
      // Neutralize spreadsheet formula injection from untrusted lead input.
      if (/^[=+\-@\t]/.test(cell)) cell = `'${cell}`;
      return `"${cell}"`;
    };
    const rows = [
      "type,email,phone,name,brandName,source,message,createdAt",
      ...leads.map((l) =>
        [
          l.type,
          escape(l.email),
          escape(l.phone),
          escape(l.name),
          escape(l.brandName),
          l.source,
          escape(l.message),
          l.createdAt.toISOString(),
        ].join(","),
      ),
    ];
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=synapai-leads.csv");
    res.send(rows.join("\n"));
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/scans", async (_req, res, next) => {
  try {
    const scans = await Scan.find({}).sort({ createdAt: -1 }).limit(200);
    const brandIds = [...new Set(scans.map((s) => String(s.brandId)))];
    const brands = await Brand.find({ _id: { $in: brandIds } });
    const brandNames = new Map(brands.map((b) => [String(b._id), b.name]));
    const snapshots = await ScoreSnapshot.find({ scanId: { $in: scans.map((s) => s._id) } });
    const overallByScan = new Map(snapshots.map((s) => [String(s.scanId), s.overall]));
    const rows: ScanListItemDto[] = scans.map((s) => ({
      id: String(s._id),
      brandId: String(s.brandId),
      brandName: brandNames.get(String(s.brandId)) ?? "?",
      tier: s.tier,
      status: s.status,
      createdAt: s.createdAt.toISOString(),
      finishedAt: s.finishedAt?.toISOString() ?? null,
      overall: overallByScan.get(String(s._id)) ?? null,
      costUsd: s.totals.costUsd,
    }));
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

adminRouter.post("/scans/:id/rerun", async (req, res, next) => {
  try {
    const scan = await Scan.findById(req.params.id).catch(() => null);
    if (!scan) throw new AppError("NOT_FOUND", 404, "Scan not found");
    if (scan.status === "running") {
      // A live run must not be duplicated; the stale-running sweeper
      // rescues genuinely dead runs.
      throw new AppError("SCAN_RUNNING", 409, "Scan is already running");
    }
    if (scan.status === "done") {
      // A finished scan re-runs as a fresh scan of the same shape.
      const fresh = await Scan.create({
        brandId: scan.brandId,
        tier: scan.tier,
        engines: scan.engines,
        trigger: "admin",
      });
      await enqueue("runScan", { scanId: String(fresh._id) });
      res.json({ scanId: String(fresh._id) });
      return;
    }
    // Failed/partial/stuck scans continue where they left off.
    scan.status = "queued";
    scan.pausedReason = null;
    await scan.save();
    await enqueue("runScan", { scanId: String(scan._id) });
    res.json({ scanId: String(scan._id) });
  } catch (err) {
    next(err);
  }
});

adminRouter.post("/brands/:id/full-scan", async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.params.id).catch(() => null);
    if (!brand) throw new AppError("NOT_FOUND", 404, "Brand not found");
    const scan = await Scan.create({
      brandId: brand._id,
      tier: "full",
      engines: env.ENGINES_FULL,
      trigger: "admin",
    });
    await enqueue("runScan", { scanId: String(scan._id) });
    res.json({ scanId: String(scan._id) });
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/usage", async (req, res, next) => {
  try {
    const days = Math.min(60, Math.max(1, Number(req.query.days) || 14));
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const rows = await ApiUsage.find({ date: { $gte: cutoff } }).sort({ date: 1 });
    res.json({
      series: rows.map((r) => ({
        date: r.date,
        provider: r.provider,
        calls: r.calls,
        tokens: r.tokens,
        costUsd: Math.round(r.costUsd * 10000) / 10000,
      })),
      budget: await getBudgetState(),
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.post("/usage/resume", async (_req, res, next) => {
  try {
    const settings = await getSettings();
    settings.budgetOverrideDate = todayKey();
    await settings.save();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/engines", async (_req, res, next) => {
  try {
    res.json(await engineStatus());
  } catch (err) {
    next(err);
  }
});

const engineFlagSchema = z.object({
  engine: z.enum(ENGINE_IDS),
  enabled: z.boolean(),
});

adminRouter.patch("/engines", async (req, res, next) => {
  try {
    const { engine, enabled } = engineFlagSchema.parse(req.body);
    const settings = await getSettings();
    settings.engineFlags = { ...settings.engineFlags, [engine as EngineId]: enabled };
    settings.markModified("engineFlags");
    await settings.save();
    res.json(await engineStatus());
  } catch (err) {
    next(err);
  }
});
