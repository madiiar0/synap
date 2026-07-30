import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../lib/errors.js";
import { User, type UserDoc } from "../../models/User.js";
import { SESSION_COOKIE, verifySessionToken } from "../../services/auth.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: UserDoc;
    }
  }
}

/** Resolve the session cookie (or Bearer token) into req.user; never fails. */
export async function attachUser(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const cookies = req.cookies as Record<string, string> | undefined;
    const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, "");
    const token = cookies?.[SESSION_COOKIE] ?? bearer;
    if (token) {
      const payload = verifySessionToken(token);
      if (payload) {
        const user = await User.findById(payload.sub).catch(() => null);
        if (user) req.user = user;
      }
    }
  } catch {
    // ignore — request continues unauthenticated
  }
  next();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new AppError("UNAUTHORIZED", 401, "Sign in required"));
    return;
  }
  next();
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new AppError("UNAUTHORIZED", 401, "Sign in required"));
    return;
  }
  if (req.user.role !== "admin") {
    next(new AppError("FORBIDDEN", 403, "Admin only"));
    return;
  }
  next();
}
