import mongoose from "mongoose";
import { env, isProd } from "../config/env.js";
import { logger } from "../lib/logger.js";
import { diagnoseMongoError, missingDatabaseName, redactUri } from "./diagnose.js";

let memoryServer: { stop: () => Promise<boolean> } | null = null;

/**
 * Connect to MONGODB_URI when configured/reachable; otherwise (dev/demo only)
 * fall back to an in-memory MongoDB so the whole funnel runs with zero
 * external services. Production requires a real URI and never falls back.
 */
export async function connectDb(): Promise<void> {
  if (env.MONGODB_URI) {
    try {
      // Atlas needs time for SRV lookup plus replica-set discovery; 4s was
      // short enough to look like an outage on a normal connection.
      await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
      logger.info(
        { uri: redactUri(env.MONGODB_URI), db: mongoose.connection.name },
        "mongo connected",
      );
      if (missingDatabaseName(env.MONGODB_URI)) {
        logger.warn(
          { db: mongoose.connection.name },
          "MONGODB_URI has no database name, so the default database is in use. Append /synapai before the query string.",
        );
      }
      return;
    } catch (err) {
      // §0.1: the real driver error, at error level. Silently degrading to an
      // empty in-memory database is what made this look like a UI bug.
      const diagnosis = diagnoseMongoError(err, env.MONGODB_URI);
      logger.error(
        {
          uri: redactUri(env.MONGODB_URI),
          errName: diagnosis.name,
          errCode: diagnosis.code,
          errMessage: diagnosis.message,
          hints: diagnosis.hints,
        },
        "mongo connection FAILED. Run `pnpm db:check` for details.",
      );
      if (isProd) {
        throw new Error(
          `Refusing to start: cannot reach MONGODB_URI in production. ${diagnosis.message}`,
        );
      }
      logger.error(
        "falling back to IN-MEMORY MongoDB (development only): DATA WILL NOT PERSIST between restarts",
      );
    }
  } else if (isProd) {
    throw new Error("MONGODB_URI is required in production");
  }

  const { MongoMemoryServer } = await import("mongodb-memory-server");
  const server = await MongoMemoryServer.create();
  memoryServer = server;
  await mongoose.connect(server.getUri("synapai"));
  logger.info("connected to in-memory MongoDB (data is not persisted)");
}

/** True when the in-memory fallback (not a real MongoDB) is in use. */
export function isMemoryDb(): boolean {
  return memoryServer !== null;
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

