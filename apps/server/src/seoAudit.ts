import { once } from "node:events";
import type { Server } from "node:http";
import {
  INDEXABLE_PUBLIC_PATHS,
  LEGACY_PUBLIC_REDIRECTS,
  LOCALE_PREFIX,
  LOCALES,
  landingFaqItems,
  publicFaqItems,
  publicPageContent,
  publicUiText,
  PUBLIC_PATHS,
  localizedPublicPath,
  routeMeta,
  type Locale,
  type PublicPath,
} from "@synapai/shared";
import { createApp } from "./createApp.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";

interface PageResult {
  path: string;
  html: string;
  title: string;
  description: string;
  indexable: boolean;
}

const failures: string[] = [];
const assert = (condition: unknown, message: string): void => {
  if (!condition) failures.push(message);
};

function count(html: string, expression: RegExp): number {
  return [...html.matchAll(expression)].length;
}

function first(html: string, expression: RegExp): string {
  return expression.exec(html)?.[1] ?? "";
}

function publicRoutePairs(): Array<{ path: string; basePath: PublicPath; locale: Locale }> {
  return PUBLIC_PATHS.flatMap((basePath) =>
    LOCALES.map((locale) => ({
      path: localizedPublicPath(basePath, locale),
      basePath,
      locale,
    })),
  );
}

async function get(origin: string, path: string): Promise<Response> {
  return fetch(`${origin}${path}`, { redirect: "manual" });
}

async function auditPage(
  origin: string,
  route: ReturnType<typeof publicRoutePairs>[number],
): Promise<PageResult> {
  const response = await get(origin, route.path);
  const html = await response.text();
  const expectedMeta = routeMeta(route.basePath, route.locale);
  const title = first(html, /<title>([\s\S]*?)<\/title>/i);
  const description = first(html, /<meta name="description" content="([^"]*)">/i);
  const canonical = first(html, /<link rel="canonical" href="([^"]*)">/i);
  const canonicalBase = env.APP_BASE_URL.replace(/\/$/, "");

  assert(response.status === 200, `${route.path}: expected 200, received ${response.status}`);
  assert(response.headers.get("content-type")?.includes("text/html"), `${route.path}: missing HTML content type`);
  assert(response.headers.get("content-language") === route.locale, `${route.path}: wrong Content-Language`);
  assert(new RegExp(`<html lang="${route.locale}"`, "i").test(html), `${route.path}: wrong html lang`);
  assert(count(html, /<main\b/gi) === 1, `${route.path}: expected one main element`);
  assert(count(html, /<h1\b/gi) === 1, `${route.path}: expected one h1`);
  assert(title.length > 10, `${route.path}: missing title`);
  assert(description.length > 40, `${route.path}: missing description`);
  assert(title === expectedMeta.title, `${route.path}: title does not match the route registry`);
  assert(canonical === `${canonicalBase}${route.path}`, `${route.path}: incorrect canonical`);
  for (const hreflang of [...LOCALES, "x-default"]) {
    assert(
      new RegExp(`<link rel="alternate" hreflang="${hreflang}" href="[^"]+">`, "i").test(html),
      `${route.path}: missing ${hreflang} alternate`,
    );
  }
  assert(/<meta property="og:title" content="[^"]+">/i.test(html), `${route.path}: missing Open Graph title`);
  assert(/<meta name="twitter:card" content="summary_large_image">/i.test(html), `${route.path}: missing X card`);

  const robots = first(html, /<meta name="robots" content="([^"]*)">/i);
  if (expectedMeta.indexable) {
    assert(robots.startsWith("index,follow"), `${route.path}: public route is not indexable`);
    const json = first(html, /<script id="akrux-structured-data" type="application\/ld\+json">([\s\S]*?)<\/script>/i);
    assert(Boolean(json), `${route.path}: missing JSON-LD`);
    if (json) {
      try {
        const parsed = JSON.parse(json) as { "@context"?: string; "@graph"?: Record<string, unknown>[] };
        assert(parsed["@context"] === "https://schema.org", `${route.path}: invalid schema context`);
        assert(Array.isArray(parsed["@graph"]) && parsed["@graph"].length >= 4, `${route.path}: incomplete schema graph`);
        const graph = parsed["@graph"] ?? [];

        // The Organization must be externally checkable, not a closed loop.
        const org = graph.find((node) => node["@type"] === "Organization");
        assert(Boolean(org), `${route.path}: missing Organization node`);
        if (org) {
          assert(Array.isArray(org.sameAs) && org.sameAs.length > 0, `${route.path}: Organization has no sameAs`);
          assert(typeof org.email === "string" && org.email.includes("@"), `${route.path}: Organization has no email`);
          assert(typeof org.telephone === "string" && org.telephone.startsWith("+"), `${route.path}: Organization has no telephone`);
          const address = org.address as Record<string, unknown> | undefined;
          assert(
            Boolean(address) && typeof address?.addressCountry === "string",
            `${route.path}: Organization has no postal address`,
          );
          assert(!("legalName" in org), `${route.path}: Organization must not claim a legalName`);
        }

        // Articles must carry a date and a named author, and their headline
        // must be the visible H1 rather than the browser title.
        for (const article of graph.filter((node) => node["@type"] === "Article")) {
          assert(typeof article.datePublished === "string", `${route.path}: Article has no datePublished`);
          assert(Boolean(article.author), `${route.path}: Article has no author`);
          const authorId = (article.author as { "@id"?: string })?.["@id"];
          assert(
            graph.some((node) => node["@type"] === "Person" && node["@id"] === authorId),
            `${route.path}: Article author does not resolve to a Person node`,
          );
          const headline = String(article.headline ?? "");
          assert(
            !/\s[|—–-]\s*Akrux\s*$/.test(headline),
            `${route.path}: Article headline carries a browser-title suffix`,
          );
          const visibleH1 = first(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i).replace(/<[^>]+>/g, "").trim();
          assert(headline === visibleH1, `${route.path}: Article headline does not match the visible H1`);
        }
      } catch {
        failures.push(`${route.path}: JSON-LD is not valid JSON`);
      }
    }
  } else {
    const expectedRobots = route.basePath === "/login" ? "noindex,nofollow" : "noindex,follow";
    assert(robots.startsWith(expectedRobots), `${route.path}: incorrect noindex follow policy`);
    assert(response.headers.get("x-robots-tag")?.includes("noindex"), `${route.path}: missing noindex response header`);
    assert(
      response.headers.get("x-robots-tag")?.includes(route.basePath === "/login" ? "nofollow" : "follow"),
      `${route.path}: response-level follow policy is incorrect`,
    );
    if (route.basePath === "/login") {
      assert(!html.includes("akrux-structured-data"), `${route.path}: sign-in route exposes page schema`);
    } else {
      assert(html.includes("akrux-structured-data"), `${route.path}: retained noindex page lost visible page schema`);
    }
  }

  const withoutScripts = html.replace(/<script\b[\s\S]*?<\/script>/gi, "");
  const formerName = ["Syn", "ap"].join("");
  assert(!withoutScripts.includes(formerName), `${route.path}: former brand is visible in HTML`);
  for (const image of html.match(/<img\b[^>]*>/gi) ?? []) {
    assert(/\salt="[^"]*"/i.test(image), `${route.path}: image is missing alt text`);
  }
  return { path: route.path, html, title, description, indexable: expectedMeta.indexable };
}

