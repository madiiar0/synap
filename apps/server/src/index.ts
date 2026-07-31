import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDb, isMemoryDb } from "./db/connect.js";
import { logger } from "./lib/logger.js";
import { sendBudgetPausedEmail } from "./mail/emails.js";
import { initQueue, registerHandler, startStuckScanSweeper } from "./queue/index.js";
import { findStuckScans, runScan } from "./services/scanRunner.js";
import { setBudgetEmailSender } from "./services/usage.js";

async function main(): Promise<void> {
  await connectDb();
  registerHandler("runScan", ({ scanId }) => runScan(scanId));
  await initQueue();
  setBudgetEmailSender(sendBudgetPausedEmail);
  startStuckScanSweeper(findStuckScans);

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
