import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import i18n from "../../lib/i18n";
import FaqSection from "./FaqSection";

describe("FaqSection (§12.8 accordion)", () => {
  it("renders all six questions and toggles answers", () => {
    const { getByText, queryByText } = render(<FaqSection />);
    const q1 = i18n.t("landing.faq.q1");
    const a1 = i18n.t("landing.faq.a1");

    for (let n = 1; n <= 6; n++) {
      expect(getByText(i18n.t(`landing.faq.q${n}`))).toBeTruthy();
    }

    expect(queryByText(a1)).toBeNull();
    fireEvent.click(getByText(q1));
    expect(queryByText(a1)).toBeTruthy();
    fireEvent.click(getByText(q1));
    expect(queryByText(a1)).toBeNull();
  });

  it("marks the open item with aria-expanded", () => {
    const { getAllByRole } = render(<FaqSection />);
    const buttons = getAllByRole("button");
    expect(buttons[0].getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(buttons[0]);
    expect(buttons[0].getAttribute("aria-expanded")).toBe("true");
  });
});
