/**
 * §3.1: `/api/brands` must never answer 304. A conditional response replays a
 * stale body (an empty list from before the first scan), which made the app
 * shell bounce a user with a finished scan back to onboarding.
 */
process.env.DEMO_MODE = "true";
process.env.MONGODB_URI = "";
process.env.AUTH_MODE = "mock";
process.env.NODE_ENV = "test";

import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const { connectDb, disconnectDb } = await import("../src/db/connect.js");
const { createApp } = await import("../src/createApp.js");

let server: Server;
let base: string;
let cookie: string;

async function post(path: string, body: unknown, jar?: string) {
  return fetch(`${base}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(jar ? { Cookie: jar } : {}),
    },
    body: JSON.stringify(body),
  });
}

describe("authenticated API responses are never conditionally cached (§3.1)", () => {
  beforeAll(async () => {
    await connectDb();
    server = createApp().listen(0);
    const address = server.address() as AddressInfo;
    base = `http://127.0.0.1:${address.port}`;
    const session = await post("/api/auth/session", { email: "nocache@test.dev", locale: "ru" });
    cookie = (session.headers.get("set-cookie") ?? "").split(";")[0];
  });

  afterAll(async () => {
    server.close();
    await disconnectDb();
  });

  it("sends no ETag and forbids caching on /api/brands", async () => {
    const res = await fetch(`${base}/api/brands`, { headers: { Cookie: cookie } });
    expect(res.status).toBe(200);
    expect(res.headers.get("etag")).toBeNull();
    expect(res.headers.get("cache-control")).toContain("no-store");
  });

  it("replays 200 with a fresh body even when the client sends If-None-Match", async () => {
    const first = await fetch(`${base}/api/brands`, { headers: { Cookie: cookie } });
    const etag = first.headers.get("etag");
    // Even a fabricated validator must not produce a 304.
    const second = await fetch(`${base}/api/brands`, {
      headers: { Cookie: cookie, "If-None-Match": etag ?? 'W/"stale"' },
    });
    expect(second.status).toBe(200);
    expect(second.status).not.toBe(304);
    await expect(second.json()).resolves.toBeInstanceOf(Array);
  });

  it("preserves the complete security-header policy", async () => {
    const res = await fetch(`${base}/api/health`);
    const csp = res.headers.get("content-security-policy") ?? "";

    expect(csp).toContain("https://*.firebaseapp.com");
    expect(res.headers.get("cross-origin-opener-policy")).toBe("same-origin-allow-popups");
    expect(res.headers.get("cross-origin-resource-policy")).toBe("same-origin");
    expect(res.headers.get("origin-agent-cluster")).toBe("?1");
    expect(res.headers.get("referrer-policy")).toBe("no-referrer");
    expect(res.headers.get("strict-transport-security")).toContain("max-age=");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(res.headers.get("x-dns-prefetch-control")).toBe("off");
    expect(res.headers.get("x-download-options")).toBe("noopen");
    expect(res.headers.get("x-frame-options")).toBe("SAMEORIGIN");
    expect(res.headers.get("x-permitted-cross-domain-policies")).toBe("none");
    expect(res.headers.get("x-powered-by")).toBeNull();
    expect(res.headers.get("x-xss-protection")).toBe("0");
  });
});
