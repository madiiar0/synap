import { ENGINE_LABELS, type EngineId } from "./engines.js";
import type { Locale } from "./constants.js";
import enTranslations from "./i18n/en.json" with { type: "json" };
import ruTranslations from "./i18n/ru.json" with { type: "json" };

/**
 * Public information architecture. Keep this registry authoritative: routing,
 * prerendering, metadata, hreflang, the sitemap, llms.txt and SEO tests all
 * consume it so a page cannot silently become orphaned.
 */
export const INDEXABLE_PUBLIC_PATHS = [
  "/",
  "/product",
  "/services",
  "/how-it-works",
  "/methodology",
  "/ai-visibility",
  "/generative-engine-optimization",
  "/use-cases",
  "/use-cases/local-businesses",
  "/use-cases/saas",
  "/use-cases/ecommerce",
  "/use-cases/professional-services",
  "/pricing",
  "/faq",
  "/about",
  "/contact",
  "/docs",
  "/blogs",
  "/blogs/audit-ai-generated-brand-information",
  "/blogs/why-ai-recommends-competitors",
  "/changelog",
  "/privacy",
  "/terms",
] as const;

export const NOINDEX_PUBLIC_PATHS = ["/login"] as const;
export const PUBLIC_PATHS = [...INDEXABLE_PUBLIC_PATHS, ...NOINDEX_PUBLIC_PATHS] as const;

export type IndexablePublicPath = (typeof INDEXABLE_PUBLIC_PATHS)[number];
export type PublicPath = (typeof PUBLIC_PATHS)[number];

export const LEGACY_PUBLIC_REDIRECTS = [
  { from: "/guides", to: "/blogs" },
  {
    from: "/guides/audit-ai-brand-information",
    to: "/blogs/audit-ai-generated-brand-information",
  },
  {
    from: "/guides/why-ai-recommends-competitors",
    to: "/blogs/why-ai-recommends-competitors",
  },
] as const satisfies ReadonlyArray<{ from: string; to: IndexablePublicPath }>;

export type LegacyPublicPath = (typeof LEGACY_PUBLIC_REDIRECTS)[number]["from"];
export type PageKind =
  | "home"
  | "product"
  | "methodology"
  | "article"
  | "faq"
  | "about"
  | "contact"
  | "docs"
  | "pricing"
  | "webpage"
  | "login";

export interface RouteMeta {
  title: string;
  description: string;
  kind: PageKind;
  indexable: boolean;
  /** ISO date backed by the checked-in content revision. */
  lastModified?: string;
}

export const PRODUCT_POSITIONING: Record<Locale, {
  sentence: string;
  short: string;
  full: string;
}> = {
  en: {
    sentence:
      "Synap gives Kazakhstan businesses a free audit of how they appear in AI-generated answers, followed by human-led improvement support. AI placement is not guaranteed.",
    short:
      "Synap gives Kazakhstan businesses a free audit of how they appear in AI-generated answers, followed by human-led improvement support. AI placement is not guaranteed.",
    full:
      "Synap is a human-assisted AI-visibility audit and improvement service for businesses in Kazakhstan. The free audit provides a dated sample of how a business appears in supported AI-generated answers, including visibility metrics, branded recognition, competitors, answer-level positions and cited sources. Business owners can review the private report and book a call with Synap. The team then plans and manually carries out agreed improvement work. AI answers vary by model, wording, date and retrieved sources, so Synap does not guarantee indexing, mentions, citations, rankings or recommendations.",
  },
  ru: {
    sentence:
      "Synap бесплатно проверяет, как бизнес в Казахстане представлен в ответах ИИ, а затем команда вручную помогает с улучшениями. Позиции в ИИ не гарантируются.",
    short:
      "Synap бесплатно проверяет, как бизнес в Казахстане представлен в ответах ИИ, а затем команда вручную помогает с улучшениями. Позиции в ИИ не гарантируются.",
    full:
      "Synap — сервис аудита и улучшения видимости бизнеса в ответах ИИ для компаний Казахстана с участием команды специалистов. Бесплатный аудит показывает датированную выборку ответов поддерживаемых ИИ-моделей, включая метрики видимости, узнаваемость бренда, конкурентов, позиции в отдельных ответах и процитированные источники. Владелец бизнеса может изучить закрытый отчёт и записаться на созвон с Synap. Затем команда составляет и вручную выполняет согласованный план улучшений. Ответы ИИ зависят от модели, формулировки, даты и найденных источников, поэтому Synap не гарантирует индексацию, упоминания, цитирование, позиции или рекомендации.",
  },
};

