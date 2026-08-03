import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import en from "@synapai/shared/i18n/en.json";
import ru from "@synapai/shared/i18n/ru.json";
import i18n from "../../lib/i18n";
import StatQuote from "./StatQuote";

vi.mock("../../components/StartCta", () => ({
  default: ({ label }: { label: string }) => <button type="button">{label}</button>,
}));

vi.mock("../../components/BookCallButton", () => ({
  default: () => <button type="button">Book a call</button>,
}));

describe("StatQuote", () => {
  it("renders the concise English Gartner text with a non-clickable source", async () => {
    await i18n.changeLanguage("en");
    const { container, getByText, queryByText } = render(<StatQuote />);
    const source = getByText(en.landing.stat.sourceLine);

    expect(
      getByText(
        "By 2028, brands’ organic search traffic will decrease by 50% or more as consumers embrace AI-powered search.",
      ),
    ).toBeTruthy();
    expect(source.tagName).toBe("P");
    expect(source.closest("a")).toBeNull();
    expect(container.querySelector("blockquote")).toBeTruthy();
    expect(
      queryByText(
        "Gartner predicted brands' organic search traffic would decrease by 50% or more by 2028 as consumers adopt generative AI search",
      ),
    ).toBeNull();
  });

  it("renders the concise Russian Gartner text with a non-clickable source", async () => {
    await i18n.changeLanguage("ru");
    const { getByText } = render(<StatQuote />);
    const source = getByText(ru.landing.stat.sourceLine);

    expect(getByText(ru.landing.stat.quote)).toBeTruthy();
    expect(source.tagName).toBe("P");
    expect(source.closest("a")).toBeNull();
  });
});
