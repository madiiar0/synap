import { rateLimit } from "express-rate-limit";
import type { NextFunction, Request, Response } from "express";
import { env } from "../../config/env.js";
import { AppError } from "../../lib/errors.js";
import { todayKey } from "../../services/usage.js";

/** Auth endpoints: 10/min/IP. */
export const authLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

/** Shared-admin password attempts: five failures/min/IP. Successful logins do
 * not consume the failure budget, while ordinary Firebase sign-in can still
 * proceed when this separate gate is exhausted. */
export const sharedAdminAuthLimiter = rateLimit({
  windowMs: 60_000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

/** General API: 120/min (per IP; sessions share NATs rarely enough for an MVP). */
export const apiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

// §6.5 abuse controls: in-memory per-IP daily counters (admin exempt).
function makeIpLimiter(
  limit: () => number,
  message: string,
): {
  check: (req: Request, _res: Response, next: NextFunction) => void;
  consume: (ip: string | undefined) => void;
  remaining: (ip: string | undefined) => number;
} {
  const counters = new Map<string, { day: string; count: number }>();
  return {
    check(req, _res, next) {
      if (req.user?.role === "admin") {
        next();
        return;
      }
      const entry = counters.get(req.ip ?? "unknown");
      if (entry && entry.day === todayKey() && entry.count >= limit()) {
        next(new AppError("RATE_LIMITED", 429, message));
        return;
      }
      next();
    },
    /** #7: read the remaining allowance WITHOUT consuming it. */
    remaining(ip) {
      const entry = counters.get(ip ?? "unknown");
      if (!entry || entry.day !== todayKey()) return limit();
      return Math.max(0, limit() - entry.count);
    },
    consume(ip) {
      const key = ip ?? "unknown";
      const day = todayKey();
      const entry = counters.get(key);
      if (!entry || entry.day !== day) counters.set(key, { day, count: 1 });
      else entry.count += 1;
    },
  };
}

const scanStarts = makeIpLimiter(
  () => env.SCAN_STARTS_PER_IP_PER_DAY,
  "Daily scan limit for this network reached",
);
const newAccounts = makeIpLimiter(
  () => env.NEW_ACCOUNTS_PER_IP_PER_DAY,
  "Daily account limit for this network reached",
);

/** 5 scan starts per IP per day (§6.5); consumed on actual scan creation. */
export function scanStartIpLimit(req: Request, res: Response, next: NextFunction): void {
  scanStarts.check(req, res, (err?: unknown) => {
    if (err) {
      next(err as Error);
      return;
    }
    if (req.user?.role !== "admin") scanStarts.consume(req.ip);
    next();
  });
}

/** 3 new accounts per IP per day (§6.5); checked before creating a User. */
export function newAccountIpAllowed(req: Request): boolean {
  let allowed = true;
  newAccounts.check(req, undefined as unknown as Response, (err?: unknown) => {
    allowed = !err;
  });
  return allowed;
}

export function consumeNewAccountQuota(ip: string | undefined): void {
  newAccounts.consume(ip);
}

/** #7: scan starts still available from this network today. */
export function scanStartsRemainingForIp(ip: string | undefined): number {
  return scanStarts.remaining(ip);
}
