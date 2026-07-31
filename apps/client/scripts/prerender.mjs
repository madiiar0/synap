/**
 * Post-build prerender (§1.1): renders the public routes (RU + EN) through
 * the SSR entry and writes static HTML into dist/prerendered/. The server
 * serves these files (injecting per-route meta at request time).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const clientRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(clientRoot, "dist");
const outDir = path.join(dist, "prerendered");

const { render } = await import(path.join(clientRoot, "dist-ssr/entry.js"));

const shell = fs.readFileSync(path.join(dist, "index.html"), "utf8");

const ROUTES = [
  { url: "/", locale: "ru", out: "index.html", mustContain: "Станьте ответом" },
  { url: "/scan", locale: "ru", out: "scan/index.html", mustContain: "Проверьте свой бизнес" },
  { url: "/login", locale: "ru", out: "login/index.html", mustContain: "аккаунт" },
  { url: "/en", locale: "en", out: "en/index.html", mustContain: "Be the answer in" },
  { url: "/en/scan", locale: "en", out: "en/scan/index.html", mustContain: "Check your business" },
  { url: "/en/login", locale: "en", out: "en/login/index.html", mustContain: "account" },
];

for (const route of ROUTES) {
  const body = await render(route.url, route.locale);
  if (!body.includes(route.mustContain)) {
    throw new Error(
      `prerender check failed for ${route.url}: expected body to contain "${route.mustContain}"`,
    );
  }
  const html = shell
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`)
    .replace(/<html lang="[^"]*"/, `<html lang="${route.locale}"`);
  const outPath = path.join(outDir, route.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);
  console.log(`prerendered ${route.url} → ${path.relative(clientRoot, outPath)} (${body.length} bytes of body)`);
}
