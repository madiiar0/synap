import { ENGINE_LABELS, type EngineId } from "./engines.js";
import { publicPageContent } from "./publicContent.js";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "./constants.js";
import enTranslations from "./i18n/en.json" with { type: "json" };
import kkTranslations from "./i18n/kk.json" with { type: "json" };
import ruTranslations from "./i18n/ru.json" with { type: "json" };

/**
 * The one public origin every crawler, AI retriever and structured-data
 * consumer must see. Canonicals, hreflang, the sitemap, llms.txt and JSON-LD
 * all derive from it, so it is checked in rather than left to a deployment
 * variable: a stale or missing dashboard value must never publish a second
 * origin for the same entity.
 */
export const CANONICAL_SITE_URL = "https://akrux.app";

/**
 * Verified, externally checkable identity. These are the strings that let a
 * model merge the site, the LinkedIn page and any directory listing into one
 * entity, so they are checked in rather than derived, and they must stay
 * byte-identical to /docs/entity-identity.md.
 *
 * `legalName` is deliberately absent: no registered entity exists yet, and a
 * placeholder would be worse than an omission.
 */
export const ORGANIZATION_IDENTITY = {
  sameAs: ["https://www.linkedin.com/company/akrux/"],
  email: "support@akrux.app",
  /** E.164 for schema and tel: links. */
  telephone: "+77757138329",
  /** Human-readable form, rendered in visible page copy. */
  telephoneDisplay: "+7 775 713 8329",
  foundingDate: "2026-07",
  addressLocality: "Astana",
  addressCountry: "KZ",
} as const;

/** The one human named anywhere on this site. */
export const FOUNDER = {
  name: "Madiyar Askaruly",
  jobTitle: "Founder",
  linkedIn: "https://www.linkedin.com/in/askkaruly/",
} as const;

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
  "/blogs/ai-visibility-kazakhstan",
  "/generative-engine-optimization",
  "/use-cases",
  "/use-cases/local-businesses",
  "/pricing",
  "/faq",
  "/about",
  "/contact",
  "/docs",
  "/blogs",
  "/blogs/audit-ai-generated-brand-information",
  "/blogs/why-ai-recommends-competitors",
] as const;

export const NOINDEX_PUBLIC_PATHS = ["/login", "/changelog", "/privacy", "/terms"] as const;
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
  {
    from: "/ai-visibility",
    to: "/blogs/ai-visibility-kazakhstan",
  },
  { from: "/use-cases/saas", to: "/use-cases" },
  { from: "/use-cases/ecommerce", to: "/use-cases" },
  { from: "/use-cases/professional-services", to: "/use-cases" },
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
  /** ISO publication date only when a truthful public publication is known. */
  datePublished?: string;
  /** Visible article headline when it differs from the browser title. */
  headline?: string;
}

export const PRODUCT_POSITIONING: Record<Locale, {
  sentence: string;
  short: string;
  full: string;
}> = {
  en: {
    sentence:
      "Akrux gives Kazakhstan businesses a free audit of how they appear in AI-generated answers, followed by human-led improvement support. AI placement is not guaranteed.",
    short:
      "Akrux gives Kazakhstan businesses a free audit of how they appear in AI-generated answers, followed by human-led improvement support. AI placement is not guaranteed.",
    full:
      "Akrux is a human-assisted AI-visibility audit and improvement service for businesses in Kazakhstan. The free audit provides a dated sample of how a business appears in supported AI-generated answers, including visibility metrics, branded recognition, competitors, answer-level positions and cited sources. Business owners can review the private report and book a call with Akrux. The team then plans and manually carries out agreed improvement work. AI answers vary by model, wording, date and retrieved sources, so Akrux does not guarantee indexing, mentions, citations, rankings or recommendations.",
  },
  ru: {
    sentence:
      "Akrux бесплатно проверяет, как бизнес в Казахстане представлен в ответах ИИ, а затем команда вручную помогает с улучшениями. Позиции в ИИ не гарантируются.",
    short:
      "Akrux бесплатно проверяет, как бизнес в Казахстане представлен в ответах ИИ, а затем команда вручную помогает с улучшениями. Позиции в ИИ не гарантируются.",
    full:
      "Akrux — сервис аудита и улучшения видимости бизнеса в ответах ИИ для компаний Казахстана с участием команды специалистов. Бесплатный аудит показывает датированную выборку ответов поддерживаемых ИИ-моделей, включая метрики видимости, узнаваемость бренда, конкурентов, позиции в отдельных ответах и процитированные источники. Владелец бизнеса может изучить закрытый отчёт и записаться на созвон с Akrux. Затем команда составляет и вручную выполняет согласованный план улучшений. Ответы ИИ зависят от модели, формулировки, даты и найденных источников, поэтому Akrux не гарантирует индексацию, упоминания, цитирование, позиции или рекомендации.",
  },
  kk: {
    sentence:
      "Akrux Қазақстандағы бизнестің ЖИ жауаптарында қалай көрсетілетінін тегін тексереді, содан кейін команда қолмен жақсартуға көмектеседі. ЖИ-дегі позициялар кепілдендірілмейді.",
    short:
      "Akrux Қазақстандағы бизнестің ЖИ жауаптарында қалай көрсетілетінін тегін тексереді, содан кейін команда қолмен жақсартуға көмектеседі. ЖИ-дегі позициялар кепілдендірілмейді.",
    full:
      "Akrux — Қазақстан компанияларына арналған, мамандар командасы қатысатын ЖИ жауаптарындағы көрінуді аудиттеу және жақсарту сервисі. Тегін аудит қолдау көрсетілетін ЖИ модельдерінің жауаптарынан күні көрсетілген таңдаманы көрсетеді: көріну метрикалары, бренд танымалдығы, бәсекелестер, жекелеген жауаптардағы позициялар және дәйексөз алынған дереккөздер. Бизнес иесі жабық есепті қарап, Akrux-пен қоңырауға жазыла алады. Содан кейін команда келісілген жақсарту жоспарын құрып, оны қолмен орындайды. ЖИ жауаптары модельге, тұжырымға, күнге және табылған дереккөздерге байланысты өзгереді, сондықтан Akrux индекстеуге, аталымдарға, дәйексөздерге, позицияларға немесе ұсыныстарға кепілдік бермейді.",
  },
};

