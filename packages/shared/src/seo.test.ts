import { describe, expect, it } from "vitest";
import { publicPageContent } from "./publicContent.js";
import { LOCALES } from "./constants.js";
import {
  INDEXABLE_PUBLIC_PATHS,
  landingFaqItems,
  LEGACY_PUBLIC_REDIRECTS,
  NOINDEX_PUBLIC_PATHS,
  PUBLIC_PATHS,
  faqLd,
  isIndexablePublicPath,
  localizedPublicPath,
  organizationLd,
  parseLocalizedPublicPath,
  PRODUCT_POSITIONING,
  routeMeta,
  serviceLd,
  softwareApplicationLd,
  structuredDataForRoute,
  webSiteLd,
} from "./seo.js";

const BASE = "https://akrux.example";
const FORMER_NAME = ["Syn", "ap"].join("");

describe("public information architecture", () => {
  it("keeps only consolidated and complete canonical routes", () => {
    expect(INDEXABLE_PUBLIC_PATHS).toHaveLength(17);
    expect(PUBLIC_PATHS).toHaveLength(21);
    expect(INDEXABLE_PUBLIC_PATHS).toContain("/use-cases");
    expect(INDEXABLE_PUBLIC_PATHS).toContain("/use-cases/local-businesses");
    expect(INDEXABLE_PUBLIC_PATHS).not.toContain("/use-cases/saas");
    expect(INDEXABLE_PUBLIC_PATHS).not.toContain("/use-cases/ecommerce");
    expect(INDEXABLE_PUBLIC_PATHS).not.toContain("/use-cases/professional-services");
  });

  it("defines Akrux as a human-assisted Kazakhstan service in primary metadata", () => {
    expect(PRODUCT_POSITIONING.en.short).toBe(
      "Akrux gives Kazakhstan businesses a free audit of how they appear in AI-generated answers, followed by human-led improvement support. AI placement is not guaranteed.",
    );
    expect(PRODUCT_POSITIONING.ru.short).toBe(
      "Akrux бесплатно проверяет, как бизнес в Казахстане представлен в ответах ИИ, а затем команда вручную помогает с улучшениями. Позиции в ИИ не гарантируются.",
    );
    expect(PRODUCT_POSITIONING.en.full).toContain("human-assisted");
    expect(PRODUCT_POSITIONING.en.full).toContain("manually carries out agreed improvement work");
    expect(PRODUCT_POSITIONING.en.full).not.toMatch(/analytics platform|continuous|real-time/i);
    expect(routeMeta("/", "en")).toMatchObject({
      title: "Akrux — Improve AI Visibility in Kazakhstan",
      description:
        "Get a free audit of how your business appears in AI answers. Akrux’s team helps Kazakhstan businesses carry out agreed improvements; AI placement is not guaranteed.",
    });
    expect(routeMeta("/", "ru")).toMatchObject({
      title: "Akrux — улучшение видимости бизнеса в ИИ в Казахстане",
      description:
        "Получите бесплатный аудит представленности бизнеса в ответах ИИ. Команда Akrux помогает компаниям Казахстана с улучшениями; позиции в ИИ не гарантируются.",
    });
  });

  it("has unique localized titles and descriptions for every public route", () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();

    for (const path of PUBLIC_PATHS) {
      for (const locale of ["ru", "en"] as const) {
        const meta = routeMeta(path, locale);
        expect(meta.title.length).toBeGreaterThan(10);
        expect(meta.description.length).toBeGreaterThan(40);
        expect(meta.title).not.toContain(FORMER_NAME);
        expect(meta.description).not.toContain(FORMER_NAME);
        expect(titles.has(meta.title)).toBe(false);
        expect(descriptions.has(meta.description)).toBe(false);
        titles.add(meta.title);
        descriptions.add(meta.description);
      }
    }
  });

  it("round-trips Russian and English route paths", () => {
    for (const path of PUBLIC_PATHS) {
      for (const locale of ["ru", "en"] as const) {
        const localized = localizedPublicPath(path, locale);
        expect(parseLocalizedPublicPath(localized)).toEqual({ path, locale });
        if (localized !== "/") {
          expect(parseLocalizedPublicPath(`${localized}/`)).toEqual({ path, locale });
        }
      }
    }
  });

  it("retains incomplete legal and history pages as noindex alongside sign-in", () => {
    expect(NOINDEX_PUBLIC_PATHS).toEqual(["/login", "/changelog", "/privacy", "/terms"]);
    for (const path of NOINDEX_PUBLIC_PATHS) {
      expect(isIndexablePublicPath(path)).toBe(false);
      expect(INDEXABLE_PUBLIC_PATHS).not.toContain(path);
      expect(PUBLIC_PATHS).toContain(path);
    }
    expect(PUBLIC_PATHS).not.toContain("/scan");
    expect(PUBLIC_PATHS).not.toContain("/app");
    expect(PUBLIC_PATHS).not.toContain("/admin");
  });

  it("publishes canonical blog routes while retaining redirect metadata for legacy guides", () => {
    expect(INDEXABLE_PUBLIC_PATHS).toContain("/blogs");
    expect(INDEXABLE_PUBLIC_PATHS).toContain("/blogs/ai-visibility-kazakhstan");
    expect(INDEXABLE_PUBLIC_PATHS).toContain("/blogs/audit-ai-generated-brand-information");
    expect(INDEXABLE_PUBLIC_PATHS).toContain("/blogs/why-ai-recommends-competitors");
    expect(INDEXABLE_PUBLIC_PATHS as readonly string[]).not.toContain("/guides");
    expect(LEGACY_PUBLIC_REDIRECTS).toEqual([
      { from: "/guides", to: "/blogs" },
      {
        from: "/guides/audit-ai-brand-information",
        to: "/blogs/audit-ai-generated-brand-information",
      },
      {
        from: "/guides/why-ai-recommends-competitors",
        to: "/blogs/why-ai-recommends-competitors",
      },
      {
        from: "/ai-visibility",
        to: "/blogs/ai-visibility-kazakhstan",
      },
      { from: "/use-cases/saas", to: "/use-cases" },
      { from: "/use-cases/ecommerce", to: "/use-cases" },
      { from: "/use-cases/professional-services", to: "/use-cases" },
    ]);
    expect(routeMeta("/blogs", "en").title).toBe("Akrux Blog — AI Visibility in Kazakhstan");
    expect(routeMeta("/blogs", "ru").title).toBe("Блог Akrux — видимость бизнеса в ответах ИИ");
  });

  it("registers localized Services metadata without a hard-coded origin", () => {
    expect(INDEXABLE_PUBLIC_PATHS).toContain("/services");
    expect(routeMeta("/services", "en")).toMatchObject({
      title: "AI Visibility Services in Kazakhstan — Akrux",
      indexable: true,
    });
    expect(routeMeta("/services", "ru")).toMatchObject({
      title: "Услуги по улучшению видимости бизнеса в ИИ в Казахстане — Akrux",
      indexable: true,
    });
    expect(localizedPublicPath("/services", "en")).toBe("/en/services");
    expect(localizedPublicPath("/services", "ru")).toBe("/services");
  });
});

