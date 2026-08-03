import { describe, expect, it } from "vitest";
import { publicPageContent } from "@synapai/shared";
import { prerenderRoutes, render } from "./entry";

describe("blog prerender output", () => {
  it("contains both localized article indexes in initial HTML", async () => {
    const ru = await render("/blogs", "ru");
    const en = await render("/en/blogs", "en");

    expect(ru).toContain(publicPageContent("/blogs", "ru").h1);
    expect(ru).toContain(publicPageContent("/blogs/audit-ai-generated-brand-information", "ru").h1);
    expect(ru).toContain("/blogs/why-ai-recommends-competitors");
    expect(en).toContain("Synap Blog");
    expect(en).toContain("How to audit AI-generated brand information");
    expect(en).toContain("What AI Visibility Means for Businesses in Kazakhstan");
    expect(en).toContain("/en/blogs/why-ai-recommends-competitors");
    expect(`${ru}${en}`).not.toMatch(/sk-[A-Za-z0-9]|BEGIN PRIVATE KEY|customer@example/i);
  });

  it("retains noindex legal and history pages in the 42-document prerender inventory", () => {
    const routes = prerenderRoutes();
    expect(routes).toHaveLength(42);
    for (const path of ["/privacy", "/en/privacy", "/terms", "/en/terms", "/changelog", "/en/changelog"]) {
      expect(routes.some((route) => route.url === path)).toBe(true);
    }
  });
});
