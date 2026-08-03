import fs from "node:fs";
import path from "node:path";
import type { Express, Request, Response } from "express";
import {
  INDEXABLE_PUBLIC_PATHS,
  LEGACY_PUBLIC_REDIRECTS,
  localizedPublicPath,
  PRODUCT_POSITIONING,
  PUBLIC_PATHS,
  publicFaqItems,
  routeMeta,
  scannedEngineNames,
  structuredDataForRoute,
  type Locale,
  type PublicPath,
} from "@synapai/shared";
import { env, repoRoot } from "../config/env.js";

const CLIENT_DIST = path.join(repoRoot, "apps/client/dist");
const PRERENDER_DIR = path.join(CLIENT_DIST, "prerendered");

interface PublicRoute {
  urlPath: string;
  basePath: PublicPath;
  locale: Locale;
}

interface PublicRedirect {
  urlPath: string;
  targetPath: string;
}

export function publicRoutes(): PublicRoute[] {
  const out: PublicRoute[] = [];
  for (const basePath of PUBLIC_PATHS) {
    out.push({ urlPath: localizedPublicPath(basePath, "ru"), basePath, locale: "ru" });
    out.push({ urlPath: localizedPublicPath(basePath, "en"), basePath, locale: "en" });
  }
  return out;
}

