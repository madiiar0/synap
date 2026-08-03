import { describe, expect, it } from "vitest";
import { classifyPublicReferrer } from "./publicAnalytics";

describe("privacy-safe public referrer classification", () => {
  const origin = "https://synap.example";

  it.each([
    ["", "direct"],
    ["https://synap.example/guides", "internal"],
    ["https://www.google.com/search?q=synap", "search"],
    ["https://chatgpt.com/c/example", "chatgpt"],
    ["https://www.perplexity.ai/search/example", "perplexity"],
    ["https://claude.ai/new", "claude"],
    ["https://copilot.microsoft.com/", "copilot"],
    ["https://example.org/article", "other"],
  ] as const)("maps %s to %s without sending the URL", (referrer, expected) => {
    expect(classifyPublicReferrer(referrer, origin)).toBe(expected);
  });
});
