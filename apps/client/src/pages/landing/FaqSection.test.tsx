import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import i18n from "../../lib/i18n";
import FaqSection from "./FaqSection";

describe("FaqSection crawlable accordion", () => {
  it("renders the six buyer-focused Russian questions and answers in the initial DOM", async () => {
    await i18n.changeLanguage("ru");
    const { container, getByText } = render(<FaqSection />);
    expect(container.querySelectorAll("details")).toHaveLength(6);
    for (let number = 1; number <= 6; number += 1) {
      expect(getByText(i18n.t(`landing.faq.q${number}`))).toBeTruthy();
      expect(getByText(i18n.t(`landing.faq.a${number}`))).toBeTruthy();
    }
  });

  it("renders the six buyer-focused English questions and answers", async () => {
    await i18n.changeLanguage("en");
    const { container, getByText } = render(<FaqSection />);
    expect(container.querySelectorAll("details")).toHaveLength(6);
    for (let number = 1; number <= 6; number += 1) {
      expect(getByText(i18n.t(`landing.faq.q${number}`))).toBeTruthy();
      expect(getByText(i18n.t(`landing.faq.a${number}`))).toBeTruthy();
    }
  });

  it("uses native details and summary disclosure semantics", async () => {
    await i18n.changeLanguage("ru");
    const { container } = render(<FaqSection />);
    const details = container.querySelector("details");
    const summary = details?.querySelector("summary");
    expect(details?.open).toBe(false);
    expect(summary).toBeTruthy();
    if (summary) fireEvent.click(summary);
    expect(details?.open).toBe(true);
  });
});
