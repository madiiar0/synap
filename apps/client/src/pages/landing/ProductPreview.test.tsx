import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
    expect(preview.getByText("Sample data")).toBeTruthy();
    expect(preview.queryByText("Northstar Coffee")).toBeNull();
    expect(preview.queryByText("Juniper Roasters")).toBeNull();
    expect(preview.queryByText("Cedar Cafe")).toBeNull();
  });
});
