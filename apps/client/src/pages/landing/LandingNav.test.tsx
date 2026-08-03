import { fireEvent, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import ru from "@synapai/shared/i18n/ru.json";
import i18n from "../../lib/i18n";
import LandingNav from "./LandingNav";

vi.mock("../../lib/queries", () => ({
  useSession: () => ({ state: "signedOut", user: undefined }),
}));

function renderNav() {
  return render(
    <MemoryRouter>
      <LandingNav />
    </MemoryRouter>,
  );
}

describe("LandingNav section anchors", () => {
  it("links the Russian desktop and mobile navigation to landing sections", async () => {
    await i18n.changeLanguage("ru");
    const { getByRole, getAllByRole } = renderNav();

    expect(getAllByRole("link", { name: ru.nav.product })[0].getAttribute("href")).toBe(
      "/#product",
    );
    expect(getAllByRole("link", { name: ru.nav.howItWorks })[0].getAttribute("href")).toBe(
      "/#how",
    );
    expect(getAllByRole("link", { name: "FAQ" })[0].getAttribute("href")).toBe("/#faq");

    fireEvent.click(getByRole("button", { name: ru.nav.openMenu }));
    expect(getAllByRole("link", { name: ru.nav.product })[1].getAttribute("href")).toBe(
      "/#product",
    );
    fireEvent.click(getAllByRole("link", { name: ru.nav.product })[1]);
    expect(getByRole("button", { name: ru.nav.openMenu }).getAttribute("aria-expanded")).toBe(
      "false",
    );
  });

  it("keeps English direct anchors on the localized homepage", async () => {
    await i18n.changeLanguage("en");
    const { getAllByRole } = renderNav();

    expect(getAllByRole("link", { name: "Product" })[0].getAttribute("href")).toBe("/en#product");
    expect(getAllByRole("link", { name: "How it works" })[0].getAttribute("href")).toBe(
      "/en#how",
    );
    expect(getAllByRole("link", { name: "FAQ" })[0].getAttribute("href")).toBe("/en#faq");
  });
});
