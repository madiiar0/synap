/**
 * `pnpm db:check` — verify MONGODB_URI end to end and explain any failure.
 * Exits 1 on failure so it can gate a deploy.
 */
import mongoose from "mongoose";
import { env } from "./config/env.js";
import { diagnoseMongoError, missingDatabaseName, redactUri } from "./db/diagnose.js";

async function main(): Promise<void> {
  if (!env.MONGODB_URI) {
    console.error("MONGODB_URI is not set in .env — the server would use an in-memory database.");
    console.error("Set it to your Atlas connection string, then run this again.");
    process.exit(1);
  }

  console.log(`Connecting to ${redactUri(env.MONGODB_URI)} ...`);
  try {
    await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
    const connection = mongoose.connection;
    const admin = connection.db?.admin();
    const info = admin ? await admin.serverStatus() : null;
    const collections = (await connection.db?.listCollections().toArray()) ?? [];

    console.log("");
    console.log("OK: connected.");
    console.log(`  server version: ${info?.version ?? "unknown"}`);
    console.log(`  database:       ${connection.name}`);
    console.log(`  collections:    ${collections.length}`);
    if (missingDatabaseName(env.MONGODB_URI)) {
      console.log("");
      console.log(
        `  WARNING: the URI has no database name, so data goes to "${connection.name}".`,
      );
      console.log("  Append the name before the query string: ...mongodb.net/synapai?appName=...");
    }
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    const diagnosis = diagnoseMongoError(err, env.MONGODB_URI);
    console.error("");
    console.error("FAILED: could not connect.");
    console.error(`  error:   ${diagnosis.name}`);
    console.error(`  code:    ${diagnosis.code}`);
    console.error(`  message: ${diagnosis.message}`);
    console.error("");
    console.error("How to fix:");
    for (const hint of diagnosis.hints) console.error(`  - ${hint}`);
    await mongoose.disconnect().catch(() => undefined);
    process.exit(1);
  }
}

void main();
