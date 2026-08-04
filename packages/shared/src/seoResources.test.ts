import { describe, expect, it } from "vitest";
import {
  buildPublicHeadTags,
  injectPublicHead,
  llmsText,
  robotsText,
  sitemapXml,
} from "./seoResources.js";

const BASE = "https://synap.example";
const SHELL = `<!doctype html>
<html lang="ru">
  <head>
    <!-- synap-seo:start -->
    <title>Old title</title>
    <meta name="robots" content="index,follow">
    <!-- synap-seo:end -->
  </head>
  <body><div id="root"><main><h1>Visible content stays identical</h1></main></div></body>
</html>`;

describe("public SEO resource rendering", () => {
  it("injects canonical metadata and JSON-LD without changing visible body markup", () => {
    const html = injectPublicHead(SHELL, BASE, "/about", "en");
    const originalBody = SHELL.match(/<body>[\s\S]*<\/body>/)?.[0];
    const renderedBody = html.match(/<body>[\s\S]*<\/body>/)?.[0];

    expect(renderedBody).toBe(originalBody);
    expect(html).toContain('<html lang="en" data-site-noindex="false">');
    expect(html).toContain(`<link rel="canonical" href="${BASE}/en/about">`);
    expect(html).toContain('hreflang="x-default"');
    expect(html).toContain('type="application/ld+json"');
  });

  it("keeps login and preview outputs non-indexable", () => {
    expect(buildPublicHeadTags(BASE, "/login", "ru")).toContain(
      'content="noindex,nofollow,noarchive"',
    );
    expect(buildPublicHeadTags(BASE, "/login", "ru")).not.toContain(
      'type="application/ld+json"',
    );
    expect(buildPublicHeadTags(BASE, "/about", "en", true)).toContain(
      'content="noindex,nofollow,noarchive"',
    );
  });

  it("publishes valid crawler resources on one canonical origin", () => {
    const robots = robotsText(BASE);
    const sitemap = sitemapXml(BASE);
    const llms = llmsText(BASE);

    expect(robots).toContain("User-agent: OAI-SearchBot");
    expect(robots).toContain("Disallow: /app");
    expect(robots).toContain(`Sitemap: ${BASE}/sitemap.xml`);
    expect(sitemap.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(sitemap).toContain(`<loc>${BASE}/methodology</loc>`);
    expect(sitemap).not.toContain(`${BASE}/app`);
    expect(llms).toContain(`Canonical website: ${BASE}`);
  });
});
