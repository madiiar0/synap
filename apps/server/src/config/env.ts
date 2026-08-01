import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { z } from "zod";
import {
  DAILY_SCAN_CAP,
  ENGINE_IDS,
  FREE_SCAN,
  FREE_SCANS_PER_ACCOUNT,
  NEW_ACCOUNTS_PER_IP_PER_DAY,
  SCAN_STARTS_PER_IP_PER_DAY,
  type EngineId,
} from "@synapai/shared";

// Load the repo-root .env (apps/server/src/config -> repo root).
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
dotenv.config({ path: path.join(repoRoot, ".env") });

const bool = z
  .string()
  .optional()
  .transform((v) => v === "true" || v === "1");

const engineList = z
  .string()
  .optional()
  .transform((v, ctx) => {
    if (!v || v.trim() === "") return [] as EngineId[];
    const items = v.split(",").map((s) => s.trim()).filter(Boolean);
    const bad = items.filter((i) => !(ENGINE_IDS as readonly string[]).includes(i));
    if (bad.length > 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Unknown engines: ${bad.join(", ")}` });
      return z.NEVER;
    }
    return items as EngineId[];
  });

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().default(4000),
  CLIENT_URL: z.string().default("http://localhost:5173"),
  APP_BASE_URL: z.string().default("http://localhost:4000"),
  BRAND_NAME: z.string().default("SynapAI"),
  JWT_SECRET: z.string().default("change_me"),
  MONGODB_URI: z.string().optional().default(""),
  REDIS_URL: z.string().optional().default(""),

  // §1: the ONLY AI credential — everything routes through Perplexity's Agent API.
  PERPLEXITY_API_KEY: z.string().optional().default(""),

  // §2: scan shape (defaults from packages/shared/scanConfig; env-overridable).
  FREE_SCAN_PROMPTS: z.coerce.number().int().min(5).max(100).default(FREE_SCAN.prompts),
  FREE_CORE_PROMPTS: z.coerce.number().int().min(1).max(50).default(FREE_SCAN.corePrompts),
  FREE_CORE_ENGINES: engineList.default(FREE_SCAN.coreEngines.join(",")),
  FREE_TAIL_ENGINES: engineList.default(FREE_SCAN.tailEngines.join(",")),

  // §6: quotas + abuse controls (server is the authority).
  FREE_SCANS_PER_ACCOUNT: z.coerce.number().int().min(0).default(FREE_SCANS_PER_ACCOUNT),
  DAILY_SCAN_CAP: z.coerce.number().int().min(1).default(DAILY_SCAN_CAP),
  SCAN_STARTS_PER_IP_PER_DAY: z.coerce.number().int().min(1).default(SCAN_STARTS_PER_IP_PER_DAY),
  NEW_ACCOUNTS_PER_IP_PER_DAY: z.coerce.number().int().min(1).default(NEW_ACCOUNTS_PER_IP_PER_DAY),
  DAILY_LLM_BUDGET_USD: z.coerce.number().min(0).default(10),

  CALENDLY_URL: z.string().optional().default(""),
  WHATSAPP_URL: z.string().optional().default(""),
  SMTP_HOST: z.string().optional().default(""),
  SMTP_PORT: z.coerce.number().int().default(587),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASS: z.string().optional().default(""),
  MAIL_FROM: z.string().default("SynapAI <no-reply@synapai.app>"),
  /**
   * #9: comma-separated list. Every address here is promoted to admin
   * (unlimited audits, bypasses the per-IP gate) on boot AND on each sign-in,
   * so adding one takes effect without a restart. Server-side only: a client
   * can never set this.
   */
  ADMIN_EMAIL: z.string().default("admin@synapai.app"),

  DEMO_MODE: bool.default("true"),
  DEMO_SCAN_TOTAL_MS: z.coerce.number().int().min(0).default(18000),

  // --- Auth (§2): firebase in production, mock for offline dev/demo/smoke.
  AUTH_MODE: z.enum(["firebase", "mock"]).optional(),
  FIREBASE_SERVICE_ACCOUNT_JSON: z.string().optional().default(""),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional().default(""),
});

// A key left blank in .env (`AUTH_MODE=`) means "not set", not "the empty
// value" — otherwise every commented-out template line fails validation.
// Keys whose schema allows "" simply fall back to their default of "".
const rawEnv = Object.fromEntries(
  Object.entries(process.env).filter(([, value]) => value !== ""),
);

const parsed = schema.safeParse(rawEnv);
if (!parsed.success) {
  // Fail fast with a readable message; never print secrets.
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

// A forgeable session secret must never reach production.
if (
  parsed.data.NODE_ENV === "production" &&
  (parsed.data.JWT_SECRET === "change_me" || parsed.data.JWT_SECRET.length < 16)
) {
  console.error(
    "Refusing to start: JWT_SECRET is unset/default. Generate one with `openssl rand -hex 32`.",
  );
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";

/** firebase when configured/forced; mock otherwise. Never mock in production. */
export const authMode: "firebase" | "mock" =
  env.AUTH_MODE ??
  (env.FIREBASE_SERVICE_ACCOUNT_JSON || env.GOOGLE_APPLICATION_CREDENTIALS
    ? "firebase"
    : "mock");

if (isProd && authMode === "mock") {
  console.error(
    "Refusing to start: AUTH_MODE=mock is not allowed in production. Configure Firebase credentials.",
  );
  process.exit(1);
}

// §0.2: asking for firebase without the credentials to do it must fail loudly,
// never degrade to password-less mock sign-in.
if (authMode === "firebase") {
  const missing: string[] = [];
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON && !env.GOOGLE_APPLICATION_CREDENTIALS) {
    missing.push("FIREBASE_SERVICE_ACCOUNT_JSON (or GOOGLE_APPLICATION_CREDENTIALS)");
  }
  if (missing.length > 0) {
    console.error(
      `Refusing to start: AUTH_MODE=firebase but these are missing: ${missing.join(", ")}.`,
    );
    console.error("See FIREBASE_SETUP.md step 5-6, or set AUTH_MODE=mock for offline development.");
    process.exit(1);
  }
}

/** #9: every configured admin address, lower-cased. */
export const adminEmails: string[] = env.ADMIN_EMAIL.split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email: string): boolean {
  return adminEmails.includes(email.trim().toLowerCase());
}

export { repoRoot };