async function run(): Promise<void> {
  logger.level = "silent";
  const app = createApp();
  const server = app.listen(0, "127.0.0.1") as Server;
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Could not resolve audit server address");
  const origin = `http://127.0.0.1:${address.port}`;

  try {
    const pages: PageResult[] = [];
    for (const route of publicRoutePairs()) pages.push(await auditPage(origin, route));

    const indexed = pages.filter((page) => page.indexable);
    assert(new Set(indexed.map((page) => page.title)).size === indexed.length, "Indexable page titles are not unique");
    assert(new Set(indexed.map((page) => page.description)).size === indexed.length, "Indexable page descriptions are not unique");

    const ruBlog = pages.find((page) => page.path === "/blogs")?.html ?? "";
    const enBlog = pages.find((page) => page.path === "/en/blogs")?.html ?? "";
    const enAiVisibility = pages.find((page) => page.path === "/en/blogs/ai-visibility-kazakhstan")?.html ?? "";
    assert(ruBlog.includes("Как проверить информацию о бренде в ответах ИИ"), "/blogs: article list is missing from initial HTML");
    assert(enBlog.includes("How to audit AI-generated brand information"), "/en/blogs: article list is missing from initial HTML");
    assert(
      enBlog.includes("What AI Visibility Means for Businesses in Kazakhstan"),
      "/en/blogs: AI-visibility article is missing from initial HTML",
    );
    assert(
      enAiVisibility.includes("Branded and unbranded questions answer different questions"),
      "/en/blogs/ai-visibility-kazakhstan: article body is missing from initial HTML",
    );

    for (const { from, to } of LEGACY_PUBLIC_REDIRECTS) {
      for (const locale of LOCALES) {
        const source = `${LOCALE_PREFIX[locale]}${from}`;
        const target = localizedPublicPath(to, locale);
        const response = await get(origin, `${source}?audit=1`);
        assert(response.status === 308, `${source}: legacy guide redirect is not permanent`);
        assert(response.headers.get("location") === `${target}?audit=1`, `${source}: redirect target is incorrect`);
        assert(target !== source, `${source}: redirect loop detected`);
      }
    }

    const knownLinks = new Set([
      ...publicRoutePairs().map((route) => route.path),
      "/app",
      "/verify-email",
    ]);
    for (const page of pages) {
      for (const match of page.html.matchAll(/<a\b[^>]*\shref="([^"]+)"[^>]*>/gi)) {
        const href = match[1];
        if (/^(?:https?:|mailto:|tel:)/.test(href)) continue;
        if (href.startsWith("#")) {
          assert(page.html.includes(`id="${href.slice(1)}"`), `${page.path}: broken same-page link ${href}`);
          continue;
        }
        const pathname = href.split(/[?#]/)[0] || page.path;
        assert(knownLinks.has(pathname), `${page.path}: broken internal link ${href}`);
      }
    }

    const robots = await get(origin, "/robots.txt");
    const robotsBody = await robots.text();
    assert(robots.status === 200 && robotsBody.includes("Disallow: /api/"), "robots.txt is missing private API rules");

    const sitemap = await get(origin, "/sitemap.xml");
    const sitemapBody = await sitemap.text();
    const sitemapLocations = [...sitemapBody.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
    assert(sitemap.status === 200, "sitemap.xml did not return 200");
    assert(
      sitemapLocations.length === INDEXABLE_PUBLIC_PATHS.length * LOCALES.length,
      "sitemap.xml has the wrong URL count",
    );

    // Translations must never steer their own wrapping: a forced break makes a
    // locale diverge from the reference layout at some breakpoint.
    const FORCED_BREAK = /<br\s*\/?>|\u00a0|\u200b/i;
    for (const locale of LOCALES) {
      const strings: string[] = [];
      const collect = (node: unknown): void => {
        if (typeof node === "string") strings.push(node);
        else if (Array.isArray(node)) node.forEach(collect);
        else if (node && typeof node === "object") Object.values(node).forEach(collect);
      };
      for (const basePath of PUBLIC_PATHS) {
        const meta = routeMeta(basePath, locale);
        collect([meta.title, meta.description, meta.headline]);
      }
      collect(publicUiText(locale));
      collect(publicFaqItems(locale));
      collect(landingFaqItems(locale));
      for (const basePath of PUBLIC_PATHS) {
        if (basePath === "/" || basePath === "/login") continue;
        collect(publicPageContent(basePath, locale));
      }
      const offenders = strings.filter((value) => FORCED_BREAK.test(value));
      assert(
        offenders.length === 0,
        `${locale}: ${offenders.length} translated string(s) contain a forced line break`,
      );
    }
    assert(sitemapBody.includes("/blogs"), "sitemap.xml is missing the blog hub");
    assert(!sitemapBody.includes("/guides"), "sitemap.xml contains a legacy guide URL");
    assert(
      !sitemapBody.match(/\/(?:login|privacy|terms|changelog)<|\/app<|\/api\//),
      "sitemap.xml contains a private or noindex URL",
    );

    for (const resource of ["/llms.txt", "/llms-full.txt"]) {
      const response = await get(origin, resource);
      const body = await response.text();
      assert(response.status === 200 && body.startsWith("# Akrux"), `${resource} is invalid`);
      assert(!/sk-[A-Za-z0-9]|BEGIN PRIVATE KEY/.test(body), `${resource} may contain a secret`);
    }

    for (const asset of ["/og-image.png", "/icon-512.png", "/site.webmanifest"]) {
      assert((await get(origin, asset)).status === 200, `${asset} did not return 200`);
    }

    const privateRoute = await get(origin, "/app");
    assert(privateRoute.status === 200, "/app must remain a functioning client route");
    assert(privateRoute.headers.get("x-robots-tag")?.includes("noindex"), "/app is missing X-Robots-Tag noindex");
    assert(privateRoute.headers.get("cache-control")?.includes("private"), "/app is publicly cacheable");

    const missing = await get(origin, "/definitely-not-an-akrux-page");
    assert(missing.status === 404, "unknown client routes do not return a real 404");
    assert(missing.headers.get("x-robots-tag")?.includes("noindex"), "404 response is indexable");

    const trailingSlash = await get(origin, "/about/");
    assert(trailingSlash.status === 308, "trailing-slash policy is not permanent");
    assert(trailingSlash.headers.get("location") === "/about", "trailing-slash redirect target is wrong");

    const missingApi = await get(origin, "/api/definitely-missing");
    assert(
      missingApi.status === 401 || missingApi.status === 404,
      "unknown protected API route returned an invalid status",
    );
    assert(missingApi.headers.get("content-type")?.includes("application/json"), "unknown API route returned HTML");
  } finally {
    server.close();
    await once(server, "close");
  }

  if (failures.length > 0) {
    console.error(`SEO audit failed (${failures.length}):\n- ${failures.join("\n- ")}`);
    process.exitCode = 1;
    return;
  }
  console.log(
    `SEO audit passed: ${PUBLIC_PATHS.length * LOCALES.length} localized HTML routes, crawl resources, metadata, schema, links, noindex boundaries and status codes.`,
  );
}

void run();
