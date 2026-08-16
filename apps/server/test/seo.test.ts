import { once } from "node:events";
import fs from "node:fs";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import express from "express";
import { describe, expect, it } from "vitest";
import {
  INDEXABLE_PUBLIC_PATHS,
  landingFaqItems,
  PRODUCT_POSITIONING,
  PUBLIC_PATHS,
  structuredDataForRoute,
} from "@synapai/shared";
import {
  buildHeadTags,
  llmsFullText,
  llmsText,
  mountSeo,
  publicRedirects,
  publicRoutes,
  robotsText,
  sitemapXml,
} from "../src/http/seo.js";
import { SESSION_COOKIE } from "../src/services/auth.js";

const BASE = "https://akrux.example";
const FORMER_NAME = ["Syn", "ap"].join("");

describe("crawl and retrieval resources", () => {
  it("preserves route counts and compatibility-sensitive internal identifiers", () => {
    expect(INDEXABLE_PUBLIC_PATHS).toHaveLength(17);
    expect(PUBLIC_PATHS).toHaveLength(21);
    expect(SESSION_COOKIE).toBe(["synap", "ai_session"].join(""));
  });

  it("uses service-led package and manifest descriptions without changing icon references", () => {
    const manifest = JSON.parse(
      fs.readFileSync(new URL("../../client/public/site.webmanifest", import.meta.url), "utf8"),
    ) as { description: string; icons: Array<{ src: string; sizes: string }> };
    const packageMetadata = JSON.parse(
      fs.readFileSync(new URL("../../../package.json", import.meta.url), "utf8"),
    ) as { description: string };

    expect(manifest.description).toContain("бизнес в Казахстане");
    expect(manifest.description).toContain("вручную помогает");
    expect(manifest.icons).toEqual([
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ]);
    expect(packageMetadata.description).toBe(PRODUCT_POSITIONING.en.short);
  });

  it("registers both locales for every public route", () => {
    expect(publicRoutes()).toHaveLength(PUBLIC_PATHS.length * 2);
    expect(new Set(publicRoutes().map((route) => route.urlPath)).size).toBe(PUBLIC_PATHS.length * 2);
  });

  it("blocks private route families while keeping public content crawlable", () => {
    const robots = robotsText(BASE);
    expect(robots).toContain("User-agent: *");
    expect(robots).toContain("Allow: /");
    for (const privatePath of ["/api/", "/app", "/admin", "/scan", "/verify-email"]) {
      expect(robots).toContain(`Disallow: ${privatePath}`);
    }
    expect(robots).toContain(`Sitemap: ${BASE}/sitemap.xml`);
  });

  it("can make a staging deployment entirely non-indexable", () => {
    expect(robotsText(BASE, true)).toContain("Disallow: /");
    expect(robotsText(BASE, true)).not.toContain("Sitemap:");
    expect(sitemapXml(BASE, true)).not.toContain("<url>");
  });

  it("sitemaps only canonical indexable routes with alternates", () => {
    const xml = sitemapXml(BASE);
    const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
    expect(locations).toHaveLength(INDEXABLE_PUBLIC_PATHS.length * 2);
    expect(new Set(locations).size).toBe(locations.length);
    expect(xml).toContain('hreflang="x-default"');
    expect(xml).toContain(`${BASE}/blogs`);
    expect(xml).toContain(`${BASE}/en/blogs`);
    expect(xml).toContain(`${BASE}/services`);
    expect(xml).toContain(`${BASE}/en/services`);
    expect(xml).not.toContain(`${BASE}/guides`);
    expect(xml).not.toMatch(/use-cases\/(?:saas|ecommerce|professional-services)/);
    expect(xml).not.toMatch(/\/(?:login|privacy|terms|changelog)<|\/app<|\/api\//);
  });

  it("permanently redirects every localized legacy content URL without loops", async () => {
    expect(publicRedirects()).toHaveLength(14);
    expect(publicRedirects().every(({ targetPath }) => !targetPath.includes("/guides"))).toBe(true);

    const app = express();
    mountSeo(app);
    const server = app.listen(0, "127.0.0.1") as Server;
    await once(server, "listening");
    const address = server.address() as AddressInfo;
    const origin = `http://127.0.0.1:${address.port}`;
    try {
      for (const { urlPath, targetPath } of publicRedirects()) {
        const response = await fetch(`${origin}${urlPath}?source=test`, { redirect: "manual" });
        expect(response.status).toBe(308);
        expect(response.headers.get("location")).toBe(`${targetPath}?source=test`);
      }
    } finally {
      server.close();
      await once(server, "close");
    }
  });

  it("creates unique index directives and valid JSON-LD boundaries", () => {
    const homepage = buildHeadTags("/", "en");
    const login = buildHeadTags("/login", "en");
    const retainedNoindex = [
      buildHeadTags("/privacy", "en"),
      buildHeadTags("/terms", "en"),
      buildHeadTags("/changelog", "en"),
    ];
    expect(homepage).toContain('content="index,follow,max-image-preview:large"');
    expect(homepage).toContain('hreflang="ru"');
    expect(homepage).toContain('hreflang="en"');
    expect(homepage).toContain('hreflang="x-default"');
    expect(homepage).toContain('type="application/ld+json"');
    expect(login).toContain('content="noindex,nofollow,noarchive"');
    expect(login).not.toContain('type="application/ld+json"');
    for (const head of retainedNoindex) {
      expect(head).toContain('content="noindex,follow,noarchive"');
      expect(head).toContain('type="application/ld+json"');
    }
  });

  it("keeps homepage FAQ JSON-LD synchronized with the visible localized landing copy", () => {
    for (const locale of ["en", "ru"] as const) {
      const head = buildHeadTags("/", locale);
      const raw = head.match(
        /<script id="akrux-structured-data" type="application\/ld\+json">([\s\S]*?)<\/script>/,
      )?.[1];
      expect(raw).toBeTruthy();
      const graph = (JSON.parse(raw ?? "{}") as { "@graph": Array<Record<string, unknown>> })[
        "@graph"
      ];
      const faq = graph.find((node) => node["@type"] === "FAQPage") as {
        mainEntity: Array<{ name: string; acceptedAnswer: { text: string } }>;
      };
      expect(
        faq.mainEntity.map((item) => ({
          question: item.name,
          answer: item.acceptedAnswer.text,
        })),
      ).toEqual(landingFaqItems(locale));
    }
  });

  it("publishes a service-led graph without former-brand, Product, or price claims", () => {
    const graph = (structuredDataForRoute(BASE, "/", "en", landingFaqItems("en")) as {
      "@graph": Array<Record<string, unknown>>;
    })["@graph"];
    const service = graph.find((node) => node["@type"] === "Service");
    const application = graph.find((node) => node["@type"] === "SoftwareApplication");
    const serialized = JSON.stringify(graph);

    expect(service?.areaServed).toEqual({ "@type": "Country", name: "Kazakhstan" });
    expect(service?.provider).toEqual({ "@id": `${BASE}/#organization` });
    expect(application?.isPartOf).toEqual({ "@id": `${BASE}/#service` });
    expect(serialized).toContain(PRODUCT_POSITIONING.en.full);
    expect(serialized).not.toContain(FORMER_NAME);
    expect(serialized).not.toMatch(/"Product"|"Offer"|priceCurrency|"price"/);
    expect(serialized).not.toContain("@akrux.app");
  });

  it("keeps llms resources factual, supplemental and outside private data", () => {
    const concise = llmsText(BASE);
    const full = llmsFullText(BASE);
    expect(concise).toContain("# Akrux");
    expect(concise).toContain("llms.txt is supplemental");
    expect(concise).toContain("Primary market: businesses in Kazakhstan");
    expect(concise).toContain("Normal free-audit model families: ChatGPT, Gemini, Perplexity");
    expect(concise).toContain("early testing stage");
    expect(concise).toContain("user-initiated");
    expect(concise).toContain("manually carries out separately scoped improvement work");
    expect(concise).toContain(`${BASE}/en/methodology`);
    expect(concise).toContain(`${BASE}/en/services`);
    expect(concise).toContain(`${BASE}/en/blogs`);
    expect(concise).not.toContain(`${BASE}/en/guides`);
    expect(full).toContain("does not guarantee indexing");
    expect(full).toMatch(/Authenticated business profiles/);
    const combined = `${concise}\n${full}`;
    expect(combined).not.toMatch(/Claude|Grok/);
    expect(combined).not.toMatch(/analytics platform|self-service SaaS|automated optimization/i);
    expect(combined).not.toMatch(/provides (?:continuous|real-time) monitoring/i);
    expect(combined).not.toMatch(
      /(?<!not )guarantees? (?:indexing|mentions|citations|positions|rankings|recommendations)/i,
    );
    expect(combined).not.toMatch(/sk-[A-Za-z0-9]|BEGIN PRIVATE KEY|synapai_session|@akrux\.app/);
    expect(llmsText(BASE)).toContain(`Canonical website: ${BASE}`);
    expect(llmsText("https://another.example")).toContain(
      "Canonical website: https://another.example",
    );
  });
});
