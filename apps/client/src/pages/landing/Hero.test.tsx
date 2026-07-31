import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AI_PLATFORMS } from "@synapai/shared";
import { CyclingPlatform } from "./Hero";

function visibleName(el: HTMLElement): string {
  const active = el.querySelector(".hero-swap-in");
  return active?.textContent ?? "";
}

describe("CyclingPlatform (hero §3)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("is a fixed-height full-width line with every platform absolutely stacked", () => {
    const { getByTestId } = render(<CyclingPlatform />);
    const el = getByTestId("cycling-engine");
    expect(el.className).toContain("h-[1.2em]");
    expect(el.className).toContain("w-full");
    // every platform is stacked in the same centered row: no layout shift
    expect(el.querySelectorAll("span[class*='absolute inset-0']")).toHaveLength(
      AI_PLATFORMS.length,
    );
  });

  it("cycles through ALL registry platforms (incl. display-only) every 3.5s", () => {
    const { getByTestId } = render(<CyclingPlatform />);
    const el = getByTestId("cycling-engine");
    expect(visibleName(el)).toContain(AI_PLATFORMS[0].name);

    for (let i = 1; i < AI_PLATFORMS.length; i++) {
      act(() => vi.advanceTimersByTime(3500));
      expect(visibleName(el)).toContain(AI_PLATFORMS[i].name);
    }
    act(() => vi.advanceTimersByTime(3500));
    expect(visibleName(el)).toContain(AI_PLATFORMS[0].name);
  });
});
