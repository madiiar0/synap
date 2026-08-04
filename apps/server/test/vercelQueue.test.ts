process.env.NODE_ENV = "test";
process.env.MONGODB_URI = "";
process.env.AUTH_MODE = "mock";
process.env.VERCEL = "1";

import { beforeEach, describe, expect, it, vi } from "vitest";

const waitUntil = vi.fn<(promise: Promise<unknown>) => void>();
vi.mock("@vercel/functions", () => ({ waitUntil }));

const { enqueue, initQueue, registerHandler } = await import("../src/queue/index.js");

describe("Vercel audit queue adapter", () => {
  beforeEach(() => {
    waitUntil.mockClear();
  });

  it("registers audit work with the Vercel function lifecycle", async () => {
    const handled = vi.fn(async () => undefined);
    registerHandler("runScan", handled);
    await initQueue();
    await enqueue("runScan", { scanId: "scan-vercel-1" });

    expect(waitUntil).toHaveBeenCalledOnce();
    await waitUntil.mock.calls[0][0];
    expect(handled).toHaveBeenCalledWith({ scanId: "scan-vercel-1" });
  });
});
