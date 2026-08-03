import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { publicPageContent, routeMeta } from "@synapai/shared";
import i18n from "../lib/i18n";
import PublicPage from "./PublicPage";

vi.mock("../lib/queries", () => ({
  useSession: () => ({ state: "signedOut", user: undefined }),
}));

vi.mock("../lib/publicAnalytics", () => ({
  trackPublicEvent: vi.fn(),
}));

function renderPage(path: string): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="*" element={<PublicPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("localized blog hub", () => {
  it("renders the English article index and localized navigation", async () => {
    await i18n.changeLanguage("en");
    const page = renderPage("/en/blogs");

    expect(page.getByRole("heading", { level: 1, name: routeMeta("/blogs", "en").title })).toBeTruthy();
    expect(page.getByRole("link", { name: /How to audit AI-generated brand information/ }).getAttribute("href"))
      .toBe("/en/blogs/audit-ai-generated-brand-information");
    expect(page.getByRole("link", { name: /Why AI answers recommend competitors/ }).getAttribute("href"))
      .toBe("/en/blogs/why-ai-recommends-competitors");
    expect(page.getAllByText("August 2, 2026").length).toBeGreaterThanOrEqual(2);
    expect(page.getAllByRole("link", { name: "Product" })[0].getAttribute("href")).toBe("/en#product");
    expect(page.getAllByRole("link", { name: "Blogs" }).some((link) => link.getAttribute("href") === "/en/blogs"))
      .toBe(true);
  });

  it("renders the Russian article index without fabricated claims", async () => {
    await i18n.changeLanguage("ru");
    const page = renderPage("/blogs");

    expect(page.getByRole("heading", { level: 1, name: routeMeta("/blogs", "ru").title })).toBeTruthy();
    expect(page.getByRole("link", { name: publicPageContent("/blogs/audit-ai-generated-brand-information", "ru").h1 }).getAttribute("href"))
      .toBe("/blogs/audit-ai-generated-brand-information");
    expect(page.getByRole("link", { name: publicPageContent("/blogs/why-ai-recommends-competitors", "ru").h1 }).getAttribute("href"))
      .toBe("/blogs/why-ai-recommends-competitors");
    expect(page.container.textContent).not.toMatch(/customer@example|BEGIN PRIVATE KEY/i);
  });
});