export const SOCIAL_IMAGE_ALT: Record<Locale, string> = {
  en: "Synap — AI-visibility audit and human-assisted improvement in Kazakhstan",
  ru: "Synap — аудит и улучшение видимости бизнеса в ИИ в Казахстане",
};

const UPDATED = "2026-08-02";

const META: Record<PublicPath, Record<Locale, Omit<RouteMeta, "indexable">>> = {
  "/": {
    en: {
      title: "Synap — Improve AI Visibility in Kazakhstan",
      description:
        "Get a free audit of how your business appears in AI answers. Synap’s team helps Kazakhstan businesses carry out agreed improvements; AI placement is not guaranteed.",
      kind: "home",
      lastModified: UPDATED,
    },
    ru: {
      title: "Synap — улучшение видимости бизнеса в ИИ в Казахстане",
      description:
        "Получите бесплатный аудит представленности бизнеса в ответах ИИ. Команда Synap помогает компаниям Казахстана с улучшениями; позиции в ИИ не гарантируются.",
      kind: "home",
      lastModified: UPDATED,
    },
  },
  "/product": {
    en: {
      title: "AI Visibility Audit for Kazakhstan | Synap",
      description:
        "Review the dated answers and visibility metrics included in Synap’s free Kazakhstan audit. Human-assisted improvement work is scoped separately after a call.",
      kind: "product",
      lastModified: UPDATED,
    },
    ru: {
      title: "Аудит видимости бизнеса в ИИ в Казахстане | Synap",
      description:
        "Изучите ответы и метрики бесплатного аудита Synap для бизнеса Казахстана. Дальнейшая работа команды согласовывается отдельно после созвона.",
      kind: "product",
      lastModified: UPDATED,
    },
  },
  "/services": {
    en: {
      title: "AI Visibility Services in Kazakhstan — Synap",
      description:
        "Start with a free, dated AI-visibility audit, then review separately scoped human-assisted improvement work for your business in Kazakhstan.",
      kind: "webpage",
      lastModified: "2026-08-03",
    },
    ru: {
      title: "Услуги по улучшению видимости бизнеса в ИИ в Казахстане — Synap",
      description:
        "Начните с бесплатного датированного аудита видимости в ИИ и обсудите отдельно согласуемые работы команды для бизнеса в Казахстане.",
      kind: "webpage",
      lastModified: "2026-08-03",
    },
  },
  "/how-it-works": {
    en: {
      title: "How Synap Visibility Scans Work | Synap",
      description:
        "Follow a Synap scan from business research and prompt generation through model requests, entity extraction, scoring and the final visibility report.",
      kind: "webpage",
      lastModified: UPDATED,
    },
    ru: {
      title: "Как работает проверка видимости в ИИ | Synap",
      description:
        "Проследите путь проверки Synap: исследование бизнеса, генерация вопросов, запросы к моделям, извлечение сущностей, расчёт и итоговый отчёт.",
      kind: "webpage",
      lastModified: UPDATED,
    },
  },
  "/methodology": {
    en: {
      title: "AI Visibility Scoring Methodology | Synap",
      description:
        "Read the factual Synap methodology for prompts, mentions, positions, competitors, failed requests, Visibility Score, Share of Voice and metric versions.",
      kind: "methodology",
      lastModified: UPDATED,
    },
    ru: {
      title: "Методология расчёта видимости в ИИ | Synap",
      description:
        "Методология Synap: вопросы, упоминания, позиции, конкуренты, ошибки запросов, Индекс видимости, доля голоса и версии метрик.",
      kind: "methodology",
      lastModified: UPDATED,
    },
  },
  "/ai-visibility": {
    en: {
      title: "What Is AI Visibility? Measurement Guide | Synap",
      description:
        "AI visibility describes whether and how a business appears in generated answers. Learn how it differs from SEO rankings and how to measure it responsibly.",
      kind: "article",
      lastModified: UPDATED,
    },
    ru: {
      title: "Что такое видимость в ИИ и как её измерять | Synap",
      description:
        "Видимость в ИИ показывает, появляется ли бизнес в сгенерированных ответах и как именно. Разбираем отличие от SEO и корректное измерение.",
      kind: "article",
      lastModified: UPDATED,
    },
  },
  "/generative-engine-optimization": {
    en: {
      title: "Generative Engine Optimization (GEO) Guide | Synap",
      description:
        "Learn what Generative Engine Optimization means, how it relates to technical SEO and entity clarity, and which measurable actions improve answer visibility.",
      kind: "article",
      lastModified: UPDATED,
    },
    ru: {
      title: "Что такое Generative Engine Optimization (GEO) | Synap",
      description:
        "Что означает GEO, как оно связано с техническим SEO и ясностью сущности и какие измеримые действия улучшают видимость в ответах ИИ.",
      kind: "article",
      lastModified: UPDATED,
    },
  },
  "/use-cases": {
    en: {
      title: "AI Visibility Use Cases by Business Type | Synap",
      description:
        "Explore practical AI visibility measurement for local businesses, SaaS teams, ecommerce brands and professional services without generic doorway content.",
      kind: "webpage",
      lastModified: UPDATED,
    },
    ru: {
      title: "Сценарии аналитики видимости в ИИ | Synap",
      description:
        "Практические сценарии измерения видимости для локального бизнеса, SaaS, электронной торговли и профессиональных услуг без шаблонных страниц.",
      kind: "webpage",
      lastModified: UPDATED,
    },
  },
  "/use-cases/local-businesses": {
    en: {
      title: "AI Visibility for Local Businesses | Synap",
      description:
        "Measure whether AI answers recommend a local business for category-and-city questions, which competitors appear and which public sources shape the answer.",
      kind: "article",
      lastModified: UPDATED,
    },
    ru: {
      title: "Видимость локального бизнеса в ответах ИИ | Synap",
      description:
        "Измеряйте рекомендации локального бизнеса по запросам категории и города, появление конкурентов и публичные источники, формирующие ответ.",
      kind: "article",
      lastModified: UPDATED,
    },
  },
  "/use-cases/saas": {
    en: {
      title: "AI Visibility Analytics for SaaS Companies | Synap",
      description:
        "Audit a dated sample of how AI answers describe a SaaS product, surface it for unbranded questions, compare alternatives and cite documentation.",
      kind: "article",
      lastModified: UPDATED,
    },
    ru: {
      title: "Аналитика видимости SaaS-продуктов в ИИ | Synap",
      description:
        "Проверьте датированную выборку ответов: как ИИ описывает SaaS-продукт, показывает его по небрендовым вопросам и цитирует документацию.",
      kind: "article",
      lastModified: UPDATED,
    },
  },
  "/use-cases/ecommerce": {
    en: {
      title: "AI Visibility Analytics for Ecommerce Brands | Synap",
      description:
        "Audit whether AI answers mention an ecommerce brand for product-discovery questions, which retailers or rivals appear and what evidence is cited.",
      kind: "article",
      lastModified: UPDATED,
    },
    ru: {
      title: "Аналитика видимости ecommerce-брендов в ИИ | Synap",
      description:
        "Проверяйте упоминания ecommerce-бренда в вопросах о выборе товаров, появление продавцов и конкурентов и источники, на которые ссылается ИИ.",
      kind: "article",
      lastModified: UPDATED,
    },
  },
  "/use-cases/professional-services": {
    en: {
      title: "AI Visibility for Professional Services | Synap",
      description:
        "Measure AI recommendations for legal, healthcare, real-estate, education and other expertise-led services while accounting for location and trust signals.",
      kind: "article",
      lastModified: UPDATED,
    },
    ru: {
      title: "Видимость профессиональных услуг в ответах ИИ | Synap",
      description:
        "Измеряйте рекомендации юридических, медицинских, образовательных и других экспертных услуг с учётом географии и сигналов доверия.",
      kind: "article",
      lastModified: UPDATED,
    },
  },
  "/pricing": {
    en: {
      title: "Synap Pricing and Free AI Visibility Scan",
      description:
        "Synap offers free visibility scans subject to account limits. Improvement planning and implementation are scoped separately after a review call.",
      kind: "pricing",
      lastModified: UPDATED,
    },
    ru: {
      title: "Тарифы Synap и бесплатная проверка видимости",
      description:
        "Synap предлагает бесплатные проверки с лимитами аккаунта. План улучшений и внедрение оцениваются отдельно после разбора результатов.",
      kind: "pricing",
      lastModified: UPDATED,
    },
  },
  "/faq": {
    en: {
      title: "Synap Frequently Asked Questions",
      description:
        "Answers about Synap scans, supported model families, Visibility Score, Share of Voice, data variability, privacy, availability and pricing.",
      kind: "faq",
      lastModified: UPDATED,
    },
    ru: {
      title: "Частые вопросы о Synap",
      description:
        "Ответы о проверках Synap, поддерживаемых моделях, Индексе видимости, доле голоса, изменчивости данных, приватности, доступности и цене.",
      kind: "faq",
      lastModified: UPDATED,
    },
  },
  "/about": {
    en: {
      title: "About Synap — AI Visibility Service in Kazakhstan",
      description:
        "Learn how Synap combines a free, dated AI-visibility audit with separately scoped human-assisted improvement work for businesses in Kazakhstan.",
      kind: "about",
      lastModified: UPDATED,
    },
    ru: {
      title: "О Synap — сервисе видимости бизнеса в ИИ в Казахстане",
      description:
        "Узнайте, как Synap сочетает бесплатный датированный аудит видимости в ИИ с отдельно согласуемой помощью команды для бизнеса Казахстана.",
      kind: "about",
      lastModified: UPDATED,
    },
  },
  "/contact": {
    en: {
      title: "Contact Synap",
      description:
        "Contact Synap about product access, a visibility report, support or an implementation review. Do not send credentials or private customer scan data.",
      kind: "contact",
      lastModified: UPDATED,
    },
    ru: {
      title: "Связаться с Synap",
      description:
        "Свяжитесь с Synap по вопросам доступа, отчёта, поддержки или разбора внедрения. Не отправляйте пароли и приватные данные клиентских проверок.",
      kind: "contact",
      lastModified: UPDATED,
    },
  },
  "/docs": {
    en: {
      title: "AI Visibility Audit Documentation | Synap",
      description:
        "Learn to create a business profile, run and repeat a scan, read Visibility Score and provider results, inspect answers, prompts, competitors and Share of Voice.",
      kind: "docs",
      lastModified: UPDATED,
    },
    ru: {
      title: "Документация по аудиту видимости Synap",
      description:
        "Как создать профиль, запустить и повторить проверку, прочитать Индекс видимости и результаты моделей, изучить ответы, вопросы и конкурентов.",
      kind: "docs",
      lastModified: UPDATED,
    },
  },
  "/blogs": {
    en: {
      title: "Synap Blog — AI Visibility in Kazakhstan",
      description:
        "Practical Synap articles about auditing AI-generated brand information, understanding competitor recommendations and improving AI visibility in Kazakhstan.",
      kind: "webpage",
      lastModified: "2026-08-03",
    },
    ru: {
      title: "Блог Synap — видимость бизнеса в ответах ИИ",
      description:
        "Практические статьи Synap об аудите информации о бренде, причинах рекомендаций конкурентов и улучшении видимости бизнеса в ответах ИИ в Казахстане.",
      kind: "webpage",
      lastModified: "2026-08-03",
    },
  },
  "/blogs/audit-ai-generated-brand-information": {
    en: {
      title: "How to Audit AI-Generated Brand Information | Synap",
      description:
        "A repeatable audit for checking whether AI answers identify a business correctly, describe it consistently, cite reliable sources and confuse it with other entities.",
      kind: "article",
      lastModified: UPDATED,
    },
    ru: {
      title: "Как проверить информацию о бренде в ответах ИИ | Synap",
      description:
        "Повторяемый аудит: правильно ли ИИ распознаёт бизнес, последовательно ли описывает его, ссылается ли на надёжные источники и путает ли сущности.",
      kind: "article",
      lastModified: UPDATED,
    },
  },
  "/blogs/why-ai-recommends-competitors": {
    en: {
      title: "Why AI Answers Recommend Competitors | Synap",
      description:
        "Learn why competitors may appear in AI recommendations, how to separate evidence gaps from model variability and which corrective actions can be verified.",
      kind: "article",
      lastModified: UPDATED,
    },
    ru: {
      title: "Почему ИИ рекомендует конкурентов | Synap",
      description:
        "Почему конкуренты появляются в рекомендациях ИИ, как отличить нехватку подтверждений от изменчивости модели и какие действия можно проверить.",
      kind: "article",
      lastModified: UPDATED,
    },
  },
  "/changelog": {
    en: {
      title: "Synap Product Changelog",
      description:
        "Dated, factual updates to Synap product behavior, methodology and public documentation. Entries are added only for changes verified in the product repository.",
      kind: "webpage",
      lastModified: UPDATED,
    },
    ru: {
      title: "История обновлений Synap",
      description:
        "Датированные фактические обновления продукта, методологии и публичной документации Synap. Записи добавляются только для подтверждённых изменений.",
      kind: "webpage",
      lastModified: UPDATED,
    },
  },
  "/privacy": {
    en: {
      title: "Synap Privacy Policy",
      description:
        "Understand which account, business, scan and contact data Synap processes, why private reports remain access-controlled and what is included in public resources.",
      kind: "webpage",
      lastModified: UPDATED,
    },
    ru: {
      title: "Политика конфиденциальности Synap",
      description:
        "Какие данные аккаунта, бизнеса, проверок и обращений обрабатывает Synap, почему отчёты закрыты и какая информация публикуется для индексации.",
      kind: "webpage",
      lastModified: UPDATED,
    },
  },
  "/terms": {
    en: {
      title: "Synap Terms of Service",
      description:
        "Terms for using Synap scans and reports, including account responsibilities, acceptable use, AI-answer limitations, availability and intellectual property.",
      kind: "webpage",
      lastModified: UPDATED,
    },
    ru: {
      title: "Условия использования Synap",
      description:
        "Условия использования проверок и отчётов Synap: обязанности аккаунта, допустимое использование, ограничения ответов ИИ, доступность и права.",
      kind: "webpage",
      lastModified: UPDATED,
    },
  },
  "/login": {
    en: {
      title: "Sign in to Synap",
      description:
        "Sign in or create a Synap account to run a private AI visibility scan and view your business report.",
      kind: "login",
    },
    ru: {
      title: "Вход в Synap",
      description:
        "Войдите или создайте аккаунт Synap, чтобы запустить приватную проверку видимости бизнеса в ИИ и открыть отчёт.",
      kind: "login",
    },
  },
};

