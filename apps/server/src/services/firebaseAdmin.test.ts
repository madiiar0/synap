import { describe, expect, it } from "vitest";
import { parseFirebaseServiceAccount } from "./firebaseAdmin.js";

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
