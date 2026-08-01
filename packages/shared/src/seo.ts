import { AI_PLATFORMS } from "./aiPlatforms.js";
import type { Locale } from "./constants.js";

// §1 (iteration 5): /scan is gone; the only entry point is sign-in.
export type PublicPath = "/" | "/login";
export const PUBLIC_PATHS: readonly PublicPath[] = ["/", "/login"];

export interface RouteMeta {
  title: string;
  description: string;
}

const META: Record<PublicPath, Record<Locale, RouteMeta>> = {
  "/": {
    ru: {
      title: "SynapAI | Узнайте, рекомендует ли ИИ ваш бизнес",
      description:
        "Бесплатная проверка: как ChatGPT, Gemini, Claude, Perplexity, DeepSeek и Grok отвечают на вопросы ваших клиентов. Индекс видимости 0-100 и список конкурентов.",
    },
    en: {
      title: "SynapAI | See whether AI recommends your business",
      description:
        "A free check: how ChatGPT, Gemini, Claude, Perplexity, DeepSeek and Grok answer your customers' questions. A 0-100 Visibility Score and your competitor list.",
    },
  },
  "/login": {
    ru: {
      title: "SynapAI | Вход и создание аккаунта",
      description:
        "Войдите или создайте аккаунт, чтобы открыть отчёт о видимости вашего бизнеса в ответах ИИ.",
    },
    en: {
      title: "SynapAI | Sign in or create an account",
      description:
        "Sign in or create an account to open the report on your business's visibility in AI answers.",
    },
  },
};

export function routeMeta(path: PublicPath, locale: Locale): RouteMeta {
  return META[path][locale];
}

/** /login + en → /en/login; / + en → /en */
export function localizedPublicPath(path: PublicPath, locale: Locale): string {
  if (locale === "ru") return path;
  return path === "/" ? "/en" : `/en${path}`;
}

// ---- JSON-LD builders (§1.3) ----

export function organizationLd(baseUrl: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SynapAI",
    url: baseUrl,
    logo: `${baseUrl}/icon-512.png`,
    sameAs: [],
  };
}

export function softwareApplicationLd(baseUrl: string, locale: Locale): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SynapAI",
    url: baseUrl,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: META["/"][locale].description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: locale === "ru" ? "Бесплатный скан видимости" : "Free visibility scan",
    },
  };
}

export function webSiteLd(baseUrl: string, locale: Locale): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SynapAI",
    url: baseUrl,
    inLanguage: locale,
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function faqLd(items: FaqItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/** The six scanned engines, for llms.txt and structured descriptions. */
export function scannedEngineNames(): string[] {
  return AI_PLATFORMS.filter((p) => p.scannable).map((p) => p.name);
}
