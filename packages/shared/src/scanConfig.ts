import type { EngineId } from "./engines.js";

/**
 * §2 scan configuration. Every number here is a default the server can
 * override via env, so the owner dials cost without a code change.
 *
 * Free scan: 8 core prompts × 3 core engines (24 calls) + 17 tail prompts
 * on the tail engine (17 calls) = 41 calls, ≈ $0.25-0.30.
 * Full scan (admin only): 25 prompts × 5 engines = 125 calls, ≈ $0.85.
 */
export const FREE_SCAN = {
  prompts: 25,
  coreEngines: ["chatgpt", "gemini", "perplexity"] as EngineId[],
  corePrompts: 8,
  tailEngine: "perplexity" as EngineId,
};

/** §6 quotas and abuse controls (server-enforced; env-overridable). */
export const FREE_SCANS_PER_ACCOUNT = 3;
export const DAILY_SCAN_CAP = 200;
export const SCAN_STARTS_PER_IP_PER_DAY = 5;
export const NEW_ACCOUNTS_PER_IP_PER_DAY = 3;

/** §4: up to this many answers per batched extraction call. */
export const EXTRACTION_BATCH_SIZE = 10;

/** §2.4: repeat scan submission with the same key within this window returns the existing scan. */
export const IDEMPOTENCY_WINDOW_MS = 60_000;

/** Known disposable-email domains rejected at sign-up and scan start (§6.5). */
export const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "tempmail.com",
  "temp-mail.org",
  "yopmail.com",
  "throwawaymail.com",
  "getnada.com",
  "trashmail.com",
  "sharklasers.com",
  "maildrop.cc",
  "dispostable.com",
  "fakeinbox.com",
  "mytemp.email",
  "tempinbox.com",
]);

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  return DISPOSABLE_EMAIL_DOMAINS.has(domain);
}
