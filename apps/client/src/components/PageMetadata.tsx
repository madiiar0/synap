import { useEffect } from "react";
import {
  localizedPublicPath,
  landingFaqItems,
  publicFaqItems,
  routeMeta,
  SOCIAL_IMAGE_ALT,
  structuredDataForRoute,
  type Locale,
  type PublicPath,
} from "@synapai/shared";

function upsertMeta(selector: string, attrs: Record<string, string>): void {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.dataset.synapManaged = "true";
    document.head.appendChild(el);
  }
  for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, value);
}

function upsertLink(selector: string, attrs: Record<string, string>): void {
  let el = document.head.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement("link");
    el.dataset.synapManaged = "true";
    document.head.appendChild(el);
  }
  for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, value);
}

/** Keep metadata correct after client-side navigation; direct requests are injected server-side. */
export function PublicPageMetadata({ path, locale }: { path: PublicPath; locale: Locale }): null {
  useEffect(() => {
    const meta = routeMeta(path, locale);
    const base = window.location.origin;
    const canonical = `${base}${localizedPublicPath(path, locale)}`;
    const ruUrl = `${base}${localizedPublicPath(path, "ru")}`;
    const enUrl = `${base}${localizedPublicPath(path, "en")}`;
    const description = meta.description;
    const image = `${base}/og-image.png`;

    document.title = meta.title;
    document.documentElement.lang = locale;
    const stagingNoindex = document.documentElement.dataset.siteNoindex === "true";
    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertMeta('meta[name="robots"]', {
      name: "robots",
      content:
        meta.indexable && !stagingNoindex
          ? "index,follow,max-image-preview:large"
          : stagingNoindex || path === "/login"
            ? "noindex,nofollow,noarchive"
            : "noindex,follow,noarchive",
    });
    upsertLink('link[rel="canonical"]', { rel: "canonical", href: canonical });
    for (const [hreflang, href] of [["ru", ruUrl], ["en", enUrl], ["x-default", ruUrl]]) {
      upsertLink(`link[rel="alternate"][hreflang="${hreflang}"]`, {
        rel: "alternate",
        hreflang,
        href,
      });
    }
    const og: Array<[string, string]> = [
      ["og:type", meta.kind === "article" ? "article" : "website"],
      ["og:site_name", "Synap"],
      ["og:title", meta.title],
      ["og:description", description],
      ["og:url", canonical],
      ["og:image", image],
      ["og:image:alt", SOCIAL_IMAGE_ALT[locale]],
      ["og:locale", locale === "ru" ? "ru_RU" : "en_US"],
      ["og:locale:alternate", locale === "ru" ? "en_US" : "ru_RU"],
    ];
    for (const [property, content] of og) {
      upsertMeta(`meta[property="${property}"]`, { property, content });
    }
    const twitter: Array<[string, string]> = [
      ["twitter:card", "summary_large_image"],
      ["twitter:title", meta.title],
      ["twitter:description", description],
      ["twitter:image", image],
      ["twitter:image:alt", SOCIAL_IMAGE_ALT[locale]],
    ];
    for (const [name, content] of twitter) {
      upsertMeta(`meta[name="${name}"]`, { name, content });
    }

    let script = document.head.querySelector<HTMLScriptElement>("#synap-structured-data");
    if (!script) {
      script = document.createElement("script");
      script.id = "synap-structured-data";
      script.type = "application/ld+json";
      script.dataset.synapManaged = "true";
      document.head.appendChild(script);
    }
    const faq = path === "/" ? landingFaqItems(locale) : path === "/faq" ? publicFaqItems(locale) : [];
    script.textContent = JSON.stringify(structuredDataForRoute(base, path, locale, faq));
  }, [locale, path]);
  return null;
}

/** Prevent stale public metadata after navigation into an authenticated route. */
export function PrivatePageMetadata({ title }: { title: string }): null {
  useEffect(() => {
    document.title = `${title} | Synap`;
    upsertMeta('meta[name="robots"]', { name: "robots", content: "noindex,nofollow,noarchive" });
    document.head.querySelectorAll('link[rel="canonical"], link[rel="alternate"][hreflang]')
      .forEach((node) => node.remove());
    document.head.querySelector("#synap-structured-data")?.remove();
  }, [title]);
  return null;
}
