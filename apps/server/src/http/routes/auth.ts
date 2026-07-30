import bcrypt from "bcryptjs";
import { Router } from "express";
import {
  adminLoginSchema,
  requestLinkSchema,
  verifyTokenSchema,
  type SessionUserDto,
} from "@synapai/shared";
import { AppError } from "../../lib/errors.js";
import { sendMagicLinkEmail } from "../../mail/emails.js";
import { User, type UserDoc } from "../../models/User.js";
import {
  clearSessionCookie,
  consumeMagicToken,
  createMagicLink,
  createSessionToken,
  setSessionCookie,
} from "../../services/auth.js";
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

authRouter.post("/request-link", authLimiter, async (req, res, next) => {
  try {
    const { email, locale } = requestLinkSchema.parse(req.body);
    const { user, link } = await createMagicLink(email, locale);
    await sendMagicLinkEmail(email, user.locale, link);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/verify", authLimiter, async (req, res, next) => {
  try {
    const { token } = verifyTokenSchema.parse(req.body);
    const user = await consumeMagicToken(token);
    setSessionCookie(res, createSessionToken(user));
    res.json(toSessionDto(user));
  } catch (err) {
    next(err);
  }
});

authRouter.post("/login", authLimiter, async (req, res, next) => {
  try {
    const { email, password } = adminLoginSchema.parse(req.body);
    const user = await User.findOne({ email });
    if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new AppError("INVALID_CREDENTIALS", 401, "Invalid email or password");
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
