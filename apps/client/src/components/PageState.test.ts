import { describe, expect, it } from "vitest";
import { resolvePageStatus } from "./PageState";

/**
 * §4: an unresolved query, an empty result and a failure must be three
 * visually distinct states, and loading must never be permanent.
 */
describe("resolvePageStatus", () => {
  const base = { isPending: false, isError: false, isEmpty: false, timedOut: false };

  it("shows content when data arrived", () => {
    expect(resolvePageStatus(base)).toBe("ready");
  });

  it("distinguishes an empty result from a pending query", () => {
    expect(resolvePageStatus({ ...base, isEmpty: true })).toBe("empty");
    expect(resolvePageStatus({ ...base, isPending: true })).toBe("loading");
  });

  it("treats a disabled query as empty, never as an endless load", () => {
    // A React Query with `enabled: false` stays isPending forever; without
    // this branch the dashboard renders a loading shell that never resolves.
    expect(resolvePageStatus({ ...base, isPending: true, disabled: true })).toBe("empty");
    expect(resolvePageStatus({ ...base, isPending: true, isEmpty: true, disabled: true })).toBe(
      "empty",
    );
  });

  it("switches a stuck load to the error state once the timeout expires", () => {
    expect(resolvePageStatus({ ...base, isPending: true, timedOut: false })).toBe("loading");
    expect(resolvePageStatus({ ...base, isPending: true, timedOut: true })).toBe("error");
  });

  it("errors win over every other state", () => {
    expect(resolvePageStatus({ ...base, isError: true })).toBe("error");
    expect(resolvePageStatus({ ...base, isError: true, isEmpty: true })).toBe("error");
    expect(resolvePageStatus({ ...base, isError: true, isPending: true })).toBe("error");
  });
});
