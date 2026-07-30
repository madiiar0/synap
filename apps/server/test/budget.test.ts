import { describe, expect, it } from "vitest";
import { isBudgetExceeded } from "../src/services/usage.js";

describe("isBudgetExceeded (budget guard decision)", () => {
  it("is fine under the cap", () => {
    expect(isBudgetExceeded(5, 10, false)).toBe(false);
    expect(isBudgetExceeded(9.99, 10, false)).toBe(false);
  });

  it("trips exactly at the cap (hard stop)", () => {
    expect(isBudgetExceeded(10, 10, false)).toBe(true);
    expect(isBudgetExceeded(11, 10, false)).toBe(true);
  });

  it("admin resume overrides for the day", () => {
    expect(isBudgetExceeded(15, 10, true)).toBe(false);
  });

  it("budget 0 means unlimited (dev convenience)", () => {
    expect(isBudgetExceeded(100, 0, false)).toBe(false);
  });
});