export function publicRedirects(): PublicRedirect[] {
  return LEGACY_PUBLIC_REDIRECTS.flatMap(({ from, to }) =>
    (["ru", "en"] as const).map((locale) => ({
      urlPath: locale === "ru" ? from : `/en${from}`,
      targetPath: localizedPublicPath(to, locale),
    })),
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeXml(value: string): string {
  return escapeHtml(value).replace(/'/g, "&apos;");
}

function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

/** One complete, route-specific head block for runtime HTML and client checks. */
export function buildHeadTags(basePath: PublicPath, locale: Locale): string {
  const base = env.APP_BASE_URL.replace(/\/$/, "");
  const meta = routeMeta(basePath, locale);
  const indexable = meta.indexable && !env.SITE_NOINDEX;
  const canonical = `${base}${localizedPublicPath(basePath, locale)}`;
  const ruUrl = `${base}${localizedPublicPath(basePath, "ru")}`;
  const enUrl = `${base}${localizedPublicPath(basePath, "en")}`;
  const ogImage = `${base}/og-image.png`;
  const ogAlt = locale === "ru" ? "Synap — аналитика видимости в ИИ" : "Synap visibility analytics for AI answers";
  const faq = basePath === "/"
    ? publicFaqItems(locale).slice(0, 6)
    : basePath === "/faq"
      ? publicFaqItems(locale)
      : [];

  const tags = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}">`,
    `<meta name="author" content="Synap">`,
    `<meta name="publisher" content="Synap">`,
    `<meta name="robots" content="${indexable ? "index,follow,max-image-preview:large" : "noindex,nofollow,noarchive"}">`,
    `<link rel="canonical" href="${escapeHtml(canonical)}">`,
    `<link rel="alternate" hreflang="ru" href="${escapeHtml(ruUrl)}">`,
    `<link rel="alternate" hreflang="en" href="${escapeHtml(enUrl)}">`,
    `<link rel="alternate" hreflang="x-default" href="${escapeHtml(ruUrl)}">`,
    `<meta property="og:type" content="${meta.kind === "article" ? "article" : "website"}">`,
    `<meta property="og:site_name" content="Synap">`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}">`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}">`,
    `<meta property="og:url" content="${escapeHtml(canonical)}">`,
    `<meta property="og:image" content="${escapeHtml(ogImage)}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${escapeHtml(ogAlt)}">`,
    `<meta property="og:locale" content="${locale === "ru" ? "ru_RU" : "en_US"}">`,
    `<meta property="og:locale:alternate" content="${locale === "ru" ? "en_US" : "ru_RU"}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}">`,
    `<meta name="twitter:image" content="${escapeHtml(ogImage)}">`,
    `<meta name="twitter:image:alt" content="${escapeHtml(ogAlt)}">`,
  ];
  if (meta.kind === "article" && meta.lastModified) {
    tags.push(`<meta property="article:published_time" content="${meta.lastModified}">`);
    tags.push(`<meta property="article:modified_time" content="${meta.lastModified}">`);
  }
  if (basePath !== "/login") {
    tags.push(
      `<script id="synap-structured-data" type="application/ld+json">${safeJson(
        structuredDataForRoute(base, basePath, locale, faq),
      )}</script>`,
    );
  }
  return tags.join("\n    ");
}

/** Inject route metadata and language into a prerendered HTML document. */
export function injectHead(html: string, basePath: PublicPath, locale: Locale): string {
  const out = html.replace(
    /<html lang="[^"]*"(?: data-site-noindex="[^"]*")?/i,
    `<html lang="${locale}" data-site-noindex="${env.SITE_NOINDEX}"`,
  );
  const block = `<!-- synap-seo:start -->\n    ${buildHeadTags(basePath, locale)}\n    <!-- synap-seo:end -->`;
  if (/<!-- synap-seo:start -->[\s\S]*?<!-- synap-seo:end -->/.test(out)) {
    return out.replace(/<!-- synap-seo:start -->[\s\S]*?<!-- synap-seo:end -->/, block);
  }
  return out.replace("</head>", `    ${block}\n  </head>`);
}

function prerenderedPath(urlPath: string): string {
  return path.join(
    PRERENDER_DIR,
    urlPath === "/" ? "index.html" : `${urlPath.replace(/^\//, "")}/index.html`,
  );
}

function shellFor(route: PublicRoute): string | null {
  const prerendered = prerenderedPath(route.urlPath);
  if (fs.existsSync(prerendered)) return fs.readFileSync(prerendered, "utf8");
  const shell = path.join(CLIENT_DIST, "index.html");
  if (fs.existsSync(shell)) return fs.readFileSync(shell, "utf8");
  return null;
}

export function robotsText(baseUrl: string, siteNoindex = false): string {
  const base = baseUrl.replace(/\/$/, "");
  if (siteNoindex) {
    return [
      "# This deployment is a staging or preview environment.",
      "User-agent: *",
      "Disallow: /",
    ].join("\n");
  }
  return [
    "# Public Synap product content is crawlable for search and AI retrieval.",
    "# Account data stays protected by authentication; these rules reduce unwanted crawling.",
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /app",
    "Disallow: /admin",
    "Disallow: /scan",
    "Disallow: /verify-email",
    "",
    `Sitemap: ${base}/sitemap.xml`,
  ].join("\n");
}

export function sitemapXml(baseUrl: string, siteNoindex = false): string {
  const base = baseUrl.replace(/\/$/, "");
  if (siteNoindex) {
    return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>';
  }
  const urls = INDEXABLE_PUBLIC_PATHS.flatMap((basePath) =>
    (["ru", "en"] as const).map((locale) => {
      const meta = routeMeta(basePath, locale);
      const loc = `${base}${localizedPublicPath(basePath, locale)}`;
      const ru = `${base}${localizedPublicPath(basePath, "ru")}`;
      const en = `${base}${localizedPublicPath(basePath, "en")}`;
      return [
        "  <url>",
        `    <loc>${escapeXml(loc)}</loc>`,
        meta.lastModified ? `    <lastmod>${meta.lastModified}</lastmod>` : null,
        `    <xhtml:link rel="alternate" hreflang="ru" href="${escapeXml(ru)}"/>`,
        `    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(en)}"/>`,
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(ru)}"/>`,
        "  </url>",
      ].filter(Boolean).join("\n");
    }),
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>`;
}

export function llmsText(baseUrl: string): string {
  const base = baseUrl.replace(/\/$/, "");
  return [
    "# Synap",
    "",
    `> ${PRODUCT_POSITIONING.en.sentence}`,
    "> Synap reports an unbranded Visibility Score, separate branded recognition, provider results, competitors, citations and Share of Voice.",
    "",
    `Canonical website: ${base}`,
    "Languages: English and Russian",
    `Supported model families: ${scannedEngineNames().join(", ")}`,
    "",
    "## Product and methodology",
    "",
    `- [Product](${base}/en/product): measured outputs and availability`,
    `- [How it works](${base}/en/how-it-works): scan workflow`,
    `- [Methodology](${base}/en/methodology): prompts, formulas, exclusions and limitations`,
    `- [Pricing](${base}/en/pricing): free-scan access and separately scoped work`,
    `- [FAQ](${base}/en/faq): concise product answers`,
    `- [Documentation](${base}/en/docs): using a private report`,
    "",
    "## Concepts and use cases",
    "",
    `- [AI visibility](${base}/en/ai-visibility)`,
    `- [Generative Engine Optimization](${base}/en/generative-engine-optimization)`,
    `- [Use cases](${base}/en/use-cases)`,
    `- [Blog](${base}/en/blogs)`,
    "",
    "## Entity and trust",
    "",
    `- [About Synap](${base}/en/about)`,
    `- [Contact](${base}/en/contact)`,
    `- [Privacy](${base}/en/privacy)`,
    `- [Terms](${base}/en/terms)`,
    `- [Changelog](${base}/en/changelog)`,
    "",
    "## Data boundary",
    "",
    "Public resources describe Synap and its methodology. Customer business profiles, account prompts, generated answers, competitor reports, emails and scan data are authenticated and are not included in public resources.",
    "",
    "llms.txt is supplemental. The canonical HTML pages, metadata, structured data, robots rules and sitemap remain authoritative.",
  ].join("\n");
}

export function llmsFullText(baseUrl: string): string {
  const base = baseUrl.replace(/\/$/, "");
  return [
    "# Synap: public product reference",
    "",
    PRODUCT_POSITIONING.en.full,
    "",
    "## Measurement summary",
    "",
    "- A scan researches the submitted business and generates 25 prompts under the current default configuration.",
    "- Prompts are stored as branded or unbranded from their actual text and known aliases.",
    "- The primary Visibility Score uses successful unbranded category and comparison answers; branded recognition is separate.",
    "- Category has weight 0.60 and unbranded comparison has weight 0.40, with model weights normalized over model families present.",
    "- Failed model requests are excluded. Every score snapshot stores a metric version; the current version is 2.",
    "- Share of Voice counts each qualifying entity at most once per successful unbranded answer and excludes directories, marketplaces, sources and generic phrases.",
    "",
    "## Supported outputs",
    "",
    "Visibility Score; branded recognition; provider-level results; prompts; generated answers; recommendation position; competitors; Share of Voice; cited domains; and prompts where competitors appear without the target business.",
    "",
    "## Limitations",
    "",
    "Generated answers vary by model, retrieval, date and wording. Provider-hosted model behavior can differ from consumer interfaces. A Synap scan does not guarantee indexing, citation, inclusion in training data, ranking, recommendation or commercial results.",
    "",
    "## Canonical references",
    "",
    `- Methodology: ${base}/en/methodology`,
    `- Product: ${base}/en/product`,
    `- Documentation: ${base}/en/docs`,
    `- FAQ: ${base}/en/faq`,
    `- Privacy boundary: ${base}/en/privacy`,
    `- Full sitemap: ${base}/sitemap.xml`,
    "",
    "Updated: 2026-08-02",
  ].join("\n");
}

/** Public HTML, crawl resources and response-level indexing controls. */
export function mountSeo(app: Express): void {
  for (const redirect of publicRedirects()) {
    app.get(redirect.urlPath, (req: Request, res: Response) => {
      const queryIndex = req.originalUrl.indexOf("?");
      const query = queryIndex >= 0 ? req.originalUrl.slice(queryIndex) : "";
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.redirect(308, `${redirect.targetPath}${query}`);
    });
  }

  for (const route of publicRoutes()) {
    app.get(route.urlPath, (_req: Request, res: Response, next) => {
      const shell = shellFor(route);
      if (!shell) {
        next();
        return;
      }
      const meta = routeMeta(route.basePath, route.locale);
      res.setHeader("Content-Language", route.locale);
      res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      if (!meta.indexable || env.SITE_NOINDEX) {
        res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
      }
      res.status(200).type("html").send(injectHead(shell, route.basePath, route.locale));
    });
  }

  const base = env.APP_BASE_URL.replace(/\/$/, "");
  app.get("/robots.txt", (_req, res) => {
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.type("text/plain").send(robotsText(base, env.SITE_NOINDEX));
  });
  app.get("/sitemap.xml", (_req, res) => {
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.type("application/xml").send(sitemapXml(base, env.SITE_NOINDEX));
  });
  app.get("/llms.txt", (_req, res) => {
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.type("text/plain").send(llmsText(base));
  });
  app.get("/llms-full.txt", (_req, res) => {
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.type("text/plain").send(llmsFullText(base));
  });
}
