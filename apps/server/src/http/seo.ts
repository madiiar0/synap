import fs from "node:fs";
import path from "node:path";
import type { Express, Request, Response } from "express";
import {
  faqLd,
  localizedPublicPath,
  organizationLd,
  PUBLIC_PATHS,
  routeMeta,
  scannedEngineNames,
  softwareApplicationLd,
  webSiteLd,
  type Locale,
  type PublicPath,
} from "@synapai/shared";
import { env, repoRoot } from "../config/env.js";
import { t } from "../lib/i18n.js";

const CLIENT_DIST = path.join(repoRoot, "apps/client/dist");
const PRERENDER_DIR = path.join(CLIENT_DIST, "prerendered");

interface PublicRoute {
  urlPath: string;
  basePath: PublicPath;
  locale: Locale;
}

function publicRoutes(): PublicRoute[] {
  const out: PublicRoute[] = [];
  for (const basePath of PUBLIC_PATHS) {
    out.push({ urlPath: basePath, basePath, locale: "ru" });
    out.push({ urlPath: localizedPublicPath(basePath, "en"), basePath, locale: "en" });
  }
  return out;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

function faqItems(locale: Locale): { question: string; answer: string }[] {
  return [1, 2, 3, 4, 5, 6].map((n) => ({
    question: t(locale, `landing.faq.q${n}`),
    answer: t(locale, `landing.faq.a${n}`),
  }));
}

/** Head block for one public route: meta, canonical, hreflang, OG, JSON-LD. */
export function buildHeadTags(basePath: PublicPath, locale: Locale): string {
  const base = env.APP_BASE_URL.replace(/\/$/, "");
  const meta = routeMeta(basePath, locale);
  const canonical = `${base}${localizedPublicPath(basePath, locale)}`;
  const ruUrl = `${base}${basePath}`;
  const enUrl = `${base}${localizedPublicPath(basePath, "en")}`;

  const ld: Record<string, unknown>[] = [
    organizationLd(base),
    softwareApplicationLd(base, locale),
    webSiteLd(base, locale),
  ];
  if (basePath === "/") ld.push(faqLd(faqItems(locale)));

  return [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}">`,
    `<link rel="canonical" href="${canonical}">`,
    `<link rel="alternate" hreflang="ru" href="${ruUrl}">`,
    `<link rel="alternate" hreflang="en" href="${enUrl}">`,
    `<link rel="alternate" hreflang="x-default" href="${ruUrl}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="SynapAI">`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}">`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:image" content="${base}/og-image.png">`,
    `<meta property="og:locale" content="${locale === "ru" ? "ru_RU" : "en_US"}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}">`,
    `<meta name="twitter:image" content="${base}/og-image.png">`,
    ...ld.map(
      (obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`,
    ),
  ].join("\n    ");
}

/** Inject head tags + lang into an index.html shell (removing stale title/description). */
export function injectHead(html: string, basePath: PublicPath, locale: Locale): string {
  let out = html
    .replace(/<title>[\s\S]*?<\/title>\s*/i, "")
    .replace(/<meta name="description"[^>]*>\s*/i, "")
    .replace(/<html lang="[^"]*"/i, `<html lang="${locale}"`);
  out = out.replace("</head>", `    ${buildHeadTags(basePath, locale)}\n  </head>`);
  return out;
}

function shellFor(route: PublicRoute): string | null {
  // Prefer the prerendered page (real body content for crawlers).
  const prerendered = path.join(
    PRERENDER_DIR,
    route.urlPath === "/" ? "index.html" : `${route.urlPath.replace(/^\//, "")}/index.html`,
  );
  if (fs.existsSync(prerendered)) return fs.readFileSync(prerendered, "utf8");
  const shell = path.join(CLIENT_DIST, "index.html");
  if (fs.existsSync(shell)) return fs.readFileSync(shell, "utf8");
  return null;
}

/** §1.1 layer 1: server-injected meta for the public routes. */
export function mountSeo(app: Express): void {
  for (const route of publicRoutes()) {
    app.get(route.urlPath, (_req: Request, res: Response, next) => {
      const shell = shellFor(route);
      if (!shell) {
        next(); // dev without a client build: Vite serves the client
        return;
      }
      res
        .status(200)
        .type("html")
        .send(injectHead(shell, route.basePath, route.locale));
    });
  }

  const base = env.APP_BASE_URL.replace(/\/$/, "");

  // §1.5 robots.txt: all major crawlers and AI bots explicitly welcome.
  app.get("/robots.txt", (_req, res) => {
    const bots = [
      "Googlebot",
      "Bingbot",
      "YandexBot",
      "GPTBot",
      "OAI-SearchBot",
      "ChatGPT-User",
      "PerplexityBot",
      "ClaudeBot",
      "Google-Extended",
      "Applebot-Extended",
    ];
    const lines = [
      ...bots.flatMap((bot) => [`User-agent: ${bot}`, "Allow: /", ""]),
      "User-agent: *",
      "Allow: /",
      "",
      `Sitemap: ${base}/sitemap.xml`,
    ];
    res.type("text/plain").send(lines.join("\n"));
  });

  app.get("/sitemap.xml", (_req, res) => {
    const urls = publicRoutes()
      .map((route) => {
        const loc = `${base}${route.urlPath}`;
        const ru = `${base}${route.basePath}`;
        const en = `${base}${localizedPublicPath(route.basePath, "en")}`;
        return [
          "  <url>",
          `    <loc>${loc}</loc>`,
          `    <xhtml:link rel="alternate" hreflang="ru" href="${ru}"/>`,
          `    <xhtml:link rel="alternate" hreflang="en" href="${en}"/>`,
          `    <xhtml:link rel="alternate" hreflang="x-default" href="${ru}"/>`,
          "  </url>",
        ].join("\n");
      })
      .join("\n");
    res
      .type("application/xml")
      .send(
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>`,
      );
  });

  // §1.5 llms.txt: dogfooding our own methodology.
  app.get("/llms.txt", (_req, res) => {
    const engines = scannedEngineNames().join(", ");
    res.type("text/plain").send(
      [
        "# SynapAI",
        "",
        "> SynapAI measures how visible a business is in AI assistants' answers.",
        `> It asks up to 100 realistic customer questions across ${engines},`,
        "> extracts mentions, competitors, sentiment and cited sources, and produces",
        "> a 0-100 Visibility Score. The scan is free; growth work is scoped on a call.",
        "",
        "## Key pages",
        "",
        `- [Home (RU)](${base}/): what SynapAI does and how it works`,
        `- [Home (EN)](${base}/en)`,
        `- [Sign in or create an account](${base}/login): running a check requires an account`,
        "",
        "## Notes",
        "",
        `- Scanned engines: ${engines}.`,
        "- Languages: Russian (default) and English.",
      ].join("\n"),
    );
  });
}
