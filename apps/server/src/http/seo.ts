import fs from "node:fs";
import path from "node:path";
import type { Express, Request, Response } from "express";
import {
  buildPublicHeadTags,
  injectPublicHead,
  LEGACY_PUBLIC_REDIRECTS,
  llmsFullText,
  llmsText,
  localizedPublicPath,
  PUBLIC_PATHS,
  robotsText,
  routeMeta,
  sitemapXml,
  type Locale,
  type PublicPath,
} from "@synapai/shared";
import { env, repoRoot } from "../config/env.js";

const CLIENT_DIST = path.join(repoRoot, "apps/client/dist");

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

/** One complete, route-specific head block for runtime HTML and client checks. */
export function buildHeadTags(basePath: PublicPath, locale: Locale): string {
  return buildPublicHeadTags(
    env.APP_BASE_URL,
    basePath,
    locale,
    env.SITE_NOINDEX,
  );
}

/** Inject route metadata and language into a prerendered HTML document. */
export function injectHead(html: string, basePath: PublicPath, locale: Locale): string {
  return injectPublicHead(
    html,
    env.APP_BASE_URL,
    basePath,
    locale,
    env.SITE_NOINDEX,
  );
}

function prerenderedPath(urlPath: string): string {
  return path.join(CLIENT_DIST, urlPath === "/" ? "index.html" : `${urlPath.slice(1)}.html`);
}

function shellFor(route: PublicRoute): string | null {
  const prerendered = prerenderedPath(route.urlPath);
  if (fs.existsSync(prerendered)) return fs.readFileSync(prerendered, "utf8");
  const shell = path.join(CLIENT_DIST, "spa.html");
  if (fs.existsSync(shell)) return fs.readFileSync(shell, "utf8");
  return null;
}

export { llmsFullText, llmsText, robotsText, sitemapXml };

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
        res.setHeader(
          "X-Robots-Tag",
          env.SITE_NOINDEX || route.basePath === "/login"
            ? "noindex, nofollow, noarchive"
            : "noindex, follow, noarchive",
        );
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