export function isPublicPath(path: string): path is PublicPath {
  return (PUBLIC_PATHS as readonly string[]).includes(path);
}

export function isIndexablePublicPath(path: PublicPath): path is IndexablePublicPath {
  return (INDEXABLE_PUBLIC_PATHS as readonly string[]).includes(path);
}

export function routeMeta(path: PublicPath, locale: Locale): RouteMeta {
  return { ...META[path][locale], indexable: isIndexablePublicPath(path) };
}

/** /methodology + en → /en/methodology; / + en → /en. */
export function localizedPublicPath(path: PublicPath, locale: Locale): string {
  if (locale === "ru") return path;
  return path === "/" ? "/en" : `/en${path}`;
}

/** Resolve a request path back to its locale-neutral registry path. */
export function parseLocalizedPublicPath(pathname: string): {
  path: PublicPath;
  locale: Locale;
} | null {
  const normalized = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  const locale: Locale = normalized === "/en" || normalized.startsWith("/en/") ? "en" : "ru";
  const base = locale === "en" ? (normalized === "/en" ? "/" : normalized.slice(3)) : normalized;
  return isPublicPath(base) ? { path: base, locale } : null;
}

export interface FaqItem {
  question: string;
  answer: string;
}

/** Homepage FAQ copy comes from the same localization keys rendered by FaqSection. */
export function landingFaqItems(locale: Locale): FaqItem[] {
  const faq = locale === "ru" ? ruTranslations.landing.faq : enTranslations.landing.faq;
  return [1, 2, 3, 4, 5, 6].map((number) => ({
    question: faq[`q${number}` as keyof typeof faq],
    answer: faq[`a${number}` as keyof typeof faq],
  }));
}

