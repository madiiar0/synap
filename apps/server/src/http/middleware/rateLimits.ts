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
const ipCounters = new Map<string, { day: string; count: number }>();

export function publicScanIpLimit(req: Request, _res: Response, next: NextFunction): void {
  const ip = req.ip ?? "unknown";
  const day = todayKey();
  const entry = ipCounters.get(ip);
  if (!entry || entry.day !== day) {
    ipCounters.set(ip, { day, count: 1 });
    next();
    return;
  }
  if (entry.count >= env.PUBLIC_SCAN_PER_IP_PER_DAY) {
    next(new AppError("RATE_LIMITED", 429, "Daily free scan limit reached"));
    return;
  }
  entry.count += 1;
  next();
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
