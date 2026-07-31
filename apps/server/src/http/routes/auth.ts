import { Router } from "express";
import { z } from "zod";
import type { SessionUserDto } from "@synapai/shared";
import { authMode, isProd } from "../../config/env.js";
import { AppError } from "../../lib/errors.js";
import { User, type UserDoc } from "../../models/User.js";
import {
  clearSessionCookie,
  createSessionToken,
  setSessionCookie,
} from "../../services/auth.js";
import { verifyFirebaseToken, type VerifiedIdentity } from "../../services/firebaseAdmin.js";
import { authLimiter } from "../middleware/rateLimits.js";

export const authRouter = Router();

function toSessionDto(user: UserDoc): SessionUserDto {
  return {
    id: String(user._id),
    email: user.email,
    name: user.name,
    locale: user.locale,
    role: user.role,
  };
}

const sessionSchema = z.object({
  idToken: z.string().min(10).max(4096).optional(),
  email: z.string().trim().toLowerCase().email().max(120).optional(),
  locale: z.enum(["ru", "en"]).optional(),
});

/** Upsert by firebaseUid, falling back to email so pre-created accounts
 * (scan unlock) get linked to the new Firebase identity (§2.2). */
async function upsertFirebaseUser(
  identity: VerifiedIdentity,
  locale?: "ru" | "en",
): Promise<UserDoc> {
  let user = await User.findOne({ firebaseUid: identity.firebaseUid });
  if (!user) {
    user = await User.findOne({ email: identity.email });
  }
  if (!user) {
    user = new User({ email: identity.email, locale: locale ?? "ru" });
  }
  user.firebaseUid = identity.firebaseUid;
  if (identity.name && !user.name) user.name = identity.name;
  if (identity.photoUrl) user.photoUrl = identity.photoUrl;
  if (locale) user.locale = locale;
  await user.save();
  return user;
}

/**
 * §2.2: exchange a Firebase ID token (or, in mock mode, a bare email) for
 * the app's session cookie. Mock mode is refused in production at startup.
 */
authRouter.post("/session", authLimiter, async (req, res, next) => {
  try {
    const input = sessionSchema.parse(req.body);
    let user: UserDoc;

    if (authMode === "firebase") {
      if (!input.idToken) throw new AppError("TOKEN_REQUIRED", 400, "idToken is required");
      user = await upsertFirebaseUser(await verifyFirebaseToken(input.idToken), input.locale);
    } else {
      // mock: local dev token flow — trusts the email; never in production.
      if (isProd) throw new AppError("FORBIDDEN", 403, "Mock auth is disabled");
      if (!input.email) throw new AppError("EMAIL_REQUIRED", 400, "email is required");
      const existing = await User.findOne({ email: input.email });
      user =
        existing ??
        (await User.create({ email: input.email, locale: input.locale ?? "ru" }));
      if (input.locale && user.locale !== input.locale) {
        user.locale = input.locale;
        await user.save();
      }
    }

    setSessionCookie(res, createSessionToken(user));
    res.json(toSessionDto(user));
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
  res.json(toSessionDto(req.user));
});
