/**
 * Build-time public-site renderer. Public routes become real clean-URL HTML
 * files in dist/, while authenticated and unknown routes keep using spa.html.
 * The rendered body is unchanged; only delivery and <head> metadata differ.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CANONICAL_SITE_URL,
  injectPublicHead,
  llmsFullText,
  llmsText,
  robotsText,
  sitemapXml,
} from "@synapai/shared";

const clientRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(clientRoot, "dist");
const shellPath = path.join(dist, "index.html");
const shell = fs.readFileSync(shellPath, "utf8");

const { render, prerenderRoutes } = await import(path.join(clientRoot, "dist-ssr/entry.js"));

function canonicalBaseUrl() {
  const explicit = process.env.PUBLIC_SITE_URL?.trim();
  // A production build always publishes the checked-in canonical origin. The
  // per-deployment URL is deliberately not used as a fallback: emitting a
  // second origin in canonicals, hreflang, the sitemap, llms.txt or JSON-LD is
  // exactly what makes crawlers and AI retrievers split one entity into two.
  const candidate =
    process.env.VERCEL_ENV === "production"
      ? CANONICAL_SITE_URL
      : explicit || (process.env.VERCEL === "1" ? CANONICAL_SITE_URL : "http://localhost:5173");
  const url = new URL(candidate);
  if (url.pathname !== "/" || url.search || url.hash) {
    throw new Error("PUBLIC_SITE_URL must be an origin without a path, query, or fragment");
  }
  if (process.env.VERCEL === "1" && url.protocol !== "https:") {
    throw new Error("The deployed public site URL must use HTTPS");
  }
  return url.origin;
}

function booleanEnv(value) {
  return value === "true" || value === "1";
}

function outputPath(url) {
  return path.join(dist, url === "/" ? "index.html" : `${url.replace(/^\//, "")}.html`);
}

function privateSpaShell(html) {
  return html.replace(
    /<meta\s+name="robots"\s+content="[^"]*"\s*\/>/i,
    '<meta name="robots" content="noindex,nofollow,noarchive" />',
  );
}

const baseUrl = canonicalBaseUrl();
const explicitNoindex = process.env.PUBLIC_SITE_NOINDEX ?? process.env.SITE_NOINDEX;
const siteNoindex = booleanEnv(explicitNoindex) || (
  process.env.VERCEL_ENV !== undefined && process.env.VERCEL_ENV !== "production"
);

// Preserve the empty, noindex SPA shell for auth-protected routes. This keeps
// landing markup out of /app and avoids changing dashboard/auth rendering.
fs.writeFileSync(path.join(dist, "spa.html"), privateSpaShell(shell));

const routes = prerenderRoutes();
for (const route of routes) {
  const body = await render(route.url, route.locale);
  if (!body.includes("<h1")) {
    throw new Error(`prerender check failed for ${route.url}: expected a server-rendered h1`);
  }
  if (route.basePath !== "/login" && !body.includes("<main")) {
    throw new Error(`prerender check failed for ${route.url}: expected semantic main content`);
  }
  const rendered = shell
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`)
    .replace(/<html lang="[^"]*"/, `<html lang="${route.locale}"`);
  const html = injectPublicHead(
    rendered,
    baseUrl,
    route.basePath,
    route.locale,
    siteNoindex,
  );
  const outPath = outputPath(route.url);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);
  console.log(`prerendered ${route.url} → ${path.relative(clientRoot, outPath)} (${body.length} bytes of body)`);
}

const crawlResources = {
  "robots.txt": robotsText(baseUrl, siteNoindex),
  "sitemap.xml": sitemapXml(baseUrl, siteNoindex),
  "llms.txt": llmsText(baseUrl),
  "llms-full.txt": llmsFullText(baseUrl),
};
for (const [name, content] of Object.entries(crawlResources)) {
  fs.writeFileSync(path.join(dist, name), `${content}\n`);
}

const home = fs.readFileSync(path.join(dist, "index.html"), "utf8");
if (!home.includes(`<link rel="canonical" href="${baseUrl}/">`)) {
  throw new Error("prerender check failed: homepage canonical is missing");
}
if (!home.includes('type="application/ld+json"')) {
  throw new Error("prerender check failed: homepage structured data is missing");
}
if (!fs.readFileSync(path.join(dist, "sitemap.xml"), "utf8").includes(`${baseUrl}/methodology`)) {
  throw new Error("prerender check failed: sitemap is missing canonical public routes");
}
console.log(`generated crawl resources for ${baseUrl}${siteNoindex ? " (noindex deployment)" : ""}`);
