import { describe, expect, it } from "vitest";
import {
  classifyFirebaseAdminInitError,
  parseFirebaseServiceAccount,
} from "./firebaseAdmin.js";

const account = {
  type: "service_account",
  project_id: "synapai-test",
  client_email: "firebase-adminsdk@synapai-test.iam.gserviceaccount.com",
  private_key: "-----BEGIN PRIVATE KEY-----\nnot-a-real-key\n-----END PRIVATE KEY-----\n",
};

describe("Firebase service account parsing", () => {
  it("accepts raw JSON from a multiline deployment secret", () => {
    expect(parseFirebaseServiceAccount(JSON.stringify(account))).toMatchObject(account);
  });

  it("accepts the documented one-line base64 format", () => {
    const encoded = Buffer.from(JSON.stringify(account), "utf8").toString("base64");
    expect(parseFirebaseServiceAccount(encoded)).toMatchObject(account);
  });

  it("rejects malformed or incomplete credentials without echoing them", () => {
    expect(() => parseFirebaseServiceAccount("not-a-credential")).toThrow(
      "valid JSON or base64-encoded JSON",
    );
    expect(() => parseFirebaseServiceAccount(JSON.stringify({ project_id: "only-one-field" })))
      .toThrow("missing project_id, client_email, or private_key");
  });
});

describe("Firebase Admin initialization diagnostics", () => {
  it("distinguishes malformed, incomplete, and invalid private-key credentials", () => {
    expect(classifyFirebaseAdminInitError(new Error(
      "Firebase service account must be valid JSON or base64-encoded JSON",
    )).code).toBe("FIREBASE_SERVICE_ACCOUNT_INVALID");
    expect(classifyFirebaseAdminInitError(new Error(
      "Firebase service account is missing project_id, client_email, or private_key",
    )).code).toBe("FIREBASE_SERVICE_ACCOUNT_INCOMPLETE");
    expect(classifyFirebaseAdminInitError(new Error(
      "Failed to parse private key: DECODER routines::unsupported",
    )).code).toBe("FIREBASE_PRIVATE_KEY_INVALID");
  });

  it("never returns the provider error text to the client", () => {
    const secret = "do-not-return-this-provider-detail";
    const failure = classifyFirebaseAdminInitError(new Error(secret));
    expect(failure).toEqual({
      code: "FIREBASE_ADMIN_INIT_FAILED",
      message: "Firebase Admin failed to initialize",
    });
    expect(failure.message).not.toContain(secret);
  });
});
