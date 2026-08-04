import { afterEach, describe, expect, it, vi } from "vitest";
import { proxyRequest } from "./proxy";

describe("Vercel frontend API proxy", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns a non-cacheable configuration error when BACKEND_URL is absent", async () => {
    const response = await proxyRequest(new Request("https://synap.vercel.app/api/health"), "");
    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "BACKEND_UNAVAILABLE" },
    });
  });

  it("forwards the complete API path, query, body and session headers", async () => {
    const upstream = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
      new Response(JSON.stringify({ role: "admin" }), {
        status: 200,
        headers: {
          "content-type": "application/json",
          "x-synap-proxy-test": "preserved",
        },
      }));
    vi.stubGlobal("fetch", upstream);

    const request = new Request(
      "https://synap-preview.vercel.app/api/auth/admin-session?next=%2Fadmin",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer existing-session",
        },
        body: JSON.stringify({ email: "owner@example.com", password: "server-only" }),
      },
    );
    const response = await proxyRequest(request, "https://synap-api.vercel.app/");

    expect(upstream).toHaveBeenCalledOnce();
    const [target, init] = upstream.mock.calls[0];
    expect(String(target)).toBe(
      "https://synap-api.vercel.app/api/auth/admin-session?next=%2Fadmin",
    );
    expect(init?.method).toBe("POST");
    expect(new Headers(init?.headers).get("authorization")).toBe("Bearer existing-session");
    expect(new Headers(init?.headers).get("x-forwarded-host")).toBe(
      "synap-preview.vercel.app",
    );
    expect(new TextDecoder().decode(init?.body as ArrayBuffer)).toContain("owner@example.com");
    expect(response.headers.get("x-synap-proxy-test")).toBe("preserved");
    await expect(response.json()).resolves.toEqual({ role: "admin" });
  });
});
