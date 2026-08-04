/**
 * Regression tests for the two errors reported after iteration 6.
 *
 * Root cause (shared mechanism, two independent code paths): Stage A research
 * appends discovered competitors to `brand.competitors` up to 12, but BOTH
 * user-facing entry points validate that array against MAX_USER_COMPETITORS
 * (5). So once a scan has enriched the business:
 *   - PATCH /api/brands/:id (Settings save) rejected 12 competitors  -> 400
 *   - POST /api/scan (Rescan) resent all 12 competitor names         -> 400
 * Neither is reachable before the first scan, which is why the gates passed.
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
const { Brand } = await import("../src/models/Brand.js");
const { User } = await import("../src/models/User.js");

let server: Server;
let base: string;
let cookie: string;
let brandId: string;

/** A business enriched by research: 2 user competitors + 8 detected ones. */
async function seedEnrichedBrand(userId: unknown): Promise<string> {
  const brand = await Brand.create({
    userId,
    name: "Coffee BOOM",
    category: "кофейня",
    city: "Алматы",
    market: "kz",
    locale: "ru",
    normKey: "coffee boom|кофейня|алматы",
    website: "https://coffeeboom.kz",
    aliases: ["Coffee Boom", "Кофе Бум"],
    competitors: [
      { name: "Starbucks", aliases: [], detected: false },
      { name: "Nurly Coffee", aliases: [], detected: false },
      ...Array.from({ length: 8 }, (_, i) => ({
        name: `Detected Rival ${i + 1}`,
        aliases: [],
        detected: true,
      })),
    ],
  });
  return String(brand._id);
}

describe("brand with research-detected competitors (post iteration 6)", () => {
  beforeAll(async () => {
    await connectDb();
    server = createApp().listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    const session = await fetch(`${base}/api/auth/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "competitors@test.dev", locale: "ru" }),
    });
    cookie = (session.headers.get("set-cookie") ?? "").split(";")[0];
    const user = await User.findOne({ email: "competitors@test.dev" });
    brandId = await seedEnrichedBrand(user?._id);
  });

  afterAll(async () => {
    server.close();
    await disconnectDb();
  });

  it("exposes user and detected competitors separately", async () => {
    const res = await fetch(`${base}/api/brands`, { headers: { Cookie: cookie } });
    const [dto] = (await res.json()) as {
      competitors: { name: string }[];
      detectedCompetitors: { name: string }[];
    }[];
    // The editable list stays within the user-facing cap...
    expect(dto.competitors.length).toBeLessThanOrEqual(5);
    expect(dto.competitors.map((c) => c.name)).toEqual(["Starbucks", "Nurly Coffee"]);
    // ...while research findings remain visible, just not editable.
    expect(dto.detectedCompetitors.length).toBe(8);
  });

  it("#10 saves business settings on an enriched brand", async () => {
    const res = await fetch(`${base}/api/brands/${brandId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        name: "Coffee BOOM",
        website: "https://coffeeboom.kz",
        category: "кофейня",
        city: "Алматы",
        market: "kz",
        aliases: ["Coffee Boom", "Кофе Бум", "CB"],
        competitors: [
          { name: "Starbucks", aliases: [] },
          { name: "Nurly Coffee", aliases: [] },
        ],
        locale: "ru",
      }),
    });
    expect(res.status).toBe(200);
    const dto = (await res.json()) as { aliases: string[] };
    expect(dto.aliases).toContain("CB");

    // Detected competitors must survive a settings save.
    const after = await Brand.findById(brandId);
    expect(after?.competitors.filter((c) => c.detected).length).toBe(8);
  });

  it("#11 starts a rescan on an enriched brand", async () => {
    const res = await fetch(`${base}/api/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        brandName: "Coffee BOOM",
        category: "кофейня",
        city: "Алматы",
        market: "kz",
        website: "https://coffeeboom.kz",
        competitors: ["Starbucks", "Nurly Coffee"],
        locale: "ru",
        idempotencyKey: crypto.randomUUID(),
      }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { scanId?: string };
    expect(body.scanId).toBeTruthy();
  });
});
