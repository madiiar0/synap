import { describe, expect, it } from "vitest";
import { classifyPublicReferrer } from "./publicAnalytics";

describe("privacy-safe public referrer classification", () => {
  const origin = "https://akrux.example";

  it.each([
    ["", "direct"],
    ["https://akrux.example/blogs", "internal"],
    ["https://www.google.com/search?q=akrux", "search"],
    ["https://chatgpt.com/c/example", "chatgpt"],
    ["https://www.perplexity.ai/search/example", "perplexity"],
    ["https://claude.ai/new", "claude"],
    ["https://copilot.microsoft.com/", "copilot"],
    ["https://example.org/article", "other"],
  ] as const)("maps %s to %s without sending the URL", (referrer, expected) => {
    expect(classifyPublicReferrer(referrer, origin)).toBe(expected);
  });
});
