import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CyclingEngine } from "./Hero";

describe("CyclingEngine (hero §12.1)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("has a fixed line height so cycling causes no layout shift", () => {
    const { getByTestId } = render(<CyclingEngine />);
    expect(getByTestId("cycling-engine").className).toContain("h-[1.15em]");
  });

  it("cycles ChatGPT → Claude → Gemini → Perplexity every 2.2s", () => {
    const { getByTestId } = render(<CyclingEngine />);
    const el = getByTestId("cycling-engine");
    expect(el.textContent).toContain("ChatGPT");

    act(() => vi.advanceTimersByTime(2200));
    expect(el.textContent).toContain("Claude");

    act(() => vi.advanceTimersByTime(2200));
    expect(el.textContent).toContain("Gemini");

    act(() => vi.advanceTimersByTime(2200));
    expect(el.textContent).toContain("Perplexity");

    act(() => vi.advanceTimersByTime(2200));
    expect(el.textContent).toContain("ChatGPT");
  });
});