export const SOCIAL_IMAGE_ALT: Record<Locale, string> = {
  en: "Akrux — AI-visibility audit and human-assisted improvement in Kazakhstan",
  ru: "Akrux — аудит и улучшение видимости бизнеса в ИИ в Казахстане",
  kk: "Akrux — Қазақстанда бизнестің ЖИ-дегі көрінуіне аудит және жақсарту",
};

/** schema.org availableLanguage names, one per supported public locale. */
export const LOCALE_SCHEMA_NAMES: string[] = ["Russian", "English", "Kazakh"];

/** Locale-specific schema and breadcrumb vocabulary. */
const SCHEMA_VOCAB: Record<Locale, {
  country: string;
  language: string;
  ogLocale: string;
  home: string;
  useCases: string;
  blogs: string;
  serviceType: string;
  appName: string;
}> = {
  ru: {
    country: "Казахстан",
    language: "Russian",
    ogLocale: "ru_RU",
    home: "Главная",
    useCases: "Сценарии",
    blogs: "Блог",
    serviceType:
      "Бесплатный аудит видимости бизнеса в ИИ и отдельно согласуемая помощь команды",
    appName: "Интерфейс аудита Akrux",
  },
  en: {
    country: "Kazakhstan",
    language: "English",
    ogLocale: "en_US",
    home: "Home",
    useCases: "Use cases",
    blogs: "Blogs",
    serviceType:
      "Free AI-visibility audit with separately scoped human-assisted improvement",
    appName: "Akrux audit interface",
  },
  kk: {
    country: "Қазақстан",
    language: "Kazakh",
    ogLocale: "kk_KZ",
    home: "Басты бет",
    useCases: "Сценарийлер",
    blogs: "Блог",
    serviceType:
      "Бизнестің ЖИ-дегі көрінуіне тегін аудит және бөлек келісілетін команда көмегі",
    appName: "Akrux аудит интерфейсі",
  },
};

/** og:locale for a page, and the alternates a crawler should also consider. */
export function ogLocale(locale: Locale): string {
  return SCHEMA_VOCAB[locale].ogLocale;
}
export function ogLocaleAlternates(locale: Locale): string[] {
  return LOCALES.filter((l) => l !== locale).map((l) => SCHEMA_VOCAB[l].ogLocale);
}

/** Homepage FAQ copy, read from the same bundles the landing renders. */
const LANDING_FAQ_SOURCE: Record<Locale, typeof ruTranslations.landing.faq> = {
  ru: ruTranslations.landing.faq,
  en: enTranslations.landing.faq,
  kk: kkTranslations.landing.faq,
};

const UPDATED = "2026-08-02";
/**
 * Phase 2.4 rule (a): first-commit date of the file carrying the article body.
 * Every article lives in publicContent.ts, whose first commit is 2026-08-03
 * (`git log --diff-filter=A --follow`). No article needed the founding-month
 * fallback.
 */
const FIRST_PUBLISHED = "2026-08-03";

