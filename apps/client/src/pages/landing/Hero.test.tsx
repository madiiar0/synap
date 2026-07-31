import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AI_PLATFORMS } from "@synapai/shared";
import { CyclingPlatform } from "./Hero";

function visibleName(el: HTMLElement): string {
  const active = el.querySelector(".hero-swap-in");
  return active?.textContent ?? "";
}

describe("CyclingPlatform (hero §4)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("has a fixed-height single-cell grid so cycling causes no layout shift", () => {
    const { getByTestId } = render(<CyclingPlatform />);
    const el = getByTestId("cycling-engine");
    expect(el.className).toContain("h-[1.15em]");
    expect(el.className).toContain("inline-grid");
    // every platform is stacked in the same cell, so the slot is max-width
    expect(el.querySelectorAll("span[class*='col-start-1']")).toHaveLength(AI_PLATFORMS.length);
  });

  it("cycles through ALL registry platforms (incl. display-only) every 3.5s", () => {
    const { getByTestId } = render(<CyclingPlatform />);
    const el = getByTestId("cycling-engine");
    expect(visibleName(el)).toContain(AI_PLATFORMS[0].name); // ChatGPT

    for (let i = 1; i < AI_PLATFORMS.length; i++) {
      act(() => vi.advanceTimersByTime(3500));
      expect(visibleName(el)).toContain(AI_PLATFORMS[i].name);
    }
    // wraps around, so Copilot (display-only) is included then back to start
    act(() => vi.advanceTimersByTime(3500));
    expect(visibleName(el)).toContain(AI_PLATFORMS[0].name);
  });
});
