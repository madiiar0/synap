/**
 * §1.2: with demo mode OFF and no provider key, a scan must FAIL VISIBLY.
 * Serving fixture answers as if they were real is the worst possible outcome,
 * so this is asserted at the resolution boundary that decides which adapters
 * a scan may use.
 *
 * Env is pinned before any app import (dotenv never overrides existing keys).
 */
process.env.DEMO_MODE = "false";
process.env.PERPLEXITY_API_KEY = "";
process.env.MONGODB_URI = "";
process.env.AUTH_MODE = "mock";

import { describe, expect, it } from "vitest";

const { NoProviderError, resolveEngines } = await import("../src/engines/registry.js");
const { env } = await import("../src/config/env.js");

describe("no silent fixture fallback (§1.2)", () => {
  it("the test really is running with demo off and no key", () => {
    expect(env.DEMO_MODE).toBe(false);
    expect(env.PERPLEXITY_API_KEY).toBe("");
  });

  it("refuses to resolve engines instead of handing back demo adapters", async () => {
    await expect(resolveEngines(["chatgpt", "gemini"])).rejects.toBeInstanceOf(NoProviderError);
  });

  it("reports the failure as SCAN_FAILED so the UI can localize it", async () => {
    const error = await resolveEngines(["chatgpt"]).catch((e: unknown) => e);
    expect((error as { code: string }).code).toBe("SCAN_FAILED");
    expect(String((error as Error).message)).toContain("PERPLEXITY_API_KEY");
  });
});
