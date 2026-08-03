import { describe, expect, it } from "vitest";
import {
  INDEXABLE_PUBLIC_PATHS,
  LEGACY_PUBLIC_REDIRECTS,
  NOINDEX_PUBLIC_PATHS,
  PUBLIC_PATHS,
  faqLd,
  isIndexablePublicPath,
  localizedPublicPath,
  organizationLd,
  parseLocalizedPublicPath,
  routeMeta,
  softwareApplicationLd,
  structuredDataForRoute,
  webSiteLd,
} from "./seo.js";

const BASE = "https://synap.example";
const FORMER_NAME = ["Synap", "AI"].join("");

describe("public information architecture", () => {
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

  it("keeps sign-in noindex and excludes all private routes", () => {
    expect(NOINDEX_PUBLIC_PATHS).toEqual(["/login"]);
    expect(isIndexablePublicPath("/login")).toBe(false);
    expect(INDEXABLE_PUBLIC_PATHS).not.toContain("/login");
    expect(PUBLIC_PATHS).not.toContain("/scan");
    expect(PUBLIC_PATHS).not.toContain("/app");
    expect(PUBLIC_PATHS).not.toContain("/admin");
  });

  it("publishes canonical blog routes while retaining only redirect metadata for guides", () => {
    expect(INDEXABLE_PUBLIC_PATHS).toContain("/blogs");
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
    ]);
    expect(routeMeta("/blogs", "en").title).toBe("Synap Blog — AI Visibility in Kazakhstan");
    expect(routeMeta("/blogs", "ru").title).toBe("Блог Synap — видимость бизнеса в ответах ИИ");
  });
});

describe("structured data", () => {
  it("uses a stable Synap organization identity with machine-readable continuity", () => {
    const ld = organizationLd(BASE) as Record<string, unknown>;
    expect(ld["@type"]).toBe("Organization");
    expect(ld["@id"]).toBe(`${BASE}/#organization`);
    expect(ld.name).toBe("Synap");
    expect(ld.alternateName).toBe(FORMER_NAME);
    expect(ld.url).toBe(BASE);
    expect(JSON.stringify(ld)).not.toContain("ratingValue");
  });

  it("describes the real browser product without reviews or invented ratings", () => {
    const ld = softwareApplicationLd(BASE, "en") as {
      "@type": string[];
      applicationCategory: string;
      operatingSystem: string;
      offers: { price: string };
    };
    expect(ld["@type"]).toEqual(["SoftwareApplication", "Product"]);
    expect(ld.applicationCategory).toBe("BusinessApplication");
    expect(ld.operatingSystem).toBe("Web browser");
    expect(ld.offers.price).toBe("0");
    expect(JSON.stringify(ld)).not.toMatch(/aggregateRating|reviewCount/);
  });

  it("declares both supported public languages on the WebSite", () => {
    expect((webSiteLd(BASE) as { inLanguage: string[] }).inLanguage).toEqual(["en", "ru"]);
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

  it("does not attach product or page schema to the noindex sign-in page", () => {
    const graph = (structuredDataForRoute(BASE, "/login", "en") as {
      "@graph": Array<Record<string, unknown>>;
    })["@graph"];
    expect(graph.map((node) => node["@type"])).toEqual(["Organization", "WebSite"]);
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
});
