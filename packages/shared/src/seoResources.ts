import {
  INDEXABLE_PUBLIC_PATHS,
  ogLocale,
  ogLocaleAlternates,
  landingFaqItems,
  localizedPublicPath,
  PRODUCT_POSITIONING,
  publicFreeAuditEngineNames,
  routeMeta,
  SOCIAL_IMAGE_ALT,
  structuredDataForRoute,
  type PublicPath,
} from "./seo.js";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "./constants.js";
import { publicFaqItems } from "./publicContent.js";

function cleanBase(baseUrl: string): string {
  return baseUrl.replace(/\/$/, "");
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

/** Route-specific metadata shared by the static frontend build and the
 * optional Express public-page server. It deliberately changes only <head>. */
export function buildPublicHeadTags(
  baseUrl: string,
  basePath: PublicPath,
  locale: Locale,
  siteNoindex = false,
): string {
  const base = cleanBase(baseUrl);
  const meta = routeMeta(basePath, locale);
  const indexable = meta.indexable && !siteNoindex;
  const robots = indexable
    ? "index,follow,max-image-preview:large"
    : siteNoindex || basePath === "/login"
      ? "noindex,nofollow,noarchive"
      : "noindex,follow,noarchive";
  const canonical = `${base}${localizedPublicPath(basePath, locale)}`;
  const alternates = LOCALES.map((l) => [l, `${base}${localizedPublicPath(basePath, l)}`] as const);
  const defaultUrl = `${base}${localizedPublicPath(basePath, DEFAULT_LOCALE)}`;
  const ogImage = `${base}/og-image.png`;
  const ogAlt = SOCIAL_IMAGE_ALT[locale];
  const faq = basePath === "/"
    ? landingFaqItems(locale)
    : basePath === "/faq"
      ? publicFaqItems(locale)
      : [];

  const tags = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}">`,
    '<meta name="author" content="Akrux">',
    '<meta name="publisher" content="Akrux">',
    `<meta name="robots" content="${robots}">`,
    `<link rel="canonical" href="${escapeHtml(canonical)}">`,
    ...alternates.map(
      ([l, href]) => `<link rel="alternate" hreflang="${l}" href="${escapeHtml(href)}">`,
    ),
    `<link rel="alternate" hreflang="x-default" href="${escapeHtml(defaultUrl)}">`,
    `<meta property="og:type" content="${meta.kind === "article" ? "article" : "website"}">`,
    '<meta property="og:site_name" content="Akrux">',
    `<meta property="og:title" content="${escapeHtml(meta.title)}">`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}">`,
    `<meta property="og:url" content="${escapeHtml(canonical)}">`,
    `<meta property="og:image" content="${escapeHtml(ogImage)}">`,
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    `<meta property="og:image:alt" content="${escapeHtml(ogAlt)}">`,
    `<meta property="og:locale" content="${ogLocale(locale)}">`,
    ...ogLocaleAlternates(locale).map(
      (alt) => `<meta property="og:locale:alternate" content="${alt}">`,
    ),
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}">`,
    `<meta name="twitter:image" content="${escapeHtml(ogImage)}">`,
    `<meta name="twitter:image:alt" content="${escapeHtml(ogAlt)}">`,
  ];
  if (meta.kind === "article" && meta.lastModified) {
    tags.push(
      `<meta property="article:published_time" content="${meta.datePublished ?? meta.lastModified}">`,
    );
    tags.push(`<meta property="article:modified_time" content="${meta.lastModified}">`);
  }
  if (basePath !== "/login") {
    tags.push(
      `<script id="akrux-structured-data" type="application/ld+json">${safeJson(
        structuredDataForRoute(base, basePath, locale, faq),
      )}</script>`,
    );
  }
  return tags.join("\n    ");
}

export function injectPublicHead(
  html: string,
  baseUrl: string,
  basePath: PublicPath,
  locale: Locale,
  siteNoindex = false,
): string {
  const out = html.replace(
    /<html lang="[^"]*"(?: data-site-noindex="[^"]*")?>/i,
    `<html lang="${locale}" data-site-noindex="${siteNoindex}">`,
  );
  const block = `<!-- akrux-seo:start -->\n    ${buildPublicHeadTags(
    baseUrl,
    basePath,
    locale,
    siteNoindex,
  )}\n    <!-- akrux-seo:end -->`;
  if (/<!-- akrux-seo:start -->[\s\S]*?<!-- akrux-seo:end -->/.test(out)) {
    return out.replace(/<!-- akrux-seo:start -->[\s\S]*?<!-- akrux-seo:end -->/, block);
  }
  return out.replace("</head>", `    ${block}\n  </head>`);
}

export function robotsText(baseUrl: string, siteNoindex = false): string {
  const base = cleanBase(baseUrl);
  if (siteNoindex) {
    return [
      "# This deployment is a staging or preview environment.",
      "User-agent: *",
      "Disallow: /",
    ].join("\n");
  }
  const privateRules = [
    "Disallow: /api/",
    "Disallow: /app",
    "Disallow: /admin",
    "Disallow: /scan",
    "Disallow: /verify-email",
  ];
  return [
    "# Public Akrux product content is crawlable for search and AI retrieval.",
    "# Account data stays protected by authentication; these rules reduce unwanted crawling.",
    "User-agent: OAI-SearchBot",
    "Allow: /",
    ...privateRules,
    "",
    "User-agent: *",
    "Allow: /",
    ...privateRules,
    "",
    `Sitemap: ${base}/sitemap.xml`,
  ].join("\n");
}

