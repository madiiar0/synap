import { describe, expect, it } from "vitest";
import {
  BLOG_ARTICLE_PATHS,
  publicFaqItems,
  publicPageContent,
  type ContentPagePath,
} from "./publicContent.js";
import type { Locale } from "./constants.js";

const changedPaths = [
  "/services",
  "/about",
  "/product",
  "/how-it-works",
  "/pricing",
  "/faq",
  "/docs",
  "/methodology",
  "/generative-engine-optimization",
  "/contact",
] as const satisfies readonly ContentPagePath[];

function pageText(path: ContentPagePath, locale: Locale): string {
  return JSON.stringify(publicPageContent(path, locale));
}

describe("Phase 2B public service content", () => {
  it("presents About as an early-stage, service-led Kazakhstan business", () => {
    for (const locale of ["en", "ru"] as const) {
      const text = pageText("/about", locale);
      expect(text).toMatch(locale === "en" ? /businesses in Kazakhstan/i : /бизнес в Казахстане/);
      expect(text).toMatch(locale === "en" ? /early testing stage/ : /раннем этапе тестирования/);
      expect(text).toMatch(locale === "en" ? /manually plans and performs/ : /вручную планирует и выполняет/);
      expect(text).not.toMatch(/analytics platform|marketing teams and agencies|глобального рынка/i);
      expect(text).not.toMatch(/repository|репозитор|founder|основател|registered location|адрес регистрации/i);
    }
  });

  it("distinguishes the diagnostic application from manual service work", () => {
    const en = pageText("/product", "en");
    const ru = pageText("/product", "ru");
    expect(en).toContain("The diagnostic application behind Synap's free audit");
    expect(en).toContain("The application provides the free diagnostic audit");
    expect(en).toContain("manually carries out only the activities agreed");
    expect(ru).toContain("Диагностическое приложение для бесплатного аудита Synap");
    expect(ru).toContain("вручную выполняет только согласованные");
    expect(`${en}\n${ru}`).not.toMatch(/Claude|Grok|fully automated|полностью автоматизированн/i);
  });

  it("documents the complete audit, call, manual-work and rescan lifecycle", () => {
    const en = publicPageContent("/how-it-works", "en");
    const ru = publicPageContent("/how-it-works", "ru");
    expect(en.sections.map((section) => section.heading)).toEqual([
      "1. Create a business profile",
      "2. Research before asking",
      "3. Generate branded and unbranded prompts",
      "4. Collect and analyse sampled answers",
      "5. Review the private report",
      "6. Book an optional review call",
      "7. Agree on and perform improvement work",
      "8. Use later scans for directional comparison",
    ]);
    expect(ru.sections).toHaveLength(8);
    expect(pageText("/how-it-works", "en")).toContain("manually performs the agreed work");
    expect(pageText("/how-it-works", "en")).toContain("cannot guarantee that the next scan will improve");
  });

  it("publishes no fixed price, currency, package or guaranteed placement", () => {
    const pricing = `${pageText("/pricing", "en")}\n${pageText("/pricing", "ru")}`;
    expect(pricing).toMatch(/initial AI-visibility audit is free|Начальный аудит видимости в ИИ бесплатный/);
    expect(pricing).toMatch(/does not currently publish a fixed subscription|не публикует фиксированную подписку/);
    expect(pricing).toMatch(/does not guarantee indexing|не гарантирует индексацию/);
    expect(pricing).not.toMatch(/\$|USD|KZT|₸|discount|скидк|monthly|per month/i);
  });

  it("keeps the public free-audit offer to three model families", () => {
    const acquisitionPaths = [
      "/services",
      "/about",
      "/product",
      "/how-it-works",
      "/pricing",
      "/faq",
    ] as const satisfies readonly ContentPagePath[];
    const text = acquisitionPaths.flatMap((path) => [pageText(path, "en"), pageText(path, "ru")]).join("\n");
    expect(text).toMatch(/ChatGPT/);
    expect(text).toMatch(/Gemini/);
    expect(text).toMatch(/Perplexity/);
    expect(text).not.toMatch(/Claude|Grok/);
    expect(text).not.toMatch(/Synap (?:offers?|provides?|runs?) (?:continuous|real-time) monitoring/i);
    expect(text).not.toMatch(/Synap (?:guarantees?|promises?) (?:placement|indexing|mentions|citations|positions|rankings|recommendations)/i);
  });

  it("answers the practical public FAQ without hidden or duplicated questions", () => {
    for (const locale of ["en", "ru"] as const) {
      const items = publicFaqItems(locale);
      expect(items).toHaveLength(12);
      expect(new Set(items.map((item) => item.question)).size).toBe(items.length);
      expect(JSON.stringify(items)).not.toMatch(/Claude|Grok/);
    }
    expect(publicFaqItems("en").map((item) => item.question)).toEqual([
      "What is Synap?",
      "Who is Synap for?",
      "What does the free audit include?",
      "Which AI model families are included in the free audit?",
      "Does Synap directly scan the consumer ChatGPT, Gemini or Perplexity apps?",
      "What happens after the audit?",
      "What can manual improvement work involve?",
      "Does Synap guarantee indexing, citations, rankings or recommendations?",
      "Does Synap provide continuous or real-time monitoring?",
      "Are audit reports public?",
      "Does Synap currently focus on Kazakhstan?",
      "Is Synap still in testing?",
    ]);
  });

  it("keeps Docs diagnostic, Methodology implementation-backed and GEO human-led", () => {
    expect(pageText("/docs", "en")).toContain("diagnostic application");
    expect(pageText("/docs", "en")).toContain("does not describe the full human-assisted Synap service");
    expect(pageText("/methodology", "en")).toContain("category rate has weight 0.60");
    expect(pageText("/methodology", "en")).toContain("comparison rate 0.40");
    expect(pageText("/generative-engine-optimization", "en")).toContain("human-led work");
    expect(pageText("/generative-engine-optimization", "en")).toContain("For a Kazakhstan business");
  });

  it("uses only existing safe contact paths and excludes unsupported public facts", () => {
    const contact = `${pageText("/contact", "en")}\n${pageText("/contact", "ru")}`;
    expect(contact).toMatch(/free audit|бесплатный аудит/);
    expect(contact).toMatch(/Book a call|созвон/);
    expect(contact).not.toMatch(/repository|репозитор|not configured|не настроен|not supplied|не указан/i);
    expect(contact).not.toMatch(/support@|@synap|phone|телефон|office hours|часы работы|legal entity|юридическ.*лиц/i);
  });

  it("contains no fabricated founder, customer, address or result claims on changed pages", () => {
    const text = changedPaths.flatMap((path) => [pageText(path, "en"), pageText(path, "ru")]).join("\n");
    expect(text).not.toMatch(/founded by|our founder|основател[ья]|trusted by|доверяют .*компани|customer count|число клиентов/i);
    expect(text).not.toMatch(/registered address|office address|юридический адрес|адрес офиса|guaranteed result|гарантированный результат/i);
    expect(text).not.toMatch(/customer@example|BEGIN PRIVATE KEY|access token value|private customer report/i);
  });

  it("retains the two established blog articles and their factual publication record", () => {
    expect(BLOG_ARTICLE_PATHS).toEqual([
      "/blogs/audit-ai-generated-brand-information",
      "/blogs/why-ai-recommends-competitors",
    ]);
    expect(publicPageContent(BLOG_ARTICLE_PATHS[0], "en")).toMatchObject({
      h1: "How to audit AI-generated brand information",
      published: "August 2, 2026",
    });
    expect(publicPageContent(BLOG_ARTICLE_PATHS[1], "ru")).toMatchObject({
      h1: "Почему ИИ рекомендует конкурентов",
      published: "2 августа 2026 года",
    });
  });
});