export function faqLd(items: FaqItem[]): Record<string, unknown> {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

function cleanBase(baseUrl: string): string {
  return baseUrl.replace(/\/$/, "");
}

export function organizationLd(baseUrl: string, locale: Locale = "en"): Record<string, unknown> {
  const base = cleanBase(baseUrl);
  return {
    "@type": "Organization",
    "@id": `${base}/#organization`,
    name: "Synap",
    url: base,
    logo: {
      "@type": "ImageObject",
      "@id": `${base}/#logo`,
      url: `${base}/icon-512.png`,
      width: 512,
      height: 512,
      caption: "Synap",
    },
    description: PRODUCT_POSITIONING[locale].short,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: `${base}/contact`,
      availableLanguage: ["English", "Russian"],
    },
  };
}

export function webSiteLd(baseUrl: string, locale: Locale = "en"): Record<string, unknown> {
  const base = cleanBase(baseUrl);
  return {
    "@type": "WebSite",
    "@id": `${base}/#website`,
    name: "Synap",
    url: base,
    description: PRODUCT_POSITIONING[locale].short,
    inLanguage: ["en", "ru"],
    publisher: { "@id": `${base}/#organization` },
  };
}

export function serviceLd(baseUrl: string, locale: Locale): Record<string, unknown> {
  const base = cleanBase(baseUrl);
  return {
    "@type": "Service",
    "@id": `${base}/#service`,
    name: "Synap",
    url: `${base}${localizedPublicPath("/", locale)}`,
    mainEntityOfPage: `${base}${localizedPublicPath("/", locale)}`,
    serviceType:
      locale === "ru"
        ? "Бесплатный аудит видимости бизнеса в ИИ и отдельно согласуемая помощь команды"
        : "Free AI-visibility audit with separately scoped human-assisted improvement",
    areaServed: {
      "@type": "Country",
      name: locale === "ru" ? "Казахстан" : "Kazakhstan",
    },
    provider: { "@id": `${base}/#organization` },
    description: PRODUCT_POSITIONING[locale].full,
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: `${base}${localizedPublicPath("/contact", locale)}`,
      availableLanguage: locale === "ru" ? "Russian" : "English",
    },
  };
}

