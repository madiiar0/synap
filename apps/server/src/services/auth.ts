import jwt from "jsonwebtoken";
import type { Response } from "express";
import { env, isProd } from "../config/env.js";
import type { UserDoc } from "../models/User.js";

export const SESSION_COOKIE = "synapai_session";
const SESSION_TTL = "30d";

interface SessionPayload {
  sub: string;
  role: string;
}

export function createSessionToken(user: UserDoc): string {
  const payload: SessionPayload = { sub: String(user._id), role: user.role };
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: SESSION_TTL });
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE);
}
