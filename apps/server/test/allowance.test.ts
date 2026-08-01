/**
 * #7: the audit allowance must be ONE value shared by the session endpoint,
 * the overview, and the server-side gate. Before this, the form read a cached
 * session (3), the dashboard read the overview (2), and the per-IP gate could
 * reject a scan the account still had budget for.
 * #9: admin bypasses both gates.
 */
process.env.DEMO_MODE = "true";
process.env.MONGODB_URI = "";
process.env.AUTH_MODE = "mock";
process.env.NODE_ENV = "test";

import { describe, expect, it } from "vitest";

const { scanAllowance } = await import("../src/services/allowance.js");
const { quotaAllows } = await import("../src/http/routes/scan.js");

type U = Parameters<typeof scanAllowance>[0];
const user = (over: Partial<Record<string, unknown>> = {}): U =>
  ({
    role: "user",
    unlimitedScans: false,
    freeScansUsed: 0,
    freeScanLimit: 3,
    ...over,
  }) as unknown as U;

describe("scanAllowance (#7 single source of truth)", () => {
  it("counts down from the account limit", () => {
    expect(scanAllowance(user()).scansLeft).toBe(3);
    expect(scanAllowance(user({ freeScansUsed: 1 })).scansLeft).toBe(2);
    expect(scanAllowance(user({ freeScansUsed: 3 })).scansLeft).toBe(0);
  });

  it("never reports a negative balance", () => {
    expect(scanAllowance(user({ freeScansUsed: 99 })).scansLeft).toBe(0);
  });

  it("blocks at the account limit with a distinguishable reason", () => {
    const spent = scanAllowance(user({ freeScansUsed: 3 }));
    expect(spent.canScan).toBe(false);
    expect(spent.reason).toBe("account_limit");
  });

  it("admin and unlimited accounts are never blocked", () => {
    for (const u of [user({ role: "admin" }), user({ unlimitedScans: true })]) {
      const a = scanAllowance(u);
      expect(a.scansLeft).toBeNull();
      expect(a.canScan).toBe(true);
      expect(a.reason).toBe("ok");
    }
    // ...even with the counter already past the limit (#9).
    const exhaustedAdmin = scanAllowance(user({ role: "admin", freeScansUsed: 99 }));
    expect(exhaustedAdmin.canScan).toBe(true);
    expect(exhaustedAdmin.scansLeft).toBeNull();
  });

  it("the server gate agrees with the number the UI shows", () => {
    // The gate must allow exactly while scansLeft > 0, with no off-by-one.
    for (let used = 0; used <= 4; used++) {
      const u = user({ freeScansUsed: used });
      const left = scanAllowance(u).scansLeft ?? 0;
      expect(quotaAllows(u as never)).toBe(left > 0);
    }
  });
});