export function softwareApplicationLd(baseUrl: string, locale: Locale): Record<string, unknown> {
  const base = cleanBase(baseUrl);
  const features: Record<Locale, string[]> = {
    en: [
      "Unbranded AI Visibility Score",
      "Branded recognition diagnostic",
      "Provider-level answer analysis",
      "Competitor and Share of Voice analysis",
      "Prompt and citation review",
    ],
    ru: [
      "Индекс видимости по небрендовым вопросам",
      "Отдельная диагностика узнаваемости бренда",
      "Анализ ответов по моделям",
      "Анализ конкурентов и доли голоса",
      "Просмотр вопросов и источников",
    ],
  };
  const descriptions: Record<Locale, string> = {
    en: "The browser-based Synap audit interface lets authenticated business owners review a private, dated sample of supported AI-generated answers and related visibility metrics.",
    ru: "Браузерный интерфейс аудита Synap позволяет авторизованному владельцу бизнеса изучить закрытую датированную выборку ответов поддерживаемых ИИ-моделей и связанные метрики видимости.",
  };
  return {
    "@type": "SoftwareApplication",
    "@id": `${base}/#audit-application`,
    name: locale === "ru" ? "Интерфейс аудита Synap" : "Synap audit interface",
    url: `${base}${localizedPublicPath("/product", locale)}`,
    mainEntityOfPage: `${base}${localizedPublicPath("/product", locale)}`,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "AI visibility audit and report interface",
    operatingSystem: "Web browser",
    browserRequirements: "A modern browser with JavaScript enabled for authenticated reports",
    isAccessibleForFree: true,
    description: descriptions[locale],
    featureList: features[locale],
    isPartOf: { "@id": `${base}/#service` },
    publisher: { "@id": `${base}/#organization` },
  };
}