describe("structured data", () => {
  it("uses a stable Akrux organization identity without unsupported former-name continuity", () => {
    const ld = organizationLd(BASE) as Record<string, unknown>;
    expect(ld["@type"]).toBe("Organization");
    expect(ld["@id"]).toBe(`${BASE}/#organization`);
    expect(ld.name).toBe("Akrux");
    expect(ld).not.toHaveProperty("alternateName");
    expect(ld.url).toBe(BASE);
    expect(ld.description).toContain("Kazakhstan");
    expect(ld.areaServed).toEqual({ "@type": "Country", name: "Kazakhstan" });
    expect(ld.knowsAbout).toContain("Answer engine optimization");
    expect(JSON.stringify(ld)).not.toContain(FORMER_NAME);
    expect(JSON.stringify(ld)).not.toContain("ratingValue");
  });

  it("makes the Kazakhstan Service primary and the browser audit application secondary", () => {
    const service = serviceLd(BASE, "en") as Record<string, unknown>;
    const ld = softwareApplicationLd(BASE, "en") as {
      "@type": string;
      "@id": string;
      applicationCategory: string;
      operatingSystem: string;
      isPartOf: { "@id": string };
    };
    expect(service["@type"]).toBe("Service");
    expect(service["@id"]).toBe(`${BASE}/#service`);
    expect(service.areaServed).toEqual({ "@type": "Country", name: "Kazakhstan" });
    expect(service.provider).toEqual({ "@id": `${BASE}/#organization` });
    expect(service.description).toContain("human-assisted");
    expect(service.description).toContain("does not guarantee indexing");
    expect(ld["@type"]).toBe("SoftwareApplication");
    expect(ld["@id"]).toBe(`${BASE}/#audit-application`);
    expect(ld.applicationCategory).toBe("BusinessApplication");
    expect(ld.operatingSystem).toBe("Web browser");
    expect(ld.isPartOf).toEqual({ "@id": `${BASE}/#service` });
    expect(ld).not.toHaveProperty("offers");
    expect(JSON.stringify(ld)).not.toMatch(/Product|priceCurrency|aggregateRating|reviewCount/);
  });

  it("keeps the Services schema aligned with the visible commercial explanation", () => {
    const service = serviceLd(BASE, "en") as { description: string; areaServed: { name: string } };
    const visible = JSON.stringify(publicPageContent("/services", "en"));

    expect(service.description).toContain("free audit");
    expect(service.description).toContain("manually carries out agreed improvement work");
    expect(service.areaServed.name).toBe("Kazakhstan");
    expect(visible).toContain("free audit");
    expect(visible).toContain("Human-assisted improvement work");
    expect(visible).toContain("businesses in Kazakhstan");
    expect(visible).toContain("cannot purchase or guarantee indexing");
  });

  it("declares both supported public languages on the WebSite", () => {
    const website = webSiteLd(BASE) as {
      inLanguage: string[];
      about: { "@id": string };
    };
    expect(website.inLanguage).toEqual([...LOCALES]);
    expect(website.about).toEqual({ "@id": `${BASE}/#service` });
  });

  it("only emits FAQ questions supplied from visible page content", () => {
    const ld = faqLd([{ question: "Visible question", answer: "Visible answer" }]) as {
      "@type": string;
      mainEntity: { name: string; acceptedAnswer: { text: string } }[];
    };
    expect(ld["@type"]).toBe("FAQPage");
    expect(ld.mainEntity).toHaveLength(1);
    expect(ld.mainEntity[0].name).toBe("Visible question");
    expect(ld.mainEntity[0].acceptedAnswer.text).toBe("Visible answer");
  });

  it("reads the homepage FAQ from the exact localized landing translation keys", () => {
    expect(landingFaqItems("en")).toEqual([
      {
        question: "How is the Visibility Score calculated?",
        answer:
          "The main score measures how often and how prominently your business appears in successful unbranded AI answers. Branded recognition is measured separately, so asking directly about your business does not inflate the main score.",
      },
      {
        question: "Which AI systems do you check?",
        answer:
          "The free audit currently evaluates model families associated with ChatGPT, Gemini and Perplexity. The results are a measured sample and may differ from answers shown in individual consumer applications.",
      },
      {
        question: "How long does the audit take?",
        answer:
          "A free audit usually completes within a few minutes. Timing can vary depending on provider availability, and we email you the report link when it is ready.",
      },
      {
        question: "Is the data accurate?",
        answer:
          "AI answers can change with the model, time, wording and retrieved sources. Your audit is a dated sample that shows the current situation, not a guaranteed or permanent ranking.",
      },
      {
        question: "What happens after the call?",
        answer:
          "We review your report, identify why competitors appear instead of you, and propose an improvement plan covering content, business information, sources and external mentions. If we agree on the scope, our team carries out the work.",
      },
      {
        question: "How much does it cost?",
        answer:
          "The AI visibility audit is free. Improvement work is priced separately after the call because the required scope depends on your industry, current online presence and competition.",
      },
    ]);
    expect(landingFaqItems("ru")).toHaveLength(6);
    expect(landingFaqItems("ru")[0].question).toBe("Как считается Индекс видимости?");
  });

  it("emits a complete graph with no Product, offer, or dangling entity references", () => {
    const graph = (structuredDataForRoute(BASE, "/", "en", landingFaqItems("en")) as {
      "@graph": Array<Record<string, unknown>>;
    })["@graph"];
    const ids = new Set<string>();
    const referencedIds: string[] = [];
    const visit = (value: unknown): void => {
      if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === "object") {
        const record = value as Record<string, unknown>;
        if (typeof record["@id"] === "string" && record["@type"]) ids.add(record["@id"]);
        else if (typeof record["@id"] === "string") referencedIds.push(record["@id"]);
        Object.values(record).forEach(visit);
      }
    };
    graph.forEach(visit);

    expect(graph.some((node) => node["@type"] === "Service")).toBe(true);
    expect(graph.some((node) => node["@type"] === "SoftwareApplication")).toBe(true);
    expect(JSON.stringify(graph)).not.toMatch(/"Product"|"Offer"|priceCurrency/);
    expect(JSON.stringify(graph)).not.toContain(FORMER_NAME);
    for (const id of referencedIds.filter((id) => id.startsWith(`${BASE}/#`))) {
      expect(ids.has(id), `missing graph node for ${id}`).toBe(true);
    }
  });

  it("does not attach product or page schema to the noindex sign-in page", () => {
    const graph = (structuredDataForRoute(BASE, "/login", "en") as {
      "@graph": Array<Record<string, unknown>>;
    })["@graph"];
    // The founder Person stays in the graph so Organization.founder resolves
    // even on the noindex sign-in page; no page or product schema is added.
    expect(graph.map((node) => node["@type"])).toEqual(["Organization", "Person", "WebSite"]);
  });

  it("uses visible article schema for migrated blog posts", () => {
    const graph = (structuredDataForRoute(
      BASE,
      "/blogs/audit-ai-generated-brand-information",
      "en",
    ) as { "@graph": Array<Record<string, unknown>> })["@graph"];
    const article = graph.find((node) => node["@type"] === "Article");

    expect(article?.url).toBe(`${BASE}/en/blogs/audit-ai-generated-brand-information`);
    expect(article?.publisher).toEqual({ "@id": `${BASE}/#organization` });
  });

  it("uses the visible AI-visibility headline without inventing publication or author data", () => {
    const graph = (structuredDataForRoute(
      BASE,
      "/blogs/ai-visibility-kazakhstan",
      "en",
    ) as { "@graph": Array<Record<string, unknown>> })["@graph"];
    const article = graph.find((node) => node["@type"] === "Article");

    expect(article?.headline).toBe("What AI Visibility Means for Businesses in Kazakhstan");
    expect(article?.dateModified).toBe("2026-08-03");
    // Phase 2.4: resolved from the first-commit date of the file carrying the
    // article body, and attributed to the one named Person.
    expect(article?.datePublished).toBe("2026-08-03");
    expect(article?.author).toEqual({ "@id": `${BASE}/#founder` });
  });

  it("connects the Services WebPage to the primary Service entity", () => {
    const graph = (structuredDataForRoute(BASE, "/services", "en") as {
      "@graph": Array<Record<string, unknown>>;
    })["@graph"];
    const page = graph.find((node) => node["@id"] === `${BASE}/en/services#webpage`);

    expect(graph.some((node) => node["@id"] === `${BASE}/#service`)).toBe(true);
    expect(page?.["@type"]).toBe("WebPage");
    expect(page?.mainEntity).toEqual({ "@id": `${BASE}/#service` });
    expect(page?.about).toEqual({ "@id": `${BASE}/#service` });
  });
});
