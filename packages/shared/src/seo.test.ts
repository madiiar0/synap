import { describe, expect, it } from "vitest";
import {
  faqLd,
  localizedPublicPath,
  organizationLd,
  PUBLIC_PATHS,
  routeMeta,
  softwareApplicationLd,
  webSiteLd,
} from "./seo.js";

const BASE = "https://synapai.app";

describe("SEO meta (§1.2)", () => {
  it("has localized title + description for every public route, dash-free", () => {
    for (const path of PUBLIC_PATHS) {
      for (const locale of ["ru", "en"] as const) {
        const meta = routeMeta(path, locale);
        expect(meta.title.length).toBeGreaterThan(10);
        expect(meta.description.length).toBeGreaterThan(40);
        expect(meta.title).not.toMatch(/[—–]/);
        expect(meta.description).not.toMatch(/[—–]/);
      }
    }
  });

  it("maps locales to URL paths (§1.4)", () => {
    expect(localizedPublicPath("/", "ru")).toBe("/");
    expect(localizedPublicPath("/", "en")).toBe("/en");
    expect(localizedPublicPath("/scan", "en")).toBe("/en/scan");
    expect(localizedPublicPath("/login", "ru")).toBe("/login");
  });
});

describe("JSON-LD (§1.3)", () => {
  it("Organization has required fields", () => {
    const ld = organizationLd(BASE);
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("Organization");
    expect(ld.name).toBe("SynapAI");
    expect(ld.url).toBe(BASE);
    expect(String(ld.logo)).toContain(BASE);
  });

  it("SoftwareApplication is a free BusinessApplication", () => {
    const ld = softwareApplicationLd(BASE, "en") as {
      "@type": string;
      applicationCategory: string;
      offers: { price: string };
    };
    expect(ld["@type"]).toBe("SoftwareApplication");
    expect(ld.applicationCategory).toBe("BusinessApplication");
    expect(ld.offers.price).toBe("0");
  });

  it("WebSite carries inLanguage", () => {
    expect((webSiteLd(BASE, "ru") as { inLanguage: string }).inLanguage).toBe("ru");
  });

  it("FAQPage wraps items into Question/Answer", () => {
    const ld = faqLd([{ question: "Q1", answer: "A1" }]) as {
      "@type": string;
      mainEntity: { "@type": string; name: string; acceptedAnswer: { text: string } }[];
    };
    expect(ld["@type"]).toBe("FAQPage");
    expect(ld.mainEntity).toHaveLength(1);
    expect(ld.mainEntity[0].name).toBe("Q1");
    expect(ld.mainEntity[0].acceptedAnswer.text).toBe("A1");
  });
});