export function sitemapXml(baseUrl: string, siteNoindex = false): string {
  const base = cleanBase(baseUrl);
  if (siteNoindex) {
    return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>';
  }
  const urls = INDEXABLE_PUBLIC_PATHS.flatMap((basePath) =>
    LOCALES.map((locale) => {
      const meta = routeMeta(basePath, locale);
      const loc = `${base}${localizedPublicPath(basePath, locale)}`;
      const alternates = LOCALES.map(
        (l) => [l, `${base}${localizedPublicPath(basePath, l)}`] as const,
      );
      const fallback = `${base}${localizedPublicPath(basePath, DEFAULT_LOCALE)}`;
      return [
        "  <url>",
        `    <loc>${escapeXml(loc)}</loc>`,
        meta.lastModified ? `    <lastmod>${meta.lastModified}</lastmod>` : null,
        ...alternates.map(
          ([l, href]) =>
            `    <xhtml:link rel="alternate" hreflang="${l}" href="${escapeXml(href)}"/>`,
        ),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(fallback)}"/>`,
        "  </url>",
      ].filter(Boolean).join("\n");
    }),
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>`;
}

export function llmsText(baseUrl: string): string {
  const base = cleanBase(baseUrl);
  return [
    "# Akrux",
    "",
    `> ${PRODUCT_POSITIONING.en.short}`,
    "",
    `Canonical website: ${base}`,
    "Primary market: businesses in Kazakhstan",
    "Languages: Kazakh, Russian and English",
    `Normal free-audit model families: ${publicFreeAuditEngineNames().join(", ")}`,
    "",
    "## Current service",
    "",
    "Akrux is in an early testing stage. A business owner can start a free, user-initiated AI-visibility audit, review the private dated report, and book a call. The Akrux team then plans and manually carries out separately scoped improvement work.",
    "",
    "The free audit uses model families associated with ChatGPT, Gemini and Perplexity through configured provider APIs. It does not claim to reproduce every answer shown in the consumer applications.",
    "",
    "Scans and rescans are started by users. Akrux does not currently provide continuous or real-time monitoring.",
    "",
    "## Audit and methodology",
    "",
    `- [Services](${base}/en/services): free audit and separately scoped human-assisted improvement`,
    `- [Audit interface](${base}/en/product): measured outputs and availability`,
    `- [How it works](${base}/en/how-it-works): scan workflow`,
    `- [Methodology](${base}/en/methodology): prompts, formulas, exclusions and limitations`,
    `- [Pricing](${base}/en/pricing): free-audit access and separately scoped work`,
    `- [FAQ](${base}/en/faq): concise service and audit answers`,
    `- [Documentation](${base}/en/docs): using a private report`,
    "",
    "## Concepts and use cases",
    "",
    `- [AI visibility in Kazakhstan](${base}/en/blogs/ai-visibility-kazakhstan)`,
    `- [Generative Engine Optimization](${base}/en/generative-engine-optimization)`,
    `- [Use cases](${base}/en/use-cases)`,
    `- [Blog](${base}/en/blogs)`,
    "",
    "## Entity and trust",
    "",
    `- [About Akrux](${base}/en/about)`,
    `- [Contact](${base}/en/contact)`,
    "",
    "## Data boundary",
    "",
    "Public resources describe Akrux and its methodology. Customer business profiles, account prompts, generated answers, competitor reports, emails and scan data remain authenticated and are not included in public resources.",
    "",
    "An Akrux audit is a dated sample. Akrux does not guarantee indexing, mentions, citations, positions, rankings or recommendations in any AI system.",
    "",
    "llms.txt is supplemental and experimental. It does not guarantee discovery, indexing or citation. Canonical HTML pages, metadata, structured data, robots rules and the sitemap remain authoritative.",
  ].join("\n");
}

export function llmsFullText(baseUrl: string): string {
  const base = cleanBase(baseUrl);
  return [
    "# Akrux: public service reference",
    "",
    PRODUCT_POSITIONING.en.full,
    "",
    "## Availability and service workflow",
    "",
    "Akrux is currently in an early testing stage and primarily serves businesses in Kazakhstan.",
    "",
    "1. A business owner starts a free AI-visibility audit.",
    "2. Akrux makes fresh provider requests and produces a private, dated report.",
    "3. The owner reviews the report and can book a call with Akrux.",
    "4. The Akrux team plans and manually performs agreed improvement work. This work is separately scoped from the free audit.",
    "",
    "Scans and rescans are user-initiated. Akrux does not currently provide continuous or real-time monitoring, and future automation is not described as a current capability.",
    "",
    "## Public free-audit coverage",
    "",
    `The normal free audit covers model families associated with ${publicFreeAuditEngineNames().join(", ")}. Requests use configured provider APIs rather than direct automation of consumer chat applications, so a scan should not be treated as a reproduction of every consumer-interface answer.`,
    "",
    "## Audit measurement summary",
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
    "Visibility metrics; branded recognition; provider-level results; prompts; generated answers; answer-level recommendation position; competitors; Share of Voice; cited domains; and prompts where competitors appear without the target business.",
    "",
    "## Limitations and privacy boundary",
    "",
    "Generated answers vary by model, retrieval, date and wording. Provider-hosted model behavior can differ from consumer interfaces. An Akrux audit is a dated sample and does not guarantee indexing, mentions, citations, positions, rankings, recommendations, inclusion in training data or commercial results.",
    "",
    "Authenticated business profiles, prompts, answers, competitor reports, account details and customer scan data remain private. They are not exposed in this file or other public crawl resources.",
    "",
    "## Canonical references",
    "",
    `- Services: ${base}/en/services`,
    `- Methodology: ${base}/en/methodology`,
    `- Audit interface: ${base}/en/product`,
    `- Documentation: ${base}/en/docs`,
    `- FAQ: ${base}/en/faq`,
    `- Full sitemap: ${base}/sitemap.xml`,
    "",
    "Updated: 2026-08-03",
  ].join("\n");
}
