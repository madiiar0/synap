import mongoose from "mongoose";
import { env, isProd } from "../config/env.js";
import { logger } from "../lib/logger.js";

let memoryServer: { stop: () => Promise<boolean> } | null = null;

/**
 * Connect to MONGODB_URI when configured/reachable; otherwise (dev/demo only)
 * fall back to an in-memory MongoDB so the whole funnel runs with zero
 * external services. Production requires a real URI.
 */
export async function connectDb(): Promise<void> {
  if (env.MONGODB_URI) {
    try {
      await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 4000 });
      logger.info({ uri: redact(env.MONGODB_URI) }, "mongo connected");
      return;
    } catch (err) {
      if (isProd) throw err;
      logger.warn(
        { uri: redact(env.MONGODB_URI) },
        "mongo unreachable — falling back to in-memory MongoDB (dev only)",
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

function redact(uri: string): string {
  return uri.replace(/\/\/[^@/]+@/, "//***@");
}
