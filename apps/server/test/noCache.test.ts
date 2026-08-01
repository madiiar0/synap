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
const { createApp } = await import("../src/app.js");

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
});
