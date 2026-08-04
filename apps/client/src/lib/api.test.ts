import { afterEach, describe, expect, it, vi } from "vitest";
import { apiGet } from "./api";

describe("API response validation", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects an HTML SPA fallback returned with status 200", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response("<!doctype html><html></html>", {
          status: 200,
          headers: { "content-type": "text/html; charset=utf-8" },
        })),
    );

    await expect(apiGet("/api/auth/me")).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
      status: 200,
    });
  });

  it("accepts successful empty responses", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 204 })));

    await expect(apiGet("/api/auth/logout")).resolves.toBeUndefined();
  });
});