function pageSchemaType(kind: PageKind): string {
  if (kind === "about") return "AboutPage";
  if (kind === "contact") return "ContactPage";
  if (kind === "faq") return "FAQPage";
  if (kind === "article") return "Article";
  return "WebPage";
}

export function webPageLd(
  baseUrl: string,
  path: PublicPath,
  locale: Locale,
): Record<string, unknown> {
  const base = cleanBase(baseUrl);
  const meta = routeMeta(path, locale);
  const url = `${base}${localizedPublicPath(path, locale)}`;
  const page: Record<string, unknown> = {
    "@type": pageSchemaType(meta.kind),
    "@id": `${url}#webpage`,
    url,
    name: meta.title,
    description: meta.description,
    inLanguage: locale,
    isPartOf: { "@id": `${base}/#website` },
    about: { "@id": `${base}/#service` },
    publisher: { "@id": `${base}/#organization` },
  };
  if (path === "/" || path === "/services") {
    page.mainEntity = { "@id": `${base}/#service` };
  }
  if (path === "/product" || path === "/docs" || path === "/methodology") {
    page.mainEntity = { "@id": `${base}/#audit-application` };
  }
  if (meta.lastModified) page.dateModified = meta.lastModified;
  if (meta.kind === "article") {
    page.headline = meta.title;
    page.datePublished = meta.lastModified;
    page.author = { "@id": `${base}/#organization` };
    page.mainEntityOfPage = { "@id": `${url}#webpage` };
  }
  return page;
}

