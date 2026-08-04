import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

export type JobName = "runScan";
export interface JobPayload {
  scanId: string;
}

type Handler = (payload: JobPayload) => Promise<void>;

const handlers = new Map<JobName, Handler>();
let driver: "inline" | "bullmq" | "vercel" = "inline";
let bullQueue: { add: (name: string, data: JobPayload) => Promise<unknown> } | null = null;

export function registerHandler(name: JobName, handler: Handler): void {
  handlers.set(name, handler);
}

async function runInline(name: JobName, payload: JobPayload): Promise<void> {
  const handler = handlers.get(name);
  if (!handler) {
    logger.error({ name }, "no handler registered for job");
    return;
  }
  try {
    await handler(payload);
  } catch (err) {
    logger.error({ err, name, payload }, "inline job failed");
  }
}

/**
 * Queue driver: BullMQ when REDIS_URL is reachable, otherwise an in-process
 * inline driver (immediate async execution).
 */
export async function initQueue(): Promise<void> {
  if (process.env.VERCEL === "1") {
    // A Vercel Function has no durable resident worker. waitUntil() keeps the
    // invocation alive after the scan-start response, within maxDuration.
    driver = "vercel";
    logger.info("queue: Vercel waitUntil driver");
    return;
  }
  if (!env.REDIS_URL) {
    driver = "inline";
    logger.info("queue: inline driver (no REDIS_URL)");
    return;
  }
  try {
    // ioredis is CJS; type its constructor structurally to keep this optional
    // path independent of interop quirks.
    const redisModule = (await import("ioredis")) as unknown as {
      default: new (
        url: string,
        opts: Record<string, unknown>,
      ) => {
        connect(): Promise<void>;
        ping(): Promise<string>;
        disconnect(): void;
      };
    };
    const probe = new redisModule.default(env.REDIS_URL, {
      lazyConnect: true,
      connectTimeout: 1500,
      maxRetriesPerRequest: 0,
    });
    await probe.connect();
    await probe.ping();
    probe.disconnect();

    const { Queue, Worker } = await import("bullmq");
    // BullMQ manages its own connections from these options.
    const connection = { url: env.REDIS_URL, maxRetriesPerRequest: null };
    bullQueue = new Queue("synapai-jobs", { connection });
    new Worker(
      "synapai-jobs",
      async (job) => {
        await runInline(job.name as JobName, job.data as JobPayload);
      },
      { connection },
    );
    driver = "bullmq";
    logger.info("queue: bullmq driver connected");
  } catch (err) {
    driver = "inline";
    bullQueue = null;
    logger.warn({ err }, "queue: redis unreachable, using inline driver");
  }
}

export async function enqueue(name: JobName, payload: JobPayload): Promise<void> {
  if (driver === "vercel") {
    const { waitUntil } = await import("@vercel/functions");
    waitUntil(runInline(name, payload));
    return;
  }
  if (driver === "bullmq" && bullQueue) {
    await bullQueue.add(name, payload);
    return;
  }
  setImmediate(() => void runInline(name, payload));
}

/**
 * Inline-driver safety net: periodically re-runs scans stuck in `queued`
 * (e.g. after a crash between enqueue and execution).
 */
export function startStuckScanSweeper(
  findStuck: () => Promise<string[]>,
  intervalMs = 60_000,
): NodeJS.Timeout {
  const timer = setInterval(() => {
    void (async () => {
      try {
        for (const scanId of await findStuck()) {
          logger.warn({ scanId }, "re-enqueueing stuck scan");
          await enqueue("runScan", { scanId });
        }
      } catch (err) {
        logger.error({ err }, "stuck-scan sweep failed");
      }
    })();
  }, intervalMs);
  timer.unref();
  return timer;
}
