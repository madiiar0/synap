import type { EngineId } from "./engines.js";

/**
 * §2 scan configuration. Every number here is a default the server can
 * override via env, so the owner dials cost without a code change.
 *
 * Free scan (iteration 6), weighted to assistant popularity in Kazakhstan:
 *   9 core prompts (all 3 branded, then comparison and top discovery prompts)
 *     × 3 core engines [chatgpt, gemini, perplexity]        = 27 calls
 *   16 tail prompts split evenly between chatgpt and gemini = 16 calls
 *                                                      total = 43 calls
 * Plus ~2 research + 1 generation + ~5 batched extraction calls.
 * Full scan (admin only): 25 prompts × 5 engines = 125 calls.
 */
export const FREE_SCAN = {
  prompts: 25,
  coreEngines: ["chatgpt", "gemini", "perplexity"] as EngineId[],
  corePrompts: 9,
  /** Tail prompts are dealt round-robin across these (§2 Stage C). */
  tailEngines: ["chatgpt", "gemini"] as EngineId[],
};

/** Total engine calls a free scan issues: 9x3 + 16 = 43. */
export const FREE_SCAN_CALLS =
  FREE_SCAN.corePrompts * FREE_SCAN.coreEngines.length +
  (FREE_SCAN.prompts - FREE_SCAN.corePrompts);

/** §2 Stage A: how many provider calls the research stage may spend. */
export const RESEARCH_MAX_CALLS = 2;

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
