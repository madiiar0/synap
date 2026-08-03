import { fireEvent, render } from "@testing-library/react";
import { publicFaqItems } from "@synapai/shared";
import { describe, expect, it } from "vitest";
import FaqSection from "./FaqSection";

describe("FaqSection crawlable accordion", () => {
  it("renders six visible questions and answers in the initial DOM", () => {
    const { container, getByText } = render(<FaqSection />);
    const items = publicFaqItems("ru").slice(0, 6);
    expect(container.querySelectorAll("details")).toHaveLength(items.length);
    for (const item of items) {
      expect(getByText(item.question)).toBeTruthy();
      expect(getByText(item.answer)).toBeTruthy();
    }
  });

  it("uses native details and summary disclosure semantics", () => {
    const { container } = render(<FaqSection />);
    const details = container.querySelector("details");
    const summary = details?.querySelector("summary");
    expect(details?.open).toBe(false);
    expect(summary).toBeTruthy();
    if (summary) fireEvent.click(summary);
    expect(details?.open).toBe(true);
  });
});
