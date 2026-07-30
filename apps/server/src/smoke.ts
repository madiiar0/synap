/**
 * Headless end-to-end smoke test (§13): boots the server fully offline
 * (DEMO_MODE + in-memory Mongo + file-outbox mail) and walks the funnel:
 * scan → progress → teaser → unlock → magic-link email → auth → dashboard
 * data → book_call lead → admin listing. Non-zero exit on any failure.
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
  process.env.MONGODB_URI = "";
  process.env.REDIS_URL = "";
  process.env.SMTP_HOST = "";
  process.env.JWT_SECRET = "smoke_secret_do_not_use";
  process.env.DEMO_SCAN_TOTAL_MS = "1200";

  const { connectDb, disconnectDb } = await import("./db/connect.js");
  const { createApp } = await import("./app.js");
  const { initQueue, registerHandler } = await import("./queue/index.js");
  const { runScan } = await import("./services/scanRunner.js");
  const { OUTBOX_DIR } = await import("./mail/mailer.js");
  const { User } = await import("./models/User.js");
  const bcrypt = (await import("bcryptjs")).default;

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
  step(`server booted at ${base} (in-memory Mongo, demo mode)`);

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

  // 1. Public scan
  const scanRes = await post("/api/public/scan", {
    brandName: "Astra Dental",
    category: "стоматология",
    city: "Алматы",
    market: "kz",
    competitors: ["Дента Люкс", "SmileCity"],
  });
  assert.equal(scanRes.status, 200, `scan create failed: ${JSON.stringify(scanRes.json)}`);
  const scanId = scanRes.json.scanId as string;
  assert.ok(scanId, "scanId missing");
  step(`public scan created: ${scanId}`);

  // 2. Poll progress to completion
  const deadline = Date.now() + 60_000;
  let status = "";
  let lastProgress = { done: 0, total: 0 };
  while (Date.now() < deadline) {
    const progress = await get(`/api/public/scan/${scanId}/progress`);
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
  assert.ok(lastProgress.done > 0 && lastProgress.total > 0, "progress counters empty");
  step(`scan finished: ${status} (${lastProgress.done}/${lastProgress.total})`);

  // 3. Teaser
  const teaser = await get(`/api/public/scan/${scanId}/teaser`);
  const teaserJson = teaser.json as {
    overall: number;
    engines: unknown[];
    competitorsDetected: number;
    demo: boolean;
  };
  assert.equal(teaser.status, 200);
  assert.ok(typeof teaserJson.overall === "number", "teaser overall missing");
  assert.ok(teaserJson.engines.length >= 1, "teaser engine bars missing");
  assert.equal(teaserJson.demo, true, "demo flag must be true in demo mode");
  step(`teaser ok: overall=${teaserJson.overall}, engines=${teaserJson.engines.length}`);

  // 4. Unlock with email → magic-link email file
  const email = `smoke-${crypto.randomBytes(3).toString("hex")}@test.dev`;
  const unlock = await post(`/api/public/scan/${scanId}/unlock`, { email });
  assert.equal(unlock.status, 200, `unlock failed: ${JSON.stringify(unlock.json)}`);
  const outboxFiles = fs
    .readdirSync(OUTBOX_DIR)
    .filter((f) => f.includes(email.split("@")[0]))
    .map((f) => path.join(OUTBOX_DIR, f));
  assert.ok(outboxFiles.length > 0, "magic-link email file not found in outbox");
  const emailHtml = fs.readFileSync(outboxFiles[0], "utf8");
  const tokenMatch = emailHtml.match(/auth\/verify\?token=([A-Za-z0-9._-]+)/);
  assert.ok(tokenMatch, "magic link token not found in email");
  step(`unlock ok: magic-link email written (${path.basename(outboxFiles[0])})`);

  // 5. Verify magic link → session cookie
  const verify = await post("/api/auth/verify", { token: tokenMatch[1] });
  assert.equal(verify.status, 200, `verify failed: ${JSON.stringify(verify.json)}`);
  assert.ok(verify.setCookie, "session cookie not set");
  const cookie = (verify.setCookie as string).split(";")[0];
  step(`magic link verified, session for ${verify.json.email as string}`);

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
    } | null;
    demo: boolean;
  };
  assert.equal(overview.status, 200);
  assert.ok(ov.snapshot, "overview snapshot missing");
  assert.ok(typeof ov.snapshot.overall === "number", "score structure wrong");
  assert.ok(
    ["branded", "category", "comparison"].every((k) => typeof ov.snapshot?.subscores[k] === "number"),
    "subscores incomplete",
  );
  assert.ok(ov.snapshot.shareOfVoice.length > 0, "share of voice empty");
  assert.ok(ov.snapshot.topSources.length > 0, "top sources empty");
  step(
    `dashboard ok: overall=${ov.snapshot.overall}, SoV=${ov.snapshot.shareOfVoice.length}, sources=${ov.snapshot.topSources.length}`,
  );

  // 7. Book-call lead
  const lead = await post("/api/leads", {
    name: "Smoke Test",
    phone: "+77001234567",
    message: "Хочу разбор отчёта",
    brandName: "Astra Dental",
    scanId,
    source: "report",
  });
  assert.equal(lead.status, 200, `lead failed: ${JSON.stringify(lead.json)}`);
  step("book_call lead created");

  // 8. Admin can list the lead
  const adminEmail = "smoke-admin@test.dev";
  const adminPassword = "smoke-admin-pass-1";
  await User.create({
    email: adminEmail,
    role: "admin",
    locale: "ru",
    passwordHash: await bcrypt.hash(adminPassword, 4),
  });
  const login = await post("/api/auth/login", { email: adminEmail, password: adminPassword });
  assert.equal(login.status, 200, `admin login failed: ${JSON.stringify(login.json)}`);
  const adminCookie = (login.setCookie as string).split(";")[0];
  const adminLeads = await get("/api/admin/leads?type=book_call", adminCookie);
  const leadRows = adminLeads.json as { phone?: string }[];
  assert.equal(adminLeads.status, 200);
  assert.ok(
    leadRows.some((l) => l.phone === "+77001234567"),
    "book_call lead not visible to admin",
  );
  step("admin sees the book_call lead");

  server.close();
  await disconnectDb();
  console.log("\nSMOKE PASS — full funnel green (offline demo mode)\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("\nSMOKE FAIL:", err);
  process.exit(1);
});
