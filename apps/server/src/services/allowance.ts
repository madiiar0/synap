import type { Request } from "express";
import type { UserDoc } from "../models/User.js";
import { scanStartsRemainingForIp } from "../http/middleware/rateLimits.js";

/**
 * #7: THE single source of truth for "can this account run an audit, and how
 * many are left". Every surface (session, overview, onboarding, rescan) and the
 * server-side gate read this, so the form, dashboard and backend can never
 * disagree.
 *
 * Two independent gates exist and both must pass:
 *   - account: freeScanLimit - freeScansUsed (permanent, never resets)
 *   - network: SCAN_STARTS_PER_IP_PER_DAY (per IP, per day)
 * Admin and unlimited accounts bypass both.
 */
export type AllowanceReason = "ok" | "account_limit" | "ip_limit";

export interface ScanAllowance {
  /** Audits the account may still run; null means unlimited (admin). */
  scansLeft: number | null;
  /** Effective right now, taking the network gate into account too. */
  canScan: boolean;
  reason: AllowanceReason;
}

export function scanAllowance(user: UserDoc, ip?: string): ScanAllowance {
  if (user.role === "admin" || user.unlimitedScans) {
    return { scansLeft: null, canScan: true, reason: "ok" };
  }

  const accountLeft = Math.max(0, user.freeScanLimit - user.freeScansUsed);
  if (accountLeft === 0) {
    return { scansLeft: 0, canScan: false, reason: "account_limit" };
  }

  // The network gate can block an account that still has audits on paper.
  // Reporting it here is what stops "2 left" from failing at submit time.
  const ipLeft = ip === undefined ? Number.POSITIVE_INFINITY : scanStartsRemainingForIp(ip);
  if (ipLeft <= 0) {
    return { scansLeft: accountLeft, canScan: false, reason: "ip_limit" };
  }

  return { scansLeft: accountLeft, canScan: true, reason: "ok" };
}

/** Convenience for routes that have a Request. */
export function allowanceFor(req: Request, user: UserDoc): ScanAllowance {
  return scanAllowance(user, req.ip);
}
