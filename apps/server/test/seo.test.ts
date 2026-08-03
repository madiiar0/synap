import { once } from "node:events";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import express from "express";
import { describe, expect, it } from "vitest";
import { INDEXABLE_PUBLIC_PATHS, PUBLIC_PATHS } from "@synapai/shared";
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

const BASE = "https://synap.example";

describe("crawl and retrieval resources", () => {
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
    expect(xml).not.toContain(`${BASE}/guides`);
    expect(xml).not.toMatch(/\/login<|\/app<|\/api\//);
  });

  it("permanently redirects every localized guide URL without loops", async () => {
    expect(publicRedirects()).toHaveLength(6);
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
    expect(homepage).toContain('content="index,follow,max-image-preview:large"');
    expect(homepage).toContain('hreflang="ru"');
    expect(homepage).toContain('hreflang="en"');
    expect(homepage).toContain('hreflang="x-default"');
    expect(homepage).toContain('type="application/ld+json"');
    expect(login).toContain('content="noindex,nofollow,noarchive"');
    expect(login).not.toContain('type="application/ld+json"');
  });

  it("keeps llms resources factual, supplemental and outside private data", () => {
    const concise = llmsText(BASE);
    const full = llmsFullText(BASE);
    expect(concise).toContain("# Synap");
    expect(concise).toContain("llms.txt is supplemental");
    expect(concise).toContain(`${BASE}/en/methodology`);
    expect(concise).toContain(`${BASE}/en/blogs`);
    expect(concise).not.toContain(`${BASE}/en/guides`);
    expect(full).toContain("does not guarantee indexing");
    expect(`${concise}\n${full}`).not.toMatch(/sk-[A-Za-z0-9]|BEGIN PRIVATE KEY/);
  });
});
