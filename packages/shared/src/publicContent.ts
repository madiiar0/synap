import type { Locale } from "./constants.js";
import type { PublicPath } from "./seo.js";

export type ContentPagePath = Exclude<PublicPath, "/" | "/login">;

export const BLOG_ARTICLE_PATHS = [
  "/blogs/ai-visibility-kazakhstan",
  "/blogs/audit-ai-generated-brand-information",
  "/blogs/why-ai-recommends-competitors",
] as const satisfies readonly ContentPagePath[];

export interface ContentLink {
  path: Exclude<PublicPath, "/login">;
  label: string;
}

export interface ContentTable {
  headers: string[];
  rows: string[][];
}

export interface ContentSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  examples?: string[];
  table?: ContentTable;
}

export interface PublicPageContent {
  eyebrow: string;
  h1: string;
  lead: string;
  summaryTitle: string;
  summary: string;
  published?: string;
  updated: string;
  sections: ContentSection[];
  related: ContentLink[];
}

export interface PublicFaqItem {
  question: string;
  answer: string;
}

export interface PublicUiText {
  useCases: string;
  blogs: string;
  breadcrumbs: string;
  home: string;
  answers: string;
  publisher: string;
  published: string;
  updated: string;
  articles: string;
  readArticle: string;
  examples: string;
  contactHeading: string;
  contactBody: string;
  related: string;
  startHeading: string;
  startBody: string;
  startButton: string;
  serviceCtaHeading: string;
  serviceCtaBody: string;
  serviceCtaButton: string;
  socialImageAlt: string;
  /** /contact: direct channels, rendered as visible text, not only schema. */
  directContactHeading: string;
  phoneNote: string;
  supportEmailNote: string;
  /** /about: the organisation's place and start, and who founded it. */
  organizationHeading: string;
  organizationPlace: string;
}

const PUBLIC_UI: Record<Locale, PublicUiText> = {
  en: {
    useCases: "Use cases",
    blogs: "Blogs",
    breadcrumbs: "Breadcrumbs",
    home: "Home",
    answers: "Answers",
    publisher: "Published by Akrux",
    published: "Published",
    updated: "Updated",
    articles: "Articles",
    readArticle: "Read article",
    examples: "Examples",
    contactHeading: "Discuss your question",
    contactBody: "Send a short description without passwords, tokens or private customer data.",
    related: "Related pages",
    startHeading: "Check your business",
    startBody: "Run a private scan and inspect the underlying answers.",
    startButton: "Start a scan",
    serviceCtaHeading: "Start with evidence",
    serviceCtaBody: "Run the free audit or book a call to discuss whether human-assisted improvement work is appropriate for your business.",
    serviceCtaButton: "Start the free audit",
    socialImageAlt: "Akrux visibility analytics for AI answers",
    directContactHeading: "Direct contact",
    phoneNote: "Call, WhatsApp or Telegram.",
    supportEmailNote:
      "Platform support, not sales. Commercial scope is agreed on a call, not over email.",
    organizationHeading: "Organization",
    organizationPlace: "Akrux works from Astana, Kazakhstan. The project started in July 2026.",
  },
  ru: {
    useCases: "Сценарии",
    blogs: "Блог",
    breadcrumbs: "Хлебные крошки",
    home: "Главная",
    answers: "Ответы",
    publisher: "Издатель: Akrux",
    published: "Опубликовано",
    updated: "Обновлено",
    articles: "Статьи",
    readArticle: "Читать статью",
    examples: "Примеры",
    contactHeading: "Обсудить задачу",
    contactBody: "Отправьте краткое описание без паролей, токенов и приватных данных клиентов.",
    related: "Связанные страницы",
    startHeading: "Проверьте свой бизнес",
    startBody: "Запустите приватную проверку и изучите исходные ответы.",
    startButton: "Начать проверку",
    serviceCtaHeading: "Начните с фактов",
    serviceCtaBody: "Запустите бесплатный аудит или запишитесь на созвон, чтобы обсудить, подходит ли вашему бизнесу помощь команды.",
    serviceCtaButton: "Начать бесплатный аудит",
    socialImageAlt: "Akrux: аналитика видимости в ИИ",
    directContactHeading: "Прямые контакты",
    phoneNote: "Звонок, WhatsApp или Telegram.",
    supportEmailNote:
      "Поддержка платформы, а не отдел продаж. Объём работ согласуется на созвоне, а не в переписке.",
    organizationHeading: "Организация",
    organizationPlace: "Akrux работает из Астаны, Казахстан. Проект начат в июле 2026 года.",
  },  kk: {
    useCases: "Сценарийлер",
    blogs: "Блог",
    breadcrumbs: "Навигация тізбегі",
    home: "Басты бет",
    answers: "Жауаптар",
    publisher: "Баспагер: Akrux",
    published: "Жарияланды",
    updated: "Жаңартылды",
    articles: "Мақалалар",
    readArticle: "Мақаланы оқу",
    examples: "Мысалдар",
    contactHeading: "Мәселені талқылау",
    contactBody: "Құпия сөздерсіз, токендерсіз және клиенттердің жеке деректерінсіз қысқаша сипаттама жіберіңіз.",
    related: "Байланысты беттер",
    startHeading: "Бизнесіңізді тексеріңіз",
    startBody: "Жеке тексеруді іске қосып, бастапқы жауаптарды қараңыз.",
    startButton: "Тексеруді бастау",
    serviceCtaHeading: "Фактілерден бастаңыз",
    serviceCtaBody: "Тегін аудитті іске қосыңыз немесе бизнесіңізге команда көмегі қажет пе, соны талқылау үшін қоңырауға жазылыңыз.",
    serviceCtaButton: "Тегін аудитті бастау",
    socialImageAlt: "Akrux: ЖИ-дегі көріну аналитикасы",
    directContactHeading: "Тікелей байланыс",
    phoneNote: "Қоңырау, WhatsApp немесе Telegram.",
    supportEmailNote:
      "Платформа қолдауы, сату бөлімі емес. Жұмыс көлемі хат алмасуда емес, қоңырауда келісіледі.",
    organizationHeading: "Ұйым",
    organizationPlace: "Akrux Астанадан (Қазақстан) жұмыс істейді. Жоба 2026 жылдың шілдесінде басталды.",
  },
};

export const PUBLIC_FAQ_ITEMS: Record<Locale, PublicFaqItem[]> = {
  en: [
    {
      question: "What is Akrux?",
      answer:
        "Akrux is an early-stage, human-assisted AI-visibility audit and improvement service for businesses in Kazakhstan. The browser application provides the free diagnostic audit; the Akrux team separately plans and performs agreed improvement work after a call.",
    },
    {
      question: "Who is Akrux for?",
      answer:
        "Akrux currently focuses on business owners in Kazakhstan who want evidence about how their company appears when people ask AI systems about a category, need, location or comparison. The audit is most useful when the business already has public information that can be checked.",
    },
    {
      question: "What does the free audit include?",
      answer:
        "The audit creates a dated sample of customer-style prompts and AI-generated answers. The private report can include visibility metrics, separate branded recognition, provider-level results, competitor appearances, answer-level positions, Share of Voice and cited sources. Coverage and failed requests are shown rather than replaced with invented data.",
    },
    {
      question: "Which AI model families are included in the free audit?",
      answer:
        "The normal free audit covers model families associated with ChatGPT, Gemini and Perplexity. The report records the family used for each sampled answer, and provider availability can affect coverage or timing.",
    },
    {
      question: "Does Akrux directly scan the consumer ChatGPT, Gemini or Perplexity apps?",
      answer:
        "No. The audit uses configured provider APIs and model families associated with those products; it does not automate each consumer chat application. Personalization, interface features and model changes can therefore produce different answers for an individual user.",
    },
    {
      question: "What happens after the audit?",
      answer:
        "The owner reviews the private report and may book a call. Akrux can explain the evidence, identify practical gaps and propose a scope of work. If both sides agree, the team manually performs the agreed improvements; this work is separate from the free audit.",
    },
    {
      question: "What can manual improvement work involve?",
      answer:
        "Depending on the audit, work may include correcting inconsistent business facts, improving crawlability and entity clarity, improving service, About or FAQ pages, creating useful factual content, strengthening relevant local listings and sources, and reviewing citation or competitor gaps. Not every engagement includes every activity.",
    },
    {
      question: "Does Akrux guarantee indexing, citations, rankings or recommendations?",
      answer:
        "No. AI systems remain independent, and answers vary by model, wording, date and retrieved sources. Akrux cannot purchase or guarantee indexing, mentions, citations, positions, rankings or recommendations.",
    },
    {
      question: "Does Akrux provide continuous or real-time monitoring?",
      answer:
        "No. Scans and rescans are started by the user and produce dated samples. A later scan can show directional movement, but Akrux does not currently run continuous monitoring or automatic optimization.",
    },
    {
      question: "Are audit reports public?",
      answer:
        "No. Business profiles, account prompts, sampled answers, competitor reports and scan results remain behind authentication. Public pages explain the service and methodology without exposing customer reports.",
    },
    {
      question: "Does Akrux currently focus on Kazakhstan?",
      answer:
        "Yes. Businesses in Kazakhstan are the primary market. The interface and public information are currently available in Kazakh, Russian and English, and a city can be supplied for local discovery questions.",
    },
    {
      question: "Is Akrux still in testing?",
      answer:
        "Yes. Akrux is in an early testing stage. The initial audit is currently free within application and provider limits, while optional improvement work is scoped separately. Availability and the service process may evolve as the model is validated.",
    },
  ],
  ru: [
    {
      question: "Что такое Akrux?",
      answer:
        "Akrux — сервис аудита и улучшения видимости бизнеса в ответах ИИ для компаний Казахстана на раннем этапе тестирования. Браузерное приложение проводит бесплатную диагностику, а команда отдельно планирует и вручную выполняет согласованные работы после созвона.",
    },
    {
      question: "Для кого предназначен Akrux?",
      answer:
        "Сейчас Akrux ориентирован на владельцев бизнеса в Казахстане, которым нужны факты о том, как компания появляется в вопросах ИИ о категории, задаче, локации или сравнении. Аудит особенно полезен, когда у бизнеса уже есть публичная информация, которую можно проверить.",
    },
    {
      question: "Что входит в бесплатный аудит?",
      answer:
        "Аудит создаёт датированную выборку клиентских вопросов и ответов ИИ. Закрытый отчёт может включать метрики видимости, отдельную узнаваемость бренда, результаты по моделям, появления конкурентов, позиции в отдельных ответах, долю голоса и источники. Неполное покрытие и ошибки показываются, а не заменяются выдуманными данными.",
    },
    {
      question: "Какие семейства ИИ-моделей входят в бесплатный аудит?",
      answer:
        "Обычный бесплатный аудит охватывает семейства моделей, связанные с ChatGPT, Gemini и Perplexity. В отчёте сохраняется семейство каждого ответа, а доступность провайдера может влиять на покрытие и время проверки.",
    },
    {
      question: "Akrux напрямую проверяет приложения ChatGPT, Gemini и Perplexity?",
      answer:
        "Нет. Аудит использует настроенные API провайдеров и семейства моделей, связанные с этими продуктами, но не автоматизирует каждое пользовательское приложение. Персонализация, функции интерфейса и обновления моделей могут дать отдельному пользователю другой ответ.",
    },
    {
      question: "Что происходит после аудита?",
      answer:
        "Владелец изучает закрытый отчёт и при желании записывается на созвон. Akrux может разобрать факты, найти практические пробелы и предложить объём работы. Если стороны договорятся, команда вручную выполняет согласованные улучшения; эта работа не входит в бесплатный аудит.",
    },
    {
      question: "Что может входить в ручную работу по улучшению?",
      answer:
        "В зависимости от аудита работа может включать исправление противоречивых фактов о бизнесе, улучшение доступности сайта и ясности сущности, доработку страниц услуг, «О компании» или FAQ, создание полезного фактического контента, укрепление локальных карточек и источников, а также разбор пробелов в цитировании и появлениях конкурентов. Не каждый проект включает все действия.",
    },
    {
      question: "Akrux гарантирует индексацию, цитирование, позиции или рекомендации?",
      answer:
        "Нет. ИИ-системы независимы, а ответы меняются в зависимости от модели, формулировки, даты и найденных источников. Akrux не может купить или гарантировать индексацию, упоминания, цитирование, позиции, рейтинги и рекомендации.",
    },
    {
      question: "Есть ли в Akrux постоянный мониторинг в реальном времени?",
      answer:
        "Нет. Проверки и повторные проверки запускает пользователь, и каждая из них создаёт датированную выборку. Более поздний аудит может показать направление изменений, но постоянного мониторинга и автоматической оптимизации сейчас нет.",
    },
    {
      question: "Публикуются ли отчёты аудита?",
      answer:
        "Нет. Профили бизнеса, вопросы аккаунта, выборка ответов, отчёты о конкурентах и результаты проверок доступны только после авторизации. Публичные страницы объясняют сервис и методологию без раскрытия клиентских отчётов.",
    },
    {
      question: "Akrux сейчас ориентирован на Казахстан?",
      answer:
        "Да. Основной рынок — бизнес в Казахстане. Интерфейс и публичная информация сейчас доступны на казахском, русском и английском, а для локальных вопросов можно указать город.",
    },
    {
      question: "Akrux находится на этапе тестирования?",
      answer:
        "Да. Akrux находится на раннем этапе тестирования. Начальный аудит сейчас бесплатный в рамках лимитов приложения и провайдера, а дополнительные работы согласовываются отдельно. Доступность и процесс оказания услуги могут меняться по мере проверки модели.",
    },
  ],  kk: [
    {
      question: "Akrux деген не?",
      answer:
        "Akrux — Қазақстан компанияларына арналған, ерте тестілеу кезеңіндегі бизнестің ЖИ жауаптарындағы көрінуін аудиттеу және жақсарту сервисі. Браузерлік қосымша тегін диагностика жүргізеді, ал команда қоңыраудан кейін келісілген жұмыстарды бөлек жоспарлап, қолмен орындайды.",
    },
    {
      question: "Akrux кімге арналған?",
      answer:
        "Қазір Akrux Қазақстандағы бизнес иелеріне бағытталған: компания санат, міндет, орналасқан жер немесе салыстыру туралы ЖИ сұрақтарында қалай шығатыны жөнінде фактілер қажет адамдарға. Аудит бизнесте тексеруге болатын жария ақпарат бар кезде әсіресе пайдалы.",
    },
    {
      question: "Тегін аудитке не кіреді?",
      answer:
        "Аудит клиент сұрақтары мен ЖИ жауаптарының күні көрсетілген таңдамасын жасайды. Жабық есепке көріну метрикалары, бөлек бренд танымалдығы, модельдер бойынша нәтижелер, бәсекелестердің шығуы, жекелеген жауаптардағы позициялар, дауыс үлесі және дереккөздер кіруі мүмкін. Толық емес қамту мен қателер ойдан шығарылған деректермен алмастырылмай, көрсетіледі.",
    },
    {
      question: "Тегін аудитке ЖИ модельдерінің қандай отбасылары кіреді?",
      answer:
        "Әдеттегі тегін аудит ChatGPT, Gemini және Perplexity-мен байланысты модель отбасыларын қамтиды. Есепте әр жауаптың отбасы сақталады, ал провайдердің қолжетімділігі қамту мен тексеру уақытына әсер етуі мүмкін.",
    },
    {
      question: "Akrux ChatGPT, Gemini және Perplexity қосымшаларын тікелей тексере ме?",
      answer:
        "Жоқ. Аудит осы өнімдермен байланысты провайдерлердің бапталған API-лары мен модель отбасыларын пайдаланады, бірақ әр пайдаланушы қосымшасын автоматтандырмайды. Дербестендіру, интерфейс мүмкіндіктері және модель жаңартулары жекелеген пайдаланушыға басқа жауап беруі мүмкін.",
    },
    {
      question: "Аудиттен кейін не болады?",
      answer:
        "Иесі жабық есепті қарайды және қаласа қоңырауға жазылады. Akrux фактілерді талдап, практикалық олқылықтарды тауып, жұмыс көлемін ұсына алады. Тараптар келіссе, команда келісілген жақсартуларды қолмен орындайды; бұл жұмыс тегін аудитке кірмейді.",
    },
    {
      question: "Жақсарту бойынша қолмен жұмысқа не кіруі мүмкін?",
      answer:
        "Аудитке байланысты жұмысқа бизнес туралы қайшы фактілерді түзету, сайттың қолжетімділігі мен сущность айқындығын жақсарту, қызметтер, «Компания туралы» немесе FAQ беттерін пысықтау, пайдалы нақты мазмұн жасау, жергілікті карточкалар мен дереккөздерді нығайту, сондай-ақ дәйексөз алудағы олқылықтар мен бәсекелестердің шығуын талдау кіруі мүмкін. Әр жобаға барлық әрекет кірмейді.",
    },
    {
      question: "Akrux индекстеуге, дәйексөзге, позицияға немесе ұсынысқа кепілдік бере ме?",
      answer:
        "Жоқ. ЖИ жүйелері тәуелсіз, ал жауаптар модельге, тұжырымға, күнге және табылған дереккөздерге қарай өзгереді. Akrux индекстеуді, аталымдарды, дәйексөздерді, позицияларды, рейтингтер мен ұсыныстарды сатып ала да, кепілдендіре де алмайды.",
    },
    {
      question: "Akrux-те нақты уақыттағы тұрақты мониторинг бар ма?",
      answer:
        "Жоқ. Тексерулер мен қайталама тексерулерді пайдаланушы іске қосады және әрқайсысы күні көрсетілген таңдама жасайды. Кейінгі аудит өзгеріс бағытын көрсете алады, бірақ қазір тұрақты мониторинг пен автоматты оңтайландыру жоқ.",
    },
    {
      question: "Аудит есептері жарияланады ма?",
      answer:
        "Жоқ. Бизнес профильдері, аккаунт сұрақтары, жауаптар таңдамасы, бәсекелестер есептері және тексеру нәтижелері тек авторизациядан кейін қолжетімді. Жария беттер клиент есептерін ашпай, сервис пен әдістемені түсіндіреді.",
    },
    {
      question: "Akrux қазір Қазақстанға бағытталған ба?",
      answer:
        "Иә. Негізгі нарық — Қазақстандағы бизнес. Интерфейс пен жария ақпарат қазір қазақ, орыс және ағылшын тілдерінде қолжетімді, ал жергілікті сұрақтар үшін қаланы көрсетуге болады.",
    },
    {
      question: "Akrux тестілеу кезеңінде ме?",
      answer:
        "Иә. Akrux ерте тестілеу кезеңінде. Бастапқы аудит қазір қосымша мен провайдер лимиттері шегінде тегін, ал қосымша жұмыстар бөлек келісіледі. Қызметтің қолжетімділігі мен көрсету процесі модель тексерілу барысында өзгеруі мүмкін.",
    },
  ],
};

const en = (content: Omit<PublicPageContent, "updated">): PublicPageContent => ({
  ...content,
  updated: "August 2, 2026",
});
const ru = (content: Omit<PublicPageContent, "updated">): PublicPageContent => ({
  ...content,
  updated: "2 августа 2026 года",
});
const enPhase2b = (content: Omit<PublicPageContent, "updated">): PublicPageContent => ({
  ...content,
  updated: "August 3, 2026",
});
const ruPhase2b = (content: Omit<PublicPageContent, "updated">): PublicPageContent => ({
  ...content,
  updated: "3 августа 2026 года",
});
const kk = (content: Omit<PublicPageContent, "updated">): PublicPageContent => ({
  ...content,
  updated: "2026 жылғы 2 тамыз",
});
const kkPhase2b = (content: Omit<PublicPageContent, "updated">): PublicPageContent => ({
  ...content,
  updated: "2026 жылғы 3 тамыз",
});

