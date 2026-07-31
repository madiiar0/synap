/**
 * Seed: admin user (creds printed), demo user, demo business «Aroma Coffee» with
 * one completed FULL fixture scan + one older snapshot so trends render.
 *
 * NOTE: with no MONGODB_URI this seeds a throwaway in-memory DB. For a
 * persistent seed, point MONGODB_URI at a real MongoDB. When the dev server
 * itself runs on the in-memory fallback, it auto-seeds on startup instead.
 */
async function main(): Promise<void> {
  process.env.DEMO_MODE = "true";
  process.env.DEMO_SCAN_TOTAL_MS = "0";

  const { connectDb, disconnectDb, isMemoryDb } = await import("./db/connect.js");
  const { seedDemoData } = await import("./services/seedData.js");

  await connectDb();
  if (isMemoryDb()) {
    console.warn(
      "WARNING: no reachable MONGODB_URI — seeded an in-memory DB that disappears when this process exits.\n" +
        "The dev server auto-seeds its own in-memory DB on startup, so `pnpm dev` is already demoable.",
    );
  }
  console.log("Running FULL fixture scan (100 prompts × 4 engines)…");
  const result = await seedDemoData();

  console.log("\n=== SynapAI seed complete ===");
  console.log(`Admin user:      ${result.adminEmail} (mock mode: sign in with this email)`);
  console.log(`Demo user:       ${result.demoEmail}`);
  console.log(`Demo business:   ${result.brandName}, latest Visibility Score: ${result.overall ?? "n/a"}`);
  console.log("With Firebase auth, grant admin via Mongo (see MANUAL_SETUP.md).\n");

  await disconnectDb();
}

main().catch((err) => {
  console.error("seed failed:", err);
  process.exit(1);
});
