process.env.DEMO_MODE = "true";
process.env.MONGODB_URI = "";
process.env.AUTH_MODE = "mock";
process.env.NODE_ENV = "test";
process.env.ADMIN_EMAIL = "owner-admin@test.dev";
process.env.ADMIN_PASSWORD = "correct-horse-battery-staple";

import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const { connectDb, disconnectDb } = await import("../src/db/connect.js");
const { createApp } = await import("../src/app.js");
const { User } = await import("../src/models/User.js");

let server: Server;
let base: string;

async function adminSession(email: string, password: string): Promise<Response> {
  return fetch(`${base}/api/auth/admin-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

describe("shared ADMIN_PASSWORD login", () => {
  beforeAll(async () => {
    await connectDb();
    server = createApp().listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    server.close();
    await disconnectDb();
  });

  it("rejects an incorrect password without exposing configuration", async () => {
    const response = await adminSession("anyone@example.com", "not-the-password");
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: { code: "ADMIN_CREDENTIALS_INVALID", message: "Invalid email or password" },
    });
  });

  it("never exposes the shared password through public configuration", async () => {
    const response = await fetch(`${base}/api/config`);
    const body = (await response.json()) as Record<string, unknown>;
    expect(response.status).toBe(200);
    expect(body).not.toHaveProperty("adminPassword");
    expect(JSON.stringify(body)).not.toContain("correct-horse-battery-staple");
  });

  it("accepts any valid email but opens only the canonical unlimited admin account", async () => {
    const response = await adminSession(
      "team-member@example.com",
      "correct-horse-battery-staple",
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("synapai_session=");
    expect(await response.json()).toMatchObject({
      email: "owner-admin@test.dev",
      role: "admin",
      emailVerified: true,
      scansLeft: null,
    });

    expect(await User.findOne({ email: "team-member@example.com" })).toBeNull();
    expect(await User.findOne({ email: "owner-admin@test.dev" })).toMatchObject({
      role: "admin",
      unlimitedScans: true,
      emailVerified: true,
    });
  });
});
