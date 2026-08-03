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
        "50% of traditional search traffic will be replaced with AI by 2028",
      ),
    ).toBeTruthy();
    expect(source.tagName).toBe("P");
    expect(source.closest("a")).toBeNull();
    expect(container.querySelector("blockquote")).toBeTruthy();
    expect(
      queryByText(
        "By 2028, brands’ organic search traffic will decrease by 50% or more as consumers embrace AI-powered search.",
      ),
    ).toBeNull();
  });

  it("renders the concise Russian Gartner text with a non-clickable source", async () => {
    await i18n.changeLanguage("ru");
    const { getByText, queryByText } = render(<StatQuote />);
    const source = getByText(ru.landing.stat.sourceLine);

    expect(ru.landing.stat.quote).toBe(
      "\u041a 2028 \u0433\u043e\u0434\u0443 \u0418\u0418 \u0437\u0430\u043c\u0435\u043d\u0438\u0442 50% \u0442\u0440\u0430\u0434\u0438\u0446\u0438\u043e\u043d\u043d\u043e\u0433\u043e \u043f\u043e\u0438\u0441\u043a\u043e\u0432\u043e\u0433\u043e \u0442\u0440\u0430\u0444\u0438\u043a\u0430",
    );
    expect(getByText(ru.landing.stat.quote)).toBeTruthy();
    expect(queryByText(en.landing.stat.quote)).toBeNull();
    expect(source.tagName).toBe("P");
    expect(source.closest("a")).toBeNull();
  });
});
