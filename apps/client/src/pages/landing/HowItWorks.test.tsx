import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ru from "@synapai/shared/i18n/ru.json";
import i18n from "../../lib/i18n";
import HowItWorks from "./HowItWorks";

describe("HowItWorks buyer-facing copy", () => {
  it("explains the English audit-to-service flow", async () => {
    await i18n.changeLanguage("en");
    const { getByText } = render(<HowItWorks />);

    expect(getByText("We ask the AIs")).toBeTruthy();
    expect(
      getByText(
        "We test 25 customer-style questions across the AI model families included in your free audit.",
      ),
    ).toBeTruthy();
    expect(getByText("The full picture")).toBeTruthy();
    expect(
      getByText(
        "See your unbranded Visibility Score, branded recognition, competitors, AI answers and cited sources.",
      ),
    ).toBeTruthy();
    expect(getByText("We help improve it")).toBeTruthy();
    expect(
      getByText(
        "On a call, we review your report, create an improvement plan, and our team carries out the agreed work.",
      ),
    ).toBeTruthy();
  });

  it("explains the Russian audit-to-service flow", async () => {
    await i18n.changeLanguage("ru");
    const { getByText } = render(<HowItWorks />);

    expect(getByText(ru.landing.how.step1Title)).toBeTruthy();
    expect(getByText(ru.landing.how.step1Text)).toBeTruthy();
    expect(getByText(ru.landing.how.step2Title)).toBeTruthy();
    expect(getByText(ru.landing.how.step2Text)).toBeTruthy();
    expect(getByText(ru.landing.how.step3Title)).toBeTruthy();
    expect(getByText(ru.landing.how.step3Text)).toBeTruthy();
  });
});
