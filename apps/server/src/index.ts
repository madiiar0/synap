import { createApp } from "./app.js";
import { authMode, env } from "./config/env.js";
import { connectDb, isMemoryDb } from "./db/connect.js";
import { logger } from "./lib/logger.js";
import { sendBudgetPausedEmail } from "./mail/emails.js";
import { initQueue, registerHandler, startStuckScanSweeper } from "./queue/index.js";
import { findStuckScans, runScan } from "./services/scanRunner.js";
import { setBudgetEmailSender } from "./services/usage.js";

async function main(): Promise<void> {
  await connectDb();

  // §1.1: demo mode must never be a silent surprise.
  if (env.DEMO_MODE) {
    logger.warn(
      "DEMO MODE: scans return fixtures. No provider calls, no cost. Set DEMO_MODE=false in .env for real scans.",
    );
  } else {
    logger.info("DEMO MODE off: scans make real provider calls and cost money.");
  }

  // §0.2: state the active auth mode on every boot, so mock sign-in is never
  // a silent surprise.
  if (authMode === "mock") {
    logger.warn(
      "AUTH MODE: mock — sign-in accepts any email with no password. Development only; set AUTH_MODE=firebase with credentials for real accounts (see FIREBASE_SETUP.md).",
    );
  } else {
    logger.info("AUTH MODE: firebase — ID tokens are verified by firebase-admin.");
  }
  registerHandler("runScan", ({ scanId }) => runScan(scanId));
  await initQueue();
  setBudgetEmailSender(sendBudgetPausedEmail);
  startStuckScanSweeper(findStuckScans);

  // §7: the owner's account is admin + unlimited from the first sign-in.
  const { User } = await import("./models/User.js");
  await User.updateOne(
    { email: env.ADMIN_EMAIL.toLowerCase() },
    {
      $set: { role: "admin", unlimitedScans: true },
      $setOnInsert: { email: env.ADMIN_EMAIL.toLowerCase(), locale: "ru", emailVerified: true },
    },
    { upsert: true },
  );
  logger.info({ admin: env.ADMIN_EMAIL }, "admin account ensured (role + unlimited scans)");

  // The in-memory DB starts empty every boot — auto-seed it so `pnpm dev`
  // is demoable offline (admin creds are printed below).
  if (isMemoryDb() && env.DEMO_MODE) {
    const { seedDemoData } = await import("./services/seedData.js");
    const seeded = await seedDemoData();
    logger.info(
      { admin: seeded.adminEmail, demo: seeded.demoEmail, overall: seeded.overall },
      "in-memory DB auto-seeded with demo data (mock auth: sign in with the email)",
    );
  }

  const app = createApp();
  app.listen(env.PORT, () => {
    logger.info(
      { port: env.PORT, demo: env.DEMO_MODE, client: env.CLIENT_URL },
      "SynapAI server listening",
    );
  });
}

main().catch((err) => {
  logger.error({ err }, "fatal startup error");
  process.exit(1);
});
