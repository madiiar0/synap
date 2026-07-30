import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import type { Response } from "express";
import type { Locale } from "@synapai/shared";
import { env, isProd } from "../config/env.js";
import { AppError } from "../lib/errors.js";
import { User, type UserDoc } from "../models/User.js";

export const SESSION_COOKIE = "synapai_session";
const SESSION_TTL = "30d";
const MAGIC_TTL_MS = 30 * 60 * 1000;

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

function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

/**
 * Create/find the user and produce a one-time magic link
 * (`CLIENT_URL/auth/verify?token=<uid>.<secret>`, 30 min TTL).
 */
export async function createMagicLink(
  email: string,
  locale?: Locale,
): Promise<{ user: UserDoc; link: string }> {
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ email, locale: locale ?? "ru" });
  } else if (locale && user.locale !== locale) {
    user.locale = locale;
  }
  const secret = crypto.randomBytes(24).toString("base64url");
  user.magicTokenHash = hashToken(secret);
  user.magicExpiresAt = new Date(Date.now() + MAGIC_TTL_MS);
  await user.save();
  const link = `${env.CLIENT_URL}/auth/verify?token=${String(user._id)}.${secret}`;
  return { user, link };
}

/** Validate and burn a magic token; returns the signed-in user. */
export async function consumeMagicToken(token: string): Promise<UserDoc> {
  const dot = token.indexOf(".");
  if (dot === -1) throw new AppError("INVALID_TOKEN", 401, "Invalid link");
  const uid = token.slice(0, dot);
  const secret = token.slice(dot + 1);
  const user = await User.findById(uid).catch(() => null);
  if (
    !user ||
    !user.magicTokenHash ||
    !user.magicExpiresAt ||
    user.magicExpiresAt.getTime() < Date.now() ||
    user.magicTokenHash !== hashToken(secret)
  ) {
    throw new AppError("INVALID_TOKEN", 401, "Invalid or expired link");
  }
  user.magicTokenHash = undefined;
  user.magicExpiresAt = undefined;
  await user.save();
  return user;
}
