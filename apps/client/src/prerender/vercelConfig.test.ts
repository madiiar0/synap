import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { LEGACY_PUBLIC_REDIRECTS, localizedPublicPath } from "@synapai/shared";
import { prerenderRoutes } from "./entry";

const clientRoot = path.resolve(import.meta.dirname, "../..");
const config = JSON.parse(
  fs.readFileSync(path.join(clientRoot, "vercel.json"), "utf8"),
) as {
  cleanUrls?: boolean;
  trailingSlash?: boolean;
  redirects?: Array<{ source: string; destination: string; permanent?: boolean }>;
  headers?: Array<{ source: string; headers: Array<{ key: string; value: string }> }>;
  rewrites?: Array<{ source: string; destination: string }>;
};

describe("Vercel public-site routing", () => {
  it("maps flat prerendered HTML to canonical clean URLs and preserves the private SPA", () => {
    expect(config.cleanUrls).toBe(true);
    expect(config.trailingSlash).toBe(false);
    expect(prerenderRoutes().find((route) => route.url === "/")?.out).toBe("index.html");
    expect(prerenderRoutes().find((route) => route.url === "/en/about")?.out).toBe(
      "en/about.html",
    );
    expect(config.rewrites).toEqual([
      {
        source: "/api/:path*",
        destination: "/api/bridge?__synap_path=:path*",
      },
      {
        source: "/:path((?!api(?:/|$)).*)",
        destination: "/spa",
      },
    ]);
  });

  it("turns every localized legacy route into a permanent server redirect", () => {
    const expected = LEGACY_PUBLIC_REDIRECTS.flatMap(({ from, to }) => [
      { source: from, destination: localizedPublicPath(to, "ru"), permanent: true },
      { source: `/en${from}`, destination: localizedPublicPath(to, "en"), permanent: true },
    ]);
    expect(config.redirects).toEqual(expected);
  });

  it("assigns crawler content types and noindex headers to private route families", () => {
    const robots = config.headers?.find(({ source }) => source === "/robots.txt");
    const sitemap = config.headers?.find(({ source }) => source === "/sitemap.xml");
    const privateRoutes = config.headers?.find(
      ({ source }) => source === "/:private(app|admin|scan)/:path*",
    );

    expect(robots?.headers).toContainEqual({
      key: "Content-Type",
      value: "text/plain; charset=utf-8",
    });
    expect(sitemap?.headers).toContainEqual({
      key: "Content-Type",
      value: "application/xml; charset=utf-8",
    });
    expect(privateRoutes?.headers).toContainEqual({
      key: "X-Robots-Tag",
      value: "noindex, nofollow, noarchive",
    });
  });
});
