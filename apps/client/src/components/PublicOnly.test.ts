import { describe, expect, it } from "vitest";
import { safeNext } from "./PublicOnly";

/**
 * §1: the `next` parameter decides where an authenticated visitor is sent from
 * a public-only route, so it must never be able to point off-site.
 */
describe("safeNext (open-redirect protection)", () => {
  it("keeps a same-origin absolute path", () => {
    expect(safeNext("/app/answers")).toBe("/app/answers");
    expect(safeNext("/app?tab=1")).toBe("/app?tab=1");
  });

  it("falls back to the dashboard when absent", () => {
    expect(safeNext(null)).toBe("/app");
    expect(safeNext("")).toBe("/app");
  });

  it("rejects absolute and protocol-relative URLs", () => {
    for (const evil of [
      "https://evil.example.com/steal",
      "http://evil.example.com",
      "//evil.example.com",
      "//evil.example.com/path",
    ]) {
      expect(safeNext(evil)).toBe("/app");
    }
  });

  it("rejects backslash and scheme tricks browsers may normalise to a host", () => {
    for (const evil of ["/\\evil.example.com", "javascript:alert(1)", "data:text/html,x"]) {
      expect(safeNext(evil)).toBe("/app");
    }
  });
});
