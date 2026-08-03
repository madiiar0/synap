import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { publicFaqItems, publicPageContent, routeMeta } from "@synapai/shared";
import i18n from "../lib/i18n";
import PublicPage from "./PublicPage";

vi.mock("../lib/queries", () => ({
  useSession: () => ({ state: "signedOut", user: undefined }),
}));

vi.mock("../lib/publicAnalytics", () => ({
  trackPublicEvent: vi.fn(),
}));

vi.mock("../components/BookCallButton", () => ({
  default: () => <button type="button">Book a call</button>,
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
    expect(page.getByRole("link", { name: /What AI Visibility Means for Businesses in Kazakhstan/ }).getAttribute("href"))
      .toBe("/en/blogs/ai-visibility-kazakhstan");
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
    expect(page.getByRole("link", { name: publicPageContent("/blogs/ai-visibility-kazakhstan", "ru").h1 }).getAttribute("href"))
      .toBe("/blogs/ai-visibility-kazakhstan");
    expect(page.container.textContent).not.toMatch(/customer@example|BEGIN PRIVATE KEY/i);
  });
});

describe("localized Services page", () => {
  it("renders substantive English service content and both conversion actions", async () => {
    await i18n.changeLanguage("en");
    const page = renderPage("/en/services");
    const content = publicPageContent("/services", "en");

    expect(page.getByRole("heading", { level: 1, name: content.h1 })).toBeTruthy();
    expect(page.getByText(/free initial AI-visibility audit during the current testing stage/i)).toBeTruthy();
    expect(page.getByRole("link", { name: "Start the free audit" }).getAttribute("href")).toBe("/en/login");
    expect(page.getByRole("button", { name: "Book a call" })).toBeTruthy();
    expect(page.container.textContent).toContain("ChatGPT, Gemini and Perplexity");
    expect(page.container.textContent).not.toMatch(/Claude|Grok/);
  });

  it("renders the Russian service content and is linked from Product", async () => {
    await i18n.changeLanguage("ru");
    const servicePage = renderPage("/services");
    expect(servicePage.getByRole("heading", {
      level: 1,
      name: publicPageContent("/services", "ru").h1,
    })).toBeTruthy();
    servicePage.unmount();

    const productPage = renderPage("/product");
    const serviceLink = publicPageContent("/product", "ru").related.find(({ path }) => path === "/services");
    expect(serviceLink).toBeTruthy();
    expect(productPage.getByRole("link", { name: serviceLink?.label }).getAttribute("href"))
      .toBe("/services");
  });
});

describe("service-led public informational pages", () => {
  it("renders the public FAQ from the same source used by JSON-LD", async () => {
    await i18n.changeLanguage("en");
    const page = renderPage("/en/faq");
    const items = publicFaqItems("en");

    expect(page.container.querySelectorAll("details")).toHaveLength(items.length);
    for (const item of items) {
      expect(page.getByText(item.question)).toBeTruthy();
      expect(page.getByText(item.answer)).toBeTruthy();
    }
  });

  it("renders service-led About, Product, workflow, Pricing and Contact content", async () => {
    await i18n.changeLanguage("en");
    for (const path of ["/en/about", "/en/product", "/en/how-it-works", "/en/pricing"] as const) {
      const page = renderPage(path);
      const basePath = path.slice(3) as "/about" | "/product" | "/how-it-works" | "/pricing";
      expect(page.getByRole("heading", { level: 1, name: publicPageContent(basePath, "en").h1 })).toBeTruthy();
      page.unmount();
    }

    const contact = renderPage("/en/contact");
    expect(contact.getByRole("link", { name: "Start the free audit" }).getAttribute("href")).toBe("/en/login");
    expect(contact.getByRole("button", { name: "Book a call" })).toBeTruthy();
  });

  it("renders the consolidated use cases and Kazakhstan local-business guidance", async () => {
    await i18n.changeLanguage("en");
    const hub = renderPage("/en/use-cases");
    for (const heading of ["Local businesses", "Ecommerce", "Professional services", "SaaS and digital products"]) {
      expect(hub.getByRole("heading", { name: heading })).toBeTruthy();
    }
    expect(hub.getByRole("link", { name: "Detailed local-business guidance" }).getAttribute("href"))
      .toBe("/en/use-cases/local-businesses");
    hub.unmount();

    const local = renderPage("/en/use-cases/local-businesses");
    expect(local.getByRole("heading", { level: 1, name: /local businesses in Kazakhstan/i })).toBeTruthy();
    expect(local.container.textContent).toContain("Russian, Kazakh and English public information");
  });
});
