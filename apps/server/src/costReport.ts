/**
 * §8: `pnpm cost:report` — the last 30 days of scan spend: scans run,
 * average cost per scan, spend per engine, total spend.
 */
async function main(): Promise<void> {
  const { connectDb, disconnectDb } = await import("./db/connect.js");
  const { Scan } = await import("./models/Scan.js");

  await connectDb();
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const scans = await Scan.find({ createdAt: { $gte: monthAgo } });

  const total = scans.reduce((s, x) => s + x.totals.costUsd, 0);
  const calls = scans.reduce((s, x) => s + x.totals.calls, 0);
  const searchFees = scans.reduce((s, x) => s + x.totals.searchFees, 0);
  const tokens = scans.reduce((s, x) => s + x.totals.tokensIn + x.totals.tokensOut, 0);

  const perEngine = new Map<string, { calls: number; costUsd: number }>();
  for (const scan of scans) {
    for (const e of scan.engineCosts) {
      const entry = perEngine.get(e.engine) ?? { calls: 0, costUsd: 0 };
      entry.calls += e.calls;
      entry.costUsd += e.costUsd;
      perEngine.set(e.engine, entry);
    }
  }

  const usd = (n: number): string => `$${n.toFixed(4)}`;
  console.log("=== SynapAI cost report (last 30 days) ===");
  console.log(`Scans run:          ${scans.length}`);
  console.log(`Provider calls:     ${calls}`);
  console.log(`Tokens (in+out):    ${tokens}`);
  console.log(`Search fees:        ${usd(searchFees)}`);
  console.log(`Total spend:        ${usd(total)}`);
  console.log(`Avg cost per scan:  ${scans.length > 0 ? usd(total / scans.length) : "n/a"}`);
  console.log("Spend per engine:");
  for (const [engine, e] of perEngine) {
    console.log(`  ${engine.padEnd(12)} ${String(e.calls).padStart(5)} calls  ${usd(e.costUsd)}`);
  }
  await disconnectDb();
}

main().catch((err) => {
  console.error("cost report failed:", err);
  process.exit(1);
});
