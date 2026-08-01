/**
 * #4/#5/#7/#10/#11 end-to-end: the real first-audit flow through the HTTP API,
 * which is the flow that was broken in the browser even though unit gates
 * passed. Runs fully offline (demo engines, in-memory Mongo, mock auth).
 */
process.env.DEMO_MODE = "true";
process.env.MONGODB_URI = "";
process.env.AUTH_MODE = "mock";
process.env.NODE_ENV = "test";
process.env.DEMO_SCAN_TOTAL_MS = "300";
process.env.SCAN_STARTS_PER_IP_PER_DAY = "20";

import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const { connectDb, disconnectDb } = await import("../src/db/connect.js");
const { createApp } = await import("../src/app.js");
const { initQueue, registerHandler } = await import("../src/queue/index.js");
const { runScan } = await import("../src/services/scanRunner.js");

let server: Server;
let base: string;
let cookie: string;

const api = async (path: string, init: RequestInit = {}): Promise<Response> =>
  fetch(`${base}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", Cookie: cookie, ...(init.headers ?? {}) },
  });

describe("first audit, end to end", () => {
  beforeAll(async () => {
    await connectDb();
    registerHandler("runScan", ({ scanId }) => runScan(scanId));
    await initQueue();
    server = createApp().listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    const session = await fetch(`${base}/api/auth/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "firstaudit@test.dev", locale: "ru" }),
    });
    cookie = (session.headers.get("set-cookie") ?? "").split(";")[0];
  });

  afterAll(async () => {
    server.close();
    await disconnectDb();
  });

  it("a new account starts with no business and a full allowance", async () => {
    const brands = await (await api("/api/brands")).json();
    expect(brands).toEqual([]);
    const me = (await (await api("/api/auth/me")).json()) as {
      scansLeft: number;
      canScan: boolean;
    };
    expect(me.scansLeft).toBe(3);
    expect(me.canScan).toBe(true);
  });

  it("#5 accepts every business identity field the settings form has", async () => {
    const res = await api("/api/scan", {
      method: "POST",
      body: JSON.stringify({
        brandName: "Coffee BOOM",
        category: "кофейня",
        city: "Алматы",
        market: "kz",
        website: "https://coffeeboom.kz",
        aliases: ["Кофе Бум", "CB"],
        competitors: ["Starbucks"],
        locale: "ru",
        idempotencyKey: crypto.randomUUID(),
      }),
    });
    expect(res.status).toBe(200);
    const { scanId } = (await res.json()) as { scanId: string };
    expect(scanId).toBeTruthy();

    // #4: wait for the audit to genuinely finish and persist.
    let status = "";
    for (let i = 0; i < 200; i++) {
      const p = (await (await api(`/api/scan/${scanId}/progress`)).json()) as { status: string };
      status = p.status;
      if (["done", "partial", "failed"].includes(status)) break;
      await new Promise((r) => setTimeout(r, 100));
    }
    expect(status).toBe("done");

    // The identity fields the form collected must be on the stored brand.
    const brands = (await (await api("/api/brands")).json()) as {
      id: string;
      website?: string;
      aliases: string[];
    }[];
    expect(brands).toHaveLength(1);
    expect(brands[0].website).toBe("https://coffeeboom.kz");
    expect(brands[0].aliases).toEqual(expect.arrayContaining(["Кофе Бум", "CB"]));
  });

  it("#4 the dashboard the redirect targets is populated, not empty", async () => {
    const brands = (await (await api("/api/brands")).json()) as { id: string }[];
    // This is exactly what ScanProgress prefetches before navigating.
    const overview = (await (await api(`/api/brands/${brands[0].id}/overview`)).json()) as {
      snapshot: { overall: number } | null;
      scansLeft: number;
    };
    expect(overview.snapshot).not.toBeNull();
    expect(typeof overview.snapshot?.overall).toBe("number");
    // #7: the same number the session reports, with no manual refresh.
    const me = (await (await api("/api/auth/me")).json()) as { scansLeft: number };
    expect(overview.scansLeft).toBe(2);
    expect(me.scansLeft).toBe(2);
  });

  it("#10 settings save persists and survives a reload", async () => {
    const brands = (await (await api("/api/brands")).json()) as { id: string }[];
    const res = await api(`/api/brands/${brands[0].id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: "Coffee BOOM",
        website: "https://new.coffeeboom.kz",
        category: "кофейня",
        city: "Алматы",
        market: "kz",
        aliases: ["Кофе Бум", "CB", "Coffee Boom KZ"],
        competitors: [{ name: "Starbucks", aliases: [] }],
        locale: "ru",
      }),
    });
    expect(res.status).toBe(200);

    const after = (await (await api("/api/brands")).json()) as {
      website?: string;
      aliases: string[];
    }[];
    expect(after[0].website).toBe("https://new.coffeeboom.kz");
    expect(after[0].aliases).toContain("Coffee Boom KZ");
  });

  it("#11 rescan starts from the stored business", async () => {
    const brands = (await (await api("/api/brands")).json()) as {
      name: string;
      category: string;
      city?: string;
      market: string;
      website?: string;
      competitors: { name: string }[];
    }[];
    const b = brands[0];
    // Exactly the payload useStartScan sends.
    const res = await api("/api/scan", {
      method: "POST",
      body: JSON.stringify({
        brandName: b.name,
        category: b.category,
        city: b.city || undefined,
        market: b.market,
        website: b.website || undefined,
        competitors: b.competitors.map((c) => c.name),
        idempotencyKey: crypto.randomUUID(),
      }),
    });
    expect(res.status).toBe(200);
  });

  it("#7/#8 the third audit exhausts the account and the API says why", async () => {
    // Two used so far; one more reaches the limit.
    const third = await api("/api/scan", {
      method: "POST",
      body: JSON.stringify({
        brandName: "Coffee BOOM",
        category: "кофейня",
        city: "Алматы",
        market: "kz",
        idempotencyKey: crypto.randomUUID(),
      }),
    });
    expect(third.status).toBe(200);

    const me = (await (await api("/api/auth/me")).json()) as {
      scansLeft: number;
      canScan: boolean;
      limitReason: string;
    };
    expect(me.scansLeft).toBe(0);
    expect(me.canScan).toBe(false);
    expect(me.limitReason).toBe("account_limit");

    const fourth = await api("/api/scan", {
      method: "POST",
      body: JSON.stringify({
        brandName: "Coffee BOOM",
        category: "кофейня",
        city: "Алматы",
        market: "kz",
        idempotencyKey: crypto.randomUUID(),
      }),
    });
    expect(fourth.status).toBe(402);
    const body = (await fourth.json()) as { error: { code: string } };
    expect(body.error.code).toBe("QUOTA_EXCEEDED");
  });
});
