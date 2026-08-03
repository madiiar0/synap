import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import i18n from "../../lib/i18n";
import FinalCta from "./FinalCta";

vi.mock("../../components/StartCta", () => ({
  default: ({ label }: { label: string }) => <button type="button">{label}</button>,
}));

vi.mock("../../components/BookCallButton", () => ({
  default: ({ label }: { label?: string }) => <button type="button">{label ?? "Book a call"}</button>,
}));

describe("FinalCta", () => {
  it("uses the outer card as the clipping frame while keeping both CTAs accessible", async () => {
    await i18n.changeLanguage("en");
    const { getByRole, getByTestId } = render(<FinalCta />);

    expect(getByTestId("final-cta-card").className).toContain("overflow-hidden");
    expect(getByTestId("final-cta-mobile-preview").className).toContain("w-[calc(100%+9rem)]");
    expect(getByTestId("final-cta-mobile-preview").className).toContain("translate-x-2");
    expect(getByRole("button", { name: "Start the free scan" })).toBeTruthy();
    expect(getByRole("button", { name: "Book a call" })).toBeTruthy();
  });
});
