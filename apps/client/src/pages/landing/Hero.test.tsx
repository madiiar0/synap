import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AI_PLATFORMS } from "@synapai/shared";
import ru from "@synapai/shared/i18n/ru.json";
import i18n from "../../lib/i18n";
import Hero, { CyclingPlatform } from "./Hero";

vi.mock("../../components/StartCta", () => ({
  default: ({ label }: { label: string }) => <a href="/login">{label}</a>,
}));

vi.mock("../../components/BookCallButton", () => ({
  default: () => <button type="button">Book a call</button>,
}));

function visibleName(el: HTMLElement): string {
  const active = el.querySelector(".hero-swap-in");
  return active?.textContent ?? "";
}

describe("CyclingPlatform (hero §3)", () => {
  const scannablePlatforms = AI_PLATFORMS.filter((platform) => platform.scannable);
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
      scannablePlatforms.length,
    );
  });

  it("cycles through scannable model families every 3.5s", () => {
    const { getByTestId } = render(<CyclingPlatform />);
    const el = getByTestId("cycling-engine");
    expect(visibleName(el)).toContain(scannablePlatforms[0].name);

    for (let i = 1; i < scannablePlatforms.length; i++) {
      act(() => vi.advanceTimersByTime(3500));
      expect(visibleName(el)).toContain(scannablePlatforms[i].name);
    }
    act(() => vi.advanceTimersByTime(3500));
    expect(visibleName(el)).toContain(scannablePlatforms[0].name);
  });

  it("uses the service-led English landing copy", async () => {
    await i18n.changeLanguage("en");
    const { getByText } = render(<Hero />);
    expect(getByText("Be the answer in")).toBeTruthy();
    expect(
      getByText(
        "See how your business appears in AI answers. Get a free visibility audit, then our team can help improve your visibility in Kazakhstan.",
      ),
    ).toBeTruthy();
    expect(getByText("Check for free")).toBeTruthy();
  });

  it("uses the service-led Russian landing copy", async () => {
    await i18n.changeLanguage("ru");
    const { getByText } = render(<Hero />);
    expect(getByText(ru.landing.heroLine1)).toBeTruthy();
    expect(getByText(ru.landing.heroSub)).toBeTruthy();
    expect(getByText(ru.landing.ctaCheckFree)).toBeTruthy();
  });
});
