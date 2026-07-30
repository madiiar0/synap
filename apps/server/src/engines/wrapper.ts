import { EngineHttpError, EngineTimeoutError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";
import { assertBudget, recordUsage } from "../services/usage.js";
import { Semaphore } from "./semaphore.js";
import type { EngineAdapter, EngineAnswer, EngineQueryOptions } from "./types.js";

const ENGINE_TIMEOUT_MS = 60_000;
const MAX_ATTEMPTS = 3; // initial call + 2 retries
const BACKOFF_MS = [1000, 3000];
const PER_PROVIDER_CONCURRENCY = 2;

function isRetryable(err: unknown): boolean {
  if (err instanceof EngineTimeoutError) return true;
  if (err instanceof EngineHttpError) return err.status === 429 || err.status >= 500;
  // SDK errors (openai/anthropic) carry a numeric status.
  const status = (err as { status?: unknown }).status;
  if (typeof status === "number") return status === 429 || status >= 500;
  const code = (err as { code?: unknown }).code;
  return code === "ECONNRESET" || code === "ETIMEDOUT" || code === "ENOTFOUND";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withTimeout<T>(engineId: string, promise: Promise<T>): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new EngineTimeoutError(engineId)), ENGINE_TIMEOUT_MS);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Wrap a real engine adapter with: budget guard, per-provider concurrency (2),
 * 60s timeout, 2 retries with backoff on 429/5xx, and ApiUsage accounting.
 */
export function instrumentEngine(adapter: EngineAdapter): EngineAdapter {
  const semaphore = new Semaphore(PER_PROVIDER_CONCURRENCY);
  return {
    id: adapter.id,
    available: () => adapter.available(),
    query: (prompt: string, opts: EngineQueryOptions): Promise<EngineAnswer> =>
      semaphore.run(async () => {
        await assertBudget();
        let lastErr: unknown;
        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
          try {
            const answer = await withTimeout(adapter.id, adapter.query(prompt, opts));
            await recordUsage(adapter.id, answer);
            return answer;
          } catch (err) {
            lastErr = err;
            if (attempt < MAX_ATTEMPTS - 1 && isRetryable(err)) {
              logger.warn({ engine: adapter.id, attempt: attempt + 1 }, "engine call retrying");
              await sleep(BACKOFF_MS[attempt] ?? 3000);
              continue;
            }
            break;
          }
        }
        throw lastErr;
      }),
  };
}