export const PUBLIC_PAGE_CONTENT: Record<ContentPagePath, Record<Locale, PublicPageContent>> = {
  "/product": {
    en: enPhase2b({
      eyebrow: "Product",
      h1: "The diagnostic application behind Akrux's free audit",
      lead:
        "The browser application collects a dated sample of AI-generated answers and turns it into a private report. It diagnoses the current situation; it does not automatically improve or continuously monitor a business.",
      summaryTitle: "Audit software and service are different",
      summary:
        "The application provides the free diagnostic audit. After reviewing the report, a business owner may book a call and separately agree on human-assisted improvement work with Akrux.",
      sections: [
        {
          heading: "Create a project and define the business",
          paragraphs: [
            "A project records the business name and category, with optional website, city, market, aliases and known competitors. These details help Akrux resolve the intended entity and create relevant buyer questions; they do not become a public customer profile.",
            "When provider access is available, the scan researches public information about the business before generating prompts. Low-confidence research does not replace the owner's submitted facts with guesses.",
          ],
        },
        {
          heading: "Generate prompts and collect sampled answers",
          paragraphs: [
            "The current default audit creates 25 customer-style prompts across branded, category, best-of, comparison, purchase and informational intents. Each prompt stores whether it actually names the business or a known alias.",
            "The normal free audit collects answers from model families associated with ChatGPT, Gemini and Perplexity through configured provider APIs. It does not directly automate the consumer chat applications, so the report is a dated sample rather than a universal AI ranking.",
          ],
        },
        {
          heading: "What the private report can contain",
          bullets: [
            "A primary Visibility Score based on successful unbranded discovery answers.",
            "A separate branded-recognition diagnostic that does not inflate the primary score.",
            "Provider-level results over comparable prompts, with missing coverage identified rather than treated as zero.",
            "The prompt, sampled answer, answer-level position and cited sources returned for that answer.",
            "Configured and detected competitor appearances, Share of Voice and prompts where competitors appear without the target business.",
          ],
        },
        {
          heading: "Interpret extracted entities with care",
          paragraphs: [
            "Known businesses are matched through submitted names and aliases, while an extraction pass can identify additional company names. Directories, marketplaces, sources and generic phrases are filtered where possible. Competitor identification can still be imperfect and should be checked against the original answer.",
          ],
        },
        {
          heading: "Audit application versus improvement service",
          paragraphs: [
            "The software observes sampled answers and records evidence. It does not edit AI answers, publish website changes or automatically optimize the business.",
            "If the owner books a call, Akrux can review the report and propose separately scoped manual work. The team manually carries out only the activities agreed with the business.",
          ],
        },
        {
          heading: "Fresh rescans, private reports and limitations",
          paragraphs: [
            "Scans and rescans are started by the user. A new scan sends fresh requests rather than reusing prior answers, so it can show directional movement while remaining subject to model, prompt, date and retrieval variability.",
            "Reports require authentication. Akrux does not currently provide continuous monitoring and does not guarantee indexing, mentions, citations, positions, rankings or recommendations.",
          ],
        },
        {
          heading: "How the audit differs from rank tracking",
          table: {
            headers: ["Question", "Traditional rank tracking", "Akrux"],
            rows: [
              ["Measured surface", "Search-result pages", "Generated answer text"],
              ["Primary unit", "URL position", "Business mention and answer-level position"],
              ["Competitive view", "Domains ranking for a query", "Entities named across answers"],
              ["Evidence", "Result URL and position", "Prompt, answer and citations"],
            ],
          },
        },
      ],
      related: [
        { path: "/services", label: "See Akrux's audit and improvement services" },
        { path: "/how-it-works", label: "Follow a scan step by step" },
        { path: "/methodology", label: "Read the scoring methodology" },
      ],
    }),
    ru: ruPhase2b({
      eyebrow: "Продукт",
      h1: "Диагностическое приложение для бесплатного аудита Akrux",
      lead:
        "Браузерное приложение собирает датированную выборку ответов ИИ и формирует закрытый отчёт. Оно диагностирует текущую ситуацию, но не улучшает бизнес автоматически и не ведёт постоянный мониторинг.",
      summaryTitle: "Приложение и услуга — разные части Akrux",
      summary:
        "Приложение проводит бесплатный диагностический аудит. После разбора отчёта владелец может записаться на созвон и отдельно согласовать с Akrux ручную работу по улучшению.",
      sections: [
        {
          heading: "Создание проекта и описание бизнеса",
          paragraphs: [
            "В проекте сохраняются название и категория бизнеса, а при необходимости — сайт, город, рынок, варианты названия и известные конкуренты. Эти сведения помогают определить нужную сущность и создать релевантные вопросы, но не становятся публичным профилем клиента.",
            "Если провайдер доступен, перед генерацией вопросов проверка изучает публичную информацию о бизнесе. Данные с низкой уверенностью не заменяют факты владельца догадками.",
          ],
        },
        {
          heading: "Генерация вопросов и выборка ответов",
          paragraphs: [
            "Текущий стандартный аудит создаёт 25 клиентских вопросов с намерениями: бренд, категория, лучшие варианты, сравнение, покупка и информация. Для каждого вопроса сохраняется фактический признак наличия названия бизнеса или известного варианта.",
            "Обычный бесплатный аудит получает ответы семейств моделей, связанных с ChatGPT, Gemini и Perplexity, через настроенные API провайдеров. Он не автоматизирует пользовательские чат-приложения, поэтому отчёт является датированной выборкой, а не универсальным рейтингом ИИ.",
          ],
        },
        {
          heading: "Что может содержать закрытый отчёт",
          bullets: [
            "Основной Индекс видимости по успешным небрендовым ответам.",
            "Отдельный показатель узнаваемости бренда, который не завышает основной индекс.",
            "Результаты по моделям на сопоставимых вопросах; отсутствие покрытия отмечается и не считается нулём.",
            "Вопрос, выборка ответа, позиция в отдельном ответе и возвращённые с ним источники.",
            "Заданные и найденные появления конкурентов, доля голоса и вопросы, где конкуренты есть, а целевого бизнеса нет.",
          ],
        },
        {
          heading: "Сущности и конкуренты требуют проверки",
          paragraphs: [
            "Известные компании сопоставляются по введённым названиям и вариантам, а отдельный проход может найти дополнительные компании. Каталоги, маркетплейсы, источники и общие фразы по возможности фильтруются. Определение конкурента остаётся несовершенным и должно проверяться по исходному ответу.",
          ],
        },
        {
          heading: "Приложение аудита и работа команды",
          paragraphs: [
            "Приложение наблюдает выборку ответов и сохраняет доказательства. Оно не редактирует ответы ИИ, не публикует изменения на сайте и не оптимизирует бизнес автоматически.",
            "Если владелец записывается на созвон, Akrux может разобрать отчёт и предложить отдельный объём ручных работ. Команда вручную выполняет только согласованные с бизнесом действия.",
          ],
        },
        {
          heading: "Свежие проверки, приватность и ограничения",
          paragraphs: [
            "Проверки и повторные проверки запускает пользователь. Новый запуск отправляет свежие запросы и не использует старые ответы, поэтому может показать направление изменений с учётом изменчивости модели, вопроса, даты и поиска.",
            "Отчёты доступны после авторизации. Akrux пока не ведёт постоянный мониторинг и не гарантирует индексацию, упоминания, цитирование, позиции, рейтинги или рекомендации.",
          ],
        },
        {
          heading: "Отличие аудита от поискового трекинга",
          table: {
            headers: ["Вопрос", "Поисковые позиции", "Akrux"],
            rows: [
              ["Измеряемая поверхность", "Поисковая выдача", "Текст сгенерированного ответа"],
              ["Основная единица", "Позиция URL", "Упоминание бизнеса и позиция в ответе"],
              ["Конкурентный срез", "Домены по запросу", "Сущности во множестве ответов"],
              ["Доказательства", "URL и позиция", "Вопрос, ответ и источники"],
            ],
          },
        },
      ],
      related: [
        { path: "/services", label: "Услуги аудита и улучшения" },
        { path: "/how-it-works", label: "Этапы проверки" },
        { path: "/methodology", label: "Методология расчёта" },
      ],
    }),    kk: kkPhase2b({
      eyebrow: "Өнім",
      h1: "Akrux тегін аудитінің диагностикалық қосымшасы",
      lead:
        "Браузерлік қосымша ЖИ жауаптарының күні көрсетілген таңдамасын жинап, жабық есеп жасайды. Ол ағымдағы жағдайды диагностикалайды, бірақ бизнесті автоматты жақсартпайды және тұрақты мониторинг жүргізбейді.",
      summaryTitle: "Қосымша мен қызмет — Akrux-тің әртүрлі бөліктері",
      summary:
        "Қосымша тегін диагностикалық аудит жүргізеді. Есепті талдағаннан кейін иесі қоңырауға жазылып, Akrux-пен жақсарту бойынша қолмен жұмысты бөлек келісе алады.",
      sections: [
        {
          heading: "Жоба құру және бизнесті сипаттау",
          paragraphs: [
            "Жобада бизнестің атауы мен санаты, қажет болса сайт, қала, нарық, атау нұсқалары және белгілі бәсекелестер сақталады. Бұл мәліметтер қажетті сущностьты анықтауға және орынды сұрақтар жасауға көмектеседі, бірақ клиенттің жария профиліне айналмайды.",
            "Провайдер қолжетімді болса, сұрақтарды жасамас бұрын тексеру бизнес туралы жария ақпаратты зерттейді. Сенімділігі төмен деректер иенің фактілерін болжамдармен алмастырмайды.",
          ],
        },
        {
          heading: "Сұрақтарды жасау және жауаптар таңдамасы",
          paragraphs: [
            "Қазіргі стандартты аудит ниеттері бар 25 клиент сұрағын жасайды: бренд, санат, үздік нұсқалар, салыстыру, сатып алу және ақпарат. Әр сұрақ үшін бизнес атауының немесе белгілі нұсқаның бар-жоғы нақты белгіленеді.",
            "Әдеттегі тегін аудит ChatGPT, Gemini және Perplexity-мен байланысты модель отбасыларының жауаптарын провайдерлердің бапталған API-лары арқылы алады. Ол пайдаланушы чат-қосымшаларын автоматтандырмайды, сондықтан есеп әмбебап ЖИ рейтингі емес, күні көрсетілген таңдама болып табылады.",
          ],
        },
        {
          heading: "Жабық есепте не болуы мүмкін",
          bullets: [
            "Сәтті брендсіз жауаптар бойынша негізгі Көріну индексі.",
            "Негізгі индексті көтермейтін бренд танымалдығының бөлек көрсеткіші.",
            "Салыстырмалы сұрақтар бойынша модельдер нәтижесі; қамтудың болмауы белгіленеді және нөл деп есептелмейді.",
            "Сұрақ, жауап таңдамасы, жекелеген жауаптағы позиция және сонымен бірге қайтарылған дереккөздер.",
            "Бәсекелестердің берілген және табылған шығуы, дауыс үлесі және бәсекелестер бар, бірақ мақсатты бизнес жоқ сұрақтар.",
          ],
        },
        {
          heading: "Сущностьтар мен бәсекелестер тексеруді талап етеді",
          paragraphs: [
            "Белгілі компаниялар енгізілген атаулар мен нұсқалар бойынша салыстырылады, ал бөлек өтуде қосымша компаниялар табылуы мүмкін. Каталогтар, маркетплейстер, дереккөздер мен жалпы тіркестер мүмкіндігінше сүзіледі. Бәсекелесті анықтау мінсіз емес және бастапқы жауап бойынша тексерілуі тиіс.",
          ],
        },
        {
          heading: "Аудит қосымшасы және команда жұмысы",
          paragraphs: [
            "Қосымша жауаптар таңдамасын бақылап, дәлелдерді сақтайды. Ол ЖИ жауаптарын өңдемейді, сайтқа өзгеріс жарияламайды және бизнесті автоматты оңтайландырмайды.",
            "Иесі қоңырауға жазылса, Akrux есепті талдап, қолмен жұмыстың бөлек көлемін ұсына алады. Команда бизнеспен келісілген әрекеттерді ғана қолмен орындайды.",
          ],
        },
        {
          heading: "Жаңа тексерулер, құпиялық және шектеулер",
          paragraphs: [
            "Тексерулер мен қайталама тексерулерді пайдаланушы іске қосады. Жаңа іске қосу жаңа сұраныстар жіберіп, ескі жауаптарды пайдаланбайды, сондықтан модельдің, сұрақтың, күннің және іздеудің өзгергіштігін ескере отырып, өзгеріс бағытын көрсете алады.",
            "Есептер авторизациядан кейін қолжетімді. Akrux әзірге тұрақты мониторинг жүргізбейді және индекстеуге, аталымдарға, дәйексөздерге, позицияларға, рейтингтерге немесе ұсыныстарға кепілдік бермейді.",
          ],
        },
        {
          heading: "Аудиттің іздеу трекингінен айырмашылығы",
          table: {
            headers: ["Сұрақ", "Іздеу позициялары", "Akrux"],
            rows: [
              ["Өлшенетін бет", "Іздеу нәтижелері", "Жасалған жауап мәтіні"],
              ["Негізгі бірлік", "URL позициясы", "Бизнес аталымы және жауаптағы позиция"],
              ["Бәсекелестік қима", "Сұраныс бойынша домендер", "Көптеген жауаптардағы сущностьтар"],
              ["Дәлелдер", "URL және позиция", "Сұрақ, жауап және дереккөздер"],
            ],
          },
        },
      ],
      related: [
        { path: "/services", label: "Аудит және жақсарту қызметтері" },
        { path: "/how-it-works", label: "Тексеру кезеңдері" },
        { path: "/methodology", label: "Есептеу әдістемесі" },
      ],
    }),
  },
  "/services": {
    en: enPhase2b({
      eyebrow: "Services",
      h1: "AI visibility services for businesses in Kazakhstan",
      lead:
        "Akrux starts with a free, dated audit of sampled AI-generated answers. Business owners can then book a call and agree on human-assisted improvement work with the Akrux team.",
      summaryTitle: "What Akrux offers",
      summary:
        "The free audit is the diagnostic entry point. Any manual improvement work is optional, separately scoped after the report review, and does not guarantee placement in AI answers.",
      sections: [
        {
          heading: "Start with a free audit",
          paragraphs: [
            "A business owner provides current business information and starts a user-initiated scan. Akrux collects a dated sample of supported AI-generated answers and makes the resulting report available privately through the authenticated audit application.",
          ],
          bullets: [
            "A free initial AI-visibility audit during the current testing stage.",
            "A private report that can be reviewed before any service work is discussed.",
            "An optional call to review the evidence and decide whether further work is useful.",
            "Fresh user-initiated audits for later directional comparison; no continuous monitoring.",
          ],
        },
        {
          heading: "What the free audit can show",
          bullets: [
            "How the business appears in sampled answers from model families associated with ChatGPT, Gemini and Perplexity.",
            "Visibility metrics based on the implemented methodology and a separate branded-recognition diagnostic.",
            "Competitor appearances, answer-level positions and Share of Voice across qualifying answers.",
            "Cited sources returned with the sampled answers, together with the prompt and scan date needed for context.",
            "Provider failures, incomplete coverage and other limitations rather than fabricated replacement data.",
          ],
        },
        {
          heading: "Human-assisted improvement work",
          paragraphs: [
            "After reviewing the audit, Akrux and the business agree on a relevant scope. Not every engagement needs every activity, and the free audit does not automatically include implementation.",
          ],
          bullets: [
            "Correcting inconsistent public business information.",
            "Improving website crawlability and machine-readable entity clarity.",
            "Improving service, About, FAQ and educational pages with factual information.",
            "Strengthening relevant local listings and credible third-party sources.",
            "Creating useful content and reviewing citation or competitor evidence gaps.",
            "Retesting comparable buyer questions through a fresh user-initiated audit.",
          ],
        },
        {
          heading: "Limits of the service",
          bullets: [
            "AI systems remain independent, and their answers vary by model, prompt, date and retrieved sources.",
            "Akrux cannot purchase or guarantee indexing, mentions, citations, positions or recommendations.",
            "Akrux does not currently provide continuous monitoring or automatic optimization.",
            "The service is in an early testing stage, so availability and the agreed scope may change as the work is validated.",
          ],
        },
      ],
      related: [
        { path: "/product", label: "See what the diagnostic audit includes" },
        { path: "/how-it-works", label: "Follow the audit and service lifecycle" },
        { path: "/pricing", label: "Understand free access and separate scoping" },
      ],
    }),
    ru: ruPhase2b({
      eyebrow: "Услуги",
      h1: "Услуги по улучшению видимости бизнеса в ИИ в Казахстане",
      lead:
        "Akrux начинает с бесплатного датированного аудита выборки ответов ИИ. Затем владелец бизнеса может записаться на созвон и согласовать с командой работы по улучшению.",
      summaryTitle: "Что предлагает Akrux",
      summary:
        "Бесплатный аудит — это начальная диагностика. Ручная работа команды не обязательна, согласовывается отдельно после разбора отчёта и не гарантирует позиции в ответах ИИ.",
      sections: [
        {
          heading: "Начните с бесплатного аудита",
          paragraphs: [
            "Владелец указывает актуальную информацию о бизнесе и самостоятельно запускает проверку. Akrux собирает датированную выборку ответов поддерживаемых ИИ-моделей, а закрытый отчёт становится доступен после авторизации.",
          ],
          bullets: [
            "Бесплатный начальный аудит видимости в ИИ на текущем этапе тестирования.",
            "Приватный отчёт, который можно изучить до обсуждения дальнейшей работы.",
            "Необязательный созвон для разбора фактов и решения о следующих шагах.",
            "Свежие проверки по инициативе пользователя для последующего сравнения; постоянного мониторинга нет.",
          ],
        },
        {
          heading: "Что показывает бесплатный аудит",
          bullets: [
            "Как бизнес представлен в выборке ответов семейств моделей, связанных с ChatGPT, Gemini и Perplexity.",
            "Метрики видимости по реализованной методологии и отдельный показатель узнаваемости бренда.",
            "Появление конкурентов, позиции в отдельных ответах и долю голоса по подходящим ответам.",
            "Источники из выборки ответов вместе с вопросом и датой проверки, необходимыми для контекста.",
            "Ошибки провайдера, неполное покрытие и другие ограничения вместо выдуманных данных.",
          ],
        },
        {
          heading: "Работа команды по улучшению",
          paragraphs: [
            "После разбора аудита Akrux и владелец бизнеса согласуют подходящий объём. Не каждой компании нужны все перечисленные действия, а внедрение не входит автоматически в бесплатный аудит.",
          ],
          bullets: [
            "Исправление противоречивой публичной информации о бизнесе.",
            "Улучшение доступности сайта для обхода и ясности сущности для машин.",
            "Улучшение страниц услуг, «О компании», FAQ и полезных материалов.",
            "Укрепление релевантных локальных карточек и надёжных внешних источников.",
            "Создание полезного контента и разбор пробелов в источниках или появлениях конкурентов.",
            "Повторная проверка сопоставимых вопросов через новый запуск по инициативе пользователя.",
          ],
        },
        {
          heading: "Ограничения услуги",
          bullets: [
            "ИИ-системы независимы, а ответы меняются в зависимости от модели, вопроса, даты и найденных источников.",
            "Akrux не может купить или гарантировать индексацию, упоминания, цитирование, позиции и рекомендации.",
            "Akrux пока не предоставляет постоянный мониторинг или автоматическую оптимизацию.",
            "Сервис находится на раннем этапе тестирования, поэтому доступность и согласуемый объём работ могут меняться по мере проверки модели.",
          ],
        },
      ],
      related: [
        { path: "/product", label: "Что входит в диагностический аудит" },
        { path: "/how-it-works", label: "Полный путь аудита и работы команды" },
        { path: "/pricing", label: "Бесплатный доступ и отдельная оценка работ" },
      ],
    }),    kk: kkPhase2b({
      eyebrow: "Қызметтер",
      h1: "Қазақстанда бизнестің ЖИ-дегі көрінуін жақсарту қызметтері",
      lead:
        "Akrux ЖИ жауаптары таңдамасының тегін әрі күні көрсетілген аудитінен бастайды. Содан кейін бизнес иесі қоңырауға жазылып, командамен жақсарту жұмыстарын келісе алады.",
      summaryTitle: "Akrux не ұсынады",
      summary:
        "Тегін аудит — бастапқы диагностика. Команданың қолмен жұмысы міндетті емес, есепті талдағаннан кейін бөлек келісіледі және ЖИ жауаптарындағы позицияға кепілдік бермейді.",
      sections: [
        {
          heading: "Тегін аудиттен бастаңыз",
          paragraphs: [
            "Иесі бизнес туралы өзекті ақпаратты көрсетіп, тексеруді өзі іске қосады. Akrux қолдау көрсетілетін ЖИ модельдері жауаптарының күні көрсетілген таңдамасын жинайды, ал жабық есеп авторизациядан кейін қолжетімді болады.",
          ],
          bullets: [
            "Ағымдағы тестілеу кезеңіндегі ЖИ-дегі көрінудің тегін бастапқы аудиті.",
            "Кейінгі жұмысты талқыламас бұрын қарауға болатын жеке есеп.",
            "Фактілерді талдап, келесі қадамдарды шешуге арналған міндетті емес қоңырау.",
            "Кейін салыстыру үшін пайдаланушы бастамасымен жасалатын жаңа тексерулер; тұрақты мониторинг жоқ.",
          ],
        },
        {
          heading: "Тегін аудит нені көрсетеді",
          bullets: [
            "Бизнес ChatGPT, Gemini және Perplexity-мен байланысты модель отбасылары жауаптарының таңдамасында қалай көрсетілгенін.",
            "Іске асырылған әдістеме бойынша көріну метрикалары және бренд танымалдығының бөлек көрсеткіші.",
            "Бәсекелестердің шығуы, жекелеген жауаптардағы позициялар және қолайлы жауаптар бойынша дауыс үлесі.",
            "Жауаптар таңдамасындағы дереккөздер, оларға контекст үшін қажет сұрақ пен тексеру күнімен бірге.",
            "Ойдан шығарылған деректердің орнына провайдер қателері, толық емес қамту және басқа шектеулер.",
          ],
        },
        {
          heading: "Команданың жақсарту жұмысы",
          paragraphs: [
            "Аудитті талдағаннан кейін Akrux пен бизнес иесі қолайлы көлемді келіседі. Әр компанияға аталған әрекеттердің бәрі қажет емес, ал енгізу тегін аудитке автоматты кірмейді.",
          ],
          bullets: [
            "Бизнес туралы қайшы жария ақпаратты түзету.",
            "Сайттың аралауға қолжетімділігін және машиналарға сущность айқындығын жақсарту.",
            "Қызметтер, «Компания туралы», FAQ беттері мен пайдалы материалдарды жақсарту.",
            "Орынды жергілікті карточкалар мен сенімді сыртқы дереккөздерді нығайту.",
            "Пайдалы мазмұн жасау және дереккөздердегі немесе бәсекелестердің шығуындағы олқылықтарды талдау.",
            "Пайдаланушы бастамасымен жаңа іске қосу арқылы салыстырмалы сұрақтарды қайта тексеру.",
          ],
        },
        {
          heading: "Қызмет шектеулері",
          bullets: [
            "ЖИ жүйелері тәуелсіз, ал жауаптар модельге, сұраққа, күнге және табылған дереккөздерге қарай өзгереді.",
            "Akrux индекстеуді, аталымдарды, дәйексөздерді, позициялар мен ұсыныстарды сатып ала да, кепілдендіре де алмайды.",
            "Akrux әзірге тұрақты мониторинг немесе автоматты оңтайландыру ұсынбайды.",
            "Сервис ерте тестілеу кезеңінде, сондықтан қолжетімділік пен келісілетін жұмыс көлемі модель тексерілу барысында өзгеруі мүмкін.",
          ],
        },
      ],
      related: [
        { path: "/product", label: "Диагностикалық аудитке не кіреді" },
        { path: "/how-it-works", label: "Аудит пен команда жұмысының толық жолы" },
        { path: "/pricing", label: "Тегін қолжетімділік және жұмыстардың бөлек бағалануы" },
      ],
    }),
  },
  "/how-it-works": {
    en: enPhase2b({
      eyebrow: "Workflow",
      h1: "How the Akrux audit and improvement service works",
      lead:
        "The process begins with a free diagnostic audit, continues with a private report and optional review call, and leads to manual improvement work only when Akrux and the business agree on a scope.",
      summaryTitle: "Direct answer",
      summary:
        "Akrux researches the submitted business, creates customer-style prompts, analyses a dated sample of AI-generated answers and stores the evidence in a private report. Later human work and rescans are separate, agreed steps rather than automatic optimization.",
      sections: [
        {
          heading: "1. Create a business profile",
          paragraphs: [
            "The owner supplies a business name and category, with optional website, city, aliases and up to five known competitors. A market setting controls the Russian–English prompt mix. These fields define the target entity; they are not public profile pages.",
          ],
        },
        {
          heading: "2. Research before asking",
          paragraphs: [
            "In a live scan, Akrux can research the public website and web results to identify services, audiences, aliases, sub-brands and likely competitors. Low-confidence research does not fill gaps with guesses; prompt generation falls back to the owner's fields.",
          ],
        },
        {
          heading: "3. Generate branded and unbranded prompts",
          paragraphs: [
            "The current default scan creates 25 prompts across branded, category, best-of, comparison, purchase and informational intents. Every prompt receives a stored branded flag based on its actual text and known aliases. At least 80% of the configured mix is intended to be unbranded.",
          ],
          examples: [
            "Branded: “What do you know about Example Brand?”",
            "Unbranded local discovery: “Recommend a dental clinic in Almaty.”",
            "Unbranded comparison: “Compare the best dental clinics in Almaty.”",
          ],
        },
        {
          heading: "4. Collect and analyse sampled answers",
          paragraphs: [
            "Answers are not reused across scans. The normal free audit sends the configured prompt plan to model families associated with ChatGPT, Gemini and Perplexity through provider APIs. It does not directly automate the consumer applications.",
            "Akrux matches known entities and their order, can extract additional company names, filters common non-competitor entities, records cited sources and calculates versioned metrics. Failed requests remain failures and are excluded from score denominators.",
          ],
        },
        {
          heading: "5. Review the private report",
          paragraphs: [
            "The owner can inspect the Visibility Score, separate branded recognition, provider-level results, prompts, sampled answers, competitor appearances, answer-level positions, Share of Voice and cited sources. The report is authenticated and is not published as a customer page.",
          ],
        },
        {
          heading: "6. Book an optional review call",
          paragraphs: [
            "A business owner may book a call after reading the report. Akrux reviews the evidence, explains important limitations and identifies gaps that may be practical to address. Booking a call does not guarantee that every project will be accepted.",
          ],
        },
        {
          heading: "7. Agree on and perform improvement work",
          paragraphs: [
            "Akrux and the business decide which actions are relevant and agree on the scope separately from the free audit. The Akrux team then manually performs the agreed work; the audit application does not implement changes automatically.",
          ],
        },
        {
          heading: "8. Use later scans for directional comparison",
          paragraphs: [
            "A later user-initiated scan sends fresh requests and can compare the same types of buyer questions. Results can move because of website or source changes, but also because of models, wording, dates and retrieval. Akrux cannot guarantee that the next scan will improve.",
          ],
        },
      ],
      related: [
        { path: "/services", label: "Review Akrux's human-assisted services" },
        { path: "/methodology", label: "Inspect formulas and exclusions" },
        { path: "/docs", label: "Use the report" },
        { path: "/privacy", label: "See how scan data is protected" },
      ],
    }),
    ru: ruPhase2b({
      eyebrow: "Процесс",
      h1: "Как проходит аудит и работа команды Akrux",
      lead:
        "Процесс начинается с бесплатного диагностического аудита, продолжается закрытым отчётом и необязательным созвоном, а ручная работа начинается только после согласования объёма с бизнесом.",
      summaryTitle: "Краткий ответ",
      summary:
        "Akrux исследует указанный бизнес, создаёт клиентские вопросы, анализирует датированную выборку ответов ИИ и сохраняет доказательства в закрытом отчёте. Дальнейшая работа команды и повторные проверки являются отдельными согласованными шагами, а не автоматической оптимизацией.",
      sections: [
        {
          heading: "1. Создание профиля бизнеса",
          paragraphs: [
            "Владелец указывает название и категорию, а при необходимости — сайт, город, варианты названия и до пяти известных конкурентов. Рынок задаёт пропорцию русских и английских вопросов. Эти поля определяют целевую сущность и не становятся публичным профилем.",
          ],
        },
        {
          heading: "2. Исследование до генерации вопросов",
          paragraphs: [
            "В рабочем режиме Akrux может изучить публичный сайт и веб-результаты, чтобы найти услуги, аудиторию, варианты названия, суббренды и вероятных конкурентов. При низкой уверенности система не заполняет пробелы догадками и использует поля владельца.",
          ],
        },
        {
          heading: "3. Брендовые и небрендовые вопросы",
          paragraphs: [
            "Текущая настройка создаёт 25 вопросов с намерениями: бренд, категория, лучшие варианты, сравнение, покупка и информация. Для каждого вопроса сохраняется признак брендовости по фактическому тексту и известным вариантам названия. Не менее 80% настроенной выборки должны быть небрендовыми.",
          ],
          examples: [
            "Брендовый: «Что вы знаете о компании Пример?»",
            "Небрендовый локальный: «Посоветуйте стоматологию в Алматы».",
            "Небрендовое сравнение: «Сравните лучшие стоматологии Алматы».",
          ],
        },
        {
          heading: "4. Сбор и анализ выборки ответов",
          paragraphs: [
            "Ответы не переиспользуются между проверками. Обычный бесплатный аудит отправляет настроенный план вопросов семействам моделей, связанным с ChatGPT, Gemini и Perplexity, через API провайдеров и не автоматизирует пользовательские приложения напрямую.",
            "Akrux сопоставляет известные сущности и порядок их появления, может извлечь дополнительные названия компаний, фильтрует распространённые неконкурентные сущности, сохраняет источники и рассчитывает версионированные метрики. Ошибочные запросы остаются ошибками и не входят в знаменатели.",
          ],
        },
        {
          heading: "5. Разбор закрытого отчёта",
          paragraphs: [
            "Владелец может изучить Индекс видимости, отдельную узнаваемость бренда, результаты по моделям, вопросы, выборку ответов, появления конкурентов, позиции в отдельных ответах, долю голоса и источники. Отчёт доступен после авторизации и не публикуется как клиентская страница.",
          ],
        },
        {
          heading: "6. Необязательный созвон",
          paragraphs: [
            "После изучения отчёта владелец может записаться на созвон. Akrux разбирает доказательства, объясняет важные ограничения и определяет пробелы, с которыми можно работать. Запись на созвон не означает, что Akrux примет любой проект.",
          ],
        },
        {
          heading: "7. Согласование и выполнение работ",
          paragraphs: [
            "Akrux и бизнес определяют релевантные действия и отдельно от бесплатного аудита согласуют объём. Затем команда Akrux вручную выполняет согласованные работы; приложение аудита не внедряет изменения автоматически.",
          ],
        },
        {
          heading: "8. Повторная проверка направления изменений",
          paragraphs: [
            "Более поздняя проверка по инициативе пользователя отправляет свежие запросы и позволяет сравнить те же типы вопросов покупателей. Результат меняется не только из-за сайта и источников, но и из-за моделей, формулировок, дат и поиска. Akrux не гарантирует улучшение следующего результата.",
          ],
        },
      ],
      related: [
        { path: "/services", label: "Услуги команды Akrux" },
        { path: "/methodology", label: "Формулы и исключения" },
        { path: "/docs", label: "Работа с отчётом" },
        { path: "/privacy", label: "Защита данных проверки" },
      ],
    }),    kk: kkPhase2b({
      eyebrow: "Процесс",
      h1: "Akrux аудиті мен команда жұмысы қалай өтеді",
      lead:
        "Процесс тегін диагностикалық аудиттен басталып, жабық есеп пен міндетті емес қоңыраумен жалғасады, ал қолмен жұмыс тек бизнеспен көлем келісілгеннен кейін басталады.",
      summaryTitle: "Қысқаша жауап",
      summary:
        "Akrux көрсетілген бизнесті зерттеп, клиент сұрақтарын жасайды, ЖИ жауаптарының күні көрсетілген таңдамасын талдап, дәлелдерді жабық есепте сақтайды. Команданың кейінгі жұмысы мен қайталама тексерулер — автоматты оңтайландыру емес, бөлек келісілген қадамдар.",
      sections: [
        {
          heading: "1. Бизнес профилін жасау",
          paragraphs: [
            "Иесі атау мен санатты, қажет болса сайтты, қаланы, атау нұсқаларын және бес белгілі бәсекелеске дейін көрсетеді. Нарық орыс және ағылшын сұрақтарының арақатынасын белгілейді. Бұл өрістер мақсатты сущностьты анықтайды және жария профильге айналмайды.",
          ],
        },
        {
          heading: "2. Сұрақтарды жасамас бұрынғы зерттеу",
          paragraphs: [
            "Жұмыс режимінде Akrux қызметтерді, аудиторияны, атау нұсқаларын, суббрендтер мен ықтимал бәсекелестерді табу үшін жария сайт пен веб-нәтижелерді зерттей алады. Сенімділік төмен болса, жүйе олқылықтарды болжаммен толтырмай, иенің өрістерін пайдаланады.",
          ],
        },
        {
          heading: "3. Брендтік және брендсіз сұрақтар",
          paragraphs: [
            "Қазіргі баптау ниеттері бар 25 сұрақ жасайды: бренд, санат, үздік нұсқалар, салыстыру, сатып алу және ақпарат. Әр сұрақ үшін брендтік белгі нақты мәтін мен белгілі атау нұсқалары бойынша сақталады. Бапталған таңдаманың кемінде 80%-ы брендсіз болуы тиіс.",
          ],
          examples: [
            "Брендтік: «Пример компаниясы туралы не білесіз?»",
            "Брендсіз жергілікті: «Алматыдан стоматология ұсыныңыз».",
            "Брендсіз салыстыру: «Алматының үздік стоматологияларын салыстырыңыз».",
          ],
        },
        {
          heading: "4. Жауаптар таңдамасын жинау және талдау",
          paragraphs: [
            "Жауаптар тексерулер арасында қайта пайдаланылмайды. Әдеттегі тегін аудит бапталған сұрақтар жоспарын ChatGPT, Gemini және Perplexity-мен байланысты модель отбасыларына провайдер API-лары арқылы жібереді және пайдаланушы қосымшаларын тікелей автоматтандырмайды.",
            "Akrux белгілі сущностьтарды және олардың шығу ретін салыстырады, қосымша компания атауларын шығара алады, кең тараған бәсекелес емес сущностьтарды сүзеді, дереккөздерді сақтайды және нұсқаланған метрикаларды есептейді. Қате сұраныстар қате күйінде қалады және бөлгіштерге кірмейді.",
          ],
        },
        {
          heading: "5. Жабық есепті талдау",
          paragraphs: [
            "Иесі Көріну индексін, бренд танымалдығын бөлек, модельдер бойынша нәтижелерді, сұрақтарды, жауаптар таңдамасын, бәсекелестердің шығуын, жекелеген жауаптардағы позицияларды, дауыс үлесі мен дереккөздерді қарай алады. Есеп авторизациядан кейін қолжетімді және клиент беті ретінде жарияланбайды.",
          ],
        },
        {
          heading: "6. Міндетті емес қоңырау",
          paragraphs: [
            "Есепті қарағаннан кейін иесі қоңырауға жазыла алады. Akrux дәлелдерді талдап, маңызды шектеулерді түсіндіріп, жұмыс істеуге болатын олқылықтарды анықтайды. Қоңырауға жазылу Akrux кез келген жобаны қабылдайды дегенді білдірмейді.",
          ],
        },
        {
          heading: "7. Жұмыстарды келісу және орындау",
          paragraphs: [
            "Akrux пен бизнес орынды әрекеттерді анықтап, тегін аудиттен бөлек көлемді келіседі. Содан кейін Akrux командасы келісілген жұмыстарды қолмен орындайды; аудит қосымшасы өзгерістерді автоматты енгізбейді.",
          ],
        },
        {
          heading: "8. Өзгеріс бағытын қайта тексеру",
          paragraphs: [
            "Пайдаланушы бастамасымен кейінірек жасалған тексеру жаңа сұраныстар жіберіп, сатып алушылардың дәл сол типтегі сұрақтарын салыстыруға мүмкіндік береді. Нәтиже сайт пен дереккөздерге ғана емес, модельдерге, тұжырымдарға, күндерге және іздеуге де байланысты өзгереді. Akrux келесі нәтиженің жақсаруына кепілдік бермейді.",
          ],
        },
      ],
      related: [
        { path: "/services", label: "Akrux командасының қызметтері" },
        { path: "/methodology", label: "Формулалар мен алып тастаулар" },
        { path: "/docs", label: "Есеппен жұмыс" },
        { path: "/privacy", label: "Тексеру деректерін қорғау" },
      ],
    }),
  },
  "/methodology": {
    en: enPhase2b({
      eyebrow: "Methodology version 2",
      h1: "How Akrux measures AI visibility",
      lead:
        "This page documents the diagnostic application's implemented calculation rather than a marketing approximation. It explains what enters each metric, what is excluded and why the audit remains a dated sample rather than a promised service outcome.",
      summaryTitle: "Primary measurement rule",
      summary:
        "The primary Visibility Score measures discovery: successful unbranded category and comparison answers. Branded prompts are reported separately and cannot increase that score; failed model requests are excluded.",
      sections: [
        {
          heading: "Prompt generation and classification",
          paragraphs: [
            "A live scan first researches the business using public web evidence when provider access is available. Prompt generation uses that research plus the submitted name, category, city, market, aliases and competitors. If generation fails, deterministic templates preserve the same intent structure.",
            "The default 25-prompt intent mix is 12% branded, 12% comparison, 20% category, 20% best-of, 20% purchase and 16% informational. Largest-remainder allocation turns that into whole prompts. A prompt is branded only when its normalized text contains the target name or a known alias; the flag is stored with the prompt.",
          ],
        },
        {
          heading: "Mention and position detection",
          paragraphs: [
            "Known entities are detected with normalized aliases, Russian–English transliteration and conservative fuzzy matching. The target's recommendation position is the order in which recognized business entities appear in the answer. Deterministic positive matches take precedence over the language-model extraction pass.",
            "The batched extraction pass can add sentiment and unknown company names. It does not erase a deterministic target mention. Repeated mentions of the same entity in one answer count once for Share of Voice.",
          ],
        },
        {
          heading: "Visibility Score formula",
          paragraphs: [
            "For every model family actually queried, Akrux calculates a category mention rate over category, best-of and purchase prompts, and a comparison mention rate over unbranded comparison prompts. The category rate has weight 0.60 and the comparison rate 0.40. Missing groups are omitted and the remaining weights are normalized.",
            "Cross-model results use weights of 0.30 ChatGPT, 0.25 Gemini, 0.20 Perplexity, 0.15 Claude and 0.10 Grok, normalized over the models present in that scan. If the average organic mention position is 2 or better, the score receives a 1.15 multiplier. The result is capped at 100, and the bonus cannot turn an imperfect baseline into 100.",
            "Branded prompts and informational prompts do not enter the primary category/comparison formula. Branded answers produce a separate recognition percentage. Informational unbranded answers can still contribute to overall evidence counts and Share of Voice.",
          ],
        },
        {
          heading: "Share of Voice formula",
          paragraphs: [
            "Akrux uses successful unbranded answers. It counts each qualifying business entity at most once per answer, sums those entity mentions, then divides each entity's count by the total qualifying mentions. Configured competitors remain visible with zero mentions; newly detected entities must pass competitor classification.",
            "Known directories, maps, marketplaces, social or source platforms and generic descriptive phrases are not competitor rows. This filtering reduces category noise, but classification can still be imperfect and should be reviewed against the underlying answers.",
          ],
        },
        {
          heading: "Failed requests, freshness and versioning",
          paragraphs: [
            "A failed model request is stored as failed and excluded from metric denominators. A partial scan is labeled partial. Extraction failure falls back to deterministic detection for the affected answers; it does not turn missing sentiment or unknown competitors into invented values.",
            "Every scan issues fresh provider requests; answers are not cached across scans. Each score snapshot stores a metric version. The current implementation is version 2, so future formula changes can be separated from historical results.",
          ],
        },
        {
          heading: "Important limitations",
          bullets: [
            "Generated answers are probabilistic and can change between otherwise similar runs.",
            "Provider-hosted model behavior may differ from consumer chat interfaces, personalization and geography.",
            "A prompt set samples likely discovery behavior; it does not represent every customer question.",
            "Entity extraction and competitor classification require human review in ambiguous categories.",
            "Visibility measures appearance in collected answers, not revenue, customer intent or guaranteed future recommendations.",
          ],
        },
      ],
      related: [
        { path: "/services", label: "See how measurements inform agreed service work" },
        { path: "/docs", label: "Interpret each report view" },
        { path: "/blogs/ai-visibility-kazakhstan", label: "Understand the measured concept" },
        { path: "/changelog", label: "Review methodology changes" },
      ],
    }),
    ru: ruPhase2b({
      eyebrow: "Методология, версия 2",
      h1: "Как Akrux измеряет видимость в ИИ",
      lead:
        "Здесь описан реализованный расчёт диагностического приложения, а не маркетинговое приближение: какие данные входят в метрики, что исключается и почему аудит остаётся датированной выборкой, а не обещанным результатом услуги.",
      summaryTitle: "Главное правило измерения",
      summary:
        "Основной Индекс видимости измеряет обнаружение бизнеса по успешным небрендовым ответам категории и сравнения. Брендовые вопросы показываются отдельно и не повышают индекс; ошибочные запросы исключаются.",
      sections: [
        {
          heading: "Генерация и классификация вопросов",
          paragraphs: [
            "Рабочая проверка сначала исследует бизнес по публичным веб-данным, если провайдер доступен. Генерация использует исследование и введённые название, категорию, город, рынок, варианты названия и конкурентов. При ошибке генерации детерминированные шаблоны сохраняют структуру намерений.",
            "Стандартная пропорция для 25 вопросов: 12% брендовых, 12% сравнений, по 20% категории, лучших вариантов и покупки, 16% информационных. Метод наибольших остатков переводит доли в целые вопросы. Вопрос считается брендовым, только если нормализованный текст содержит название цели или известный вариант; признак сохраняется.",
          ],
        },
        {
          heading: "Определение упоминаний и позиций",
          paragraphs: [
            "Известные сущности находятся по нормализованным вариантам названия, русско-английской транслитерации и консервативному нечёткому совпадению. Позиция цели — порядок появления распознанных бизнес-сущностей в ответе. Положительное детерминированное совпадение имеет приоритет над проходом языковой модели.",
            "Пакетное извлечение может добавить тональность и неизвестные названия компаний. Оно не удаляет найденное детерминированное упоминание. Повторения одной сущности в ответе учитываются один раз для доли голоса.",
          ],
        },
        {
          heading: "Формула Индекса видимости",
          paragraphs: [
            "Для каждого фактически запрошенного семейства моделей Akrux считает долю упоминаний по вопросам категории, лучших вариантов и покупки, а также долю по небрендовым сравнениям. Вес категории — 0,60, сравнения — 0,40. Отсутствующие группы исключаются, оставшиеся веса нормализуются.",
            "Межмодельный расчёт использует веса: ChatGPT 0,30, Gemini 0,25, Perplexity 0,20, Claude 0,15 и Grok 0,10, с нормализацией по моделям конкретной проверки. При средней органической позиции 2 или лучше применяется множитель 1,15. Результат ограничен 100, а бонус не может превратить несовершенную базу в 100.",
            "Брендовые и информационные вопросы не входят в основную формулу категории и сравнения. Брендовые ответы дают отдельный процент узнаваемости. Информационные небрендовые ответы могут входить в общие показатели доказательств и долю голоса.",
          ],
        },
        {
          heading: "Формула доли голоса",
          paragraphs: [
            "Akrux использует успешные небрендовые ответы. Каждая подходящая бизнес-сущность учитывается не более одного раза на ответ; её число делится на сумму всех подходящих упоминаний. Заданные конкуренты остаются в таблице с нулём, а новые сущности проходят классификацию.",
            "Известные каталоги, карты, маркетплейсы, социальные и информационные платформы, а также общие описательные фразы не считаются конкурентами. Фильтрация снижает шум, но неоднозначные случаи нужно проверять по исходным ответам.",
          ],
        },
        {
          heading: "Ошибки, свежесть и версии",
          paragraphs: [
            "Ошибочный запрос к модели сохраняется как ошибка и не входит в знаменатели. Частичная проверка помечается как частичная. При ошибке языкового извлечения остаётся детерминированный результат; отсутствующая тональность или неизвестный конкурент не выдумываются.",
            "Каждая проверка отправляет свежие запросы; ответы между проверками не кэшируются. Снимок оценки хранит версию метрики. Текущая реализация — версия 2, поэтому будущие изменения формулы можно отделить от истории.",
          ],
        },
        {
          heading: "Важные ограничения",
          bullets: [
            "Сгенерированные ответы вероятностны и меняются между похожими запусками.",
            "Поведение модели у провайдера может отличаться от потребительского чата, персонализации и географии.",
            "Набор вопросов — выборка, а не все возможные формулировки клиентов.",
            "Извлечение сущностей и классификация конкурентов требуют проверки в неоднозначных категориях.",
            "Видимость описывает появление в собранных ответах, а не выручку и не гарантированную будущую рекомендацию.",
          ],
        },
      ],
      related: [
        { path: "/services", label: "Как измерения помогают согласовать работу" },
        { path: "/docs", label: "Как читать разделы отчёта" },
        { path: "/blogs/ai-visibility-kazakhstan", label: "Что именно измеряется" },
        { path: "/changelog", label: "Изменения методологии" },
      ],
    }),    kk: kkPhase2b({
      eyebrow: "Әдістеме, 2-нұсқа",
      h1: "Akrux ЖИ-дегі көрінуді қалай өлшейді",
      lead:
        "Мұнда маркетингтік жуықтау емес, диагностикалық қосымшаның іске асырылған есептеуі сипатталған: метрикаларға қандай деректер кіреді, не алып тасталады және аудит неге қызметтің уәде етілген нәтижесі емес, күні көрсетілген таңдама болып қалады.",
      summaryTitle: "Өлшеудің басты ережесі",
      summary:
        "Негізгі Көріну индексі бизнестің табылуын санат пен салыстырудың сәтті брендсіз жауаптары бойынша өлшейді. Брендтік сұрақтар бөлек көрсетіледі және индексті көтермейді; қате сұраныстар алып тасталады.",
      sections: [
        {
          heading: "Сұрақтарды жасау және жіктеу",
          paragraphs: [
            "Жұмыс режиміндегі тексеру провайдер қолжетімді болса, алдымен бизнесті жария веб-деректер бойынша зерттейді. Жасау кезінде зерттеу мен енгізілген атау, санат, қала, нарық, атау нұсқалары және бәсекелестер пайдаланылады. Жасау қате берсе, детерминистік шаблондар ниет құрылымын сақтайды.",
            "25 сұраққа арналған стандартты арақатынас: 12% брендтік, 12% салыстыру, санат, үздік нұсқалар және сатып алу бойынша 20%-дан, 16% ақпараттық. Ең үлкен қалдық әдісі үлестерді бүтін сұрақтарға айналдырады. Сұрақ брендтік деп тек нормаланған мәтінде мақсаттың атауы немесе белгілі нұсқасы болса ғана саналады; белгі сақталады.",
          ],
        },
        {
          heading: "Аталымдар мен позицияларды анықтау",
          paragraphs: [
            "Белгілі сущностьтар нормаланған атау нұсқалары, орысша-ағылшынша транслитерация және консервативті бұлыңғыр сәйкестік арқылы табылады. Мақсаттың позициясы — жауапта танылған бизнес-сущностьтардың шығу реті. Оң детерминистік сәйкестік тілдік модель өтуінен басым.",
            "Топтық шығару реңк пен белгісіз компания атауларын қоса алады. Ол табылған детерминистік аталымды жоймайды. Жауаптағы бір сущностьтың қайталануы дауыс үлесі үшін бір рет есептеледі.",
          ],
        },
        {
          heading: "Көріну индексінің формуласы",
          paragraphs: [
            "Akrux әр нақты сұралған модель отбасы үшін санат, үздік нұсқалар және сатып алу сұрақтары бойынша аталым үлесін, сондай-ақ брендсіз салыстырулар бойынша үлесті есептейді. Санат салмағы — 0,60, салыстыру — 0,40. Жоқ топтар алып тасталады, қалған салмақтар нормаланады.",
            "Модельаралық есептеу мына салмақтарды пайдаланады: ChatGPT 0,30, Gemini 0,25, Perplexity 0,20, Claude 0,15 және Grok 0,10, нақты тексеру модельдері бойынша нормалаумен. Орташа органикалық позиция 2 немесе одан жақсы болса, 1,15 көбейткіші қолданылады. Нәтиже 100-мен шектелген, ал бонус мінсіз емес базаны 100-ге айналдыра алмайды.",
            "Брендтік және ақпараттық сұрақтар санат пен салыстырудың негізгі формуласына кірмейді. Брендтік жауаптар танымалдықтың бөлек пайызын береді. Ақпараттық брендсіз жауаптар дәлелдердің жалпы көрсеткіштері мен дауыс үлесіне кіруі мүмкін.",
          ],
        },
        {
          heading: "Дауыс үлесінің формуласы",
          paragraphs: [
            "Akrux сәтті брендсіз жауаптарды пайдаланады. Әр қолайлы бизнес-сущность бір жауапқа бір реттен артық есептелмейді; оның саны барлық қолайлы аталымдардың қосындысына бөлінеді. Берілген бәсекелестер кестеде нөлмен қалады, ал жаңа сущностьтар жіктеуден өтеді.",
            "Белгілі каталогтар, карталар, маркетплейстер, әлеуметтік және ақпараттық платформалар, сондай-ақ жалпы сипаттама тіркестері бәсекелес деп есептелмейді. Сүзу шуды азайтады, бірақ түсініксіз жағдайларды бастапқы жауаптар бойынша тексеру керек.",
          ],
        },
        {
          heading: "Қателер, жаңалық және нұсқалар",
          paragraphs: [
            "Модельге жіберілген қате сұраныс қате ретінде сақталады және бөлгіштерге кірмейді. Ішінара тексеру ішінара деп белгіленеді. Тілдік шығару қате берсе, детерминистік нәтиже қалады; жоқ реңк немесе белгісіз бәсекелес ойдан шығарылмайды.",
            "Әр тексеру жаңа сұраныстар жібереді; жауаптар тексерулер арасында кэштелмейді. Баға сныпшоты метрика нұсқасын сақтайды. Ағымдағы іске асыру — 2-нұсқа, сондықтан формуланың болашақ өзгерістерін тарихтан ажыратуға болады.",
          ],
        },
        {
          heading: "Маңызды шектеулер",
          bullets: [
            "Жасалған жауаптар ықтималдық сипатта және ұқсас іске қосулар арасында өзгереді.",
            "Провайдердегі модель мінез-құлқы тұтынушы чатынан, дербестендіруден және географиядан өзгеше болуы мүмкін.",
            "Сұрақтар жиыны — таңдама, клиенттердің барлық ықтимал тұжырымдары емес.",
            "Сущностьтарды шығару мен бәсекелестерді жіктеу түсініксіз санаттарда тексеруді талап етеді.",
            "Көріну жиналған жауаптардағы шығуды сипаттайды, түсімді де, кепілді болашақ ұсынысты да емес.",
          ],
        },
      ],
      related: [
        { path: "/services", label: "Өлшемдер жұмысты келісуге қалай көмектеседі" },
        { path: "/docs", label: "Есеп бөлімдерін қалай оқу керек" },
        { path: "/blogs/ai-visibility-kazakhstan", label: "Дәл не өлшенеді" },
        { path: "/changelog", label: "Әдістеме өзгерістері" },
      ],
    }),
  },
  "/blogs/ai-visibility-kazakhstan": {
    en: enPhase2b({
      eyebrow: "Article",
      h1: "What AI Visibility Means for Businesses in Kazakhstan",
      lead:
        "AI visibility describes whether and how a business appears when an AI system generates an answer to a relevant customer question. It is not one universal ranking and it changes with the model, prompt, date and retrieved sources.",
      summaryTitle: "Definition",
      summary:
        "For a Kazakhstan business, AI visibility includes recognition of the correct entity, appearances in relevant answers, recommendation order, description accuracy, competitors and cited evidence. Each audit remains a dated sample rather than a permanent position.",
      sections: [
        {
          heading: "AI visibility is different from a Google ranking",
          paragraphs: [
            "Search results usually present ranked pages or domains for a query. An AI-generated answer can combine information into prose, name several businesses, omit links, retrieve different sources or change its wording between runs. There is no single AI ranking shared by every model and interface.",
          ],
          table: {
            headers: ["Question", "Traditional search", "AI-generated answer"],
            rows: [
              ["Primary output", "Ranked links", "Synthesized text"],
              ["Measured entity", "Page or domain", "Business, product or organization"],
              ["Evidence", "Indexed page and snippet", "Answer text and returned citations"],
              ["Sources of change", "Index and ranking systems", "Model, prompt, date, retrieval and interface context"],
            ],
          },
        },
        {
          heading: "Mentions and recommendations are not the same",
          paragraphs: [
            "A mention only shows that the answer named the business. A recommendation adds context: the business may be presented as suitable for a need, included among alternatives or placed earlier in a list. Neither signal proves that a customer saw, trusted or acted on the answer.",
            "The exact answer and its sources matter more than an isolated number. A prominent recommendation based on outdated facts can be less useful than a lower mention supported by accurate current information.",
          ],
        },
        {
          heading: "Branded and unbranded questions answer different questions",
          paragraphs: [
            "A branded prompt names the business and tests recognition: does the system identify and describe the right entity? An unbranded prompt asks about a category, need, comparison or location without naming the business and tests discovery among relevant alternatives.",
            "A responsible audit reports branded recognition separately so direct questions about the company do not inflate the primary unbranded Visibility Score.",
          ],
        },
        {
          heading: "Why the same question can produce a different answer",
          bullets: [
            "The selected model family and model version can change.",
            "Small wording differences can change the interpreted need or location.",
            "Retrieved web sources and their freshness can differ by date and provider.",
            "Consumer applications can add personalization, interface features or context that an API-based sample does not reproduce.",
          ],
        },
        {
          heading: "What an AI-visibility audit can measure",
          bullets: [
            "Whether the correct business appears in sampled branded and unbranded answers.",
            "Visibility metrics, separate branded recognition and answer-level positions.",
            "Which competitors appear and their Share of Voice across qualifying sampled answers.",
            "The exact prompts, sampled answers and citations returned with those answers.",
            "Directional changes between fresh, user-initiated audits of comparable question types.",
          ],
        },
        {
          heading: "What an audit cannot prove",
          paragraphs: [
            "An audit cannot prove that every consumer will receive the same response, that a real customer saw or acted on it, or that one website change caused a later movement. It does not guarantee indexing, mentions, citations, rankings or recommendations.",
          ],
        },
        {
          heading: "Why consistent business information and external sources matter",
          paragraphs: [
            "A business is easier to resolve when its name, services, city, service area, website and contact information agree across authoritative pages. Contradictory or incomplete facts can make the entity harder to identify, but consistency alone does not guarantee inclusion in an answer.",
            "Third-party sources can corroborate claims or introduce errors. Review citations and relevant local listings to see which information an answer relied on, then correct facts at the source you control or can legitimately update. Do not create fake citations or listings.",
          ],
        },
        {
          heading: "Practical first steps for a Kazakhstan business",
          bullets: [
            "Write down the official business name, real services, city or service area and current contact routes.",
            "Check whether Russian, Kazakh and English public references describe the same entity and offering.",
            "Use realistic local customer questions without inserting the business name into every prompt.",
            "Review sampled competitors and citations against the original answers rather than copying their wording.",
            "Prioritize factual gaps, then use a later dated audit for directional comparison without assuming causation.",
          ],
        },
        {
          heading: "How Akrux fits",
          paragraphs: [
            "Akrux provides Kazakhstan businesses with a free, user-initiated audit covering model families associated with ChatGPT, Gemini and Perplexity through configured provider APIs. The private report records a dated sample of prompts, answers, metrics, competitors, positions and cited sources.",
            "After reviewing the report, the owner may book a call. Akrux can then plan and manually perform separately agreed improvement work. AI systems remain independent, so the audit and service do not guarantee a future placement or recommendation.",
          ],
        },
      ],
      related: [
        { path: "/services", label: "Review Akrux's audit and improvement service" },
        { path: "/methodology", label: "See Akrux's exact measurement rules" },
        { path: "/use-cases/local-businesses", label: "Apply the concepts to a local business" },
      ],
    }),
    ru: ruPhase2b({
      eyebrow: "Статья",
      h1: "Что означает видимость бизнеса в ответах ИИ для компаний Казахстана",
      lead:
        "Видимость в ИИ показывает, появляется ли бизнес в сгенерированном ответе на релевантный вопрос клиента и как именно он представлен. Это не единый универсальный рейтинг: результат зависит от модели, вопроса, даты и найденных источников.",
      summaryTitle: "Определение",
      summary:
        "Для бизнеса Казахстана видимость в ИИ включает распознавание правильной сущности, появление в релевантных ответах, порядок рекомендаций, точность описания, конкурентов и процитированные доказательства. Каждый аудит остаётся датированной выборкой, а не постоянной позицией.",
      sections: [
        {
          heading: "Видимость в ИИ отличается от позиции в Google",
          paragraphs: [
            "Поисковая выдача обычно показывает ранжированные страницы или домены. Ответ ИИ может объединять информацию в текст, называть несколько компаний, не давать ссылок, находить другие источники и менять формулировку между запусками. Единого рейтинга для всех моделей и интерфейсов не существует.",
          ],
          table: {
            headers: ["Вопрос", "Традиционный поиск", "Ответ ИИ"],
            rows: [
              ["Основной результат", "Ранжированные ссылки", "Синтезированный текст"],
              ["Измеряемая сущность", "Страница или домен", "Бизнес, продукт или организация"],
              ["Доказательства", "Страница и сниппет", "Текст ответа и возвращённые источники"],
              ["Причины изменений", "Индекс и алгоритмы ранжирования", "Модель, вопрос, дата, поиск и контекст интерфейса"],
            ],
          },
        },
        {
          heading: "Упоминание и рекомендация — разные сигналы",
          paragraphs: [
            "Упоминание показывает только то, что ответ назвал бизнес. В рекомендации появляется контекст: компания может быть представлена как подходящий вариант, включена среди альтернатив или поставлена выше в списке. Ни один из сигналов не доказывает, что клиент увидел ответ, доверился ему или совершил действие.",
            "Точный текст ответа и его источники важнее отдельного числа. Заметная рекомендация на основе устаревших фактов может быть менее полезной, чем более низкое упоминание с актуальным подтверждением.",
          ],
        },
        {
          heading: "Брендовые и небрендовые вопросы измеряют разное",
          paragraphs: [
            "Брендовый вопрос называет компанию и проверяет узнаваемость: правильно ли система определяет и описывает сущность. Небрендовый вопрос спрашивает о категории, задаче, сравнении или месте без названия компании и проверяет обнаружение среди релевантных вариантов.",
            "Корректный аудит показывает узнаваемость отдельно, чтобы прямые вопросы о компании не завышали основной небрендовый Индекс видимости.",
          ],
        },
        {
          heading: "Почему один вопрос может дать разные ответы",
          bullets: [
            "Могут измениться семейство и версия модели.",
            "Небольшая разница в формулировке меняет понимание задачи или локации.",
            "Найденные веб-источники и их актуальность зависят от даты и провайдера.",
            "Пользовательские приложения могут добавлять персонализацию, функции интерфейса и контекст, которых нет в выборке через API.",
          ],
        },
        {
          heading: "Что может измерить аудит видимости",
          bullets: [
            "Появляется ли правильный бизнес в выборке брендовых и небрендовых ответов.",
            "Метрики видимости, отдельную узнаваемость бренда и позиции в отдельных ответах.",
            "Какие конкуренты появляются и какова их доля голоса в подходящей выборке.",
            "Точные вопросы, выборку ответов и возвращённые с ними источники.",
            "Направление изменений между свежими проверками сопоставимых типов вопросов по инициативе пользователя.",
          ],
        },
        {
          heading: "Чего аудит не доказывает",
          paragraphs: [
            "Аудит не доказывает, что каждый пользователь получит тот же ответ, что реальный клиент увидел его или совершил действие и что одна правка вызвала последующее изменение. Он не гарантирует индексацию, упоминания, цитирование, позиции, рейтинги или рекомендации.",
          ],
        },
        {
          heading: "Почему важны единые факты и внешние источники",
          paragraphs: [
            "Бизнес проще распознать, когда название, услуги, город, зона обслуживания, сайт и контакты совпадают на авторитетных страницах. Противоречивые или неполные данные затрудняют идентификацию, но сама согласованность не гарантирует появление в ответе.",
            "Внешние источники могут подтверждать заявления или распространять ошибки. Проверяйте цитирование и релевантные локальные карточки, чтобы понять, на что опирался ответ, а затем исправляйте факты в источнике, который вы контролируете или можете законно обновить. Не создавайте фиктивные ссылки и карточки.",
          ],
        },
        {
          heading: "Первые шаги для бизнеса в Казахстане",
          bullets: [
            "Зафиксируйте официальное название, реальные услуги, город или зону обслуживания и актуальные способы связи.",
            "Проверьте, одинаково ли русские, казахские и английские публичные источники описывают сущность и предложение.",
            "Используйте реалистичные локальные вопросы клиентов, не вставляя название бизнеса в каждый запрос.",
            "Проверяйте конкурентов и источники по исходным ответам, а не копируйте их формулировки.",
            "Сначала исправьте фактические пробелы, затем используйте новый датированный аудит для сравнения направления без вывода о причинности.",
          ],
        },
        {
          heading: "Роль Akrux",
          paragraphs: [
            "Akrux проводит для бизнеса Казахстана бесплатный аудит по инициативе пользователя. Он охватывает семейства моделей, связанные с ChatGPT, Gemini и Perplexity, через настроенные API провайдеров. Закрытый отчёт сохраняет датированную выборку вопросов, ответов, метрик, конкурентов, позиций и источников.",
            "После разбора отчёта владелец может записаться на созвон. Akrux может спланировать и вручную выполнить отдельно согласованные работы. ИИ-системы остаются независимыми, поэтому аудит и услуга не гарантируют будущую позицию или рекомендацию.",
          ],
        },
      ],
      related: [
        { path: "/services", label: "Аудит и помощь команды Akrux" },
        { path: "/methodology", label: "Точные правила измерения Akrux" },
        { path: "/use-cases/local-businesses", label: "Применение для локального бизнеса" },
      ],
    }),    kk: kkPhase2b({
      eyebrow: "Мақала",
      h1: "Қазақстан компаниялары үшін бизнестің ЖИ жауаптарындағы көрінуі не білдіреді",
      lead:
        "ЖИ-дегі көріну бизнестің клиенттің орынды сұрағына жасалған жауапта шығатынын және қалай көрсетілетінін білдіреді. Бұл біртұтас әмбебап рейтинг емес: нәтиже модельге, сұраққа, күнге және табылған дереккөздерге байланысты.",
      summaryTitle: "Анықтама",
      summary:
        "Қазақстан бизнесі үшін ЖИ-дегі көріну дұрыс сущностьты тануды, орынды жауаптарда шығуды, ұсыныстар ретін, сипаттама дәлдігін, бәсекелестерді және дәйексөз алынған дәлелдерді қамтиды. Әр аудит тұрақты позиция емес, күні көрсетілген таңдама болып қалады.",
      sections: [
        {
          heading: "ЖИ-дегі көріну Google позициясынан өзгеше",
          paragraphs: [
            "Іздеу нәтижелері әдетте сұрыпталған беттерді немесе домендерді көрсетеді. ЖИ жауабы ақпаратты мәтінге біріктіріп, бірнеше компанияны атап, сілтеме бермей, басқа дереккөздер тауып, іске қосулар арасында тұжырымды өзгертуі мүмкін. Барлық модельдер мен интерфейстерге ортақ біртұтас рейтинг жоқ.",
          ],
          table: {
            headers: ["Сұрақ", "Дәстүрлі іздеу", "ЖИ жауабы"],
            rows: [
              ["Негізгі нәтиже", "Сұрыпталған сілтемелер", "Синтезделген мәтін"],
              ["Өлшенетін сущность", "Бет немесе домен", "Бизнес, өнім немесе ұйым"],
              ["Дәлелдер", "Бет және сниппет", "Жауап мәтіні және қайтарылған дереккөздер"],
              ["Өзгеріс себептері", "Индекс және сұрыптау алгоритмдері", "Модель, сұрақ, күн, іздеу және интерфейс контексті"],
            ],
          },
        },
        {
          heading: "Аталым мен ұсыныс — әртүрлі сигналдар",
          paragraphs: [
            "Аталым жауаптың бизнесті атағанын ғана көрсетеді. Ұсыныста контекст пайда болады: компания қолайлы нұсқа ретінде берілуі, баламалар арасына кіруі немесе тізімде жоғары қойылуы мүмкін. Бұл сигналдардың бірде-бірі клиенттің жауапты көргенін, оған сенгенін немесе әрекет жасағанын дәлелдемейді.",
            "Жауаптың нақты мәтіні мен оның дереккөздері жеке саннан маңыздырақ. Ескірген фактілерге негізделген көрнекі ұсыныс өзекті растауы бар төменірек аталымнан пайдасы аз болуы мүмкін.",
          ],
        },
        {
          heading: "Брендтік және брендсіз сұрақтар әртүрлі нәрсені өлшейді",
          paragraphs: [
            "Брендтік сұрақ компанияны атап, танымалдықты тексереді: жүйе сущностьты дұрыс анықтап, сипаттай ма. Брендсіз сұрақ компания атауынсыз санат, міндет, салыстыру немесе орын туралы сұрап, орынды нұсқалар арасында табылуды тексереді.",
            "Дұрыс аудит танымалдықты бөлек көрсетеді, сонда компания туралы тікелей сұрақтар негізгі брендсіз Көріну индексін көтермейді.",
          ],
        },
        {
          heading: "Бір сұрақ неге әртүрлі жауап беруі мүмкін",
          bullets: [
            "Модельдің отбасы мен нұсқасы өзгеруі мүмкін.",
            "Тұжырымдағы шағын айырмашылық міндетті немесе орынды түсінуді өзгертеді.",
            "Табылған веб-дереккөздер мен олардың өзектілігі күн мен провайдерге байланысты.",
            "Пайдаланушы қосымшалары API арқылы алынған таңдамада жоқ дербестендіруді, интерфейс мүмкіндіктері мен контекстті қосуы мүмкін.",
          ],
        },
        {
          heading: "Көріну аудиті нені өлшей алады",
          bullets: [
            "Брендтік және брендсіз жауаптар таңдамасында дұрыс бизнес шыға ма.",
            "Көріну метрикаларын, бренд танымалдығын бөлек және жекелеген жауаптардағы позицияларды.",
            "Қандай бәсекелестер шығатынын және олардың қолайлы таңдамадағы дауыс үлесін.",
            "Нақты сұрақтарды, жауаптар таңдамасын және олармен бірге қайтарылған дереккөздерді.",
            "Пайдаланушы бастамасымен салыстырмалы сұрақ түрлерін жаңа тексерулер арасындағы өзгеріс бағытын.",
          ],
        },
        {
          heading: "Аудит нені дәлелдемейді",
          paragraphs: [
            "Аудит әр пайдаланушы дәл сол жауапты алатынын, нақты клиенттің оны көргенін немесе әрекет жасағанын және бір түзетудің кейінгі өзгерісті тудырғанын дәлелдемейді. Ол индекстеуге, аталымдарға, дәйексөздерге, позицияларға, рейтингтерге немесе ұсыныстарға кепілдік бермейді.",
          ],
        },
        {
          heading: "Бірыңғай фактілер мен сыртқы дереккөздер неге маңызды",
          paragraphs: [
            "Атау, қызметтер, қала, қызмет көрсету аймағы, сайт және байланыстар беделді беттерде сәйкес келгенде бизнесті тану оңайырақ. Қайшы немесе толық емес деректер сәйкестендіруді қиындатады, бірақ үйлесімділіктің өзі жауапта шығуға кепілдік бермейді.",
            "Сыртқы дереккөздер мәлімдемелерді растай да, қателерді таратуы да мүмкін. Жауап неге сүйенгенін түсіну үшін дәйексөздер мен орынды жергілікті карточкаларды тексеріңіз, содан кейін фактілерді өзіңіз бақылайтын немесе заңды түрде жаңарта алатын дереккөзде түзетіңіз. Жалған сілтемелер мен карточкалар жасамаңыз.",
          ],
        },
        {
          heading: "Қазақстандағы бизнеске арналған алғашқы қадамдар",
          bullets: [
            "Ресми атауды, нақты қызметтерді, қаланы немесе қызмет көрсету аймағын және өзекті байланыс тәсілдерін бекітіңіз.",
            "Орыс, қазақ және ағылшын тіліндегі жария дереккөздер сущность пен ұсынысты бірдей сипаттай ма, тексеріңіз.",
            "Әр сұранысқа бизнес атауын қоспай, шынайы жергілікті клиент сұрақтарын пайдаланыңыз.",
            "Бәсекелестер мен дереккөздерді олардың тұжырымдарын көшірмей, бастапқы жауаптар бойынша тексеріңіз.",
            "Алдымен нақты олқылықтарды түзетіңіз, содан соң себептілік туралы қорытынды жасамай, бағытты салыстыру үшін жаңа күні көрсетілген аудитті пайдаланыңыз.",
          ],
        },
        {
          heading: "Akrux рөлі",
          paragraphs: [
            "Akrux Қазақстан бизнесі үшін пайдаланушы бастамасымен тегін аудит жүргізеді. Ол ChatGPT, Gemini және Perplexity-мен байланысты модель отбасыларын провайдерлердің бапталған API-лары арқылы қамтиды. Жабық есеп сұрақтардың, жауаптардың, метрикалардың, бәсекелестердің, позициялар мен дереккөздердің күні көрсетілген таңдамасын сақтайды.",
            "Есепті талдағаннан кейін иесі қоңырауға жазыла алады. Akrux бөлек келісілген жұмыстарды жоспарлап, қолмен орындай алады. ЖИ жүйелері тәуелсіз болып қалады, сондықтан аудит те, қызмет те болашақ позицияға немесе ұсынысқа кепілдік бермейді.",
          ],
        },
      ],
      related: [
        { path: "/services", label: "Akrux аудиті және команда көмегі" },
        { path: "/methodology", label: "Akrux өлшеуінің нақты ережелері" },
        { path: "/use-cases/local-businesses", label: "Жергілікті бизнеске қолдану" },
      ],
    }),
  },
  "/generative-engine-optimization": {
    en: enPhase2b({
      eyebrow: "Guide",
      h1: "How Generative Engine Optimization improves public business information",
      lead:
        "Generative Engine Optimization, or GEO, is human-led work that makes public business information easier for answer-generating systems to retrieve, connect to the correct entity, verify and cite.",
      summaryTitle: "Practical definition",
      summary:
        "GEO combines crawlable content, technical SEO, entity consistency, useful answers, primary evidence and measurement of generated outputs. It does not guarantee inclusion in training data or a recommendation.",
      published: "August 2, 2026",
      sections: [
        {
          heading: "GEO and SEO overlap",
          paragraphs: [
            "Answer engines often depend on searchable or retrievable web content. Correct status codes, canonical URLs, server-visible text, internal links, sitemaps and structured data therefore remain foundational. GEO does not replace those controls.",
            "The added focus is entity and answer clarity: a page should state what the product is, who publishes it, which problem it solves, how claims can be checked and where a reader can find the methodology.",
          ],
        },
        {
          heading: "A practical GEO workflow",
          bullets: [
            "Audit branded and unbranded answers before making changes.",
            "Correct contradictory names, descriptions, locations and product facts across authoritative pages.",
            "Publish self-contained product, methodology, about, contact, legal and documentation pages.",
            "Support claims with first-party evidence and cite primary external sources when external facts are necessary.",
            "Make public pages crawlable while keeping accounts, prompts, reports and APIs access-controlled.",
            "Rescan comparable prompts and record what changed; do not attribute every movement to one edit.",
          ],
        },
        {
          heading: "What human-led improvement can change",
          paragraphs: [
            "For a Kazakhstan business, practical work may correct inconsistent names, services, locations and contact facts; improve crawlability and structured identity; strengthen service, About and FAQ pages; publish useful explanations; and improve relevant local listings or third-party sources.",
            "The right action depends on the audit evidence. Publishing more pages is not automatically useful, and no single checklist applies to every company or industry.",
          ],
        },
        {
          heading: "What to avoid",
          paragraphs: [
            "Hidden keyword blocks, fake FAQs, doorway pages, fabricated citations and crawler-only content make the information less trustworthy. A useful GEO page should answer a real question for a person and expose the same facts to machines.",
          ],
        },
        {
          heading: "How Akrux fits",
          paragraphs: [
            "The Akrux audit stores prompts and sampled answers, separates branded recognition from unbranded discovery, identifies competing entities and sources, and produces versioned metrics. After a call, the team can use that evidence to plan and manually perform agreed work.",
            "Later user-initiated audits can show directional movement, but AI systems remain independent. Akrux cannot guarantee that an edit will produce a mention, citation, position or recommendation.",
          ],
        },
      ],
      related: [
        { path: "/services", label: "See what Akrux offers commercially" },
        { path: "/blogs/ai-visibility-kazakhstan", label: "Define the outcome being measured" },
        { path: "/blogs/audit-ai-generated-brand-information", label: "Run a factual entity audit" },
      ],
    }),
    ru: ruPhase2b({
      eyebrow: "Руководство",
      h1: "Как Generative Engine Optimization улучшает публичную информацию о бизнесе",
      lead:
        "Generative Engine Optimization, или GEO, — ручная работа, которая делает публичную информацию о бизнесе удобнее для поиска, сопоставления с правильной сущностью, проверки и цитирования системами генерации ответов.",
      summaryTitle: "Практическое определение",
      summary:
        "GEO объединяет доступный контент, техническое SEO, согласованность сущности, полезные ответы, первичные доказательства и измерение сгенерированных результатов. Оно не гарантирует попадание в обучающие данные или рекомендацию.",
      published: "2 августа 2026 года",
      sections: [
        {
          heading: "GEO и SEO пересекаются",
          paragraphs: [
            "Ответные системы часто зависят от индексируемого или извлекаемого веб-контента. Правильные статусы, канонические URL, серверный текст, внутренние ссылки, карта сайта и структурированные данные остаются фундаментом. GEO не заменяет эти механизмы.",
            "Дополнительный фокус — ясность сущности и ответа: страница должна прямо говорить, что это за продукт, кто его публикует, какую проблему он решает, как проверить заявления и где найти методологию.",
          ],
        },
        {
          heading: "Практический процесс GEO",
          bullets: [
            "Проверьте брендовые и небрендовые ответы до изменений.",
            "Устраните противоречия в названиях, описаниях, локациях и фактах на авторитетных страницах.",
            "Опубликуйте самостоятельные страницы продукта, методологии, компании, контактов, документов и справки.",
            "Подтверждайте заявления первичными данными и ссылайтесь на первичные внешние источники, когда они нужны.",
            "Откройте публичные страницы для обхода, но защитите аккаунты, вопросы, отчёты и API.",
            "Повторяйте сопоставимые проверки и фиксируйте изменения, не приписывая любое движение одной правке.",
          ],
        },
        {
          heading: "Что можно улучшить ручной работой",
          paragraphs: [
            "Для бизнеса в Казахстане практическая работа может исправлять противоречия в названиях, услугах, локациях и контактах; улучшать обход сайта и структурированную идентичность; усиливать страницы услуг, «О компании» и FAQ; публиковать полезные объяснения; дорабатывать релевантные локальные карточки и внешние источники.",
            "Подходящие действия определяются фактами аудита. Большее число страниц само по себе не приносит пользы, а единый список не подходит каждой компании и отрасли.",
          ],
        },
        {
          heading: "Чего избегать",
          paragraphs: [
            "Скрытые ключевые слова, фиктивные FAQ, дорвеи, выдуманные ссылки и отдельный контент для роботов снижают доверие. Хорошая GEO-страница отвечает на реальный вопрос человека и показывает машинам те же факты.",
          ],
        },
        {
          heading: "Роль Akrux",
          paragraphs: [
            "Аудит Akrux сохраняет вопросы и выборку ответов, отделяет узнаваемость бренда от небрендового обнаружения, определяет конкурирующие сущности и источники и рассчитывает версионированные метрики. После созвона команда может использовать эти данные для планирования и ручного выполнения согласованной работы.",
            "Более поздние проверки по инициативе пользователя могут показать направление изменений, но ИИ-системы остаются независимыми. Akrux не гарантирует, что правка приведёт к упоминанию, цитированию, позиции или рекомендации.",
          ],
        },
      ],
      related: [
        { path: "/services", label: "Коммерческие услуги Akrux" },
        { path: "/blogs/ai-visibility-kazakhstan", label: "Что измеряет GEO" },
        { path: "/blogs/audit-ai-generated-brand-information", label: "Фактический аудит сущности" },
      ],
    }),    kk: kkPhase2b({
      eyebrow: "Нұсқаулық",
      h1: "Generative Engine Optimization бизнес туралы жария ақпаратты қалай жақсартады",
      lead:
        "Generative Engine Optimization, немесе GEO, — бизнес туралы жария ақпаратты жауап жасайтын жүйелерге табуға, дұрыс сущностьпен салыстыруға, тексеруге және дәйексөз алуға ыңғайлы ететін қолмен жасалатын жұмыс.",
      summaryTitle: "Практикалық анықтама",
      summary:
        "GEO қолжетімді мазмұнды, техникалық SEO-ны, сущность үйлесімділігін, пайдалы жауаптарды, бастапқы дәлелдерді және жасалған нәтижелерді өлшеуді біріктіреді. Ол оқыту деректеріне түсуге немесе ұсынылуға кепілдік бермейді.",
      published: "2026 жылғы 2 тамыз",
      sections: [
        {
          heading: "GEO мен SEO қиылысады",
          paragraphs: [
            "Жауап жүйелері көбіне индекстелетін немесе шығарып алынатын веб-мазмұнға тәуелді. Дұрыс статустар, канондық URL-дар, сервер мәтіні, ішкі сілтемелер, сайт картасы және құрылымдық деректер негіз болып қала береді. GEO бұл тетіктерді алмастырмайды.",
            "Қосымша назар — сущность пен жауап айқындығы: бет бұл қандай өнім екенін, оны кім жариялайтынын, қандай мәселені шешетінін, мәлімдемелерді қалай тексеруге болатынын және әдістемені қайдан табуға болатынын тікелей айтуы тиіс.",
          ],
        },
        {
          heading: "GEO практикалық процесі",
          bullets: [
            "Өзгерістерге дейін брендтік және брендсіз жауаптарды тексеріңіз.",
            "Беделді беттердегі атаулар, сипаттамалар, орындар мен фактілердегі қайшылықтарды жойыңыз.",
            "Өнім, әдістеме, компания, байланыс, құжаттар және анықтама беттерін өзінше толық етіп жариялаңыз.",
            "Мәлімдемелерді бастапқы деректермен растаңыз және қажет болғанда бастапқы сыртқы дереккөздерге сілтеңіз.",
            "Жария беттерді аралауға ашыңыз, бірақ аккаунттарды, сұрақтарды, есептер мен API-ды қорғаңыз.",
            "Салыстырмалы тексерулерді қайталап, өзгерістерді тіркеңіз, әрі кез келген қозғалысты бір түзетуге жатқызбаңыз.",
          ],
        },
        {
          heading: "Қолмен жұмыспен нені жақсартуға болады",
          paragraphs: [
            "Қазақстандағы бизнес үшін практикалық жұмыс атаулардағы, қызметтердегі, орындардағы және байланыстардағы қайшылықтарды түзете алады; сайтты аралауды және құрылымдық бірегейлікті жақсарта алады; қызметтер, «Компания туралы» және FAQ беттерін күшейте алады; пайдалы түсіндірмелер жариялай алады; орынды жергілікті карточкалар мен сыртқы дереккөздерді пысықтай алады.",
            "Қолайлы әрекеттер аудит фактілерімен анықталады. Беттердің көбеюі өздігінен пайда әкелмейді, ал біртұтас тізім әр компания мен салаға келе бермейді.",
          ],
        },
        {
          heading: "Неден аулақ болу керек",
          paragraphs: [
            "Жасырын кілт сөздер, жалған FAQ, дорвейлер, ойдан шығарылған сілтемелер және роботтарға арналған бөлек мазмұн сенімді төмендетеді. Жақсы GEO беті адамның нақты сұрағына жауап береді және машиналарға дәл сол фактілерді көрсетеді.",
          ],
        },
        {
          heading: "Akrux рөлі",
          paragraphs: [
            "Akrux аудиті сұрақтар мен жауаптар таңдамасын сақтайды, бренд танымалдығын брендсіз табылудан ажыратады, бәсекелес сущностьтар мен дереккөздерді анықтайды және нұсқаланған метрикаларды есептейді. Қоңыраудан кейін команда бұл деректерді келісілген жұмысты жоспарлау және қолмен орындау үшін пайдалана алады.",
            "Пайдаланушы бастамасымен кейінірек жасалған тексерулер өзгеріс бағытын көрсете алады, бірақ ЖИ жүйелері тәуелсіз болып қалады. Akrux түзетудің аталымға, дәйексөзге, позицияға немесе ұсынысқа әкелетініне кепілдік бермейді.",
          ],
        },
      ],
      related: [
        { path: "/services", label: "Akrux коммерциялық қызметтері" },
        { path: "/blogs/ai-visibility-kazakhstan", label: "GEO нені өлшейді" },
        { path: "/blogs/audit-ai-generated-brand-information", label: "Сущностьтың нақты аудиті" },
      ],
    }),
  },
  "/use-cases": {
    en: enPhase2b({
      eyebrow: "Use cases",
      h1: "AI-visibility audit questions by business type",
      lead:
        "Different businesses need different buyer questions and evidence checks. These examples show how an audit can be adapted; they are not Akrux client case studies or promised outcomes.",
      summaryTitle: "How to use these examples",
      summary:
        "Start with the real way customers discover the business, then review the sampled answer, competitors and citations. The appropriate improvement work depends on the evidence and is agreed separately after the free audit.",
      sections: [
        {
          heading: "Local businesses",
          paragraphs: [
            "Local discovery usually combines a service or category with a city, district, opening need or practical constraint. Audit questions should check whether the correct business appears, which nearby alternatives recur, and whether answers rely on the business website, maps, directories or editorial sources.",
            "Name, service, city, service-area and contact consistency are especially important. The dedicated local-business guide covers Kazakhstan-specific review steps in more detail.",
          ],
          examples: [
            "“Recommend a coffee shop in Almaty for a quiet meeting.”",
            "“Which dental clinic in Astana offers weekend appointments?”",
          ],
        },
        {
          heading: "Ecommerce",
          paragraphs: [
            "Product-discovery answers can mix a manufacturer, product, retailer and marketplace. Review category and purchase questions separately, check whether availability or specifications are current, and do not treat every marketplace as a competing brand.",
            "Useful evidence includes current product pages, delivery or warranty information and truthful third-party reviews. Akrux exposes returned citations but does not ingest a private product feed or guarantee that generated availability information is current.",
          ],
          examples: [
            "“Compare refillable skincare brands available in Kazakhstan.”",
            "“Where can I buy a compact espresso machine with a local warranty?”",
          ],
        },
        {
          heading: "Professional services",
          paragraphs: [
            "Expertise-led services are often discovered through specialty, location, eligibility and trust. Review names, service scope, locations and any material credentials against current authoritative sources, and do not treat generated legal, medical or financial text as professional advice.",
            "The audit records prompts, sampled answers, entities, positions and citations. It does not validate professional qualifications or certify an answer; sensitive facts require a competent human review.",
          ],
          examples: [
            "“Which firms handle cross-border tax for small exporters?”",
            "“Find a clinic in Almaty offering the stated service.”",
          ],
        },
        {
          heading: "SaaS and digital products",
          paragraphs: [
            "Discovery often begins with a workflow, audience, integration or alternative rather than the product name. Compare unbranded category and alternative prompts with the current product definition, documentation, availability and dated comparison criteria.",
            "Old names, conflicting homepage and documentation claims, or unsupported feature statements can make the product harder to resolve. The audit can show which public sources an answer used, but it does not prove product-market fit or automate changes.",
          ],
          examples: [
            "“Which tools track brand appearances in AI-generated answers?”",
            "“Compare tools for reviewing competitor recommendations in AI search.”",
          ],
        },
        {
          heading: "Shared starting point",
          bullets: [
            "Define the exact business entity and aliases.",
            "Use prompts grounded in actual services and customer needs.",
            "Review the answer and citations, not only the score.",
            "Separate model variability from correctable source gaps.",
            "Treat every later audit as a fresh dated sample, not proof that one change caused the result.",
          ],
        },
      ],
      related: [
        { path: "/use-cases/local-businesses", label: "Detailed local-business guidance" },
        { path: "/services", label: "How Akrux's service works" },
        { path: "/blogs/ai-visibility-kazakhstan", label: "Understand AI visibility in Kazakhstan" },
        { path: "/methodology", label: "Review measurement rules" },
      ],
    }),
    ru: ruPhase2b({
      eyebrow: "Сценарии",
      h1: "Вопросы аудита видимости в ИИ для разных типов бизнеса",
      lead:
        "Разным компаниям нужны разные клиентские вопросы и проверки источников. Это примеры настройки аудита, а не кейсы клиентов Akrux и не обещанные результаты.",
      summaryTitle: "Как использовать примеры",
      summary:
        "Начните с реального способа поиска бизнеса клиентами, затем изучите выборку ответов, конкурентов и источников. Подходящая работа по улучшению определяется доказательствами и согласуется отдельно после бесплатного аудита.",
      sections: [
        {
          heading: "Локальный бизнес",
          paragraphs: [
            "Локальное обнаружение обычно объединяет услугу или категорию с городом, районом, временем работы или практическим условием. Вопросы должны показывать, появляется ли правильный бизнес, какие местные альтернативы повторяются и использует ли ответ сайт компании, карты, каталоги или редакционные источники.",
            "Особенно важны единые название, услуги, город, зона обслуживания и контакты. В отдельном руководстве для локального бизнеса собраны подробные шаги с учётом Казахстана.",
          ],
          examples: [
            "«Посоветуйте тихую кофейню в Алматы для встречи».",
            "«Какая стоматология в Астане работает по выходным?»",
          ],
        },
        {
          heading: "Электронная торговля",
          paragraphs: [
            "В ответах о выборе товара могут смешиваться производитель, продукт, продавец и маркетплейс. Анализируйте вопросы категории и покупки отдельно, проверяйте актуальность наличия и характеристик и не считайте каждый маркетплейс конкурирующим брендом.",
            "Полезные доказательства — актуальные страницы товаров, условия доставки или гарантии и достоверные внешние отзывы. Akrux показывает возвращённые источники, но не загружает приватный товарный фид и не гарантирует актуальность наличия в ответе ИИ.",
          ],
          examples: [
            "«Сравните бренды многоразовой косметической упаковки в Казахстане».",
            "«Где купить компактную кофемашину с местной гарантией?»",
          ],
        },
        {
          heading: "Профессиональные услуги",
          paragraphs: [
            "Экспертные услуги часто ищут по специализации, месту, условиям и доверию. Сверяйте названия, перечень услуг, локации и существенные сведения о квалификации с актуальными авторитетными источниками и не воспринимайте юридические, медицинские или финансовые тексты ИИ как консультацию.",
            "Аудит сохраняет вопросы, выборку ответов, сущности, позиции и источники. Он не проверяет профессиональную квалификацию и не сертифицирует ответ; чувствительные факты должен оценивать компетентный человек.",
          ],
          examples: [
            "«Какие компании ведут международные налоги малых экспортёров?»",
            "«Найдите клинику в Алматы с указанной услугой».",
          ],
        },
        {
          heading: "SaaS и цифровые продукты",
          paragraphs: [
            "Поиск часто начинается с задачи, аудитории, интеграции или альтернативы, а не с названия продукта. Сопоставляйте небрендовые вопросы категории и сравнения с актуальным определением продукта, документацией, доступностью и датированными критериями.",
            "Старые названия, противоречия между главной страницей и документацией или неподтверждённые функции затрудняют идентификацию. Аудит показывает использованные публичные источники, но не доказывает соответствие рынку и не внедряет изменения автоматически.",
          ],
          examples: [
            "«Какие инструменты отслеживают появление бренда в ответах ИИ?»",
            "«Сравните сервисы для анализа рекомендаций конкурентов в ИИ-поиске».",
          ],
        },
        {
          heading: "Общая отправная точка",
          bullets: [
            "Точно определите бизнес-сущность и варианты названия.",
            "Стройте вопросы на реальных услугах и потребностях клиентов.",
            "Проверяйте ответ и источники, а не только индекс.",
            "Отделяйте изменчивость модели от исправимых пробелов в источниках.",
            "Считайте каждую повторную проверку свежей датированной выборкой, а не доказательством влияния одной правки.",
          ],
        },
      ],
      related: [
        { path: "/use-cases/local-businesses", label: "Подробно о локальном бизнесе" },
        { path: "/services", label: "Как устроена услуга Akrux" },
        { path: "/blogs/ai-visibility-kazakhstan", label: "Видимость в ИИ для бизнеса Казахстана" },
        { path: "/methodology", label: "Правила измерения" },
      ],
    }),    kk: kkPhase2b({
      eyebrow: "Сценарийлер",
      h1: "Бизнестің әр түріне арналған ЖИ-дегі көріну аудитінің сұрақтары",
      lead:
        "Әр компанияға әртүрлі клиент сұрақтары мен дереккөз тексерулері қажет. Бұл — аудитті баптау мысалдары, Akrux клиенттерінің кейстері де, уәде етілген нәтижелер де емес.",
      summaryTitle: "Мысалдарды қалай пайдалану керек",
      summary:
        "Клиенттер бизнесті шын мәнінде қалай іздейтінінен бастаңыз, содан кейін жауаптар, бәсекелестер мен дереккөздер таңдамасын қараңыз. Қолайлы жақсарту жұмысы дәлелдермен анықталады және тегін аудиттен кейін бөлек келісіледі.",
      sections: [
        {
          heading: "Жергілікті бизнес",
          paragraphs: [
            "Жергілікті табылу әдетте қызметті немесе санатты қаламен, ауданмен, жұмыс уақытымен немесе практикалық шартпен біріктіреді. Сұрақтар дұрыс бизнестің шығатынын, қандай жергілікті баламалар қайталанатынын және жауаптың компания сайтын, карталарды, каталогтарды немесе редакциялық дереккөздерді пайдаланатынын көрсетуі тиіс.",
            "Бірыңғай атау, қызметтер, қала, қызмет көрсету аймағы және байланыстар әсіресе маңызды. Жергілікті бизнеске арналған бөлек нұсқаулықта Қазақстанды ескеретін толық қадамдар жинақталған.",
          ],
          examples: [
            "«Алматыдан кездесуге ыңғайлы тыныш кофехана ұсыныңыз».",
            "«Астанада демалыс күндері жұмыс істейтін қай стоматология бар?»",
          ],
        },
        {
          heading: "Электрондық сауда",
          paragraphs: [
            "Тауар таңдау туралы жауаптарда өндіруші, өнім, сатушы және маркетплейс араласуы мүмкін. Санат пен сатып алу сұрақтарын бөлек талдаңыз, қолжетімділік пен сипаттамалардың өзектілігін тексеріңіз және әр маркетплейсті бәсекелес бренд деп есептемеңіз.",
            "Пайдалы дәлелдер — өзекті тауар беттері, жеткізу немесе кепілдік шарттары және сенімді сыртқы пікірлер. Akrux қайтарылған дереккөздерді көрсетеді, бірақ жеке тауар фидін жүктемейді және ЖИ жауабындағы қолжетімділіктің өзектілігіне кепілдік бермейді.",
          ],
          examples: [
            "«Қазақстандағы көп рет қолданылатын косметика қаптамасының брендтерін салыстырыңыз».",
            "«Жергілікті кепілдігі бар шағын кофемашинаны қайдан сатып алуға болады?»",
          ],
        },
        {
          heading: "Кәсіби қызметтер",
          paragraphs: [
            "Сараптамалық қызметтерді көбіне мамандық, орын, шарттар және сенім бойынша іздейді. Атауларды, қызметтер тізімін, орындарды және біліктілік туралы елеулі мәліметтерді өзекті беделді дереккөздермен салыстырыңыз әрі ЖИ жазған заңдық, медициналық немесе қаржылық мәтіндерді кеңес деп қабылдамаңыз.",
            "Аудит сұрақтарды, жауаптар таңдамасын, сущностьтарды, позициялар мен дереккөздерді сақтайды. Ол кәсіби біліктілікті тексермейді және жауапты сертификаттамайды; сезімтал фактілерді құзыретті адам бағалауы тиіс.",
          ],
          examples: [
            "«Шағын экспорттаушылардың халықаралық салықтарын қандай компаниялар жүргізеді?»",
            "«Алматыдан көрсетілген қызметі бар клиника табыңыз».",
          ],
        },
        {
          heading: "SaaS және цифрлық өнімдер",
          paragraphs: [
            "Іздеу көбіне өнім атауынан емес, міндеттен, аудиториядан, интеграциядан немесе баламадан басталады. Санат пен салыстырудың брендсіз сұрақтарын өнімнің өзекті анықтамасымен, құжаттамамен, қолжетімділікпен және күні көрсетілген өлшемдермен салыстырыңыз.",
            "Ескі атаулар, басты бет пен құжаттама арасындағы қайшылықтар немесе расталмаған функциялар сәйкестендіруді қиындатады. Аудит пайдаланылған жария дереккөздерді көрсетеді, бірақ нарыққа сәйкестікті дәлелдемейді және өзгерістерді автоматты енгізбейді.",
          ],
          examples: [
            "«Брендтің ЖИ жауаптарында шығуын қандай құралдар бақылайды?»",
            "«ЖИ-іздеудегі бәсекелестер ұсыныстарын талдайтын сервистерді салыстырыңыз».",
          ],
        },
        {
          heading: "Ортақ бастау нүктесі",
          bullets: [
            "Бизнес-сущность пен атау нұсқаларын нақты анықтаңыз.",
            "Сұрақтарды нақты қызметтер мен клиент қажеттіліктеріне сүйеніп құрыңыз.",
            "Тек индексті емес, жауап пен дереккөздерді тексеріңіз.",
            "Модель өзгергіштігін дереккөздердегі түзетуге болатын олқылықтардан ажыратыңыз.",
            "Әр қайталама тексеруді бір түзетудің әсерін дәлелдейтін нәрсе емес, жаңа әрі күні көрсетілген таңдама деп есептеңіз.",
          ],
        },
      ],
      related: [
        { path: "/use-cases/local-businesses", label: "Жергілікті бизнес туралы толығырақ" },
        { path: "/services", label: "Akrux қызметі қалай құрылған" },
        { path: "/blogs/ai-visibility-kazakhstan", label: "Қазақстан бизнесіне ЖИ-дегі көріну" },
        { path: "/methodology", label: "Өлшеу ережелері" },
      ],
    }),
  },
  "/use-cases/local-businesses": {
    en: enPhase2b({
      eyebrow: "Use case",
      h1: "AI visibility for local businesses in Kazakhstan",
      lead:
        "Local AI visibility depends on whether a system can connect the right business, service and place using consistent public information and relevant local sources.",
      summaryTitle: "Practical measurement goal",
      summary:
        "Use customer-style questions tied to a real city or service area, then review business appearances, competitors, answer-level positions and citations as a dated sample. No listing or content change guarantees a recommendation.",
      sections: [
        {
          heading: "Start with one consistent local business identity",
          paragraphs: [
            "Use the same official or customer-facing name, service description, website and current contact details across pages the business controls. If a business serves customers at a location, state the real city and address accurately. If it travels or works remotely, describe the genuine service area instead of implying a walk-in location.",
            "Check for old names, duplicate map listings, inconsistent categories and similarly named companies. Consistency helps systems resolve the intended entity, but it does not guarantee inclusion in an AI answer.",
          ],
        },
        {
          heading: "Review Russian, Kazakh and English public information",
          paragraphs: [
            "A Kazakhstan business may be described across Russian, Kazakh and English websites, listings or articles. The core name, services, city, hours and contact facts should not contradict one another across those sources.",
            "Akrux's interface and public information are available in Kazakh, Russian and English, while report content is still produced in Russian and English. Kazakh public sources remain relevant evidence and should be reviewed by someone fluent in the language when accuracy matters.",
          ],
        },
        {
          heading: "Use real local service pages",
          paragraphs: [
            "A homepage name alone may not explain what the business does in a specific place. Publish crawlable text for real services, eligibility, booking or purchase steps, city or service area, and current contact or location information. Avoid city pages for places the business does not serve.",
          ],
        },
        {
          heading: "Ask customer-style local questions",
          examples: [
            "“Recommend a coffee shop in Almaty for a quiet meeting.”",
            "“Which dental clinic in Astana offers weekend appointments?”",
            "“Compare independent hotels near the center of Shymkent.”",
            "“Which accounting firms work with small exporters in Kazakhstan?”",
          ],
        },
        {
          heading: "Review competitors, positions and citations together",
          paragraphs: [
            "A competitor appearance can reflect stronger prompt fit, clearer local evidence, better entity consistency or normal model variability. Check the original answer before treating every extracted name as a true competitor, and distinguish maps, directories, marketplaces and associations from operating businesses.",
            "Open returned citations where available. Look for missing first-party service information, outdated directory facts, unsupported descriptions and recurring sources that describe competitors more clearly. A citation is evidence used in that sampled answer, not proof of a permanent ranking.",
          ],
        },
        {
          heading: "Check local listings without treating them as a guarantee",
          bullets: [
            "Correct business-owned map and directory listings that contain inaccurate names, categories, locations, hours or website links.",
            "Prioritize relevant Kazakhstan listings and authoritative industry sources rather than creating profiles everywhere.",
            "Keep contact and location facts aligned with the website and actual operating model.",
            "Do not buy fake reviews, fabricate citations or assume that a listing forces an AI system to recommend the business.",
          ],
        },
        {
          heading: "Rescan after agreed improvements",
          paragraphs: [
            "After factual and technical work has been completed and public sources have had time to update, start a fresh audit using comparable types of buyer questions. Compare the dated answers, coverage, competitors and sources directionally.",
            "A later result can change because of the work, but also because the model, prompt wording, retrieval and date changed. Akrux does not provide continuous monitoring and cannot guarantee improvement in a later sample.",
          ],
        },
      ],
      related: [
        { path: "/services", label: "See how Akrux supports agreed improvement work" },
        { path: "/blogs/ai-visibility-kazakhstan", label: "Understand AI visibility in Kazakhstan" },
        { path: "/blogs/audit-ai-generated-brand-information", label: "Audit local entity facts" },
        { path: "/methodology", label: "See how directories are filtered" },
      ],
    }),
    ru: ruPhase2b({
      eyebrow: "Сценарий",
      h1: "Видимость локального бизнеса Казахстана в ответах ИИ",
      lead:
        "Локальная видимость зависит от того, может ли ИИ связать правильный бизнес, услугу и место с помощью согласованной публичной информации и релевантных локальных источников.",
      summaryTitle: "Практическая цель измерения",
      summary:
        "Используйте клиентские вопросы о реальном городе или зоне обслуживания, затем изучайте появления бизнеса, конкурентов, позиции и источники как датированную выборку. Карточки и контент не гарантируют рекомендацию.",
      sections: [
        {
          heading: "Начните с единой локальной идентичности",
          paragraphs: [
            "Используйте одно официальное или привычное клиентам название, описание услуг, сайт и актуальные контакты на подконтрольных страницах. Если бизнес принимает клиентов на месте, точно укажите реальный город и адрес. Если команда выезжает или работает удалённо, опишите настоящую зону обслуживания без выдуманной точки приёма.",
            "Проверьте старые названия, дубли карточек на картах, разные категории и компании с похожим названием. Согласованность помогает определить нужную сущность, но не гарантирует появление в ответе ИИ.",
          ],
        },
        {
          heading: "Проверьте русские, казахские и английские источники",
          paragraphs: [
            "Бизнес Казахстана может быть описан на русском, казахском и английском в сайтах, карточках и публикациях. Название, услуги, город, часы работы и контакты не должны противоречить друг другу в этих источниках.",
            "Интерфейс и публичная информация Akrux доступны на казахском, русском и английском, а содержимое отчётов пока формируется на русском и английском. Казахские публичные источники остаются важными доказательствами, и при существенных фактах их должен проверять человек, свободно владеющий языком.",
          ],
        },
        {
          heading: "Опишите реальные локальные услуги",
          paragraphs: [
            "Одного названия на главной недостаточно, чтобы объяснить услуги в конкретном месте. Опубликуйте обычным индексируемым текстом реальные услуги, условия, шаги записи или покупки, город или зону обслуживания и актуальные контакты или локацию. Не создавайте городские страницы для мест, где бизнес не работает.",
          ],
        },
        {
          heading: "Используйте локальные вопросы от лица клиента",
          examples: [
            "«Посоветуйте тихую кофейню в Алматы для встречи».",
            "«Какая стоматология в Астане работает по выходным?»",
            "«Сравните независимые отели рядом с центром Шымкента».",
            "«Какие бухгалтерские компании работают с малыми экспортёрами в Казахстане?»",
          ],
        },
        {
          heading: "Анализируйте конкурентов, позиции и источники вместе",
          paragraphs: [
            "Появление конкурента может объясняться лучшим соответствием вопросу, более ясными локальными доказательствами, единой сущностью или обычной изменчивостью модели. Проверяйте исходный ответ, прежде чем считать каждое найденное название реальным конкурентом, и отделяйте карты, каталоги, маркетплейсы и ассоциации от работающих компаний.",
            "Открывайте возвращённые источники, если они есть. Ищите недостающую информацию об услугах на сайте бизнеса, устаревшие факты в каталогах, неподтверждённые описания и источники, которые яснее рассказывают о конкурентах. Цитирование относится к конкретной выборке и не доказывает постоянную позицию.",
          ],
        },
        {
          heading: "Работайте с локальными карточками без обещаний",
          bullets: [
            "Исправьте подконтрольные карточки на картах и в каталогах с неверным названием, категорией, адресом, временем работы или сайтом.",
            "Сосредоточьтесь на релевантных карточках Казахстана и авторитетных отраслевых источниках, а не создавайте профили повсюду.",
            "Согласуйте контакты и локацию с сайтом и реальной моделью работы.",
            "Не покупайте фиктивные отзывы, не выдумывайте ссылки и не считайте, что карточка заставит ИИ рекомендовать бизнес.",
          ],
        },
        {
          heading: "Повторите аудит после согласованных улучшений",
          paragraphs: [
            "После завершения фактических и технических работ и обновления публичных источников запустите свежий аудит с сопоставимыми типами вопросов покупателей. Сравнивайте датированные ответы, покрытие, конкурентов и источники как направление изменений.",
            "Результат может измениться из-за работы, но также из-за модели, формулировки, поиска и даты. Akrux не ведёт постоянный мониторинг и не гарантирует улучшение следующей выборки.",
          ],
        },
      ],
      related: [
        { path: "/services", label: "Как Akrux помогает с согласованной работой" },
        { path: "/blogs/ai-visibility-kazakhstan", label: "Видимость в ИИ для бизнеса Казахстана" },
        { path: "/blogs/audit-ai-generated-brand-information", label: "Аудит локальных фактов" },
        { path: "/methodology", label: "Фильтрация каталогов" },
      ],
    }),    kk: kkPhase2b({
      eyebrow: "Сценарий",
      h1: "Қазақстандағы жергілікті бизнестің ЖИ жауаптарындағы көрінуі",
      lead:
        "Жергілікті көріну ЖИ дұрыс бизнесті, қызметті және орынды үйлесімді жария ақпарат пен орынды жергілікті дереккөздер арқылы байланыстыра ала ма, соған байланысты.",
      summaryTitle: "Өлшеудің практикалық мақсаты",
      summary:
        "Нақты қала немесе қызмет көрсету аймағы туралы клиент сұрақтарын пайдаланыңыз, содан кейін бизнестің шығуын, бәсекелестерді, позициялар мен дереккөздерді күні көрсетілген таңдама ретінде қараңыз. Карточкалар мен мазмұн ұсынысқа кепілдік бермейді.",
      sections: [
        {
          heading: "Бірыңғай жергілікті бірегейліктен бастаңыз",
          paragraphs: [
            "Өзіңіз бақылайтын беттерде бір ресми немесе клиенттерге таныс атауды, қызметтер сипаттамасын, сайтты және өзекті байланыстарды пайдаланыңыз. Бизнес клиенттерді орнында қабылдаса, нақты қала мен мекенжайды дәл көрсетіңіз. Команда шығып жұмыс істесе немесе қашықтан жұмыс істесе, ойдан шығарылған қабылдау нүктесінсіз шынайы қызмет көрсету аймағын сипаттаңыз.",
            "Ескі атауларды, карталардағы қайталанатын карточкаларды, әртүрлі санаттарды және атауы ұқсас компанияларды тексеріңіз. Үйлесімділік қажетті сущностьты анықтауға көмектеседі, бірақ ЖИ жауабында шығуға кепілдік бермейді.",
          ],
        },
        {
          heading: "Орыс, қазақ және ағылшын дереккөздерін тексеріңіз",
          paragraphs: [
            "Қазақстан бизнесі сайттарда, карточкаларда және басылымдарда орыс, қазақ және ағылшын тілдерінде сипатталуы мүмкін. Атау, қызметтер, қала, жұмыс уақыты және байланыстар осы дереккөздерде бір-біріне қайшы келмеуі тиіс.",
            "Akrux интерфейсі мен жария ақпараты қазақ, орыс және ағылшын тілдерінде қолжетімді, ал есептердің мазмұны әзірге орыс және ағылшын тілдерінде жасалады. Қазақ тіліндегі жария дереккөздер бәрібір маңызды болуы мүмкін, және елеулі фактілерді тілді еркін меңгерген адам тексеруі тиіс.",
          ],
        },
        {
          heading: "Нақты жергілікті қызметтерді сипаттаңыз",
          paragraphs: [
            "Нақты орындағы қызметтерді түсіндіру үшін басты беттегі атау жеткіліксіз. Әдеттегі индекстелетін мәтінмен нақты қызметтерді, шарттарды, жазылу немесе сатып алу қадамдарын, қаланы немесе қызмет көрсету аймағын және өзекті байланыстар мен орынды жариялаңыз. Бизнес жұмыс істемейтін жерлерге арналған қалалық беттер жасамаңыз.",
          ],
        },
        {
          heading: "Клиент атынан жергілікті сұрақтарды пайдаланыңыз",
          examples: [
            "«Алматыдан кездесуге ыңғайлы тыныш кофехана ұсыныңыз».",
            "«Астанада демалыс күндері жұмыс істейтін қай стоматология бар?»",
            "«Шымкент орталығына жақын тәуелсіз қонақүйлерді салыстырыңыз».",
            "«Қазақстанда шағын экспорттаушылармен қандай бухгалтерлік компаниялар жұмыс істейді?»",
          ],
        },
        {
          heading: "Бәсекелестерді, позициялар мен дереккөздерді бірге талдаңыз",
          paragraphs: [
            "Бәсекелестің шығуы сұраққа жақсырақ сәйкестікпен, айқынырақ жергілікті дәлелдермен, бірыңғай сущностьпен немесе модельдің әдеттегі өзгергіштігімен түсіндірілуі мүмкін. Табылған әр атауды нақты бәсекелес деп есептеместен бұрын бастапқы жауапты тексеріңіз және карталарды, каталогтарды, маркетплейстер мен қауымдастықтарды жұмыс істеп тұрған компаниялардан ажыратыңыз.",
            "Қайтарылған дереккөздер болса, оларды ашыңыз. Бизнес сайтындағы қызметтер туралы жетіспейтін ақпаратты, каталогтардағы ескірген фактілерді, расталмаған сипаттамаларды және бәсекелестер туралы айқынырақ айтатын дереккөздерді іздеңіз. Дәйексөз нақты таңдамаға қатысты және тұрақты позицияны дәлелдемейді.",
          ],
        },
        {
          heading: "Жергілікті карточкалармен уәдесіз жұмыс істеңіз",
          bullets: [
            "Атауы, санаты, мекенжайы, жұмыс уақыты немесе сайты дұрыс емес, өзіңіз бақылайтын карта және каталог карточкаларын түзетіңіз.",
            "Барлық жерде профиль жасаудың орнына Қазақстанның орынды карточкалары мен беделді салалық дереккөздеріне назар аударыңыз.",
            "Байланыстар мен орынды сайтпен және нақты жұмыс моделімен үйлестіріңіз.",
            "Жалған пікірлер сатып алмаңыз, сілтемелерді ойдан шығармаңыз және карточка ЖИ-ді бизнесті ұсынуға мәжбүрлейді деп ойламаңыз.",
          ],
        },
        {
          heading: "Келісілген жақсартулардан кейін аудитті қайталаңыз",
          paragraphs: [
            "Нақты және техникалық жұмыстар аяқталып, жария дереккөздер жаңартылған соң, сатып алушылардың салыстырмалы сұрақ түрлерімен жаңа аудитті іске қосыңыз. Күні көрсетілген жауаптарды, қамтуды, бәсекелестер мен дереккөздерді өзгеріс бағыты ретінде салыстырыңыз.",
            "Нәтиже жұмысқа байланысты да, модельге, тұжырымға, іздеуге және күнге байланысты да өзгеруі мүмкін. Akrux тұрақты мониторинг жүргізбейді және келесі таңдаманың жақсаруына кепілдік бермейді.",
          ],
        },
      ],
      related: [
        { path: "/services", label: "Akrux келісілген жұмыста қалай көмектеседі" },
        { path: "/blogs/ai-visibility-kazakhstan", label: "Қазақстан бизнесіне ЖИ-дегі көріну" },
        { path: "/blogs/audit-ai-generated-brand-information", label: "Жергілікті фактілер аудиті" },
        { path: "/methodology", label: "Каталогтарды сүзу" },
      ],
    }),
  },
  "/pricing": {
    en: enPhase2b({
      eyebrow: "Pricing",
      h1: "Start with a free visibility scan",
      lead:
        "The initial AI-visibility audit is free during Akrux's current testing stage. Optional human-assisted improvement work is reviewed and scoped separately.",
      summaryTitle: "Current pricing status",
      summary:
        "Akrux does not currently publish a fixed subscription or universal service price. The work required depends on the audit, the business and the competitive evidence; no AI placement is guaranteed.",
      sections: [
        {
          heading: "Free initial audit during testing",
          bullets: [
            "Business research and a 25-prompt set under the current default configuration, subject to application and provider limits.",
            "Coverage across ChatGPT, Gemini and Perplexity model families using the configured free-scan plan.",
            "Visibility Score, branded diagnostic, answers, prompts, competitors, citations and Share of Voice.",
            "Private report access through a verified account in production.",
          ],
        },
        {
          heading: "Optional improvement work",
          paragraphs: [
            "After reviewing the private report, a business owner may book a call. Akrux can propose manual work such as correcting public entity facts, improving crawlability, strengthening useful first-party information or reviewing source gaps. Price, deliverables and timing are agreed separately and are not implied by the free audit.",
            "Booking a call does not guarantee that Akrux will accept every project. The team first checks whether there is a useful and responsible scope of work.",
          ],
        },
        {
          heading: "No fixed public package or guaranteed placement",
          paragraphs: [
            "There is currently no public fixed subscription, currency-based package or universal price for improvement work. Akrux does not sell or guarantee indexing, mentions, citations, positions, rankings or recommendations because providers and AI systems remain independent.",
          ],
        },
      ],
      related: [
        { path: "/services", label: "Review the available service process" },
        { path: "/product", label: "See what the scan includes" },
        { path: "/methodology", label: "Read how metrics are calculated" },
        { path: "/contact", label: "Discuss a report" },
      ],
    }),
    ru: ruPhase2b({
      eyebrow: "Тарифы",
      h1: "Начните с бесплатной проверки видимости",
      lead:
        "Начальный аудит видимости в ИИ бесплатный на текущем этапе тестирования Akrux. Необязательная ручная работа команды разбирается и оценивается отдельно.",
      summaryTitle: "Текущий статус цены",
      summary:
        "Akrux пока не публикует фиксированную подписку или универсальную цену услуги. Необходимый объём зависит от аудита, бизнеса и конкурентных данных; позиции в ИИ не гарантируются.",
      sections: [
        {
          heading: "Бесплатный начальный аудит на этапе тестирования",
          bullets: [
            "Исследование бизнеса и набор из 25 вопросов в текущей стандартной конфигурации с учётом лимитов приложения и провайдера.",
            "Покрытие семейств ChatGPT, Gemini и Perplexity по настроенному бесплатному плану.",
            "Индекс видимости, брендовый показатель, ответы, вопросы, конкуренты, источники и доля голоса.",
            "Приватный отчёт через подтверждённый аккаунт в рабочей среде.",
          ],
        },
        {
          heading: "Необязательная работа по улучшению",
          paragraphs: [
            "После изучения закрытого отчёта владелец может записаться на созвон. Akrux может предложить ручную работу: исправление публичных фактов о сущности, улучшение обхода сайта, усиление полезной информации или разбор пробелов в источниках. Цена, результат работ и сроки согласуются отдельно и не следуют из бесплатного аудита.",
            "Запись на созвон не означает, что Akrux примет любой проект. Сначала команда проверяет, существует ли полезный и ответственный объём работы.",
          ],
        },
        {
          heading: "Нет фиксированного пакета и гарантии позиции",
          paragraphs: [
            "Сейчас нет публичной фиксированной подписки, пакета в определённой валюте или универсальной цены на улучшения. Akrux не продаёт и не гарантирует индексацию, упоминания, цитирование, позиции, рейтинги или рекомендации, потому что провайдеры и ИИ-системы независимы.",
          ],
        },
      ],
      related: [
        { path: "/services", label: "Как устроена услуга" },
        { path: "/product", label: "Состав проверки" },
        { path: "/methodology", label: "Расчёт метрик" },
        { path: "/contact", label: "Обсудить отчёт" },
      ],
    }),    kk: kkPhase2b({
      eyebrow: "Бағалар",
      h1: "Көрінудің тегін тексеруінен бастаңыз",
      lead:
        "ЖИ-дегі көрінудің бастапқы аудиті Akrux-тің ағымдағы тестілеу кезеңінде тегін. Команданың міндетті емес қолмен жұмысы бөлек талданып, бағаланады.",
      summaryTitle: "Бағаның ағымдағы мәртебесі",
      summary:
        "Akrux әзірге тіркелген жазылымды немесе қызметтің әмбебап бағасын жарияламайды. Қажетті көлем аудитке, бизнеске және бәсекелестік деректерге байланысты; ЖИ-дегі позициялар кепілдендірілмейді.",
      sections: [
        {
          heading: "Тестілеу кезеңіндегі тегін бастапқы аудит",
          bullets: [
            "Қосымша мен провайдер лимиттерін ескере отырып, бизнесті зерттеу және қазіргі стандартты конфигурациядағы 25 сұрақтан тұратын жиын.",
            "Бапталған тегін жоспар бойынша ChatGPT, Gemini және Perplexity отбасыларын қамту.",
            "Көріну индексі, брендтік көрсеткіш, жауаптар, сұрақтар, бәсекелестер, дереккөздер және дауыс үлесі.",
            "Жұмыс ортасында расталған аккаунт арқылы жеке есеп.",
          ],
        },
        {
          heading: "Міндетті емес жақсарту жұмысы",
          paragraphs: [
            "Жабық есепті қарағаннан кейін иесі қоңырауға жазыла алады. Akrux қолмен жұмысты ұсына алады: сущность туралы жария фактілерді түзету, сайтты аралауды жақсарту, пайдалы ақпаратты күшейту немесе дереккөздердегі олқылықтарды талдау. Баға, жұмыс нәтижесі және мерзімдер бөлек келісіледі және тегін аудиттен тумайды.",
            "Қоңырауға жазылу Akrux кез келген жобаны қабылдайды дегенді білдірмейді. Алдымен команда пайдалы әрі жауапты жұмыс көлемі бар-жоғын тексереді.",
          ],
        },
        {
          heading: "Тіркелген пакет пен позиция кепілдігі жоқ",
          paragraphs: [
            "Қазір жария тіркелген жазылым, белгілі валютадағы пакет немесе жақсартулардың әмбебап бағасы жоқ. Akrux индекстеуді, аталымдарды, дәйексөздерді, позицияларды, рейтингтер мен ұсыныстарды сатпайды әрі кепілдендірмейді, өйткені провайдерлер мен ЖИ жүйелері тәуелсіз.",
          ],
        },
      ],
      related: [
        { path: "/services", label: "Қызмет қалай құрылған" },
        { path: "/product", label: "Тексеру құрамы" },
        { path: "/methodology", label: "Метрикаларды есептеу" },
        { path: "/contact", label: "Есепті талқылау" },
      ],
    }),
  },
  "/faq": {
    en: enPhase2b({
      eyebrow: "FAQ",
      h1: "Frequently asked questions about Akrux",
      lead: "Practical answers about the free audit, human-assisted service, model coverage, privacy, pricing and limitations.",
      summaryTitle: "Start here",
      summary:
        "Akrux provides businesses in Kazakhstan with a free, dated AI-visibility audit and can separately perform agreed improvement work. AI placement and future scan results are not guaranteed.",
      sections: [],
      related: [
        { path: "/services", label: "Review Akrux's service" },
        { path: "/methodology", label: "Read the full methodology" },
        { path: "/docs", label: "Open product documentation" },
        { path: "/contact", label: "Ask a product question" },
      ],
    }),
    ru: ruPhase2b({
      eyebrow: "FAQ",
      h1: "Частые вопросы о Akrux",
      lead: "Практические ответы о бесплатном аудите, помощи команды, покрытии моделей, приватности, цене и ограничениях.",
      summaryTitle: "Главное",
      summary:
        "Akrux проводит для бизнеса в Казахстане бесплатный датированный аудит видимости в ИИ и может отдельно выполнить согласованные работы по улучшению. Позиции и будущий результат проверки не гарантируются.",
      sections: [],
      related: [
        { path: "/services", label: "Услуги Akrux" },
        { path: "/methodology", label: "Полная методология" },
        { path: "/docs", label: "Документация продукта" },
        { path: "/contact", label: "Задать вопрос" },
      ],
    }),    kk: kkPhase2b({
      eyebrow: "FAQ",
      h1: "Akrux туралы жиі қойылатын сұрақтар",
      lead: "Тегін аудит, команда көмегі, модельдерді қамту, құпиялық, баға және шектеулер туралы практикалық жауаптар.",
      summaryTitle: "Ең бастысы",
      summary:
        "Akrux Қазақстандағы бизнес үшін ЖИ-дегі көрінудің тегін әрі күні көрсетілген аудитін жүргізеді және келісілген жақсарту жұмыстарын бөлек орындай алады. Позициялар мен тексерудің болашақ нәтижесі кепілдендірілмейді.",
      sections: [],
      related: [
        { path: "/services", label: "Akrux қызметтері" },
        { path: "/methodology", label: "Толық әдістеме" },
        { path: "/docs", label: "Өнім құжаттамасы" },
        { path: "/contact", label: "Сұрақ қою" },
      ],
    }),
  },
  "/about": {
    en: enPhase2b({
      eyebrow: "About",
      h1: "Akrux helps Kazakhstan businesses understand and improve AI visibility",
      lead:
        "Akrux combines a free diagnostic audit with separately agreed, human-assisted improvement work for business owners in Kazakhstan.",
      summaryTitle: "What Akrux is",
      summary:
        "Akrux is an early-stage AI-visibility audit and improvement service. The browser application creates the private report; the team manually plans and performs agreed work after a call.",
      sections: [
        {
          heading: "Why Akrux exists",
          paragraphs: [
            "A business owner can often see search rankings but not the exact AI-generated answers in which the company is absent, confused with another entity or described using weak sources. Akrux provides a dated evidence set of prompts, sampled answers, business appearances, competitors and citations.",
          ],
        },
        {
          heading: "The free-audit entry point",
          paragraphs: [
            "The current entry point is a free, user-initiated audit covering model families associated with ChatGPT, Gemini and Perplexity. It researches the submitted business, creates customer-style prompts and stores a dated sample of answers and metrics in a private authenticated report.",
          ],
        },
        {
          heading: "Human-assisted improvement",
          paragraphs: [
            "After reviewing the report, the owner may book a call. Akrux can identify practical gaps, agree on a relevant scope and manually perform the work. The service is not a fully automated optimization system, and implementation is separate from the free audit.",
          ],
        },
        {
          heading: "Kazakhstan focus and current stage",
          paragraphs: [
            "Businesses in Kazakhstan are Akrux's primary market. The interface and public information are currently available in Kazakh, Russian and English, and local audits can use a city to make buyer questions more relevant.",
            "Akrux is in an early testing stage. The service process and availability may evolve as the team validates the work with businesses.",
          ],
        },
        {
          heading: "Honest limits",
          paragraphs: [
            "AI answers change with the model, prompt, date and retrieved sources. Akrux observes and works on public evidence but does not control AI systems and cannot guarantee indexing, mentions, citations, positions, rankings or recommendations.",
          ],
        },
      ],
      related: [
        { path: "/services", label: "See the audit and improvement service" },
        { path: "/product", label: "Understand the diagnostic application" },
        { path: "/methodology", label: "Verify the metric definitions" },
      ],
    }),
    ru: ruPhase2b({
      eyebrow: "О Akrux",
      h1: "Akrux помогает бизнесу Казахстана понять и улучшить видимость в ИИ",
      lead:
        "Akrux сочетает бесплатный диагностический аудит с отдельно согласуемой помощью команды для владельцев бизнеса в Казахстане.",
      summaryTitle: "Что такое Akrux",
      summary:
        "Akrux — сервис аудита и улучшения видимости в ИИ на раннем этапе. Браузерное приложение создаёт закрытый отчёт, а команда вручную планирует и выполняет согласованные работы после созвона.",
      sections: [
        {
          heading: "Зачем существует Akrux",
          paragraphs: [
            "Владелец может видеть поисковые позиции, но не конкретные ответы ИИ, в которых компания отсутствует, перепутана с другой сущностью или описана по слабым источникам. Akrux создаёт датированный набор доказательств: вопросы, выборку ответов, появления бизнеса, конкурентов и источники.",
          ],
        },
        {
          heading: "Вход через бесплатный аудит",
          paragraphs: [
            "Сейчас первый шаг — бесплатный аудит по инициативе пользователя с семействами моделей, связанными с ChatGPT, Gemini и Perplexity. Он исследует указанный бизнес, создаёт клиентские вопросы и сохраняет датированную выборку ответов и метрик в закрытом отчёте.",
          ],
        },
        {
          heading: "Помощь команды",
          paragraphs: [
            "После изучения отчёта владелец может записаться на созвон. Akrux определяет практические пробелы, согласует релевантный объём и вручную выполняет работу. Сервис не является полностью автоматизированной оптимизацией, а внедрение отделено от бесплатного аудита.",
          ],
        },
        {
          heading: "Фокус на Казахстане и текущий этап",
          paragraphs: [
            "Основной рынок Akrux — бизнес в Казахстане. Интерфейс и публичная информация сейчас доступны на казахском, русском и английском, а в локальном аудите можно указать город для более релевантных вопросов покупателей.",
            "Akrux находится на раннем этапе тестирования. Процесс и доступность услуги могут меняться по мере проверки работы с бизнесом.",
          ],
        },
        {
          heading: "Честные ограничения",
          paragraphs: [
            "Ответы ИИ меняются в зависимости от модели, вопроса, даты и найденных источников. Akrux наблюдает результат и работает с публичными доказательствами, но не контролирует ИИ-системы и не гарантирует индексацию, упоминания, цитирование, позиции, рейтинги или рекомендации.",
          ],
        },
      ],
      related: [
        { path: "/services", label: "Аудит и услуги по улучшению" },
        { path: "/product", label: "Диагностическое приложение" },
        { path: "/methodology", label: "Определения метрик" },
      ],
    }),    kk: kkPhase2b({
      eyebrow: "Akrux туралы",
      h1: "Akrux Қазақстан бизнесіне ЖИ-дегі көрінуді түсінуге және жақсартуға көмектеседі",
      lead:
        "Akrux тегін диагностикалық аудитті Қазақстандағы бизнес иелеріне арналған бөлек келісілетін команда көмегімен ұштастырады.",
      summaryTitle: "Akrux деген не",
      summary:
        "Akrux — ерте кезеңдегі ЖИ-дегі көрінуді аудиттеу және жақсарту сервисі. Браузерлік қосымша жабық есеп жасайды, ал команда қоңыраудан кейін келісілген жұмыстарды қолмен жоспарлап, орындайды.",
      sections: [
        {
          heading: "Akrux не үшін бар",
          paragraphs: [
            "Иесі іздеу позицияларын көре алады, бірақ компания жоқ, басқа сущностьпен шатастырылған немесе әлсіз дереккөздер бойынша сипатталған нақты ЖИ жауаптарын көрмейді. Akrux күні көрсетілген дәлелдер жиынын жасайды: сұрақтар, жауаптар таңдамасы, бизнестің шығуы, бәсекелестер және дереккөздер.",
          ],
        },
        {
          heading: "Тегін аудит арқылы кіру",
          paragraphs: [
            "Қазір бірінші қадам — ChatGPT, Gemini және Perplexity-мен байланысты модель отбасылары қатысатын, пайдаланушы бастамасымен жасалатын тегін аудит. Ол көрсетілген бизнесті зерттеп, клиент сұрақтарын жасайды және жауаптар мен метрикалардың күні көрсетілген таңдамасын жабық есепте сақтайды.",
          ],
        },
        {
          heading: "Команда көмегі",
          paragraphs: [
            "Есепті қарағаннан кейін иесі қоңырауға жазыла алады. Akrux практикалық олқылықтарды анықтап, орынды көлемді келісіп, жұмысты қолмен орындайды. Сервис толық автоматтандырылған оңтайландыру емес, ал енгізу тегін аудиттен бөлек.",
          ],
        },
        {
          heading: "Қазақстанға назар және ағымдағы кезең",
          paragraphs: [
            "Akrux-тің негізгі нарығы — Қазақстандағы бизнес. Интерфейс пен жария ақпарат қазір қазақ, орыс және ағылшын тілдерінде қолжетімді, ал жергілікті аудитте сатып алушылардың орындырақ сұрақтары үшін қаланы көрсетуге болады.",
            "Akrux ерте тестілеу кезеңінде. Қызметтің процесі мен қолжетімділігі бизнеспен жұмыс тексерілу барысында өзгеруі мүмкін.",
          ],
        },
        {
          heading: "Адал шектеулер",
          paragraphs: [
            "ЖИ жауаптары модельге, сұраққа, күнге және табылған дереккөздерге қарай өзгереді. Akrux нәтижені бақылап, жария дәлелдермен жұмыс істейді, бірақ ЖИ жүйелерін басқармайды және индекстеуге, аталымдарға, дәйексөздерге, позицияларға, рейтингтерге немесе ұсыныстарға кепілдік бермейді.",
          ],
        },
      ],
      related: [
        { path: "/services", label: "Аудит және жақсарту қызметтері" },
        { path: "/product", label: "Диагностикалық қосымша" },
        { path: "/methodology", label: "Метрика анықтамалары" },
      ],
    }),
  },
  "/contact": {
    en: enPhase2b({
      eyebrow: "Contact",
      h1: "Contact Akrux",
      lead:
        "Start the free audit to create a private report, or use the existing Book a call flow to discuss the report and possible improvement work.",
      summaryTitle: "Choose the appropriate next step",
      summary:
        "The audit is the diagnostic starting point. A call is useful when you already have a report or want to understand whether Akrux can responsibly help with an agreed scope.",
      sections: [
        {
          heading: "Start with the free audit",
          paragraphs: [
            "Create or sign in to an account, provide the business information and start a user-initiated audit. The resulting report remains private and gives both the owner and Akrux a dated evidence set for any later discussion.",
          ],
        },
        {
          heading: "Book a call",
          paragraphs: [
            "Use the Book a call button to discuss a completed report, an important measurement question or possible manual improvement work. Describe the business and the question without including sensitive account or customer information.",
          ],
        },
        {
          heading: "Protect private information",
          paragraphs: [
            "Do not place passwords, access tokens, billing details, private scan answers or customer personal data in the general call-request form. Authenticated report details should remain inside the protected workflow.",
          ],
        },
      ],
      related: [
        { path: "/services", label: "Review what Akrux can help with" },
        { path: "/faq", label: "Check common questions first" },
        { path: "/pricing", label: "Understand current access" },
      ],
    }),
    ru: ruPhase2b({
      eyebrow: "Контакты",
      h1: "Связаться с Akrux",
      lead:
        "Запустите бесплатный аудит, чтобы получить закрытый отчёт, или используйте существующую форму записи на созвон для обсуждения отчёта и возможных работ.",
      summaryTitle: "Выберите подходящий следующий шаг",
      summary:
        "Аудит — начальная диагностика. Созвон полезен, когда отчёт уже готов или вы хотите понять, может ли Akrux ответственно помочь в рамках согласованной работы.",
      sections: [
        {
          heading: "Начните с бесплатного аудита",
          paragraphs: [
            "Создайте аккаунт или войдите, укажите информацию о бизнесе и запустите проверку. Отчёт останется закрытым и даст владельцу и Akrux датированный набор фактов для дальнейшего обсуждения.",
          ],
        },
        {
          heading: "Запишитесь на созвон",
          paragraphs: [
            "Используйте кнопку записи, чтобы обсудить готовый отчёт, важный вопрос о метрике или возможную ручную работу по улучшению. Опишите бизнес и вопрос без чувствительных данных аккаунта или клиентов.",
          ],
        },
        {
          heading: "Защитите приватную информацию",
          paragraphs: [
            "Не отправляйте через общую форму пароли, токены доступа, платёжные данные, приватные ответы аудита или персональные данные клиентов. Детали закрытого отчёта должны оставаться в защищённом процессе.",
          ],
        },
      ],
      related: [
        { path: "/services", label: "Чем может помочь Akrux" },
        { path: "/faq", label: "Частые вопросы" },
        { path: "/pricing", label: "Текущий доступ" },
      ],
    }),    kk: kkPhase2b({
      eyebrow: "Байланыс",
      h1: "Akrux-пен байланысу",
      lead:
        "Жабық есеп алу үшін тегін аудитті іске қосыңыз немесе есеп пен ықтимал жұмыстарды талқылау үшін қолданыстағы қоңырауға жазылу формасын пайдаланыңыз.",
      summaryTitle: "Қолайлы келесі қадамды таңдаңыз",
      summary:
        "Аудит — бастапқы диагностика. Қоңырау есеп дайын болғанда немесе Akrux келісілген жұмыс шеңберінде жауапкершілікпен көмектесе ала ма, соны түсінгіңіз келгенде пайдалы.",
      sections: [
        {
          heading: "Тегін аудиттен бастаңыз",
          paragraphs: [
            "Аккаунт жасаңыз немесе кіріңіз, бизнес туралы ақпаратты көрсетіп, тексеруді іске қосыңыз. Есеп жабық қалады және иесі мен Akrux-ке кейінгі талқылау үшін күні көрсетілген фактілер жиынын береді.",
          ],
        },
        {
          heading: "Қоңырауға жазылыңыз",
          paragraphs: [
            "Дайын есепті, метрика туралы маңызды сұрақты немесе жақсарту бойынша ықтимал қолмен жұмысты талқылау үшін жазылу түймесін пайдаланыңыз. Бизнес пен сұрақты аккаунттың немесе клиенттердің сезімтал деректерінсіз сипаттаңыз.",
          ],
        },
        {
          heading: "Жеке ақпаратты қорғаңыз",
          paragraphs: [
            "Жалпы форма арқылы құпия сөздерді, қолжетімділік токендерін, төлем деректерін, аудиттің жеке жауаптарын немесе клиенттердің дербес деректерін жібермеңіз. Жабық есептің егжей-тегжейі қорғалған процесте қалуы тиіс.",
          ],
        },
      ],
      related: [
        { path: "/services", label: "Akrux немен көмектесе алады" },
        { path: "/faq", label: "Жиі қойылатын сұрақтар" },
        { path: "/pricing", label: "Ағымдағы қолжетімділік" },
      ],
    }),
  },
  "/docs": {
    en: enPhase2b({
      eyebrow: "Documentation",
      h1: "Using the Akrux diagnostic audit report",
      lead:
        "This guide documents the authenticated diagnostic application and explains what each report view can and cannot tell you. It does not describe the full human-assisted Akrux service.",
      summaryTitle: "Quick start",
      summary:
        "Create or sign in to an account, add a business profile, run a scan, wait for fresh provider requests to finish, then inspect the score together with prompts, answers, competitors and citations.",
      sections: [
        {
          heading: "Create a project or business profile",
          paragraphs: [
            "Enter the business name and category. Add the website, city, market, aliases and known competitors when available. Use aliases only for names that refer to the same business; do not add products or rivals as aliases.",
          ],
        },
        {
          heading: "Run and repeat a scan",
          paragraphs: [
            "Starting a scan consumes the configured account allowance at creation time. The progress page shows research, prompt generation and model-request stages. A rescan creates fresh requests and does not reuse prior answers. Quotas and provider budgets may delay or block a new run.",
          ],
        },
        {
          heading: "Understand the Visibility Score",
          paragraphs: [
            "The primary score is an unbranded discovery measure. Read it with the eligible response count, category and comparison subscores, average position and methodology version. The branded percentage answers a different question—whether the model recognizes the business when it is named—and is kept separate.",
          ],
        },
        {
          heading: "Provider-level results",
          paragraphs: [
            "Provider cards compare only the shared core prompt set when a free scan gives wider prompt coverage to some models. A model marked ‘not checked’ was not queried. Do not interpret absent coverage as a zero score.",
          ],
        },
        {
          heading: "Review answers and prompts",
          paragraphs: [
            "Filter answers by model, language, intent and whether the target was mentioned. Open the cited sources and check whether the answer is accurate. In Prompts, review branded status and intent. Disabling a prompt excludes its normalized text from the next generation run; it does not rewrite an old scan.",
          ],
        },
        {
          heading: "Competitors, Share of Voice and Where you lose",
          paragraphs: [
            "The Competitors view contains configured rivals and newly detected entities that pass classification. Share of Voice counts qualifying entity mentions across successful unbranded answers. ‘Where you lose’ highlights prompts where a competitor appears and the target does not; it is a prioritization view, not proof that a customer was lost.",
          ],
        },
        {
          heading: "Freshness and known limitations",
          bullets: [
            "A result belongs to the date, prompt and provider model recorded for that scan.",
            "Generated answers can change without a website change.",
            "Citation presence does not prove that every sentence came from that source.",
            "Entity extraction and sentiment can require human correction or interpretation.",
            "No report guarantees indexing, citation, training-data inclusion, ranking or recommendation.",
          ],
        },
        {
          heading: "From report to optional service work",
          paragraphs: [
            "The report is the diagnostic output. A business owner can separately book a call, agree on a relevant scope and ask the Akrux team to perform improvement work. No application metric automatically triggers implementation or guarantees a future AI outcome.",
          ],
        },
      ],
      related: [
        { path: "/services", label: "Understand the human-assisted service" },
        { path: "/methodology", label: "Check the implemented formula" },
        { path: "/faq", label: "Read common product answers" },
        { path: "/contact", label: "Request help with a report" },
      ],
    }),
    ru: ruPhase2b({
      eyebrow: "Документация",
      h1: "Работа с диагностическим отчётом Akrux",
      lead:
        "Руководство описывает диагностическое приложение после авторизации и объясняет, что каждый раздел отчёта показывает и чего не доказывает. Оно не описывает всю услугу Akrux с участием команды.",
      summaryTitle: "Быстрый старт",
      summary:
        "Создайте аккаунт или войдите, добавьте профиль бизнеса, запустите проверку, дождитесь свежих запросов к провайдеру, затем изучите индекс вместе с вопросами, ответами, конкурентами и источниками.",
      sections: [
        {
          heading: "Создание проекта или профиля бизнеса",
          paragraphs: [
            "Укажите название и категорию. При наличии добавьте сайт, город, рынок, варианты названия и известных конкурентов. Варианты должны относиться к тому же бизнесу; не добавляйте продукты и конкурентов как псевдонимы.",
          ],
        },
        {
          heading: "Запуск и повторная проверка",
          paragraphs: [
            "Проверка расходует квоту аккаунта при создании. Экран прогресса показывает исследование, генерацию вопросов и запросы к моделям. Повторный запуск отправляет свежие запросы и не использует старые ответы. Квоты и бюджет провайдера могут остановить новый запуск.",
          ],
        },
        {
          heading: "Индекс видимости",
          paragraphs: [
            "Основной индекс измеряет небрендовое обнаружение. Читайте его вместе с числом подходящих ответов, показателями категории и сравнения, средней позицией и версией методологии. Брендовый процент отвечает на другой вопрос — узнаёт ли модель бизнес, когда он назван, — и считается отдельно.",
          ],
        },
        {
          heading: "Результаты по моделям",
          paragraphs: [
            "Карточки моделей сравнивают общий набор ключевых вопросов, когда бесплатная проверка даёт некоторым моделям больше покрытия. Метка «не проверено» означает, что модель не запрашивалась; отсутствие покрытия не равно нулю.",
          ],
        },
        {
          heading: "Ответы и вопросы",
          paragraphs: [
            "Фильтруйте ответы по модели, языку, намерению и упоминанию цели. Открывайте источники и проверяйте точность. В разделе вопросов смотрите намерение и брендовость. Отключение исключает нормализованный текст из следующей генерации и не меняет старую проверку.",
          ],
        },
        {
          heading: "Конкуренты, доля голоса и «Где вы проигрываете»",
          paragraphs: [
            "В конкурентах находятся заданные соперники и новые сущности, прошедшие классификацию. Доля голоса считает подходящие упоминания в успешных небрендовых ответах. «Где вы проигрываете» показывает вопросы с конкурентом без цели; это приоритизация, а не доказательство потерянного клиента.",
          ],
        },
        {
          heading: "Свежесть и ограничения",
          bullets: [
            "Результат относится к дате, вопросу и модели конкретной проверки.",
            "Ответ может измениться без изменений на сайте.",
            "Наличие ссылки не доказывает, что каждое предложение взято из неё.",
            "Извлечение сущностей и тональности может требовать человеческой проверки.",
            "Отчёт не гарантирует индексацию, цитирование, попадание в обучающие данные, позицию или рекомендацию.",
          ],
        },
        {
          heading: "От отчёта к необязательной работе команды",
          paragraphs: [
            "Отчёт — результат диагностики. Владелец может отдельно записаться на созвон, согласовать релевантный объём и поручить Akrux работу по улучшению. Метрика приложения не запускает внедрение автоматически и не гарантирует будущий результат в ИИ.",
          ],
        },
      ],
      related: [
        { path: "/services", label: "Услуга с участием команды" },
        { path: "/methodology", label: "Реализованная формула" },
        { path: "/faq", label: "Частые вопросы" },
        { path: "/contact", label: "Помощь с отчётом" },
      ],
    }),    kk: kkPhase2b({
      eyebrow: "Құжаттама",
      h1: "Akrux диагностикалық есебімен жұмыс",
      lead:
        "Нұсқаулық авторизациядан кейінгі диагностикалық қосымшаны сипаттайды және есептің әр бөлімі нені көрсететінін әрі нені дәлелдемейтінін түсіндіреді. Ол команда қатысатын Akrux қызметінің бүкілін сипаттамайды.",
      summaryTitle: "Жылдам бастау",
      summary:
        "Аккаунт жасаңыз немесе кіріңіз, бизнес профилін қосыңыз, тексеруді іске қосыңыз, провайдерге жаңа сұраныстарды күтіңіз, содан кейін индексті сұрақтармен, жауаптармен, бәсекелестермен және дереккөздермен бірге қараңыз.",
      sections: [
        {
          heading: "Жоба немесе бизнес профилін жасау",
          paragraphs: [
            "Атау мен санатты көрсетіңіз. Бар болса, сайтты, қаланы, нарықты, атау нұсқаларын және белгілі бәсекелестерді қосыңыз. Нұсқалар дәл сол бизнеске қатысты болуы тиіс; өнімдер мен бәсекелестерді бүркеншік атау ретінде қоспаңыз.",
          ],
        },
        {
          heading: "Іске қосу және қайта тексеру",
          paragraphs: [
            "Тексеру жасалған кезде аккаунт квотасын жұмсайды. Барыс экраны зерттеуді, сұрақтарды жасауды және модельдерге сұраныстарды көрсетеді. Қайта іске қосу жаңа сұраныстар жіберіп, ескі жауаптарды пайдаланбайды. Квоталар мен провайдер бюджеті жаңа іске қосуды тоқтатуы мүмкін.",
          ],
        },
        {
          heading: "Көріну индексі",
          paragraphs: [
            "Негізгі индекс брендсіз табылуды өлшейді. Оны қолайлы жауаптар санымен, санат пен салыстыру көрсеткіштерімен, орташа позициямен және әдістеме нұсқасымен бірге оқыңыз. Брендтік пайыз басқа сұраққа жауап береді — модель бизнесті аталған кезде тани ма — және бөлек есептеледі.",
          ],
        },
        {
          heading: "Модельдер бойынша нәтижелер",
          paragraphs: [
            "Модель карточкалары тегін тексеру кейбір модельдерге көбірек қамту бергенде негізгі сұрақтардың ортақ жиынын салыстырады. «Тексерілмеді» белгісі модельге сұраныс жіберілмегенін білдіреді; қамтудың болмауы нөлге тең емес.",
          ],
        },
        {
          heading: "Жауаптар мен сұрақтар",
          paragraphs: [
            "Жауаптарды модель, тіл, ниет және мақсаттың аталуы бойынша сүзіңіз. Дереккөздерді ашып, дәлдігін тексеріңіз. Сұрақтар бөлімінде ниет пен брендтікті қараңыз. Өшіру нормаланған мәтінді келесі жасаудан шығарады және ескі тексеруді өзгертпейді.",
          ],
        },
        {
          heading: "Бәсекелестер, дауыс үлесі және «Қай жерде ұтыласыз»",
          paragraphs: [
            "Бәсекелестер бөлімінде берілген қарсыластар мен жіктеуден өткен жаңа сущностьтар табылады. Дауыс үлесі сәтті брендсіз жауаптардағы қолайлы аталымдарды есептейді. «Қай жерде ұтыласыз» мақсатсыз, бәсекелесі бар сұрақтарды көрсетеді; бұл — жоғалған клиенттің дәлелі емес, басымдық белгілеу.",
          ],
        },
        {
          heading: "Жаңалық және шектеулер",
          bullets: [
            "Нәтиже нақты тексерудің күніне, сұрағына және моделіне қатысты.",
            "Жауап сайтта өзгеріссіз де өзгеруі мүмкін.",
            "Сілтеменің болуы әр сөйлем содан алынғанын дәлелдемейді.",
            "Сущностьтар мен реңкті шығару адам тексеруін талап етуі мүмкін.",
            "Есеп индекстеуге, дәйексөзге, оқыту деректеріне түсуге, позицияға немесе ұсынысқа кепілдік бермейді.",
          ],
        },
        {
          heading: "Есептен команданың міндетті емес жұмысына",
          paragraphs: [
            "Есеп — диагностиканың нәтижесі. Иесі бөлек қоңырауға жазылып, орынды көлемді келісіп, жақсарту жұмысын Akrux-ке тапсыра алады. Қосымшаның метрикасы енгізуді автоматты бастамайды және ЖИ-дегі болашақ нәтижеге кепілдік бермейді.",
          ],
        },
      ],
      related: [
        { path: "/services", label: "Команда қатысатын қызмет" },
        { path: "/methodology", label: "Іске асырылған формула" },
        { path: "/faq", label: "Жиі қойылатын сұрақтар" },
        { path: "/contact", label: "Есеп бойынша көмек" },
      ],
    }),
  },
  "/blogs": {
    en: {
      eyebrow: "Akrux Blog",
      h1: "Akrux Blog — AI Visibility in Kazakhstan",
      lead:
        "Practical articles for business owners who want to understand and improve how their companies appear in AI-generated answers.",
      summaryTitle: "Start with the evidence",
      summary:
        "Audit what AI systems currently say about your business, then compare the evidence and prompts that may cause competitors to appear.",
      updated: "August 3, 2026",
      sections: [],
      related: [
        { path: "/blogs/audit-ai-generated-brand-information", label: "Audit brand information" },
        { path: "/blogs/why-ai-recommends-competitors", label: "Diagnose competitor recommendations" },
        { path: "/generative-engine-optimization", label: "Read the GEO guide" },
      ],
    },
    ru: {
      eyebrow: "Блог Akrux",
      h1: "Блог Akrux — видимость бизнеса в ответах ИИ",
      lead:
        "Практические статьи для владельцев бизнеса, которые хотят понять и улучшить представление своей компании в ответах ИИ.",
      summaryTitle: "Начните с фактов",
      summary:
        "Проверьте, что ИИ сейчас говорит о вашем бизнесе, а затем сравните доказательства и вопросы, из-за которых в ответах могут появляться конкуренты.",
      updated: "3 августа 2026 года",
      sections: [],
      related: [
        { path: "/blogs/audit-ai-generated-brand-information", label: "Аудит информации о бренде" },
        { path: "/blogs/why-ai-recommends-competitors", label: "Причины рекомендаций конкурентов" },
        { path: "/generative-engine-optimization", label: "Руководство по GEO" },
      ],
    },    kk: {
      eyebrow: "Akrux блогы",
      h1: "Akrux блогы — бизнестің ЖИ жауаптарындағы көрінуі",
      lead:
        "Компаниясының ЖИ жауаптарындағы көрінуін түсініп, жақсартқысы келетін бизнес иелеріне арналған практикалық мақалалар.",
      summaryTitle: "Фактілерден бастаңыз",
      summary:
        "ЖИ қазір бизнесіңіз туралы не айтатынын тексеріңіз, содан кейін жауаптарда бәсекелестердің шығуына себеп болатын дәлелдер мен сұрақтарды салыстырыңыз.",
      updated: "2026 жылғы 3 тамыз",
      sections: [],
      related: [
        { path: "/blogs/audit-ai-generated-brand-information", label: "Бренд ақпаратының аудиті" },
        { path: "/blogs/why-ai-recommends-competitors", label: "Бәсекелестерді ұсыну себептері" },
        { path: "/generative-engine-optimization", label: "GEO бойынша нұсқаулық" },
      ],
    },
  },
  "/blogs/audit-ai-generated-brand-information": {
    en: en({
      eyebrow: "Article",
      h1: "How to audit AI-generated brand information",
      lead:
        "A useful audit checks identity and claims answer by answer instead of reducing accuracy to one score.",
      summaryTitle: "Audit outcome",
      summary:
        "Produce a dated evidence table containing the exact prompt, model family, answer claim, identified entity, citation, verification result and corrective source owner.",
      published: "August 2, 2026",
      sections: [
        {
          heading: "1. Define the target entity",
          bullets: [
            "Canonical product and organization name.",
            "Domains, spelling variants, transliterations, former names and genuine sub-brands.",
            "Products or similarly named companies that must not be merged with the target.",
          ],
        },
        {
          heading: "2. Build a balanced prompt sample",
          paragraphs: [
            "Include direct branded questions, unbranded category discovery, best-of, purchase and comparison prompts. Add a location only where the business actually serves it. Record the wording rather than summarizing it later.",
          ],
        },
        {
          heading: "3. Verify each material claim",
          bullets: [
            "Correct entity: is the answer about this business?",
            "Correct offering: are products, services and availability current?",
            "Correct location and audience: are geographic claims supported?",
            "Correct evidence: does the cited page actually support the statement?",
            "Correct uncertainty: does the answer overstate information the source does not prove?",
          ],
        },
        {
          heading: "4. Fix the authoritative source",
          paragraphs: [
            "Correct the business's own crawlable pages first, then update authoritative profiles or directories under the business's control. Use one consistent entity description and link detailed claims to documentation. Do not create fake third-party citations.",
          ],
        },
        {
          heading: "5. Recheck without over-attribution",
          paragraphs: [
            "Repeat comparable prompts after sources can be recrawled. A changed answer is evidence of a changed output, not proof that one edit caused it. Keep unsuccessful and unchanged results in the record.",
          ],
        },
      ],
      related: [
        { path: "/blogs/why-ai-recommends-competitors", label: "Analyze competitor appearances" },
        { path: "/methodology", label: "Use Akrux's extraction definitions" },
        { path: "/generative-engine-optimization", label: "Turn findings into a GEO plan" },
      ],
    }),
    ru: ru({
      eyebrow: "Статья",
      h1: "Как проверить информацию о бренде в ответах ИИ",
      lead:
        "Полезный аудит проверяет сущность и утверждения по каждому ответу, а не сводит точность к одному числу.",
      summaryTitle: "Результат аудита",
      summary:
        "Создайте датированную таблицу: точный вопрос, семейство модели, утверждение ответа, распознанная сущность, источник, результат проверки и владелец исправляемого источника.",
      published: "2 августа 2026 года",
      sections: [
        {
          heading: "1. Определите целевую сущность",
          bullets: [
            "Каноническое название продукта и организации.",
            "Домены, варианты написания, транслитерации, прежние названия и реальные суббренды.",
            "Продукты и одноимённые компании, которые нельзя объединять с целью.",
          ],
        },
        {
          heading: "2. Соберите сбалансированную выборку",
          paragraphs: [
            "Включите прямые брендовые вопросы, небрендовое обнаружение категории, лучшие варианты, покупку и сравнения. Добавляйте место только там, где бизнес действительно работает. Сохраняйте точную формулировку.",
          ],
        },
        {
          heading: "3. Проверьте существенные утверждения",
          bullets: [
            "Правильная сущность: ответ точно об этом бизнесе?",
            "Правильное предложение: продукты, услуги и доступность актуальны?",
            "Правильные место и аудитория: география подтверждена?",
            "Правильное доказательство: процитированная страница подтверждает фразу?",
            "Правильная уверенность: ответ не преувеличивает данные источника?",
          ],
        },
        {
          heading: "4. Исправьте авторитетный источник",
          paragraphs: [
            "Сначала исправьте собственные индексируемые страницы, затем профили и каталоги под контролем бизнеса. Используйте одно определение сущности и связывайте детальные заявления с документацией. Не создавайте фиктивные сторонние ссылки.",
          ],
        },
        {
          heading: "5. Проверьте снова без ложной причинности",
          paragraphs: [
            "Повторите сопоставимые вопросы после возможного переобхода источников. Изменённый ответ доказывает изменение результата, но не влияние одной правки. Сохраняйте неудачные и неизменившиеся результаты.",
          ],
        },
      ],
      related: [
        { path: "/blogs/why-ai-recommends-competitors", label: "Анализ конкурентов" },
        { path: "/methodology", label: "Определения извлечения Akrux" },
        { path: "/generative-engine-optimization", label: "План GEO по результатам" },
      ],
    }),    kk: kk({
      eyebrow: "Мақала",
      h1: "ЖИ жауаптарындағы бренд ақпаратын қалай тексеру керек",
      lead:
        "Пайдалы аудит сущность пен тұжырымдарды әр жауап бойынша тексереді, дәлдікті бір санға түйіндемейді.",
      summaryTitle: "Аудит нәтижесі",
      summary:
        "Күні көрсетілген кесте жасаңыз: нақты сұрақ, модель отбасы, жауаптың тұжырымы, танылған сущность, дереккөз, тексеру нәтижесі және түзетілетін дереккөздің иесі.",
      published: "2026 жылғы 2 тамыз",
      sections: [
        {
          heading: "1. Мақсатты сущностьты анықтаңыз",
          bullets: [
            "Өнім мен ұйымның канондық атауы.",
            "Домендер, жазылу нұсқалары, транслитерациялар, бұрынғы атаулар және нақты суббрендтер.",
            "Мақсатпен біріктіруге болмайтын өнімдер мен аттас компаниялар.",
          ],
        },
        {
          heading: "2. Теңгерімді таңдама жинаңыз",
          paragraphs: [
            "Тікелей брендтік сұрақтарды, санатты брендсіз табуды, үздік нұсқаларды, сатып алуды және салыстыруларды қосыңыз. Орынды бизнес шынымен жұмыс істейтін жерлерге ғана қосыңыз. Нақты тұжырымды сақтаңыз.",
          ],
        },
        {
          heading: "3. Елеулі тұжырымдарды тексеріңіз",
          bullets: [
            "Дұрыс сущность: жауап дәл осы бизнес туралы ма?",
            "Дұрыс ұсыныс: өнімдер, қызметтер және қолжетімділік өзекті ме?",
            "Дұрыс орын мен аудитория: география расталған ба?",
            "Дұрыс дәлел: дәйексөз алынған бет тіркесті растай ма?",
            "Дұрыс сенімділік: жауап дереккөз деректерін асыра көрсетпей ме?",
          ],
        },
        {
          heading: "4. Беделді дереккөзді түзетіңіз",
          paragraphs: [
            "Алдымен өз индекстелетін беттеріңізді, содан кейін бизнес бақылайтын профильдер мен каталогтарды түзетіңіз. Сущностьтың бір анықтамасын пайдаланыңыз және егжей-тегжейлі мәлімдемелерді құжаттамамен байланыстырыңыз. Жалған сыртқы сілтемелер жасамаңыз.",
          ],
        },
        {
          heading: "5. Жалған себептіліксіз қайта тексеріңіз",
          paragraphs: [
            "Дереккөздер қайта аралануы мүмкін болғаннан кейін салыстырмалы сұрақтарды қайталаңыз. Өзгерген жауап нәтиженің өзгергенін дәлелдейді, бірақ бір түзетудің әсерін емес. Сәтсіз және өзгермеген нәтижелерді де сақтаңыз.",
          ],
        },
      ],
      related: [
        { path: "/blogs/why-ai-recommends-competitors", label: "Бәсекелестерді талдау" },
        { path: "/methodology", label: "Akrux шығару анықтамалары" },
        { path: "/generative-engine-optimization", label: "Нәтиже бойынша GEO жоспары" },
      ],
    }),
  },
  "/blogs/why-ai-recommends-competitors": {
    en: en({
      eyebrow: "Article",
      h1: "Why AI answers recommend competitors",
      lead:
        "A competitor can appear because it fits the prompt, has clearer evidence, is easier to resolve as an entity or simply surfaced in a variable model run.",
      summaryTitle: "Do not jump to one cause",
      summary:
        "Compare the exact prompt, answer, recommendation order and citations across multiple relevant questions before deciding whether the problem is category fit, evidence, entity clarity or model variability.",
      published: "August 2, 2026",
      sections: [
        {
          heading: "Four common explanations",
          bullets: [
            "Prompt fit: the competitor more directly serves the stated need or location.",
            "Evidence coverage: the competitor has clearer crawlable service pages and corroborating sources.",
            "Entity clarity: names, descriptions and profiles consistently resolve to one organization.",
            "Run variability: retrieval or generation changed even though public information did not.",
          ],
        },
        {
          heading: "How to diagnose the gap",
          paragraphs: [
            "Group losing prompts by intent and need. Open the cited pages. Check whether the competitor claim is supported and whether the target has an equivalent public fact. Confirm that the target is not present under an unrecognized alias and that a directory has not been mistaken for a competitor.",
          ],
        },
        {
          heading: "Corrective actions that can be verified",
          bullets: [
            "Publish a clear service or product page that directly answers the missing need.",
            "Correct inconsistent names, categories and locations on owned and authoritative profiles.",
            "Add factual documentation, methodology, availability and comparison criteria.",
            "Improve internal links so the relevant evidence is reachable from core product pages.",
            "Rescan a stable prompt set and document whether source and answer patterns changed.",
          ],
        },
        {
          heading: "What not to conclude",
          paragraphs: [
            "One answer does not prove a platform-wide preference, a commercial relationship or permanent ranking. Do not publish accusations about a competitor or promise that copying its keywords will reverse the result.",
          ],
        },
      ],
      related: [
        { path: "/blogs/audit-ai-generated-brand-information", label: "Audit factual brand information" },
        { path: "/docs", label: "Use Where you lose and citations" },
        { path: "/use-cases", label: "Apply industry-specific context" },
      ],
    }),
    ru: ru({
      eyebrow: "Статья",
      h1: "Почему ИИ рекомендует конкурентов",
      lead:
        "Конкурент может появиться из-за лучшего соответствия вопросу, более ясных доказательств, простой идентификации сущности или изменчивости конкретного запуска.",
      summaryTitle: "Не сводите всё к одной причине",
      summary:
        "Сравните точный вопрос, ответ, порядок рекомендаций и источники по нескольким релевантным вопросам, прежде чем выбирать между соответствием категории, доказательствами, ясностью сущности и изменчивостью модели.",
      published: "2 августа 2026 года",
      sections: [
        {
          heading: "Четыре частые причины",
          bullets: [
            "Соответствие: конкурент точнее отвечает указанной задаче или месту.",
            "Доказательства: у конкурента яснее индексируемые страницы и подтверждающие источники.",
            "Сущность: названия, описания и профили стабильно указывают на одну организацию.",
            "Изменчивость: поиск или генерация изменились без изменения публичной информации.",
          ],
        },
        {
          heading: "Как диагностировать разрыв",
          paragraphs: [
            "Сгруппируйте проигрышные вопросы по намерению и задаче. Откройте процитированные страницы. Проверьте, подтверждено ли заявление о конкуренте и есть ли эквивалентный публичный факт у цели. Убедитесь, что цель не скрыта под нераспознанным вариантом и каталог не принят за конкурента.",
          ],
        },
        {
          heading: "Проверяемые действия",
          bullets: [
            "Опубликуйте понятную страницу услуги или продукта, прямо отвечающую на недостающую задачу.",
            "Исправьте разные названия, категории и локации в собственных и авторитетных профилях.",
            "Добавьте фактическую документацию, методологию, доступность и критерии сравнения.",
            "Улучшите внутренние ссылки до релевантных доказательств.",
            "Повторите стабильный набор вопросов и зафиксируйте изменения источников и ответов.",
          ],
        },
        {
          heading: "Чего нельзя заключить",
          paragraphs: [
            "Один ответ не доказывает предпочтение всей платформы, коммерческие отношения или постоянную позицию. Не обвиняйте конкурента и не обещайте, что копирование ключевых слов изменит результат.",
          ],
        },
      ],
      related: [
        { path: "/blogs/audit-ai-generated-brand-information", label: "Аудит фактов о бренде" },
        { path: "/docs", label: "Источники и «Где вы проигрываете»" },
        { path: "/use-cases", label: "Отраслевой контекст" },
      ],
    }),    kk: kk({
      eyebrow: "Мақала",
      h1: "ЖИ неге бәсекелестерді ұсынады",
      lead:
        "Бәсекелес сұраққа жақсырақ сәйкестікке, айқынырақ дәлелдерге, сущностьты оңай сәйкестендіруге немесе нақты іске қосудың өзгергіштігіне байланысты шығуы мүмкін.",
      summaryTitle: "Бәрін бір себепке саймаңыз",
      summary:
        "Санатқа сәйкестік, дәлелдер, сущность айқындығы және модель өзгергіштігі арасында таңдамас бұрын нақты сұрақты, жауапты, ұсыныстар ретін және дереккөздерді бірнеше орынды сұрақ бойынша салыстырыңыз.",
      published: "2026 жылғы 2 тамыз",
      sections: [
        {
          heading: "Төрт жиі себеп",
          bullets: [
            "Сәйкестік: бәсекелес көрсетілген міндетке немесе орынға дәлірек жауап береді.",
            "Дәлелдер: бәсекелестің индекстелетін беттері мен растайтын дереккөздері айқынырақ.",
            "Сущность: атаулар, сипаттамалар және профильдер тұрақты түрде бір ұйымды көрсетеді.",
            "Өзгергіштік: жария ақпарат өзгермей-ақ іздеу немесе жасау өзгерді.",
          ],
        },
        {
          heading: "Айырманы қалай диагностикалау керек",
          paragraphs: [
            "Ұтылған сұрақтарды ниет пен міндет бойынша топтаңыз. Дәйексөз алынған беттерді ашыңыз. Бәсекелес туралы мәлімдеме расталған ба және мақсатта соған тең жария факт бар ма, тексеріңіз. Мақсат танылмаған нұсқаның астында жасырылмағанына және каталог бәсекелес деп қабылданбағанына көз жеткізіңіз.",
          ],
        },
        {
          heading: "Тексерілетін әрекеттер",
          bullets: [
            "Жетіспейтін міндетке тікелей жауап беретін түсінікті қызмет немесе өнім бетін жариялаңыз.",
            "Өз және беделді профильдердегі әртүрлі атауларды, санаттар мен орындарды түзетіңіз.",
            "Нақты құжаттаманы, әдістемені, қолжетімділікті және салыстыру өлшемдерін қосыңыз.",
            "Орынды дәлелдерге апаратын ішкі сілтемелерді жақсартыңыз.",
            "Тұрақты сұрақтар жиынын қайталап, дереккөздер мен жауаптардың өзгерісін тіркеңіз.",
          ],
        },
        {
          heading: "Не деп қорытуға болмайды",
          paragraphs: [
            "Бір жауап бүкіл платформаның артықшылық беруін, коммерциялық қатынасты немесе тұрақты позицияны дәлелдемейді. Бәсекелесті кінәламаңыз және кілт сөздерді көшіру нәтижені өзгертеді деп уәде етпеңіз.",
          ],
        },
      ],
      related: [
        { path: "/blogs/audit-ai-generated-brand-information", label: "Бренд фактілерінің аудиті" },
        { path: "/docs", label: "Дереккөздер және «Қай жерде ұтыласыз»" },
        { path: "/use-cases", label: "Салалық контекст" },
      ],
    }),
  },
  "/changelog": {
    en: en({
      eyebrow: "Changelog",
      h1: "Akrux product updates",
      lead: "Only changes verified in the repository are recorded here; no historical releases are reconstructed.",
      summaryTitle: "Latest update",
      summary:
        "On August 2, 2026, the product adopted the Akrux brand and added a public, bilingual entity and methodology layer for crawlability and verification.",
      sections: [
        {
          heading: "August 2, 2026 — Public entity and methodology release",
          bullets: [
            "Unified the public product name as Akrux while retaining the former name only as structured entity continuity data.",
            "Added crawlable product, methodology, about, pricing, FAQ, documentation, use-case, guide, legal and contact pages in English and Russian.",
            "Centralized metadata, canonicals, hreflang, social cards and page-specific JSON-LD.",
            "Expanded prerendering, crawl controls, sitemaps, llms.txt resources, real 404 behavior and automated quality checks.",
            "Documented the implemented version 2 Visibility Score and Share of Voice formulas.",
          ],
        },
        {
          heading: "Earlier history",
          paragraphs: [
            "The repository contains earlier engineering work, but a public release chronology and verified founding facts have not been supplied. This page does not convert internal commit history into marketing claims.",
          ],
        },
      ],
      related: [
        { path: "/methodology", label: "Read methodology version 2" },
        { path: "/docs", label: "Read the current documentation" },
        { path: "/about", label: "About the product" },
      ],
    }),
    ru: ru({
      eyebrow: "Обновления",
      h1: "История обновлений Akrux",
      lead: "Здесь фиксируются только подтверждённые репозиторием изменения; прошлые релизы не реконструируются.",
      summaryTitle: "Последнее обновление",
      summary:
        "2 августа 2026 года продукт перешёл на бренд Akrux и получил публичный двуязычный слой сущности и методологии для обхода и проверки.",
      sections: [
        {
          heading: "2 августа 2026 года — публичная сущность и методология",
          bullets: [
            "Публичное название унифицировано как Akrux; прежнее имя сохранено только в структурированных данных для связи сущности.",
            "Добавлены индексируемые страницы продукта, методологии, компании, цены, FAQ, документации, сценариев, руководств, условий и контактов на русском и английском.",
            "Централизованы метаданные, канонические URL, hreflang, социальные карточки и JSON-LD по типу страницы.",
            "Расширены пререндеринг, правила обхода, карта сайта, llms.txt, реальные ответы 404 и автоматические проверки качества.",
            "Опубликованы реализованные формулы Индекса видимости версии 2 и доли голоса.",
          ],
        },
        {
          heading: "Более ранняя история",
          paragraphs: [
            "В репозитории есть предыдущая инженерная работа, но публичная хронология релизов и подтверждённые факты основания не предоставлены. Внутренняя история коммитов не превращается здесь в маркетинговые заявления.",
          ],
        },
      ],
      related: [
        { path: "/methodology", label: "Методология версии 2" },
        { path: "/docs", label: "Текущая документация" },
        { path: "/about", label: "О продукте" },
      ],
    }),    kk: kk({
      eyebrow: "Жаңартулар",
      h1: "Akrux жаңарту тарихы",
      lead: "Мұнда тек репозиториймен расталған өзгерістер тіркеледі; өткен релиздер қайта құрастырылмайды.",
      summaryTitle: "Соңғы жаңарту",
      summary:
        "2026 жылғы 2 тамызда өнім Akrux брендіне көшті және аралау мен тексеруге арналған сущность пен әдістеменің жария қоснысқаулы қабатын алды.",
      sections: [
        {
          heading: "2026 жылғы 2 тамыз — жария сущность және әдістеме",
          bullets: [
            "Жария атау Akrux ретінде біріздендірілді; бұрынғы атау сущность байланысы үшін тек құрылымдық деректерде сақталды.",
            "Орыс және ағылшын тілдерінде өнім, әдістеме, компания, баға, FAQ, құжаттама, сценарийлер, нұсқаулықтар, шарттар және байланыс беттері индекстелетін түрде қосылды.",
            "Метадеректер, канондық URL-дар, hreflang, әлеуметтік карточкалар және бет түрі бойынша JSON-LD орталықтандырылды.",
            "Пререндеринг, аралау ережелері, сайт картасы, llms.txt, нақты 404 жауаптары және сапаның автоматты тексерулері кеңейтілді.",
            "Көріну индексінің 2-нұсқасы мен дауыс үлесінің іске асырылған формулалары жарияланды.",
          ],
        },
        {
          heading: "Бұрынғы тарих",
          paragraphs: [
            "Репозиторийде алдыңғы инженерлік жұмыс бар, бірақ релиздердің жария хронологиясы мен негізі қалану туралы расталған фактілер берілмеген. Ішкі коммит тарихы мұнда маркетингтік мәлімдемеге айналдырылмайды.",
          ],
        },
      ],
      related: [
        { path: "/methodology", label: "2-нұсқа әдістемесі" },
        { path: "/docs", label: "Ағымдағы құжаттама" },
        { path: "/about", label: "Өнім туралы" },
      ],
    }),
  },
  "/privacy": {
    en: en({
      eyebrow: "Privacy",
      h1: "Akrux privacy policy",
      lead:
        "Public discoverability applies to product information only. Customer profiles, prompts, answers and reports remain access-controlled.",
      summaryTitle: "Privacy boundary",
      summary:
        "Akrux processes account and scan data to provide private visibility reports. Public SEO resources contain no customer scans, user emails, access tokens, billing data or private provider responses.",
      sections: [
        {
          heading: "Data the product processes",
          bullets: [
            "Account data such as email, optional display name, locale and authentication-provider identifiers.",
            "Business profile fields such as name, category, website, city, market, aliases and competitors.",
            "Generated prompts, provider answers, citations, extracted entities, scan status, cost metadata and calculated report metrics.",
            "Contact-request fields voluntarily submitted through the Book a call form.",
          ],
        },
        {
          heading: "Why it is processed",
          paragraphs: [
            "The data is used to authenticate accounts, research the submitted business, run requested scans, build reports, enforce quotas, send transactional messages, respond to requests and protect provider budgets. AI prompts and public business context are sent to the configured model provider to perform a scan.",
          ],
        },
        {
          heading: "Public and private separation",
          paragraphs: [
            "Marketing pages, methodology, documentation, sitemap and llms.txt are public. Account routes, APIs, business profiles, prompts tied to accounts, raw answers, competitors and reports are excluded from public indexes and protected by authorization checks. Robots rules supplement access control; they are not used as the security boundary.",
          ],
        },
        {
          heading: "Cookies, retention and requests",
          paragraphs: [
            "Akrux uses an HTTP-only session cookie after authentication and local browser storage for language and pending form preferences. A production retention schedule, legal operator identity, jurisdiction-specific rights process and privacy contact are not configured in this repository. The product owner must supply them before relying on this page as a complete jurisdictional notice.",
          ],
        },
        {
          heading: "Public measurement analytics",
          paragraphs: [
            "Public-page analytics, when enabled, stores aggregate date, page, language, event and coarse referral category. It does not store a raw referrer, user email, page contents or claim that normal visits are verified crawler traffic.",
          ],
        },
      ],
      related: [
        { path: "/terms", label: "Read the Terms of Service" },
        { path: "/contact", label: "Use the public contact route" },
        { path: "/methodology", label: "See what a scan stores" },
      ],
    }),
    ru: ru({
      eyebrow: "Конфиденциальность",
      h1: "Политика конфиденциальности Akrux",
      lead:
        "Публичная обнаруживаемость относится только к информации о продукте. Клиентские профили, вопросы, ответы и отчёты остаются закрытыми.",
      summaryTitle: "Граница приватности",
      summary:
        "Akrux обрабатывает данные аккаунта и проверки для приватного отчёта. Публичные SEO-ресурсы не содержат клиентские проверки, почту пользователей, токены, платёжные данные и приватные ответы провайдера.",
      sections: [
        {
          heading: "Какие данные обрабатываются",
          bullets: [
            "Данные аккаунта: email, необязательное имя, язык и идентификаторы провайдера авторизации.",
            "Поля бизнеса: название, категория, сайт, город, рынок, варианты названия и конкуренты.",
            "Сгенерированные вопросы, ответы провайдера, ссылки, сущности, статус, данные стоимости и метрики отчёта.",
            "Поля обращения, добровольно отправленные через форму созвона.",
          ],
        },
        {
          heading: "Зачем данные обрабатываются",
          paragraphs: [
            "Данные нужны для авторизации, исследования указанного бизнеса, запуска проверки, построения отчёта, квот, транзакционных сообщений, ответов на обращения и контроля бюджета. Вопросы и публичный контекст бизнеса отправляются настроенному провайдеру моделей для выполнения проверки.",
          ],
        },
        {
          heading: "Разделение публичного и приватного",
          paragraphs: [
            "Маркетинговые страницы, методология, документация, карта сайта и llms.txt публичны. Маршруты аккаунта, API, профили, вопросы аккаунта, сырые ответы, конкуренты и отчёты исключены из публичных индексов и защищены проверкой доступа. Robots дополняет защиту, но не является её границей.",
          ],
        },
        {
          heading: "Файлы cookie, хранение и запросы",
          paragraphs: [
            "После входа Akrux использует HTTP-only cookie сессии, а локальное хранилище браузера — для языка и незавершённых полей формы. Срок хранения в рабочей среде, юридический оператор, процесс прав по юрисдикциям и контакт приватности в репозитории не настроены. Владелец должен добавить их до использования страницы как полного юридического уведомления.",
          ],
        },
        {
          heading: "Аналитика публичных страниц",
          paragraphs: [
            "При включении аналитика хранит агрегированные дату, страницу, язык, событие и грубую категорию перехода. Она не хранит исходный реферер, email, содержимое страницы и не выдаёт обычные посещения за подтверждённый трафик роботов.",
          ],
        },
      ],
      related: [
        { path: "/terms", label: "Условия использования" },
        { path: "/contact", label: "Публичный канал связи" },
        { path: "/methodology", label: "Данные проверки" },
      ],
    }),    kk: kk({
      eyebrow: "Құпиялық",
      h1: "Akrux құпиялық саясаты",
      lead:
        "Жария табылу тек өнім туралы ақпаратқа қатысты. Клиент профильдері, сұрақтары, жауаптары мен есептері жабық қалады.",
      summaryTitle: "Құпиялық шекарасы",
      summary:
        "Akrux аккаунт пен тексеру деректерін жеке есеп үшін өңдейді. Жария SEO ресурстарында клиент тексерулері, пайдаланушы поштасы, токендер, төлем деректері және провайдердің жеке жауаптары болмайды.",
      sections: [
        {
          heading: "Қандай деректер өңделеді",
          bullets: [
            "Аккаунт деректері: email, міндетті емес атау, тіл және авторизация провайдерінің идентификаторлары.",
            "Бизнес өрістері: атау, санат, сайт, қала, нарық, атау нұсқалары және бәсекелестер.",
            "Жасалған сұрақтар, провайдер жауаптары, сілтемелер, сущностьтар, күй, құн деректері және есеп метрикалары.",
            "Қоңырау формасы арқылы ерікті жіберілген өтініш өрістері.",
          ],
        },
        {
          heading: "Деректер не үшін өңделеді",
          paragraphs: [
            "Деректер авторизация, көрсетілген бизнесті зерттеу, тексеруді іске қосу, есеп құру, квоталар, транзакциялық хабарламалар, өтініштерге жауап беру және бюджетті бақылау үшін қажет. Сұрақтар мен бизнестің жария контексті тексеруді орындау үшін бапталған модель провайдеріне жіберіледі.",
          ],
        },
        {
          heading: "Жария мен жабықты бөлу",
          paragraphs: [
            "Маркетинг беттері, әдістеме, құжаттама, сайт картасы және llms.txt жария. Аккаунт маршруттары, API, профильдер, аккаунт сұрақтары, шикі жауаптар, бәсекелестер және есептер жария индекстерден шығарылған әрі қолжетімділік тексеруімен қорғалған. Robots қорғанысты толықтырады, бірақ оның шекарасы емес.",
          ],
        },
        {
          heading: "Cookie файлдары, сақтау және сұраныстар",
          paragraphs: [
            "Кіргеннен кейін Akrux HTTP-only сессия cookie-ін, ал браузердің жергілікті жадын тіл мен аяқталмаған форма өрістері үшін пайдаланады. Жұмыс ортасындағы сақтау мерзімі, заңды оператор, юрисдикциялар бойынша құқықтар процесі және құпиялық байланысы репозиторийде бапталмаған. Бетті толық заңды хабарлама ретінде пайдаланар алдында иесі оларды қосуы тиіс.",
          ],
        },
        {
          heading: "Жария беттер аналитикасы",
          paragraphs: [
            "Қосылған жағдайда аналитика жиынтық күнді, бетті, тілді, оқиғаны және өтудің шамамен алынған санатын сақтайды. Ол бастапқы рефererді, email-ді, бет мазмұнын сақтамайды және әдеттегі кірулерді расталған робот трафигі етіп көрсетпейді.",
          ],
        },
      ],
      related: [
        { path: "/terms", label: "Пайдалану шарттары" },
        { path: "/contact", label: "Жария байланыс арнасы" },
        { path: "/methodology", label: "Тексеру деректері" },
      ],
    }),
  },
  "/terms": {
    en: en({
      eyebrow: "Terms",
      h1: "Akrux terms of service",
      lead:
        "These terms describe the current product behavior. Akrux is the product name; verified legal-operator details still need to be supplied for a production legal notice.",
      summaryTitle: "Core terms",
      summary:
        "Use Akrux only for businesses and data you are authorized to evaluate. Treat generated answers and metrics as variable analytical evidence, not guarantees or professional advice.",
      sections: [
        {
          heading: "Accounts and acceptable use",
          bullets: [
            "Keep account access secure and provide accurate profile information.",
            "Do not scan or submit private personal data, credentials or confidential customer material.",
            "Do not bypass quotas, interfere with providers, scrape authenticated reports or use the service unlawfully.",
            "Do not present Akrux output as a guaranteed model ranking, endorsement or verified professional advice.",
          ],
        },
        {
          heading: "Generated-output limitations",
          paragraphs: [
            "AI answers can be incomplete, inaccurate, variable or unavailable. Entity extraction, sentiment and competitor classification may require review. The service makes no guarantee of indexing, training-data inclusion, citation, recommendation, commercial outcome or uninterrupted provider availability.",
          ],
        },
        {
          heading: "Plans, limits and availability",
          paragraphs: [
            "Free scans are subject to account, network, daily and budget limits. Optional review or implementation work is separately scoped. The product may pause scans when provider credentials, quotas or budgets are unavailable rather than supply fabricated data.",
          ],
        },
        {
          heading: "Content and product rights",
          paragraphs: [
            "Users retain responsibility for the business information they submit. Third-party model names, answers and cited content remain subject to their respective rights and terms. Akrux software, original documentation and brand assets may not be misrepresented as a third-party endorsement.",
          ],
        },
        {
          heading: "Legal completion required",
          paragraphs: [
            "The repository does not contain a verified legal business name, registered address, governing law, dispute venue, tax details or dedicated legal contact. Those facts must be supplied and reviewed by qualified counsel before these terms are treated as complete production terms.",
          ],
        },
      ],
      related: [
        { path: "/privacy", label: "Read the Privacy Policy" },
        { path: "/methodology", label: "Understand output limitations" },
        { path: "/contact", label: "Contact Akrux" },
      ],
    }),
    ru: ru({
      eyebrow: "Условия",
      h1: "Условия использования Akrux",
      lead:
        "Условия описывают текущее поведение продукта. Akrux — название продукта; подтверждённые данные юридического оператора ещё нужно добавить для рабочего юридического документа.",
      summaryTitle: "Основные условия",
      summary:
        "Используйте Akrux только для бизнеса и данных, которые вы вправе проверять. Рассматривайте ответы и метрики как изменчивые аналитические доказательства, а не гарантии или профессиональную консультацию.",
      sections: [
        {
          heading: "Аккаунты и допустимое использование",
          bullets: [
            "Защищайте доступ к аккаунту и указывайте точные данные профиля.",
            "Не отправляйте приватные персональные данные, учётные данные и конфиденциальные клиентские материалы.",
            "Не обходите квоты, не мешайте провайдерам, не извлекайте закрытые отчёты автоматически и не нарушайте закон.",
            "Не представляйте результат Akrux как гарантированную позицию, одобрение или профессиональную консультацию.",
          ],
        },
        {
          heading: "Ограничения сгенерированных данных",
          paragraphs: [
            "Ответы могут быть неполными, неточными, изменчивыми или недоступными. Извлечение сущностей, тональности и конкурентов может требовать проверки. Сервис не гарантирует индексацию, попадание в обучающие данные, цитирование, рекомендацию, коммерческий результат или постоянную доступность провайдера.",
          ],
        },
        {
          heading: "Планы, лимиты и доступность",
          paragraphs: [
            "Бесплатные проверки ограничены аккаунтом, сетью, днём и бюджетом. Разбор и внедрение оцениваются отдельно. При отсутствии ключей, квот или бюджета продукт может остановить проверку вместо выдачи выдуманных данных.",
          ],
        },
        {
          heading: "Права на контент и продукт",
          paragraphs: [
            "Пользователь отвечает за отправленную информацию о бизнесе. Названия моделей, их ответы и процитированный контент регулируются правами и условиями соответствующих сторон. Нельзя выдавать ПО, документацию и бренд Akrux за одобрение третьей стороны.",
          ],
        },
        {
          heading: "Требуется юридическое завершение",
          paragraphs: [
            "В репозитории нет подтверждённых юридического наименования, адреса регистрации, применимого права, места споров, налоговых данных и контакта юриста. Эти сведения должен предоставить владелец и проверить квалифицированный специалист до использования условий как полного рабочего документа.",
          ],
        },
      ],
      related: [
        { path: "/privacy", label: "Политика конфиденциальности" },
        { path: "/methodology", label: "Ограничения результатов" },
        { path: "/contact", label: "Связаться с Akrux" },
      ],
    }),    kk: kk({
      eyebrow: "Шарттар",
      h1: "Akrux пайдалану шарттары",
      lead:
        "Шарттар өнімнің ағымдағы мінез-құлқын сипаттайды. Akrux — өнім атауы; жұмыс істейтін заңды құжат үшін заңды оператордың расталған деректерін әлі қосу қажет.",
      summaryTitle: "Негізгі шарттар",
      summary:
        "Akrux-ті тек өзіңіз тексеруге құқылы бизнес пен деректер үшін пайдаланыңыз. Жауаптар мен метрикаларды кепілдік немесе кәсіби кеңес емес, өзгермелі аналитикалық дәлел деп қараңыз.",
      sections: [
        {
          heading: "Аккаунттар және рұқсат етілген пайдалану",
          bullets: [
            "Аккаунтқа қолжетімділікті қорғаңыз және профильде дәл деректер көрсетіңіз.",
            "Жеке дербес деректерді, тіркелгі деректерін және құпия клиент материалдарын жібермеңіз.",
            "Квоталарды айналып өтпеңіз, провайдерлерге кедергі жасамаңыз, жабық есептерді автоматты шығарып алмаңыз және заңды бұзбаңыз.",
            "Akrux нәтижесін кепілді позиция, мақұлдау немесе кәсіби кеңес ретінде көрсетпеңіз.",
          ],
        },
        {
          heading: "Жасалған деректердің шектеулері",
          paragraphs: [
            "Жауаптар толық емес, дәл емес, өзгермелі немесе қолжетімсіз болуы мүмкін. Сущностьтарды, реңкті және бәсекелестерді шығару тексеруді талап етуі мүмкін. Сервис индекстеуге, оқыту деректеріне түсуге, дәйексөзге, ұсынысқа, коммерциялық нәтижеге немесе провайдердің тұрақты қолжетімділігіне кепілдік бермейді.",
          ],
        },
        {
          heading: "Жоспарлар, лимиттер және қолжетімділік",
          paragraphs: [
            "Тегін тексерулер аккаунтпен, желімен, күнмен және бюджетпен шектелген. Талдау мен енгізу бөлек бағаланады. Кілттер, квоталар немесе бюджет болмаса, өнім ойдан шығарылған дерек берудің орнына тексеруді тоқтатуы мүмкін.",
          ],
        },
        {
          heading: "Мазмұн мен өнімге құқықтар",
          paragraphs: [
            "Пайдаланушы жіберілген бизнес ақпараты үшін жауапты. Модель атаулары, олардың жауаптары және дәйексөз алынған мазмұн тиісті тараптардың құқықтары мен шарттарымен реттеледі. Akrux бағдарламалық жасақтамасын, құжаттамасы мен брендін үшінші тараптың мақұлдауы етіп көрсетуге болмайды.",
          ],
        },
        {
          heading: "Заңды тұрғыдан аяқтау қажет",
          paragraphs: [
            "Репозиторийде расталған заңды атау, тіркеу мекенжайы, қолданылатын құқық, дауларды қарау орны, салық деректері және заңгер байланысы жоқ. Бұл мәліметтерді иесі беруі және шарттарды толық жұмыс құжаты ретінде пайдаланбас бұрын білікті маман тексеруі тиіс.",
          ],
        },
      ],
      related: [
        { path: "/privacy", label: "Құпиялық саясаты" },
        { path: "/methodology", label: "Нәтиже шектеулері" },
        { path: "/contact", label: "Akrux-пен байланысу" },
      ],
    }),
  },
};

export function publicPageContent(path: ContentPagePath, locale: Locale): PublicPageContent {
  return PUBLIC_PAGE_CONTENT[path][locale];
}

export function publicFaqItems(locale: Locale): PublicFaqItem[] {
  return PUBLIC_FAQ_ITEMS[locale];
}

export function publicUiText(locale: Locale): PublicUiText {
  return PUBLIC_UI[locale];
}
