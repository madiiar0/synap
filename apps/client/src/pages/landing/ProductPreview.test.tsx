import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ru from "@synapai/shared/i18n/ru.json";
import i18n from "../../lib/i18n";
import MockAnswer from "./MockAnswer";
import ProductPreview from "./ProductPreview";
import { LANDING_COFFEE_SHOPS } from "./landingCoffeeShops";

describe("ProductPreview sample businesses", () => {
  it("uses the mock answer's business names and matching existing logos", async () => {
    await i18n.changeLanguage("en");
    const mockAnswer = render(<MockAnswer />);
    const mockLogos = new Map(
      LANDING_COFFEE_SHOPS.map(({ name }) => [
        name,
        mockAnswer.getByAltText(name).getAttribute("src"),
      ]),
    );
    mockAnswer.unmount();

    const preview = render(<ProductPreview />);
    for (const { name, logo } of LANDING_COFFEE_SHOPS) {
      expect(logo).toBeTruthy();
      expect(preview.getByText(name)).toBeTruthy();
      expect(preview.getByAltText(name).getAttribute("src")).toBe(mockLogos.get(name));
    }
    expect(preview.getByText("Example ranking")).toBeTruthy();
    expect(preview.queryByText("Sample data")).toBeNull();
    expect(preview.container.querySelector("[class*='uppercase'][class*='tracking-wide']")).toBeNull();
    expect(preview.queryByText("Northstar Coffee")).toBeNull();
    expect(preview.queryByText("Juniper Roasters")).toBeNull();
    expect(preview.queryByText("Cedar Cafe")).toBeNull();
  });

  it("renders the localized example label without a sample-data badge", async () => {
    await i18n.changeLanguage("ru");
    const preview = render(<ProductPreview />);

    expect(preview.getByText(ru.landing.preview.title)).toBeTruthy();
    expect("sampleData" in ru.common).toBe(false);
  });
});
