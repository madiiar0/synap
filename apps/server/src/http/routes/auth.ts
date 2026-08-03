import crypto from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { scanAllowance } from "../../services/allowance.js";
import { isDisposableEmail, type SessionUserDto } from "@synapai/shared";
import { adminEmails, authMode, env, isAdminEmail, isProd } from "../../config/env.js";
import { logger } from "../../lib/logger.js";
import { AppError } from "../../lib/errors.js";
import { User, type UserDoc } from "../../models/User.js";
import {
  clearSessionCookie,
  createSessionToken,
  setSessionCookie,
} from "../../services/auth.js";
import { verifyFirebaseToken, type VerifiedIdentity } from "../../services/firebaseAdmin.js";
import {
  authLimiter,
  consumeNewAccountQuota,
  newAccountIpAllowed,
  sharedAdminAuthLimiter,
} from "../middleware/rateLimits.js";

export const authRouter = Router();

export function toSessionDto(user: UserDoc, ip?: string): SessionUserDto {
  // #7: one authoritative allowance, shared with the overview and the gate.
  const allowance = scanAllowance(user, ip);
  return {
    id: String(user._id),
    email: user.email,
    name: user.name,
    locale: user.locale,
    role: user.role,
    emailVerified: user.emailVerified,
    scansLeft: allowance.scansLeft,
    canScan: allowance.canScan,
    limitReason: allowance.reason,
  };
}

const sessionSchema = z.object({
  idToken: z.string().min(10).max(4096).optional(),
  email: z.string().trim().toLowerCase().email().max(120).optional(),
  locale: z.enum(["ru", "en"]).optional(),
});

const sharedAdminSessionSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(120),
  password: z.string().min(1).max(256),
});

function sharedAdminPasswordMatches(candidate: string): boolean {
  if (!env.ADMIN_PASSWORD) return false;
  const digest = (value: string): Buffer => crypto.createHash("sha256").update(value).digest();
  return crypto.timingSafeEqual(digest(candidate), digest(env.ADMIN_PASSWORD));
}

/**
 * Optional shared access to the one canonical admin account. The submitted
 * email is deliberately not persisted or promoted: every successful login
 * resolves to the first server-controlled ADMIN_EMAIL account.
 */
authRouter.post("/admin-session", sharedAdminAuthLimiter, async (req, res, next) => {
  try {
    const input = sharedAdminSessionSchema.parse(req.body);
    if (!sharedAdminPasswordMatches(input.password)) {
      throw new AppError("ADMIN_CREDENTIALS_INVALID", 401, "Invalid email or password");
    }

    const canonicalAdminEmail = adminEmails[0];
    if (!canonicalAdminEmail) {
      throw new AppError("ADMIN_LOGIN_UNAVAILABLE", 503, "Admin login is unavailable");
    }

    const user = await User.findOneAndUpdate(
      { email: canonicalAdminEmail },
      {
        $set: { role: "admin", unlimitedScans: true, emailVerified: true },
        $setOnInsert: { email: canonicalAdminEmail, locale: "ru" },
      },
      { upsert: true, new: true },
    );

    setSessionCookie(res, createSessionToken(user));
    res.json(toSessionDto(user, req.ip));
  } catch (err) {
    next(err);
  }
});

/** Upsert by firebaseUid, falling back to email so pre-created accounts get
 * linked to the new Firebase identity (§5). */
async function upsertFirebaseUser(
  identity: VerifiedIdentity,
  locale: "ru" | "en" | undefined,
  req: { ip?: string },
): Promise<UserDoc> {
  let user = await User.findOne({ firebaseUid: identity.firebaseUid });
  if (!user) {
    user = await User.findOne({ email: identity.email });
  }
  if (!user) {
    // Genuinely new account: abuse controls apply (§6.5).
    if (isDisposableEmail(identity.email)) {
      throw new AppError("DISPOSABLE_EMAIL", 403, "Disposable email addresses are not allowed");
    }
    if (!newAccountIpAllowed(req as never)) {
      throw new AppError("RATE_LIMITED", 429, "Daily account limit for this network reached");
    }
    consumeNewAccountQuota(req.ip);
    user = new User({
      email: identity.email,
      locale: locale ?? "ru",
      freeScanLimit: env.FREE_SCANS_PER_ACCOUNT,
    });
  }
  user.firebaseUid = identity.firebaseUid;
  user.emailVerified = identity.emailVerified;
  if (identity.name && !user.name) user.name = identity.name;
  if (identity.photoUrl) user.photoUrl = identity.photoUrl;
  if (locale) user.locale = locale;
  await user.save();
  return user;
}

/** Exchange a Firebase ID token (or, in mock mode, a bare email) for the
 * app's session cookie. Mock mode is refused in production at startup. */
authRouter.post("/session", authLimiter, async (req, res, next) => {
  try {
    const input = sessionSchema.parse(req.body);
    let user: UserDoc;

    if (authMode === "firebase") {
      if (!input.idToken) throw new AppError("TOKEN_REQUIRED", 400, "idToken is required");
      user = await upsertFirebaseUser(await verifyFirebaseToken(input.idToken), input.locale, req);
    } else {
      // mock: local dev token flow — trusts the email; never in production.
      if (isProd) throw new AppError("FORBIDDEN", 403, "Mock auth is disabled");
      if (!input.email) throw new AppError("EMAIL_REQUIRED", 400, "email is required");
      if (isDisposableEmail(input.email)) {
        throw new AppError("DISPOSABLE_EMAIL", 403, "Disposable email addresses are not allowed");
      }
      const existing = await User.findOne({ email: input.email });
      if (!existing && !newAccountIpAllowed(req as never)) {
        throw new AppError("RATE_LIMITED", 429, "Daily account limit for this network reached");
      }
      if (!existing) consumeNewAccountQuota(req.ip);
      user =
        existing ??
        (await User.create({
          email: input.email,
          locale: input.locale ?? "ru",
          emailVerified: true, // mock mode has no verification flow
          freeScanLimit: env.FREE_SCANS_PER_ACCOUNT,
        }));
      if (input.locale && user.locale !== input.locale) {
        user.locale = input.locale;
        await user.save();
      }
    }

    // #9: promote on sign-in as well as on boot, so adding an address to
    // ADMIN_EMAIL takes effect immediately and an account created after boot
    // is still recognised. Driven purely by server env; never by the client.
    if (
      isAdminEmail(user.email) &&
      (user.role !== "admin" || !user.unlimitedScans || !user.emailVerified)
    ) {
      user.role = "admin";
      user.unlimitedScans = true;
      // #9: an admin address is trusted by configuration, so it is never sent
      // through email verification. upsertFirebaseUser copies the provider's
      // flag, which is false for a password account, so restore it here.
      user.emailVerified = true;
      await user.save();
      logger.info({ email: user.email }, "account promoted to admin from ADMIN_EMAIL");
    }

    setSessionCookie(res, createSessionToken(user));
    res.json(toSessionDto(user, req.ip));
  } catch (err) {
    next(err);
  }
});

authRouter.post("/logout", (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

authRouter.get("/me", (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Not signed in" } });
    return;
  }
  res.json(toSessionDto(req.user, req.ip));
});
