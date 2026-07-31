/**
 * Headless end-to-end smoke test: boots the server fully offline (DEMO_MODE,
 * AUTH_MODE=mock, in-memory Mongo, file-outbox mail, zero credentials) and
 * walks the funnel: mock sign-in → scan → progress → dashboard data →
 * quota exhaustion (QUOTA_EXCEEDED on the 4th scan) → book_call lead →
 * admin listing. Non-zero exit on any failure.
 */
import assert from "node:assert";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { Server } from "node:http";

function step(name: string): void {
  console.log(`✓ ${name}`);
}

async function main(): Promise<void> {
  process.env.NODE_ENV = "test";
  process.env.DEMO_MODE = "true";
  process.env.AUTH_MODE = "mock";
  process.env.MONGODB_URI = "";
  process.env.REDIS_URL = "";
  process.env.SMTP_HOST = "";
  process.env.JWT_SECRET = "smoke_secret_do_not_use";
  process.env.DEMO_SCAN_TOTAL_MS = "1200";
  process.env.SCAN_STARTS_PER_IP_PER_DAY = "10"; // quota test needs 4 starts

  const { connectDb, disconnectDb } = await import("./db/connect.js");
  const { createApp } = await import("./app.js");
  const { initQueue, registerHandler } = await import("./queue/index.js");
  const { runScan } = await import("./services/scanRunner.js");
  const { OUTBOX_DIR } = await import("./mail/mailer.js");
  const { User } = await import("./models/User.js");

  await connectDb();
  registerHandler("runScan", ({ scanId }) => runScan(scanId));
  await initQueue();

  const app = createApp();
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const address = server.address();
  if (address === null || typeof address === "string") throw new Error("no server port");
  const base = `http://127.0.0.1:${address.port}`;
  step(`server booted at ${base} (in-memory Mongo, demo mode, mock auth)`);

  const post = async (
    url: string,
    body: unknown,
    cookie?: string,
  ): Promise<{ status: number; json: Record<string, unknown>; setCookie: string | null }> => {
    const res = await fetch(`${base}${url}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) },
      body: JSON.stringify(body),
    });
    return {
      status: res.status,
      json: (await res.json()) as Record<string, unknown>,
      setCookie: res.headers.get("set-cookie"),
    };
  };
  const get = async (url: string, cookie?: string): Promise<{ status: number; json: unknown }> => {
    const res = await fetch(`${base}${url}`, {
      headers: cookie ? { Cookie: cookie } : {},
    });
    return { status: res.status, json: await res.json() };
  };

  // 1. §5.2: scanning requires an account — anonymous scan is rejected.
  const email = `smoke-${crypto.randomBytes(3).toString("hex")}@test.dev`;
  const business = {
    brandName: "Coffee Boom",
    category: "кофейня",
    city: "Алматы",
    market: "kz",
    competitors: ["Nurly Coffee", "Vega Roasters"],
  };
  const anon = await post("/api/scan", business);
  assert.equal(anon.status, 401, "anonymous scan must be rejected");
  step("anonymous scan rejected (401)");

  // 2. Mock sign-in → session cookie
  const session = await post("/api/auth/session", { email });
  assert.equal(session.status, 200, `session failed: ${JSON.stringify(session.json)}`);
  assert.ok(session.setCookie, "session cookie not set");
  assert.equal(session.json.scansLeft, 3, "fresh account must have 3 scans left");
  const cookie = (session.setCookie as string).split(";")[0];
  step(`mock session created for ${email} (scansLeft=3)`);

  // 3. Authed scan with idempotency key
  const idempotencyKey = crypto.randomUUID();
  const scanRes = await post("/api/scan", { ...business, idempotencyKey }, cookie);
  assert.equal(scanRes.status, 200, `scan create failed: ${JSON.stringify(scanRes.json)}`);
  const scanId = scanRes.json.scanId as string;
  assert.ok(scanId, "scanId missing");
  const replay = await post("/api/scan", { ...business, idempotencyKey }, cookie);
  assert.equal(replay.json.scanId, scanId, "idempotent replay must return the same scanId");
  step(`scan created: ${scanId} (idempotent replay returns same id)`);

  // 4. Poll progress to completion (authed)
  const deadline = Date.now() + 60_000;
  let status = "";
  let lastProgress = { done: 0, total: 0 };
  while (Date.now() < deadline) {
    const progress = await get(`/api/scan/${scanId}/progress`, cookie);
    const p = progress.json as { status: string; done: number; total: number };
    status = p.status;
    lastProgress = p;
    if (status === "done" || status === "partial" || status === "failed") break;
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  assert.ok(
    status === "done" || status === "partial",
    `scan did not finish (status=${status}, progress=${JSON.stringify(lastProgress)})`,
  );
  // §2.1: free scan = core×coreEngines + tail = 8×3 + 17 = 41 calls
  assert.equal(lastProgress.total, 41, `free scan must plan 41 calls, got ${lastProgress.total}`);
  step(`scan finished: ${status} (41-call free plan confirmed)`);

  // 5. Report email links to /login
  const outboxFiles = fs
    .readdirSync(OUTBOX_DIR)
    .filter((f) => f.includes(email.split("@")[0]))
    .map((f) => path.join(OUTBOX_DIR, f));
  assert.ok(outboxFiles.length > 0, "report email file not found in outbox");
  assert.ok(fs.readFileSync(outboxFiles[0], "utf8").includes("/login"), "email must link to /login");
  step("report email written (links to /login)");

  // 6. Dashboard data
  const brands = await get("/api/brands", cookie);
  const brandList = brands.json as { id: string; name: string }[];
  assert.ok(brandList.length >= 1, "no brands for user");
  const brandId = brandList[0].id;
  const overview = await get(`/api/brands/${brandId}/overview`, cookie);
  const ov = overview.json as {
    snapshot: {
      overall: number;
      subscores: Record<string, number>;
      shareOfVoice: unknown[];
      topSources: unknown[];
      perEngine: { engine: string }[];
    } | null;
    scan: { engines: string[] };
    scansLeft: number | null;
  };
  assert.equal(overview.status, 200);
  assert.ok(ov.snapshot, "overview snapshot missing");
  assert.ok(typeof ov.snapshot.overall === "number", "score structure wrong");
  assert.ok(ov.snapshot.shareOfVoice.length > 0, "share of voice empty");
  assert.ok(ov.snapshot.topSources.length > 0, "top sources empty");
  // §0 rule 2: only engines actually queried may appear in results.
  const queried = new Set(ov.scan.engines);
  for (const e of ov.snapshot.perEngine) {
    assert.ok(queried.has(e.engine), `engine ${e.engine} appears but was not queried`);
  }
  assert.equal(ov.scansLeft, 2, `scansLeft must be 2 after one scan, got ${ov.scansLeft}`);
  step(
    `dashboard ok: overall=${ov.snapshot.overall}, engines=[${ov.scan.engines.join(",")}], scansLeft=2`,
  );

  // 7. §6: quota — scans 2 and 3 pass, the 4th returns QUOTA_EXCEEDED (402).
  for (let n = 2; n <= 3; n++) {
    const extra = await post("/api/scan", { ...business, idempotencyKey: crypto.randomUUID() }, cookie);
    assert.equal(extra.status, 200, `scan ${n} should be allowed`);
  }
  const fourth = await post(
    "/api/scan",
    { ...business, idempotencyKey: crypto.randomUUID() },
    cookie,
  );
  assert.equal(fourth.status, 402, `4th scan must be 402, got ${fourth.status}`);
  assert.equal(
    (fourth.json.error as { code?: string }).code,
    "QUOTA_EXCEEDED",
    "4th scan must return QUOTA_EXCEEDED",
  );
  step("quota enforced: 3 scans allowed, 4th returns QUOTA_EXCEEDED");

  // 8. Book-call lead + admin listing
  const lead = await post(
    "/api/leads",
    {
      name: "Smoke Test",
      phone: "+77001234567",
      message: "Хочу разбор отчёта",
      brandName: "Coffee Boom",
      source: "dashboard",
    },
    cookie,
  );
  assert.equal(lead.status, 200, `lead failed: ${JSON.stringify(lead.json)}`);

  const adminEmail = "smoke-admin@test.dev";
  await User.create({ email: adminEmail, role: "admin", locale: "ru", emailVerified: true });
  const adminLogin = await post("/api/auth/session", { email: adminEmail });
  assert.equal(adminLogin.status, 200, "admin session failed");
  assert.equal(adminLogin.json.scansLeft, null, "admin must have unlimited scans (null)");
  const adminCookie = (adminLogin.setCookie as string).split(";")[0];
  const adminLeads = await get("/api/admin/leads?type=book_call", adminCookie);
  assert.ok(
    (adminLeads.json as { phone?: string }[]).some((l) => l.phone === "+77001234567"),
    "book_call lead not visible to admin",
  );
  step("book_call lead created and visible to admin (admin scansLeft=null)");

  // Scans 2-3 from the quota check may still be running inline; let them
  // drain before tearing the DB down so shutdown is clean.
  const { Scan } = await import("./models/Scan.js");
  for (let i = 0; i < 100; i++) {
    const active = await Scan.countDocuments({ status: { $in: ["queued", "running"] } });
    if (active === 0) break;
    await new Promise((r) => setTimeout(r, 200));
  }

  server.close();
  await disconnectDb();
  console.log("\nSMOKE PASS: authed funnel, 41-call plan, quotas, leads, admin (offline)\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("\nSMOKE FAIL:", err);
  process.exit(1);
});