const META: Record<PublicPath, Record<Locale, Omit<RouteMeta, "indexable">>> = {
  "/": {
    en: {
      title: "Akrux — Improve AI Visibility in Kazakhstan",
      description:
        "Get a free audit of how your business appears in AI answers. Akrux’s team helps Kazakhstan businesses carry out agreed improvements; AI placement is not guaranteed.",
      kind: "home",
      lastModified: UPDATED,
    },
    ru: {
      title: "Akrux — улучшение видимости бизнеса в ИИ в Казахстане",
      description:
        "Получите бесплатный аудит представленности бизнеса в ответах ИИ. Команда Akrux помогает компаниям Казахстана с улучшениями; позиции в ИИ не гарантируются.",
      kind: "home",
      lastModified: UPDATED,
    },
    kk: {
      title: "Akrux — Қазақстанда бизнестің ЖИ-дегі көрінуін жақсарту",
      description:
        "Бизнесіңіздің ЖИ жауаптарындағы көрінуіне тегін аудит алыңыз. Akrux командасы Қазақстан компанияларына жақсартуға көмектеседі; ЖИ-дегі позиция кепілдендірілмейді.",
      kind: "home",
      lastModified: UPDATED,
    },
  },
  "/product": {
    en: {
      title: "AI Visibility Audit for Kazakhstan | Akrux",
      description:
        "See how Akrux’s browser application creates a private, dated AI-visibility audit for Kazakhstan businesses before any separately scoped manual service work.",
      kind: "product",
      lastModified: "2026-08-03",
    },
    ru: {
      title: "Аудит видимости бизнеса в ИИ в Казахстане | Akrux",
      description:
        "Узнайте, как приложение Akrux создаёт закрытый датированный аудит видимости для бизнеса Казахстана до отдельно согласуемой ручной работы команды.",
      kind: "product",
      lastModified: "2026-08-03",
    },
    kk: {
      title: "Қазақстанда бизнестің ЖИ-дегі көріну аудиті | Akrux",
      description:
        "Akrux қосымшасы Қазақстан бизнесі үшін команданың бөлек келісілетін қолмен жұмысына дейін жабық әрі күні көрсетілген көріну аудитін қалай жасайтынын біліңіз.",
      kind: "product",
      lastModified: "2026-08-03",
    },
  },
  "/services": {
    en: {
      title: "AI Visibility Services in Kazakhstan — Akrux",
      description:
        "Start with a free, dated AI-visibility audit, then review separately scoped human-assisted improvement work for your business in Kazakhstan.",
      kind: "webpage",
      lastModified: "2026-08-03",
    },
    ru: {
      title: "Услуги по улучшению видимости бизнеса в ИИ в Казахстане — Akrux",
      description:
        "Начните с бесплатного датированного аудита видимости в ИИ и обсудите отдельно согласуемые работы команды для бизнеса в Казахстане.",
      kind: "webpage",
      lastModified: "2026-08-03",
    },
    kk: {
      title: "Қазақстанда бизнестің ЖИ-дегі көрінуін жақсарту қызметтері — Akrux",
      description:
        "ЖИ-дегі көрінудің тегін әрі күні көрсетілген аудитінен бастаңыз да, Қазақстандағы бизнес үшін команданың бөлек келісілетін жұмысын талқылаңыз.",
      kind: "webpage",
      lastModified: "2026-08-03",
    },
  },
  "/how-it-works": {
    en: {
      title: "How Akrux's AI Visibility Service Works",
      description:
        "Follow the full Akrux process: free audit, private report, optional call, agreed human-led improvement work and later user-initiated rescans.",
      kind: "webpage",
      lastModified: "2026-08-03",
    },
    ru: {
      title: "Как работает аудит и помощь команды Akrux",
      description:
        "Полный процесс Akrux: бесплатный аудит, закрытый отчёт, необязательный созвон, согласованная ручная работа и повторные проверки.",
      kind: "webpage",
      lastModified: "2026-08-03",
    },
    kk: {
      title: "Akrux аудиті мен команда көмегі қалай жұмыс істейді",
      description:
        "Akrux толық процесі: тегін аудит, жабық есеп, міндетті емес қоңырау, келісілген қолмен жұмыс және қайталама тексерулер.",
      kind: "webpage",
      lastModified: "2026-08-03",
    },
  },
  "/methodology": {
    en: {
      title: "AI Visibility Scoring Methodology | Akrux",
      description:
        "Read the implemented methodology behind Akrux’s dated diagnostic audit: prompts, mentions, positions, failed requests, Visibility Score and Share of Voice.",
      kind: "methodology",
      lastModified: "2026-08-03",
    },
    ru: {
      title: "Методология расчёта видимости в ИИ | Akrux",
      description:
        "Реализованная методология датированного аудита Akrux: вопросы, упоминания, позиции, ошибки, Индекс видимости и доля голоса.",
      kind: "methodology",
      lastModified: "2026-08-03",
    },
    kk: {
      title: "ЖИ-дегі көріну есептеу әдістемесі | Akrux",
      description:
        "Akrux күні көрсетілген аудитінің іске асырылған әдістемесі: сұрақтар, аталымдар, позициялар, қателер, Көріну индексі және дауыс үлесі.",
      kind: "methodology",
      lastModified: "2026-08-03",
    },
  },
  "/blogs/ai-visibility-kazakhstan": {
    en: {
      title: "What AI Visibility Means for Kazakhstan Businesses | Akrux",
      description:
        "Learn how mentions, recommendations, prompts and citations shape AI visibility for Kazakhstan businesses—and what a dated Akrux audit can and cannot show.",
      kind: "article",
      lastModified: "2026-08-03",
      datePublished: FIRST_PUBLISHED,
      headline: "What AI Visibility Means for Businesses in Kazakhstan",
    },
    ru: {
      title: "Что означает видимость бизнеса в ответах ИИ в Казахстане | Akrux",
      description:
        "Разбираем упоминания, рекомендации, вопросы и источники в ответах ИИ для бизнеса Казахстана, а также возможности и ограничения датированного аудита Akrux.",
      kind: "article",
      lastModified: "2026-08-03",
      datePublished: FIRST_PUBLISHED,
      headline: "Что означает видимость бизнеса в ответах ИИ для компаний Казахстана",
    },
    kk: {
      title: "Қазақстанда бизнестің ЖИ жауаптарындағы көрінуі не білдіреді | Akrux",
      description:
        "Қазақстан бизнесі үшін ЖИ жауаптарындағы аталымдарды, ұсыныстарды, сұрақтар мен дереккөздерді, сондай-ақ күні көрсетілген Akrux аудитінің мүмкіндіктері мен шектеулерін талдаймыз.",
      kind: "article",
      lastModified: "2026-08-03",
      datePublished: FIRST_PUBLISHED,
      headline: "Қазақстан компаниялары үшін бизнестің ЖИ жауаптарындағы көрінуі не білдіреді",
    },
  },
  "/generative-engine-optimization": {
    en: {
      title: "GEO for Kazakhstan Businesses: A Practical Guide | Akrux",
      description:
        "Learn how human-led GEO work can improve crawlability, entity clarity, useful content and sources for Kazakhstan businesses without guaranteed AI placement.",
      kind: "article",
      lastModified: "2026-08-03",
      datePublished: FIRST_PUBLISHED,
    },
    ru: {
      title: "GEO для бизнеса Казахстана: практическое руководство | Akrux",
      description:
        "Как ручная GEO-работа улучшает обход сайта, ясность сущности, полезный контент и источники бизнеса без гарантии позиции в ИИ.",
      kind: "article",
      lastModified: "2026-08-03",
      datePublished: FIRST_PUBLISHED,
    },
    kk: {
      title: "Қазақстан бизнесіне GEO: практикалық нұсқаулық | Akrux",
      description:
        "Қолмен жасалатын GEO жұмысы сайтты аралауды, нысан айқындығын, пайдалы мазмұн мен дереккөздерді ЖИ-дегі позицияға кепілдіксіз қалай жақсартады.",
      kind: "article",
      lastModified: "2026-08-03",
      datePublished: FIRST_PUBLISHED,
    },
  },
  "/use-cases": {
    en: {
      title: "AI Visibility Use Cases by Business Type | Akrux",
      description:
        "Explore practical AI visibility measurement for local businesses, SaaS teams, ecommerce brands and professional services without generic doorway content.",
      kind: "webpage",
      lastModified: "2026-08-03",
    },
    ru: {
      title: "Сценарии аналитики видимости в ИИ | Akrux",
      description:
        "Практические сценарии измерения видимости для локального бизнеса, SaaS, электронной торговли и профессиональных услуг без шаблонных страниц.",
      kind: "webpage",
      lastModified: "2026-08-03",
    },
    kk: {
      title: "ЖИ-дегі көріну аналитикасының сценарийлері | Akrux",
      description:
        "Жергілікті бизнес, SaaS, электрондық сауда және кәсіби қызметтер үшін көрінуді өлшеудің практикалық сценарийлері, шаблон беттерсіз.",
      kind: "webpage",
      lastModified: "2026-08-03",
    },
  },
  "/use-cases/local-businesses": {
    en: {
      title: "AI Visibility for Local Businesses in Kazakhstan | Akrux",
      description:
        "Practical guidance for auditing local AI visibility in Kazakhstan across business facts, city prompts, competitor appearances, listings, citations and dated rescans.",
      kind: "article",
      lastModified: "2026-08-03",
      datePublished: FIRST_PUBLISHED,
    },
    ru: {
      title: "Видимость локального бизнеса Казахстана в ответах ИИ | Akrux",
      description:
        "Практический аудит локальной видимости в Казахстане: факты о бизнесе, городские вопросы, конкуренты, карточки, источники и датированные проверки.",
      kind: "article",
      lastModified: "2026-08-03",
      datePublished: FIRST_PUBLISHED,
    },
    kk: {
      title: "Қазақстандағы жергілікті бизнестің ЖИ жауаптарындағы көрінуі | Akrux",
      description:
        "Қазақстандағы жергілікті көріну аудиті: бизнес фактілері, қалалық сұрақтар, бәсекелестер, карточкалар, дереккөздер және күні көрсетілген тексерулер.",
      kind: "article",
      lastModified: "2026-08-03",
      datePublished: FIRST_PUBLISHED,
    },
  },
  "/pricing": {
    en: {
      title: "Free AI Visibility Audit and Service Pricing | Akrux",
      description:
        "The initial audit is free during testing. Akrux has no fixed public subscription or universal service price; optional manual work is scoped after review.",
      kind: "pricing",
      lastModified: "2026-08-03",
    },
    ru: {
      title: "Бесплатный аудит и стоимость услуг Akrux",
      description:
        "Начальный аудит бесплатный на этапе тестирования. Фиксированной подписки и универсальной цены нет; ручная работа оценивается после разбора.",
      kind: "pricing",
      lastModified: "2026-08-03",
    },
    kk: {
      title: "Akrux тегін аудиті және қызмет құны",
      description:
        "Бастапқы аудит тестілеу кезеңінде тегін. Тіркелген жазылым мен әмбебап баға жоқ; қолмен жұмыс талдаудан кейін бағаланады.",
      kind: "pricing",
      lastModified: "2026-08-03",
    },
  },
  "/faq": {
    en: {
      title: "Akrux Service and AI Visibility Audit FAQ",
      description:
        "Answers about Akrux’s free audit, Kazakhstan focus, private reports, model coverage, human-assisted work, testing stage and limitations.",
      kind: "faq",
      lastModified: "2026-08-03",
    },
    ru: {
      title: "Частые вопросы об аудите и услугах Akrux",
      description:
        "Ответы о бесплатном аудите, фокусе на Казахстане, приватных отчётах, моделях, ручной работе команды, тестировании и ограничениях.",
      kind: "faq",
      lastModified: "2026-08-03",
    },
    kk: {
      title: "Akrux аудиті мен қызметтері туралы жиі қойылатын сұрақтар",
      description:
        "Тегін аудит, Қазақстанға назар, жабық есептер, модельдер, команданың қолмен жұмысы, тестілеу және шектеулер туралы жауаптар.",
      kind: "faq",
      lastModified: "2026-08-03",
    },
  },
  "/about": {
    en: {
      title: "About Akrux — AI Visibility Service in Kazakhstan",
      description:
        "Learn how Akrux combines a free, dated AI-visibility audit with separately scoped human-assisted improvement work for businesses in Kazakhstan.",
      kind: "about",
      lastModified: "2026-08-03",
    },
    ru: {
      title: "О Akrux — сервисе видимости бизнеса в ИИ в Казахстане",
      description:
        "Узнайте, как Akrux сочетает бесплатный датированный аудит видимости в ИИ с отдельно согласуемой помощью команды для бизнеса Казахстана.",
      kind: "about",
      lastModified: "2026-08-03",
    },
    kk: {
      title: "Akrux туралы — Қазақстанда бизнестің ЖИ-дегі көріну сервисі",
      description:
        "Akrux ЖИ-дегі көрінудің тегін әрі күні көрсетілген аудитін Қазақстан бизнесіне арналған бөлек келісілетін команда көмегімен қалай ұштастыратынын біліңіз.",
      kind: "about",
      lastModified: "2026-08-03",
    },
  },
  "/contact": {
    en: {
      title: "Contact Akrux",
      description:
        "Start a free AI-visibility audit or use Akrux’s existing call-booking flow to discuss a private report and possible agreed improvement work.",
      kind: "contact",
      lastModified: "2026-08-03",
    },
    ru: {
      title: "Связаться с Akrux",
      description:
        "Запустите бесплатный аудит или используйте форму записи Akrux, чтобы обсудить закрытый отчёт и возможные согласованные работы.",
      kind: "contact",
      lastModified: "2026-08-03",
    },
    kk: {
      title: "Akrux-пен байланысу",
      description:
        "Тегін аудитті іске қосыңыз немесе жабық есеп пен ықтимал келісілген жұмысты талқылау үшін Akrux жазылу формасын пайдаланыңыз.",
      kind: "contact",
      lastModified: "2026-08-03",
    },
  },
  "/docs": {
    en: {
      title: "AI Visibility Audit Documentation | Akrux",
      description:
        "Documentation for Akrux’s diagnostic application: create a profile, run an audit and interpret scores, prompts, sampled answers, competitors and sources.",
      kind: "docs",
      lastModified: "2026-08-03",
    },
    ru: {
      title: "Документация по аудиту видимости Akrux",
      description:
        "Документация диагностического приложения Akrux: профиль, аудит, Индекс видимости, вопросы, выборка ответов, конкуренты и источники.",
      kind: "docs",
      lastModified: "2026-08-03",
    },
    kk: {
      title: "Akrux көріну аудиті бойынша құжаттама",
      description:
        "Akrux диагностикалық қосымшасының құжаттамасы: профиль, аудит, Көріну индексі, сұрақтар, жауаптар таңдамасы, бәсекелестер және дереккөздер.",
      kind: "docs",
      lastModified: "2026-08-03",
    },
  },
  "/blogs": {
    en: {
      title: "Akrux Blog — AI Visibility in Kazakhstan",
      description:
        "Practical Akrux articles about auditing AI-generated brand information, understanding competitor recommendations and improving AI visibility in Kazakhstan.",
      kind: "webpage",
      lastModified: "2026-08-03",
    },
    ru: {
      title: "Блог Akrux — видимость бизнеса в ответах ИИ",
      description:
        "Практические статьи Akrux об аудите информации о бренде, причинах рекомендаций конкурентов и улучшении видимости бизнеса в ответах ИИ в Казахстане.",
      kind: "webpage",
      lastModified: "2026-08-03",
    },
    kk: {
      title: "Akrux блогы — бизнестің ЖИ жауаптарындағы көрінуі",
      description:
        "Бренд туралы ақпарат аудиті, бәсекелестерді ұсыну себептері және Қазақстанда бизнестің ЖИ жауаптарындағы көрінуін жақсарту туралы Akrux мақалалары.",
      kind: "webpage",
      lastModified: "2026-08-03",
    },
  },
  "/blogs/audit-ai-generated-brand-information": {
    en: {
      title: "How to Audit AI-Generated Brand Information | Akrux",
      description:
        "A repeatable audit for checking whether AI answers identify a business correctly, describe it consistently, cite reliable sources and confuse it with other entities.",
      kind: "article",
      lastModified: UPDATED,
      datePublished: UPDATED,
    },
    ru: {
      title: "Как проверить информацию о бренде в ответах ИИ | Akrux",
      description:
        "Повторяемый аудит: правильно ли ИИ распознаёт бизнес, последовательно ли описывает его, ссылается ли на надёжные источники и путает ли сущности.",
      kind: "article",
      lastModified: UPDATED,
      datePublished: UPDATED,
    },
    kk: {
      title: "ЖИ жауаптарындағы бренд ақпаратын қалай тексеру керек | Akrux",
      description:
        "Қайталанатын аудит: ЖИ бизнесті дұрыс тани ма, оны дәйекті сипаттай ма, сенімді дереккөздерге сілтей ме және нысандарды шатастыра ма.",
      kind: "article",
      lastModified: UPDATED,
      datePublished: UPDATED,
    },
  },
  "/blogs/why-ai-recommends-competitors": {
    en: {
      title: "Why AI Answers Recommend Competitors | Akrux",
      description:
        "Learn why competitors may appear in AI recommendations, how to separate evidence gaps from model variability and which corrective actions can be verified.",
      kind: "article",
      lastModified: UPDATED,
      datePublished: UPDATED,
    },
    ru: {
      title: "Почему ИИ рекомендует конкурентов | Akrux",
      description:
        "Почему конкуренты появляются в рекомендациях ИИ, как отличить нехватку подтверждений от изменчивости модели и какие действия можно проверить.",
      kind: "article",
      lastModified: UPDATED,
      datePublished: UPDATED,
    },
    kk: {
      title: "ЖИ неге бәсекелестерді ұсынады | Akrux",
      description:
        "Бәсекелестер ЖИ ұсыныстарында неге шығады, растаудың жетіспеуін модель өзгергіштігінен қалай ажыратуға болады және қандай әрекеттерді тексеруге болады.",
      kind: "article",
      lastModified: UPDATED,
      datePublished: UPDATED,
    },
  },
  "/changelog": {
    en: {
      title: "Akrux Product Changelog",
      description:
        "Dated, factual updates to Akrux product behavior, methodology and public documentation. Entries are added only for changes verified in the product repository.",
      kind: "webpage",
      lastModified: UPDATED,
    },
    ru: {
      title: "История обновлений Akrux",
      description:
        "Датированные фактические обновления продукта, методологии и публичной документации Akrux. Записи добавляются только для подтверждённых изменений.",
      kind: "webpage",
      lastModified: UPDATED,
    },
    kk: {
      title: "Akrux жаңарту тарихы",
      description:
        "Akrux өнімінің, әдістемесінің және жария құжаттамасының күні көрсетілген нақты жаңартулары. Жазбалар тек расталған өзгерістер үшін қосылады.",
      kind: "webpage",
      lastModified: UPDATED,
    },
  },
  "/privacy": {
    en: {
      title: "Akrux Privacy Policy",
      description:
        "Understand which account, business, scan and contact data Akrux processes, why private reports remain access-controlled and what is included in public resources.",
      kind: "webpage",
      lastModified: UPDATED,
    },
    ru: {
      title: "Политика конфиденциальности Akrux",
      description:
        "Какие данные аккаунта, бизнеса, проверок и обращений обрабатывает Akrux, почему отчёты закрыты и какая информация публикуется для индексации.",
      kind: "webpage",
      lastModified: UPDATED,
    },
    kk: {
      title: "Akrux құпиялық саясаты",
      description:
        "Akrux аккаунт, бизнес, тексеру және өтініш деректерінің қайсысын өңдейді, есептер неге жабық және индекстеуге қандай ақпарат жарияланады.",
      kind: "webpage",
      lastModified: UPDATED,
    },
  },
  "/terms": {
    en: {
      title: "Akrux Terms of Service",
      description:
        "Terms for using Akrux scans and reports, including account responsibilities, acceptable use, AI-answer limitations, availability and intellectual property.",
      kind: "webpage",
      lastModified: UPDATED,
    },
    ru: {
      title: "Условия использования Akrux",
      description:
        "Условия использования проверок и отчётов Akrux: обязанности аккаунта, допустимое использование, ограничения ответов ИИ, доступность и права.",
      kind: "webpage",
      lastModified: UPDATED,
    },
    kk: {
      title: "Akrux пайдалану шарттары",
      description:
        "Akrux тексерулері мен есептерін пайдалану шарттары: аккаунт міндеттері, рұқсат етілген пайдалану, ЖИ жауаптарының шектеулері, қолжетімділік және құқықтар.",
      kind: "webpage",
      lastModified: UPDATED,
    },
  },
  "/login": {
    en: {
      title: "Sign in to Akrux",
      description:
        "Sign in or create a Akrux account to run a private AI visibility scan and view your business report.",
      kind: "login",
    },
    ru: {
      title: "Вход в Akrux",
      description:
        "Войдите или создайте аккаунт Akrux, чтобы запустить приватную проверку видимости бизнеса в ИИ и открыть отчёт.",
      kind: "login",
    },
    kk: {
      title: "Akrux-ке кіру",
      description:
        "Бизнестің ЖИ-дегі көрінуін жеке тексеруді іске қосып, есепті ашу үшін Akrux аккаунтына кіріңіз немесе оны жасаңыз.",
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
/**
 * URL prefix per locale. The default locale is served from the root; each
 * additional locale gets its own prefix, so every language is independently
 * crawlable under one origin.
 */
export const LOCALE_PREFIX: Record<Locale, string> = { ru: "", en: "/en", kk: "/kk" };

export function localizedPublicPath(path: PublicPath, locale: Locale): string {
  const prefix = LOCALE_PREFIX[locale];
  if (!prefix) return path;
  return path === "/" ? prefix : `${prefix}${path}`;
}

/** Resolve a request path back to its locale-neutral registry path. */
export function parseLocalizedPublicPath(pathname: string): {
  path: PublicPath;
  locale: Locale;
} | null {
  const normalized = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  for (const locale of LOCALES) {
    const prefix = LOCALE_PREFIX[locale];
    if (!prefix) continue;
    if (normalized === prefix) return isPublicPath("/") ? { path: "/", locale } : null;
    if (normalized.startsWith(`${prefix}/`)) {
      const base = normalized.slice(prefix.length);
      return isPublicPath(base) ? { path: base, locale } : null;
    }
  }
  return isPublicPath(normalized) ? { path: normalized, locale: DEFAULT_LOCALE } : null;
}

export interface FaqItem {
  question: string;
  answer: string;
}

/** Homepage FAQ copy comes from the same localization keys rendered by FaqSection. */
export function landingFaqItems(locale: Locale): FaqItem[] {
  const faq = LANDING_FAQ_SOURCE[locale];
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
    name: "Akrux",
    url: base,
    logo: {
      "@type": "ImageObject",
      "@id": `${base}/#logo`,
      url: `${base}/icon-512.png`,
      width: 512,
      height: 512,
      caption: "Akrux",
    },
    description: PRODUCT_POSITIONING[locale].short,
    areaServed: {
      "@type": "Country",
      name: SCHEMA_VOCAB[locale].country,
    },
    knowsAbout: [
      "AI visibility",
      "Generative engine optimization",
      "Answer engine optimization",
      "AI-generated brand answers",
    ],
    sameAs: [...ORGANIZATION_IDENTITY.sameAs],
    address: {
      "@type": "PostalAddress",
      addressLocality: ORGANIZATION_IDENTITY.addressLocality,
      addressCountry: ORGANIZATION_IDENTITY.addressCountry,
    },
    email: ORGANIZATION_IDENTITY.email,
    telephone: ORGANIZATION_IDENTITY.telephone,
    foundingDate: ORGANIZATION_IDENTITY.foundingDate,
    founder: { "@id": `${base}/#founder` },
    contactPoint: {
      "@type": "ContactPoint",
      // Platform support only. Sales intent routes to the existing
      // call-booking action, never to this address.
      contactType: "customer support",
      url: `${base}/contact`,
      email: ORGANIZATION_IDENTITY.email,
      telephone: ORGANIZATION_IDENTITY.telephone,
      availableLanguage: LOCALE_SCHEMA_NAMES,
    },
  };
}

/** The founder. Referenced by Organization.founder and every Article author. */
export function personLd(baseUrl: string): Record<string, unknown> {
  const base = cleanBase(baseUrl);
  return {
    "@type": "Person",
    "@id": `${base}/#founder`,
    name: FOUNDER.name,
    jobTitle: FOUNDER.jobTitle,
    url: `${base}/about`,
    sameAs: [FOUNDER.linkedIn],
    worksFor: { "@id": `${base}/#organization` },
  };
}

export function webSiteLd(baseUrl: string, locale: Locale = "en"): Record<string, unknown> {
  const base = cleanBase(baseUrl);
  return {
    "@type": "WebSite",
    "@id": `${base}/#website`,
    name: "Akrux",
    url: base,
    description: PRODUCT_POSITIONING[locale].short,
    inLanguage: [...LOCALES],
    about: { "@id": `${base}/#service` },
    publisher: { "@id": `${base}/#organization` },
  };
}

export function serviceLd(baseUrl: string, locale: Locale): Record<string, unknown> {
  const base = cleanBase(baseUrl);
  return {
    "@type": "Service",
    "@id": `${base}/#service`,
    name: "Akrux",
    url: `${base}${localizedPublicPath("/", locale)}`,
    mainEntityOfPage: `${base}${localizedPublicPath("/", locale)}`,
    serviceType: SCHEMA_VOCAB[locale].serviceType,
    category: "AI visibility audit and human-assisted improvement",
    availableLanguage: LOCALE_SCHEMA_NAMES,
    areaServed: {
      "@type": "Country",
      name: SCHEMA_VOCAB[locale].country,
    },
    audience: {
      "@type": "BusinessAudience",
      geographicArea: {
        "@type": "Country",
        name: SCHEMA_VOCAB[locale].country,
      },
    },
    provider: { "@id": `${base}/#organization` },
    description: PRODUCT_POSITIONING[locale].full,
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: `${base}${localizedPublicPath("/contact", locale)}`,
      availableLanguage: SCHEMA_VOCAB[locale].language,
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
    kk: [
      "Брендсіз сұрақтар бойынша Көріну индексі",
      "Бренд танымалдығының бөлек диагностикасы",
      "Модельдер бойынша жауаптарды талдау",
      "Бәсекелестер мен дауыс үлесін талдау",
      "Сұрақтар мен дереккөздерді қарау",
    ],
  };
  const descriptions: Record<Locale, string> = {
    en: "The browser-based Akrux audit interface lets authenticated business owners review a private, dated sample of supported AI-generated answers and related visibility metrics.",
    ru: "Браузерный интерфейс аудита Akrux позволяет авторизованному владельцу бизнеса изучить закрытую датированную выборку ответов поддерживаемых ИИ-моделей и связанные метрики видимости.",
    kk: "Akrux браузерлік аудит интерфейсі авторизацияланған бизнес иесіне қолдау көрсетілетін ЖИ модельдері жауаптарының жабық әрі күні көрсетілген таңдамасын және оған қатысты көріну метрикаларын қарауға мүмкіндік береді.",
  };
  return {
    "@type": "SoftwareApplication",
    "@id": `${base}/#audit-application`,
    name: SCHEMA_VOCAB[locale].appName,
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

/**
 * The visible H1, which is the only correct value for Article.headline. Derived
 * from the rendered content so the two cannot drift; `headline` in META stays
 * available as an explicit override.
 */
function articleHeadline(path: PublicPath, locale: Locale): string {
  const meta = META[path][locale];
  if (meta.headline) return meta.headline;
  if (path === "/" || path === "/login") return meta.title;
  return publicPageContent(path, locale).h1;
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
    // The headline must be what the reader sees, never the browser title:
    // a " | Akrux" suffix in headline makes the Article disagree with its own
    // H1 and reads as boilerplate rather than a claim about the page.
    page.headline = articleHeadline(path, locale);
    if (meta.datePublished) page.datePublished = meta.datePublished;
    page.author = { "@id": `${base}/#founder` };
    page.mainEntityOfPage = { "@id": `${url}#webpage` };
  }
  return page;
}

function breadcrumbNames(path: PublicPath, locale: Locale): Array<{ name: string; path: PublicPath }> {
  const home = { name: SCHEMA_VOCAB[locale].home, path: "/" as PublicPath };
  if (path === "/") return [home];
  const crumbs = [home];
  if (path.startsWith("/use-cases/")) {
    crumbs.push({ name: SCHEMA_VOCAB[locale].useCases, path: "/use-cases" });
  }
  if (path.startsWith("/blogs/")) {
    crumbs.push({ name: SCHEMA_VOCAB[locale].blogs, path: "/blogs" });
  }
  crumbs.push({ name: routeMeta(path, locale).title.replace(/ \| Akrux$/, ""), path });
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
    personLd(baseUrl),
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
