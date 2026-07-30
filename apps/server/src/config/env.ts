import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { z } from "zod";
import { ENGINE_IDS, type EngineId } from "@synapai/shared";

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

  PERPLEXITY_API_KEY: z.string().optional().default(""),
  PERPLEXITY_MODEL: z.string().default("sonar"),
  OPENAI_API_KEY: z.string().optional().default(""),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  ANTHROPIC_API_KEY: z.string().optional().default(""),
  ANTHROPIC_MODEL: z.string().default("claude-haiku-4-5"),
  GEMINI_API_KEY: z.string().optional().default(""),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
  EXTRACTION_PROVIDER: z.enum(ENGINE_IDS).default("perplexity"),

  SCAN_PROMPTS_FREE: z.coerce.number().int().min(1).max(500).default(25),
  SCAN_PROMPTS_FULL: z.coerce.number().int().min(1).max(500).default(100),
  ENGINES_FREE: engineList.default("perplexity"),
  ENGINES_FULL: engineList.default("perplexity,chatgpt,gemini,claude"),
  DAILY_LLM_BUDGET_USD: z.coerce.number().min(0).default(10),

  PUBLIC_SCAN_PER_IP_PER_DAY: z.coerce.number().int().min(1).default(3),
  PUBLIC_SCAN_GLOBAL_PER_DAY: z.coerce.number().int().min(1).default(30),

  CALENDLY_URL: z.string().optional().default(""),
  WHATSAPP_URL: z.string().optional().default(""),
  SMTP_HOST: z.string().optional().default(""),
  SMTP_PORT: z.coerce.number().int().default(587),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASS: z.string().optional().default(""),
  MAIL_FROM: z.string().default("SynapAI <no-reply@synapai.app>"),
  ADMIN_EMAIL: z.string().default("admin@synapai.app"),

  DEMO_MODE: bool.default("true"),
  DEMO_SCAN_TOTAL_MS: z.coerce.number().int().min(0).default(18000),
});

const parsed = schema.safeParse(process.env);
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
export { repoRoot };
