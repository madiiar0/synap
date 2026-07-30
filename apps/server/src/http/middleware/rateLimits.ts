import rateLimit from "express-rate-limit";
import type { NextFunction, Request, Response } from "express";
import { env } from "../../config/env.js";
import { AppError } from "../../lib/errors.js";
import { Scan } from "../../models/Scan.js";
import { todayKey } from "../../services/usage.js";

/** Auth endpoints: 10/min/IP. */
export const authLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

/** General API: 120/min (per IP; sessions share NATs rarely enough for an MVP). */
export const apiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

// Per-IP daily counter for public scan creation (in-memory, resets by day).
// Split check/consume so validation failures and cache hits don't burn quota.
const ipCounters = new Map<string, { day: string; count: number }>();

export function publicScanIpLimit(req: Request, _res: Response, next: NextFunction): void {
  const entry = ipCounters.get(req.ip ?? "unknown");
  if (entry && entry.day === todayKey() && entry.count >= env.PUBLIC_SCAN_PER_IP_PER_DAY) {
    next(new AppError("RATE_LIMITED", 429, "Daily free scan limit reached"));
    return;
  }
  next();
}

/** Called by the route only when a scan is actually created. */
export function consumePublicScanQuota(ip: string | undefined): void {
  const key = ip ?? "unknown";
  const day = todayKey();
  const entry = ipCounters.get(key);
  if (!entry || entry.day !== day) {
    ipCounters.set(key, { day, count: 1 });
  } else {
    entry.count += 1;
  }
}

/** Global daily cap on public scans (Mongo-backed, restart-safe). */
export async function publicScanGlobalLimit(
  _req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const startOfDay = new Date(`${todayKey()}T00:00:00.000Z`);
  const count = await Scan.countDocuments({
    trigger: "public",
    createdAt: { $gte: startOfDay },
  });
  if (count >= env.PUBLIC_SCAN_GLOBAL_PER_DAY) {
    next(new AppError("RATE_LIMITED", 429, "Daily scan capacity reached"));
    return;
  }
  next();
}