function breadcrumbNames(path: PublicPath, locale: Locale): Array<{ name: string; path: PublicPath }> {
  const home = { name: locale === "ru" ? "Главная" : "Home", path: "/" as PublicPath };
  if (path === "/") return [home];
  const crumbs = [home];
  if (path.startsWith("/use-cases/")) {
    crumbs.push({ name: locale === "ru" ? "Сценарии" : "Use cases", path: "/use-cases" });
  }
  if (path.startsWith("/blogs/")) {
    crumbs.push({ name: locale === "ru" ? "Блог" : "Blogs", path: "/blogs" });
  }
  crumbs.push({ name: routeMeta(path, locale).title.replace(/ \| Synap$/, ""), path });
  return crumbs;
}

export function breadcrumbLd(
  baseUrl: string,
  path: PublicPath,
  locale: Locale,
): Record<string, unknown> {
  const base = cleanBase(baseUrl);
  return {
    "@type": "BreadcrumbList",
    "@id": `${base}${localizedPublicPath(path, locale)}#breadcrumbs`,
    itemListElement: breadcrumbNames(path, locale).map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${base}${localizedPublicPath(crumb.path, locale)}`,
    })),
  };
}

export function structuredDataForRoute(
  baseUrl: string,
  path: PublicPath,
  locale: Locale,
  faqItems: FaqItem[] = [],
): Record<string, unknown> {
  const graph: Record<string, unknown>[] = [
    organizationLd(baseUrl, locale),
    webSiteLd(baseUrl, locale),
  ];
  if (path !== "/login") {
    graph.push(serviceLd(baseUrl, locale));
    graph.push(softwareApplicationLd(baseUrl, locale));
    graph.push(webPageLd(baseUrl, path, locale));
    graph.push(breadcrumbLd(baseUrl, path, locale));
  }
  if ((path === "/" || path === "/faq") && faqItems.length > 0) {
    const page = graph.find((node) => node["@id"] === `${cleanBase(baseUrl)}${localizedPublicPath(path, locale)}#webpage`);
    if (path === "/faq" && page) {
      Object.assign(page, faqLd(faqItems));
    } else {
      graph.push({
        ...faqLd(faqItems),
        "@id": `${cleanBase(baseUrl)}${localizedPublicPath(path, locale)}#faq`,
        url: `${cleanBase(baseUrl)}${localizedPublicPath(path, locale)}#faq`,
        inLanguage: locale,
        isPartOf: { "@id": `${cleanBase(baseUrl)}${localizedPublicPath(path, locale)}#webpage` },
      });
    }
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

/** Supported model-family labels, in the public product order. */
export function scannedEngineNames(): string[] {
  const order: EngineId[] = ["chatgpt", "gemini", "perplexity", "claude", "grok"];
  return order.map((id) => ENGINE_LABELS[id]);
}

/** Model families included in the normal public free-audit flow. */
export function publicFreeAuditEngineNames(): string[] {
  const order: EngineId[] = ["chatgpt", "gemini", "perplexity"];
  return order.map((id) => ENGINE_LABELS[id]);
}
