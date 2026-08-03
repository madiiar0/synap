import type { Locale } from "./constants.js";
import type { IndexablePublicPath } from "./seo.js";

export type ContentPagePath = Exclude<IndexablePublicPath, "/">;

export const BLOG_ARTICLE_PATHS = [
  "/blogs/audit-ai-generated-brand-information",
  "/blogs/why-ai-recommends-competitors",
] as const satisfies readonly ContentPagePath[];

export interface ContentLink {
  path: IndexablePublicPath;
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
  socialImageAlt: string;
}

const PUBLIC_UI: Record<Locale, PublicUiText> = {
  en: {
    useCases: "Use cases",
    blogs: "Blogs",
    breadcrumbs: "Breadcrumbs",
    home: "Home",
    answers: "Answers",
    publisher: "Published by Synap",
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
    socialImageAlt: "Synap visibility analytics for AI answers",
  },
  ru: {
    useCases: "Сценарии",
    blogs: "Блог",
    breadcrumbs: "Хлебные крошки",
    home: "Главная",
    answers: "Ответы",
    publisher: "Издатель: Synap",
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
    socialImageAlt: "Synap: аналитика видимости в ИИ",
  },
};

export const PUBLIC_FAQ_ITEMS: Record<Locale, PublicFaqItem[]> = {
  en: [
    {
      question: "What is Synap?",
      answer:
        "Synap is a browser-based AI visibility analytics platform. It measures how a business appears in generated answers, including unbranded visibility, branded recognition, recommendation position, competitors, citations and Share of Voice.",
    },
    {
      question: "How is the primary Visibility Score calculated?",
      answer:
        "The primary score uses successful unbranded answers only. Category, best-of and purchase prompts form a category subscore weighted at 60%; unbranded comparison prompts form a comparison subscore weighted at 40%. Results are weighted across the model families actually queried. A limited position bonus applies when the average organic mention position is two or better. Branded and informational prompts do not raise the primary score.",
    },
    {
      question: "Which AI systems does Synap evaluate?",
      answer:
        "Synap currently supports model families associated with ChatGPT, Gemini, Perplexity, Claude and Grok. The free scan uses ChatGPT, Gemini and Perplexity coverage; the full internal tier can add Claude and Grok. Requests run through Perplexity's Agent API, not the consumer chat interfaces, so results should be interpreted as a measured sample rather than a reproduction of every public product experience.",
    },
    {
      question: "What is Share of Voice in Synap?",
      answer:
        "Share of Voice is each qualifying business entity's share of all qualifying entity mentions across successful unbranded answers. An entity counts at most once per answer. Directories, marketplaces, sources and generic phrases are filtered from the competitor table.",
    },
    {
      question: "Are AI answers stable or guaranteed?",
      answer:
        "No. Generated answers vary with model version, retrieval results, time, wording and provider behavior. A Synap scan is a dated sample. Rescanning can reveal movement, but neither a score nor an optimization guarantees that an AI system will recommend a business.",
    },
    {
      question: "How long does a scan take?",
      answer:
        "A free scan usually completes in minutes, but timing depends on provider latency and request availability. Synap shows progress and emails the report link when processing finishes.",
    },
    {
      question: "Is a Synap scan free?",
      answer:
        "Free scans are available subject to account, network, daily and provider-budget limits. Improvement planning or implementation is scoped separately after a review call; no fixed paid price is currently published.",
    },
    {
      question: "Are scan results public?",
      answer:
        "No. Business profiles, generated prompts tied to an account, model answers, competitor reports and scan results are authenticated data. Public pages explain the product and methodology without exposing customer reports.",
    },
    {
      question: "Which languages and markets are supported?",
      answer:
        "The interface and public documentation support English and Russian. Prompt language mix is configured for Kazakhstan, Russia or a global market, and a city can be added for local discovery questions.",
    },
    {
      question: "Does Synap replace traditional SEO analytics?",
      answer:
        "No. Search analytics measures indexed pages, queries, impressions, clicks and rankings. Synap measures generated answers, mentions, recommendation order, competitors and cited sources. The two evidence sets are complementary.",
    },
  ],
  ru: [
    {
      question: "Что такое Synap?",
      answer:
        "Synap — браузерная платформа аналитики видимости в ИИ. Она измеряет появление бизнеса в сгенерированных ответах: небрендовую видимость, узнаваемость бренда, позицию в рекомендациях, конкурентов, источники и долю голоса.",
    },
    {
      question: "Как рассчитывается основной Индекс видимости?",
      answer:
        "Основной индекс использует только успешные ответы на небрендовые вопросы. Вопросы о категории, лучших вариантах и покупке формируют показатель категории с весом 60%; небрендовые сравнения — показатель сравнения с весом 40%. Результаты взвешиваются по фактически запрошенным семействам моделей. Если средняя органическая позиция не ниже второй, применяется ограниченный бонус. Брендовые и информационные вопросы не повышают основной индекс.",
    },
    {
      question: "Какие ИИ-системы оценивает Synap?",
      answer:
        "Synap поддерживает семейства моделей, связанные с ChatGPT, Gemini, Perplexity, Claude и Grok. Бесплатная проверка использует ChatGPT, Gemini и Perplexity; полный внутренний уровень может добавлять Claude и Grok. Запросы выполняются через Agent API Perplexity, а не через потребительские чат-интерфейсы, поэтому результат — измеренная выборка, а не точная копия каждого публичного продукта.",
    },
    {
      question: "Что означает доля голоса в Synap?",
      answer:
        "Доля голоса — доля каждой подходящей бизнес-сущности среди всех подходящих упоминаний в успешных небрендовых ответах. В одном ответе сущность учитывается не более одного раза. Каталоги, маркетплейсы, источники и общие фразы исключаются из таблицы конкурентов.",
    },
    {
      question: "Стабильны ли ответы ИИ и гарантирован ли результат?",
      answer:
        "Нет. Ответы меняются из-за версии модели, результатов поиска, времени, формулировки и поведения провайдера. Проверка Synap — датированная выборка. Повторные проверки показывают движение, но ни индекс, ни оптимизация не гарантируют рекомендацию бизнеса.",
    },
    {
      question: "Сколько длится проверка?",
      answer:
        "Бесплатная проверка обычно завершается за несколько минут, но время зависит от задержки и доступности провайдера. Synap показывает прогресс и отправляет ссылку на отчёт после завершения.",
    },
    {
      question: "Проверка Synap бесплатная?",
      answer:
        "Бесплатные проверки доступны с лимитами аккаунта, сети, дня и бюджета провайдера. План улучшений и внедрение оцениваются отдельно после разбора; фиксированная платная цена сейчас не опубликована.",
    },
    {
      question: "Публикуются ли результаты проверок?",
      answer:
        "Нет. Профили бизнеса, вопросы аккаунта, ответы моделей, отчёты о конкурентах и результаты проверок доступны только после авторизации. Публичные страницы объясняют продукт и методологию без раскрытия клиентских отчётов.",
    },
    {
      question: "Какие языки и рынки поддерживаются?",
      answer:
        "Интерфейс и публичная документация доступны на русском и английском. Языковая пропорция вопросов настраивается для Казахстана, России или глобального рынка; для локального поиска можно указать город.",
    },
    {
      question: "Заменяет ли Synap традиционную SEO-аналитику?",
      answer:
        "Нет. Поисковая аналитика измеряет индексируемые страницы, запросы, показы, клики и позиции. Synap измеряет сгенерированные ответы, упоминания, порядок рекомендаций, конкурентов и источники. Эти наборы данных дополняют друг друга.",
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

export const PUBLIC_PAGE_CONTENT: Record<ContentPagePath, Record<Locale, PublicPageContent>> = {
  "/product": {
    en: en({
      eyebrow: "Product",
      h1: "AI visibility analytics built around actual answers",
      lead:
        "Synap turns a controlled set of customer-style prompts and generated answers into a report that a business can inspect, question and repeat.",
      summaryTitle: "Product in one sentence",
      summary:
        "Synap measures when, where and how a business is mentioned, ranked and recommended in supported AI-generated answers, alongside competitors, citations and Share of Voice.",
      sections: [
        {
          heading: "What a scan produces",
          paragraphs: [
            "The report is evidence-first: every high-level metric can be traced back to the prompts and answers collected for that scan.",
          ],
          bullets: [
            "A primary Visibility Score based on successful unbranded discovery answers.",
            "A separate branded-recognition diagnostic that cannot inflate the primary score.",
            "Provider-level mention rates and scores over a shared prompt set where comparisons are valid.",
            "The generated prompt list, answer text, recommendation position and cited domains.",
            "Competitor entities, Share of Voice and a ‘Where you lose’ view for answers that name rivals but not the target business.",
          ],
        },
        {
          heading: "What Synap evaluates",
          paragraphs: [
            "Synap supports model families associated with ChatGPT, Gemini, Perplexity, Claude and Grok. The free plan concentrates coverage on ChatGPT, Gemini and Perplexity; a full internal tier can query all five.",
            "Those requests are made through Perplexity's Agent API rather than by automating consumer chat products. This makes the run reproducible inside Synap's provider setup, but it does not imply that every consumer interface will return the same answer.",
          ],
        },
        {
          heading: "Who it is for",
          paragraphs: [
            "Synap is designed for businesses with a public identity that customers may discover by category, need, location or comparison. Marketing teams can monitor visibility; agencies can diagnose client evidence gaps; owners can inspect which competitors and sources shape answers.",
            "The product is browser-based. Public explanations are available without an account; scans and customer reports require authentication.",
          ],
        },
        {
          heading: "How it differs from rank tracking",
          table: {
            headers: ["Question", "Traditional rank tracking", "Synap"],
            rows: [
              ["Measured surface", "Search-result pages", "Generated answer text"],
              ["Primary unit", "URL position", "Business mention and recommendation position"],
              ["Competitive view", "Domains ranking for a query", "Entities named across answers"],
              ["Evidence", "Result URL and position", "Prompt, answer and citations"],
            ],
          },
        },
      ],
      related: [
        { path: "/how-it-works", label: "Follow a scan step by step" },
        { path: "/methodology", label: "Read the scoring methodology" },
        { path: "/pricing", label: "Review access and pricing" },
      ],
    }),
    ru: ru({
      eyebrow: "Продукт",
      h1: "Аналитика видимости в ИИ на основе реальных ответов",
      lead:
        "Synap превращает контролируемый набор клиентских вопросов и сгенерированных ответов в отчёт, который можно проверить, разобрать и повторить.",
      summaryTitle: "Продукт одним предложением",
      summary:
        "Synap измеряет, когда, где и как бизнес упоминают, ранжируют и рекомендуют в ответах поддерживаемых ИИ-моделей, а также показывает конкурентов, источники и долю голоса.",
      sections: [
        {
          heading: "Что выдаёт проверка",
          paragraphs: [
            "Отчёт строится от доказательств: каждый верхнеуровневый показатель можно связать с вопросами и ответами конкретной проверки.",
          ],
          bullets: [
            "Основной Индекс видимости по успешным небрендовым ответам.",
            "Отдельный показатель узнаваемости бренда, который не завышает основной индекс.",
            "Доля упоминаний и показатели по моделям на общем наборе вопросов, где сравнение корректно.",
            "Список вопросов, тексты ответов, позиции в рекомендациях и процитированные домены.",
            "Сущности конкурентов, доля голоса и раздел «Где вы проигрываете» для ответов с конкурентами без целевого бизнеса.",
          ],
        },
        {
          heading: "Что оценивает Synap",
          paragraphs: [
            "Synap поддерживает семейства моделей, связанные с ChatGPT, Gemini, Perplexity, Claude и Grok. Бесплатный уровень сосредоточен на ChatGPT, Gemini и Perplexity; полный внутренний уровень может запросить все пять.",
            "Запросы выполняются через Agent API Perplexity, а не через автоматизацию потребительских чатов. Это делает запуск воспроизводимым в среде провайдера Synap, но не означает, что каждый публичный интерфейс даст тот же ответ.",
          ],
        },
        {
          heading: "Для кого создан продукт",
          paragraphs: [
            "Synap подходит компаниям с публичной идентичностью, которые клиенты ищут по категории, задаче, локации или сравнению. Маркетинговые команды отслеживают видимость, агентства диагностируют пробелы в доказательствах, а владельцы видят конкурентов и источники ответов.",
            "Продукт работает в браузере. Публичные объяснения доступны без аккаунта; проверки и клиентские отчёты требуют авторизации.",
          ],
        },
        {
          heading: "Отличие от отслеживания поисковых позиций",
          table: {
            headers: ["Вопрос", "Поисковые позиции", "Synap"],
            rows: [
              ["Измеряемая поверхность", "Поисковая выдача", "Текст сгенерированного ответа"],
              ["Основная единица", "Позиция URL", "Упоминание бизнеса и позиция рекомендации"],
              ["Конкурентный срез", "Домены по запросу", "Сущности во множестве ответов"],
              ["Доказательства", "URL и позиция", "Вопрос, ответ и источники"],
            ],
          },
        },
      ],
      related: [
        { path: "/how-it-works", label: "Этапы проверки" },
        { path: "/methodology", label: "Методология расчёта" },
        { path: "/pricing", label: "Доступ и тарифы" },
      ],
    }),
  },
  "/how-it-works": {
    en: en({
      eyebrow: "Workflow",
      h1: "How a Synap visibility scan works",
      lead:
        "A scan moves through business research, prompt generation, model requests, extraction and scoring. Failed stages are labeled rather than silently replaced with invented data.",
      summaryTitle: "Direct answer",
      summary:
        "Synap researches the submitted business, writes a dated prompt set, collects fresh answers for that scan, detects business entities and citations, then calculates versioned metrics and stores the underlying evidence in a private report.",
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
            "In a live scan, Synap can research the public website and web results to identify services, audiences, aliases, sub-brands and likely competitors. Low-confidence research does not fill gaps with guesses; prompt generation falls back to the owner's fields.",
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
          heading: "4. Collect fresh generated answers",
          paragraphs: [
            "Answers are never reused across scans. The free plan sends a shared core prompt set to ChatGPT, Gemini and Perplexity model families, then distributes the remaining prompts across ChatGPT and Gemini coverage. The full internal tier can run every prompt across all five supported model families.",
          ],
        },
        {
          heading: "5. Extract entities and calculate the report",
          paragraphs: [
            "Deterministic alias matching identifies known businesses and their order of appearance. A batched language-model pass can add sentiment and previously unknown company names. Entity classification removes directories, marketplaces, sources and generic phrases before competitor reporting.",
            "Successful answers feed the versioned Visibility Score, branded diagnostic, provider cards, citations and Share of Voice. Failed requests remain failures and are excluded from score denominators.",
          ],
        },
      ],
      related: [
        { path: "/methodology", label: "Inspect formulas and exclusions" },
        { path: "/docs", label: "Use the report" },
        { path: "/privacy", label: "See how scan data is protected" },
      ],
    }),
    ru: ru({
      eyebrow: "Процесс",
      h1: "Как проходит проверка видимости Synap",
      lead:
        "Проверка проходит через исследование бизнеса, генерацию вопросов, запросы к моделям, извлечение данных и расчёт. Ошибки помечаются, а не заменяются выдуманными данными.",
      summaryTitle: "Краткий ответ",
      summary:
        "Synap исследует указанный бизнес, создаёт датированный набор вопросов, получает свежие ответы для этой проверки, находит бизнес-сущности и источники, затем рассчитывает версионированные метрики и сохраняет доказательства в приватном отчёте.",
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
            "В рабочем режиме Synap может изучить публичный сайт и веб-результаты, чтобы найти услуги, аудиторию, варианты названия, суббренды и вероятных конкурентов. При низкой уверенности система не заполняет пробелы догадками и использует поля владельца.",
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
          heading: "4. Свежие сгенерированные ответы",
          paragraphs: [
            "Ответы никогда не переиспользуются между проверками. Бесплатный уровень отправляет общий набор вопросов семействам ChatGPT, Gemini и Perplexity, затем распределяет остальные вопросы между покрытием ChatGPT и Gemini. Полный внутренний уровень может прогнать каждый вопрос через все пять поддерживаемых семейств.",
          ],
        },
        {
          heading: "5. Извлечение сущностей и отчёт",
          paragraphs: [
            "Детерминированное сопоставление вариантов названия находит известные компании и порядок появления. Пакетный проход языковой модели может добавить тональность и ранее неизвестные названия. Классификация исключает каталоги, маркетплейсы, источники и общие фразы.",
            "Успешные ответы формируют версионированный Индекс видимости, брендовый показатель, карточки моделей, источники и долю голоса. Ошибочные запросы остаются ошибками и не входят в знаменатели.",
          ],
        },
      ],
      related: [
        { path: "/methodology", label: "Формулы и исключения" },
        { path: "/docs", label: "Работа с отчётом" },
        { path: "/privacy", label: "Защита данных проверки" },
      ],
    }),
  },
  "/methodology": {
    en: en({
      eyebrow: "Methodology version 2",
      h1: "How Synap measures AI visibility",
      lead:
        "This page documents the implemented calculation rather than a marketing approximation. It explains what enters each metric, what is excluded and why results remain a sample.",
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
            "For every model family actually queried, Synap calculates a category mention rate over category, best-of and purchase prompts, and a comparison mention rate over unbranded comparison prompts. The category rate has weight 0.60 and the comparison rate 0.40. Missing groups are omitted and the remaining weights are normalized.",
            "Cross-model results use weights of 0.30 ChatGPT, 0.25 Gemini, 0.20 Perplexity, 0.15 Claude and 0.10 Grok, normalized over the models present in that scan. If the average organic mention position is 2 or better, the score receives a 1.15 multiplier. The result is capped at 100, and the bonus cannot turn an imperfect baseline into 100.",
            "Branded prompts and informational prompts do not enter the primary category/comparison formula. Branded answers produce a separate recognition percentage. Informational unbranded answers can still contribute to overall evidence counts and Share of Voice.",
          ],
        },
        {
          heading: "Share of Voice formula",
          paragraphs: [
            "Synap uses successful unbranded answers. It counts each qualifying business entity at most once per answer, sums those entity mentions, then divides each entity's count by the total qualifying mentions. Configured competitors remain visible with zero mentions; newly detected entities must pass competitor classification.",
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
        { path: "/docs", label: "Interpret each report view" },
        { path: "/ai-visibility", label: "Understand the measured concept" },
        { path: "/changelog", label: "Review methodology changes" },
      ],
    }),
    ru: ru({
      eyebrow: "Методология, версия 2",
      h1: "Как Synap измеряет видимость в ИИ",
      lead:
        "Здесь описан реализованный расчёт, а не маркетинговое приближение: какие данные входят в метрики, что исключается и почему результат остаётся выборкой.",
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
            "Для каждого фактически запрошенного семейства моделей Synap считает долю упоминаний по вопросам категории, лучших вариантов и покупки, а также долю по небрендовым сравнениям. Вес категории — 0,60, сравнения — 0,40. Отсутствующие группы исключаются, оставшиеся веса нормализуются.",
            "Межмодельный расчёт использует веса: ChatGPT 0,30, Gemini 0,25, Perplexity 0,20, Claude 0,15 и Grok 0,10, с нормализацией по моделям конкретной проверки. При средней органической позиции 2 или лучше применяется множитель 1,15. Результат ограничен 100, а бонус не может превратить несовершенную базу в 100.",
            "Брендовые и информационные вопросы не входят в основную формулу категории и сравнения. Брендовые ответы дают отдельный процент узнаваемости. Информационные небрендовые ответы могут входить в общие показатели доказательств и долю голоса.",
          ],
        },
        {
          heading: "Формула доли голоса",
          paragraphs: [
            "Synap использует успешные небрендовые ответы. Каждая подходящая бизнес-сущность учитывается не более одного раза на ответ; её число делится на сумму всех подходящих упоминаний. Заданные конкуренты остаются в таблице с нулём, а новые сущности проходят классификацию.",
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
        { path: "/docs", label: "Как читать разделы отчёта" },
        { path: "/ai-visibility", label: "Что именно измеряется" },
        { path: "/changelog", label: "Изменения методологии" },
      ],
    }),
  },
  "/ai-visibility": {
    en: en({
      eyebrow: "Guide",
      h1: "What is AI visibility?",
      lead:
        "AI visibility is the observable presence and treatment of an entity inside generated answers to relevant questions.",
      summaryTitle: "Definition",
      summary:
        "For a business, AI visibility describes whether an answer identifies the business, includes it among relevant options, places it in a recommendation order, describes it accurately and cites evidence connected to it.",
      published: "August 2, 2026",
      sections: [
        {
          heading: "Visibility is more than a mention",
          paragraphs: [
            "A business can be named only when the user already supplied its name, or it can surface organically when the user asks for a category, need or location. Those are different signals. A useful audit separates branded recognition from unbranded discovery and keeps the underlying question visible.",
            "Position, description, competitors and citations add context. A first-position recommendation supported by current primary information is different from a passing mention based on an outdated directory.",
          ],
        },
        {
          heading: "AI visibility versus traditional SEO",
          table: {
            headers: ["Dimension", "Search visibility", "AI visibility"],
            rows: [
              ["Output", "Ranked links", "Synthesized answer"],
              ["Entity signal", "Page or domain", "Business, product or organization"],
              ["Evidence", "Indexed page and snippet", "Answer text and cited sources"],
              ["Volatility", "Ranking changes", "Model, retrieval and wording changes"],
              ["Success", "Impressions, clicks, rank", "Mentions, recommendation position, Share of Voice"],
            ],
          },
        },
        {
          heading: "A responsible measurement set",
          bullets: [
            "Use realistic prompts tied to actual products, services, audiences and locations.",
            "Separate questions that name the business from those that do not.",
            "Record the date, model family, exact prompt, answer and citations.",
            "Treat failed requests as missing measurements, not negative answers.",
            "Repeat scans over time and interpret movement alongside source changes.",
          ],
        },
        {
          heading: "What the number cannot prove",
          paragraphs: [
            "A visibility score does not prove that a real customer saw an answer, clicked, purchased or will receive the same response. It is a controlled observation of generated outputs. Conversion and search analytics remain necessary for commercial impact.",
          ],
        },
      ],
      related: [
        { path: "/generative-engine-optimization", label: "Move from measurement to GEO" },
        { path: "/methodology", label: "See Synap's exact measurement rules" },
        { path: "/use-cases", label: "Apply the concept by business type" },
      ],
    }),
    ru: ru({
      eyebrow: "Руководство",
      h1: "Что такое видимость в ИИ?",
      lead:
        "Видимость в ИИ — наблюдаемое присутствие сущности и отношение к ней в сгенерированных ответах на релевантные вопросы.",
      summaryTitle: "Определение",
      summary:
        "Для бизнеса видимость в ИИ показывает, распознаёт ли ответ компанию, включает ли её в подходящие варианты, какое место даёт в рекомендации, корректно ли описывает и связывает ли с подтверждающими источниками.",
      published: "2 августа 2026 года",
      sections: [
        {
          heading: "Видимость — это больше, чем упоминание",
          paragraphs: [
            "Компания может появиться только потому, что пользователь уже назвал её, или органически — в вопросе о категории, задаче или месте. Это разные сигналы. Полезный аудит отделяет узнаваемость бренда от небрендового обнаружения и сохраняет исходный вопрос.",
            "Позиция, описание, конкуренты и источники дают контекст. Первая рекомендация с актуальным первичным подтверждением отличается от случайного упоминания по устаревшему каталогу.",
          ],
        },
        {
          heading: "Видимость в ИИ и традиционное SEO",
          table: {
            headers: ["Измерение", "Поисковая видимость", "Видимость в ИИ"],
            rows: [
              ["Результат", "Ранжированные ссылки", "Синтезированный ответ"],
              ["Сущность", "Страница или домен", "Бизнес, продукт или организация"],
              ["Доказательства", "Страница и сниппет", "Текст ответа и источники"],
              ["Изменчивость", "Изменение позиции", "Модель, поиск и формулировка"],
              ["Успех", "Показы, клики, позиция", "Упоминания, порядок, доля голоса"],
            ],
          },
        },
        {
          heading: "Корректный набор измерений",
          bullets: [
            "Используйте реалистичные вопросы о фактических продуктах, услугах, аудитории и локации.",
            "Отделяйте вопросы с названием бизнеса от вопросов без него.",
            "Сохраняйте дату, семейство модели, точный вопрос, ответ и источники.",
            "Считайте ошибочный запрос отсутствующим измерением, а не отрицательным ответом.",
            "Повторяйте проверки и сопоставляйте движение с изменениями источников.",
          ],
        },
        {
          heading: "Чего число не доказывает",
          paragraphs: [
            "Индекс не доказывает, что реальный клиент увидел ответ, перешёл, купил или получит ту же формулировку. Это контролируемое наблюдение сгенерированных результатов. Для коммерческого эффекта по-прежнему нужны данные конверсий и поиска.",
          ],
        },
      ],
      related: [
        { path: "/generative-engine-optimization", label: "От измерения к GEO" },
        { path: "/methodology", label: "Точные правила Synap" },
        { path: "/use-cases", label: "Сценарии по типам бизнеса" },
      ],
    }),
  },
  "/generative-engine-optimization": {
    en: en({
      eyebrow: "Guide",
      h1: "What is Generative Engine Optimization?",
      lead:
        "Generative Engine Optimization, or GEO, is the practice of making public information easier for answer-generating systems to retrieve, resolve to the correct entity, verify and cite.",
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
          heading: "A verifiable GEO workflow",
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
          heading: "What to avoid",
          paragraphs: [
            "Hidden keyword blocks, fake FAQs, doorway pages, fabricated citations and crawler-only content make the information less trustworthy. A useful GEO page should answer a real question for a person and expose the same facts to machines.",
          ],
        },
        {
          heading: "How Synap fits",
          paragraphs: [
            "Synap is the measurement layer: it stores prompts and answers, separates branded from unbranded discovery, identifies competing entities and sources, and produces versioned metrics. The resulting evidence can prioritize work, but the scan itself is not an optimization guarantee.",
          ],
        },
      ],
      related: [
        { path: "/ai-visibility", label: "Define the outcome being measured" },
        { path: "/blogs/audit-ai-generated-brand-information", label: "Run a factual entity audit" },
        { path: "/product", label: "See the Synap measurement product" },
      ],
    }),
    ru: ru({
      eyebrow: "Руководство",
      h1: "Что такое Generative Engine Optimization?",
      lead:
        "Generative Engine Optimization, или GEO, — практика, которая делает публичную информацию удобной для поиска, сопоставления с правильной сущностью, проверки и цитирования системами генерации ответов.",
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
          heading: "Проверяемый процесс GEO",
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
          heading: "Чего избегать",
          paragraphs: [
            "Скрытые ключевые слова, фиктивные FAQ, дорвеи, выдуманные ссылки и отдельный контент для роботов снижают доверие. Хорошая GEO-страница отвечает на реальный вопрос человека и показывает машинам те же факты.",
          ],
        },
        {
          heading: "Роль Synap",
          paragraphs: [
            "Synap — измерительный слой: сохраняет вопросы и ответы, разделяет брендовый и небрендовый поиск, определяет конкурирующие сущности и источники и рассчитывает версионированные метрики. Данные помогают расставить приоритеты, но проверка не гарантирует результат оптимизации.",
          ],
        },
      ],
      related: [
        { path: "/ai-visibility", label: "Что измеряет GEO" },
        { path: "/blogs/audit-ai-generated-brand-information", label: "Фактический аудит сущности" },
        { path: "/product", label: "Измерительный продукт Synap" },
      ],
    }),
  },
  "/use-cases": {
    en: en({
      eyebrow: "Use cases",
      h1: "Different businesses need different AI visibility questions",
      lead:
        "A useful use-case page changes the discovery model, prompt examples and evidence requirements—not just the industry name.",
      summaryTitle: "Where Synap is useful",
      summary:
        "Synap is most useful when customers may ask an AI system to recommend, compare or explain providers and the business has enough public information to identify and verify it.",
      sections: [
        {
          heading: "Local businesses",
          paragraphs: ["Measure category-plus-location discovery, local competitors and directory evidence."],
        },
        {
          heading: "SaaS companies",
          paragraphs: ["Measure category, workflow and alternative prompts, with product documentation as key evidence."],
        },
        {
          heading: "Ecommerce brands",
          paragraphs: ["Measure product-discovery prompts, brand-versus-retailer ambiguity and cited catalog evidence."],
        },
        {
          heading: "Professional services",
          paragraphs: ["Measure expertise, location and trust-sensitive recommendations without treating generated answers as professional advice."],
        },
        {
          heading: "Shared starting point",
          bullets: [
            "Define the exact business entity and aliases.",
            "Use prompts grounded in actual services and customer needs.",
            "Review the answer and citations, not only the score.",
            "Separate model variability from correctable source gaps.",
          ],
        },
      ],
      related: [
        { path: "/use-cases/local-businesses", label: "Local business visibility" },
        { path: "/use-cases/saas", label: "SaaS visibility" },
        { path: "/use-cases/ecommerce", label: "Ecommerce visibility" },
        { path: "/use-cases/professional-services", label: "Professional services visibility" },
      ],
    }),
    ru: ru({
      eyebrow: "Сценарии",
      h1: "Разным бизнесам нужны разные вопросы о видимости",
      lead:
        "Полезный сценарий меняет модель обнаружения, примеры вопросов и требования к доказательствам, а не только название отрасли.",
      summaryTitle: "Когда Synap полезен",
      summary:
        "Synap особенно полезен, когда клиенты могут попросить ИИ порекомендовать, сравнить или объяснить поставщиков, а у бизнеса достаточно публичной информации для идентификации и проверки.",
      sections: [
        { heading: "Локальный бизнес", paragraphs: ["Измерение вопросов категории и места, локальных конкурентов и данных каталогов."] },
        { heading: "SaaS-компании", paragraphs: ["Измерение категории, рабочих задач и альтернатив, где ключевым доказательством становится документация продукта."] },
        { heading: "Электронная торговля", paragraphs: ["Измерение выбора товаров, неоднозначности между брендом и продавцом и данных каталогов."] },
        { heading: "Профессиональные услуги", paragraphs: ["Измерение экспертных, локальных и чувствительных к доверию рекомендаций без подмены профессиональной консультации."] },
        {
          heading: "Общая отправная точка",
          bullets: [
            "Точно определите бизнес-сущность и варианты названия.",
            "Стройте вопросы на реальных услугах и потребностях клиентов.",
            "Проверяйте ответ и источники, а не только индекс.",
            "Отделяйте изменчивость модели от исправимых пробелов в источниках.",
          ],
        },
      ],
      related: [
        { path: "/use-cases/local-businesses", label: "Локальный бизнес" },
        { path: "/use-cases/saas", label: "SaaS" },
        { path: "/use-cases/ecommerce", label: "Электронная торговля" },
        { path: "/use-cases/professional-services", label: "Профессиональные услуги" },
      ],
    }),
  },
  "/use-cases/local-businesses": {
    en: en({
      eyebrow: "Use case",
      h1: "AI visibility for local businesses",
      lead:
        "Local discovery depends on category, place and evidence that the business is active and relevant in that place.",
      summaryTitle: "Local measurement goal",
      summary:
        "Measure whether generated answers include the business for unbranded category-and-location questions, where it appears among alternatives and which local sources support the recommendation.",
      published: "August 2, 2026",
      sections: [
        {
          heading: "Realistic prompt patterns",
          examples: [
            "“Recommend a coffee shop in Almaty for a quiet meeting.”",
            "“Which dental clinic in Astana offers weekend appointments?”",
            "“Compare independent hotels near the city center.”",
          ],
        },
        {
          heading: "Common visibility problems",
          bullets: [
            "Inconsistent name, address, category or website across public sources.",
            "A directory outranks the business's own current service information.",
            "The site describes the brand but not the specific services or location.",
            "A similarly named business is mistaken for the target entity.",
          ],
        },
        {
          heading: "What to measure and improve",
          paragraphs: [
            "Use city-specific unbranded prompts, review which competitors recur and inspect whether citations point to the business site, maps, directories or editorial sources. Correct core business facts at their authoritative source, publish service and location details as text, and keep opening hours and contact routes consistent.",
            "Synap supports a city field and market-specific language mix. It identifies directory entities separately so a map platform is not misreported as a competitor.",
          ],
        },
      ],
      related: [
        { path: "/blogs/audit-ai-generated-brand-information", label: "Audit local entity facts" },
        { path: "/methodology", label: "See how directories are filtered" },
        { path: "/product", label: "Review the report outputs" },
      ],
    }),
    ru: ru({
      eyebrow: "Сценарий",
      h1: "Видимость локального бизнеса в ИИ",
      lead:
        "Локальное обнаружение зависит от категории, места и доказательств того, что бизнес активен и релевантен в этой локации.",
      summaryTitle: "Цель измерения",
      summary:
        "Проверьте, включает ли ИИ бизнес в небрендовые ответы по категории и месту, какую позицию он занимает среди вариантов и какие локальные источники подтверждают рекомендацию.",
      published: "2 августа 2026 года",
      sections: [
        {
          heading: "Реалистичные вопросы",
          examples: [
            "«Посоветуйте тихую кофейню в Алматы для встречи».",
            "«Какая стоматология в Астане работает по выходным?»",
            "«Сравните независимые отели рядом с центром города».",
          ],
        },
        {
          heading: "Частые проблемы",
          bullets: [
            "Разные название, адрес, категория или сайт в публичных источниках.",
            "Каталог оказывается заметнее актуальной информации на сайте бизнеса.",
            "Сайт описывает бренд, но не конкретные услуги и локацию.",
            "Похожее название принимается за целевую компанию.",
          ],
        },
        {
          heading: "Что измерять и улучшать",
          paragraphs: [
            "Используйте небрендовые вопросы с городом, проверяйте повторяющихся конкурентов и смотрите, ведут ли ссылки на сайт, карты, каталоги или редакционные материалы. Исправляйте базовые факты в авторитетном источнике, публикуйте услуги и локацию обычным текстом, поддерживайте единые часы работы и контакты.",
            "Synap поддерживает поле города и языковую пропорцию рынка. Каталоги классифицируются отдельно и не становятся конкурентами.",
          ],
        },
      ],
      related: [
        { path: "/blogs/audit-ai-generated-brand-information", label: "Аудит локальных фактов" },
        { path: "/methodology", label: "Фильтрация каталогов" },
        { path: "/product", label: "Разделы отчёта" },
      ],
    }),
  },
  "/use-cases/saas": {
    en: en({
      eyebrow: "Use case",
      h1: "AI visibility analytics for SaaS",
      lead:
        "SaaS discovery often begins with a workflow, integration, audience or alternative—not the product name.",
      summaryTitle: "SaaS measurement goal",
      summary:
        "Measure whether generated answers connect the product to the problems it actually solves, surface it for unbranded category prompts and describe capabilities from current product evidence.",
      published: "August 2, 2026",
      sections: [
        {
          heading: "Prompt patterns",
          examples: [
            "“Which tools monitor brand mentions in AI answers?”",
            "“Best analytics platform for a multilingual marketing team.”",
            "“Compare tools for tracking competitor recommendations in AI search.”",
          ],
        },
        {
          heading: "SaaS-specific gaps",
          bullets: [
            "Homepage positioning conflicts with documentation or changelog language.",
            "Feature claims have no crawlable help page or release evidence.",
            "Old product names and domains split the entity.",
            "Alternative pages compare categories without clear dated criteria.",
          ],
        },
        {
          heading: "Practical actions",
          paragraphs: [
            "Create one stable product definition, publish feature and methodology documentation, keep integration and availability facts current, and link product claims to detailed pages. Compare competitors only on dated, verifiable criteria.",
            "Synap's prompt research can use a submitted website and its report exposes cited domains, helping a SaaS team see whether answers rely on first-party documentation or third-party summaries.",
          ],
        },
      ],
      related: [
        { path: "/generative-engine-optimization", label: "Build a GEO work plan" },
        { path: "/blogs/why-ai-recommends-competitors", label: "Diagnose competitor recommendations" },
        { path: "/docs", label: "Read provider and citation results" },
      ],
    }),
    ru: ru({
      eyebrow: "Сценарий",
      h1: "Аналитика видимости SaaS в ИИ",
      lead:
        "Поиск SaaS часто начинается с задачи, интеграции, аудитории или альтернативы, а не с названия продукта.",
      summaryTitle: "Цель измерения SaaS",
      summary:
        "Проверьте, связывает ли ИИ продукт с реальными задачами, показывает ли его по небрендовым категориям и описывает ли возможности по актуальным данным продукта.",
      published: "2 августа 2026 года",
      sections: [
        {
          heading: "Примеры вопросов",
          examples: [
            "«Какие инструменты отслеживают упоминания бренда в ответах ИИ?»",
            "«Лучшая аналитическая платформа для многоязычной маркетинговой команды».",
            "«Сравните сервисы отслеживания рекомендаций конкурентов в ИИ-поиске».",
          ],
        },
        {
          heading: "Специфические пробелы SaaS",
          bullets: [
            "Позиционирование на главной противоречит документации или обновлениям.",
            "У функций нет индексируемой справки или подтверждения выпуска.",
            "Старые названия и домены разделяют сущность.",
            "Страницы альтернатив сравнивают продукты без датированных критериев.",
          ],
        },
        {
          heading: "Практические действия",
          paragraphs: [
            "Создайте одно стабильное определение продукта, опубликуйте документацию функций и методологии, поддерживайте факты об интеграциях и доступности, связывайте заявления с подробными страницами. Сравнивайте конкурентов только по датированным проверяемым критериям.",
            "Исследование Synap может использовать указанный сайт, а отчёт показывает процитированные домены — так команда видит, опирается ли ИИ на документацию или сторонние пересказы.",
          ],
        },
      ],
      related: [
        { path: "/generative-engine-optimization", label: "План GEO" },
        { path: "/blogs/why-ai-recommends-competitors", label: "Почему появляются конкуренты" },
        { path: "/docs", label: "Результаты моделей и источники" },
      ],
    }),
  },
  "/use-cases/ecommerce": {
    en: en({
      eyebrow: "Use case",
      h1: "AI visibility analytics for ecommerce",
      lead:
        "Ecommerce answers can mix products, manufacturers, retailers and marketplaces, so entity classification matters as much as mention count.",
      summaryTitle: "Ecommerce measurement goal",
      summary:
        "Measure whether a brand or store appears for unbranded product-discovery questions, which alternatives recur, how it is described and whether cited evidence is current.",
      published: "August 2, 2026",
      sections: [
        {
          heading: "Prompt patterns",
          examples: [
            "“Which running shoes suit wet winter streets?”",
            "“Compare refillable skincare brands available in Kazakhstan.”",
            "“Where can I buy a compact espresso machine with local warranty?”",
          ],
        },
        {
          heading: "Common ecommerce ambiguity",
          bullets: [
            "A marketplace is mistaken for a competing brand.",
            "A retailer page carries outdated availability or specifications.",
            "Product variants and parent brands are treated as separate companies.",
            "The answer cites reviews while the official product facts are not crawlable.",
          ],
        },
        {
          heading: "Measurement considerations",
          paragraphs: [
            "Separate company, product, retailer and marketplace entities before reading Share of Voice. Review category and purchase-intent prompts separately, because appearing in research does not mean being recommended for purchase.",
            "Synap filters known marketplaces from competitor rows and exposes answer citations. It does not ingest a private product feed or guarantee that availability data in a generated answer is current.",
          ],
        },
      ],
      related: [
        { path: "/methodology", label: "Understand entity filtering" },
        { path: "/blogs/audit-ai-generated-brand-information", label: "Audit product and brand facts" },
        { path: "/product", label: "See measured outputs" },
      ],
    }),
    ru: ru({
      eyebrow: "Сценарий",
      h1: "Аналитика видимости электронной торговли в ИИ",
      lead:
        "В ecommerce-ответах смешиваются товары, производители, продавцы и маркетплейсы, поэтому классификация сущностей не менее важна, чем число упоминаний.",
      summaryTitle: "Цель измерения",
      summary:
        "Проверьте появление бренда или магазина в небрендовом выборе товаров, повторяющиеся альтернативы, описание и актуальность процитированных данных.",
      published: "2 августа 2026 года",
      sections: [
        {
          heading: "Примеры вопросов",
          examples: [
            "«Какие кроссовки подходят для мокрой зимней улицы?»",
            "«Сравните бренды многоразовой косметической упаковки в Казахстане».",
            "«Где купить компактную кофемашину с местной гарантией?»",
          ],
        },
        {
          heading: "Типичные неоднозначности",
          bullets: [
            "Маркетплейс принимается за конкурирующий бренд.",
            "Страница продавца содержит устаревшие наличие или характеристики.",
            "Варианты товара и родительский бренд считаются разными компаниями.",
            "Ответ цитирует обзоры, а официальные данные товара недоступны для обхода.",
          ],
        },
        {
          heading: "Особенности измерения",
          paragraphs: [
            "Сначала разделите компанию, товар, продавца и маркетплейс, затем читайте долю голоса. Анализируйте вопросы категории и покупки отдельно: присутствие в исследовании не равно рекомендации к покупке.",
            "Synap исключает известные маркетплейсы из конкурентов и показывает источники ответов. Платформа не загружает приватный товарный фид и не гарантирует актуальность наличия в сгенерированном ответе.",
          ],
        },
      ],
      related: [
        { path: "/methodology", label: "Классификация сущностей" },
        { path: "/blogs/audit-ai-generated-brand-information", label: "Аудит фактов о товаре и бренде" },
        { path: "/product", label: "Измеряемые результаты" },
      ],
    }),
  },
  "/use-cases/professional-services": {
    en: en({
      eyebrow: "Use case",
      h1: "AI visibility for professional services",
      lead:
        "Expertise-led services are discovered through specialty, location, eligibility and trust—areas where inaccurate generated claims can be consequential.",
      summaryTitle: "Measurement goal",
      summary:
        "Measure whether AI answers identify the right provider for relevant unbranded questions, then verify every material claim against current first-party and authoritative sources.",
      published: "August 2, 2026",
      sections: [
        {
          heading: "Prompt patterns",
          examples: [
            "“Which firms handle cross-border tax for small exporters?”",
            "“Find a clinic in Almaty offering the stated service.”",
            "“Compare property agencies experienced with commercial leases.”",
          ],
        },
        {
          heading: "Trust-sensitive review",
          bullets: [
            "Check names, credentials, service scope and locations against authoritative records.",
            "Do not treat generated legal, medical or financial statements as professional advice.",
            "Distinguish a directory or association from a competing provider.",
            "Avoid publishing customer outcomes, certifications or partnerships without evidence.",
          ],
        },
        {
          heading: "How Synap supports the audit",
          paragraphs: [
            "Synap records the prompt, answer, named entities, position and citations so a reviewer can inspect the statement rather than rely on a score. City and market inputs help shape relevant questions; alias matching reduces missed mentions across spelling and language variants.",
            "The tool measures generated output. It does not validate professional credentials or certify the accuracy of an answer; a qualified human must verify sensitive facts.",
          ],
        },
      ],
      related: [
        { path: "/privacy", label: "Review report privacy" },
        { path: "/blogs/audit-ai-generated-brand-information", label: "Run a factual accuracy audit" },
        { path: "/methodology", label: "Understand extraction limits" },
      ],
    }),
    ru: ru({
      eyebrow: "Сценарий",
      h1: "Видимость профессиональных услуг в ИИ",
      lead:
        "Экспертные услуги ищут по специализации, месту, условиям и доверию — в этих областях неточное утверждение ИИ может иметь последствия.",
      summaryTitle: "Цель измерения",
      summary:
        "Проверьте, называет ли ИИ подходящего поставщика по релевантным небрендовым вопросам, а затем сверяйте каждое существенное утверждение с актуальными первичными и авторитетными источниками.",
      published: "2 августа 2026 года",
      sections: [
        {
          heading: "Примеры вопросов",
          examples: [
            "«Какие компании ведут международные налоги малых экспортёров?»",
            "«Найдите клинику в Алматы с указанной услугой».",
            "«Сравните агентства недвижимости с опытом коммерческой аренды».",
          ],
        },
        {
          heading: "Проверка доверия",
          bullets: [
            "Сверяйте названия, квалификацию, перечень услуг и локации с авторитетными реестрами.",
            "Не воспринимайте юридические, медицинские и финансовые тексты ИИ как профессиональную консультацию.",
            "Отделяйте каталог или ассоциацию от конкурирующего поставщика.",
            "Не публикуйте результаты клиентов, сертификаты и партнёрства без доказательств.",
          ],
        },
        {
          heading: "Как Synap помогает аудиту",
          paragraphs: [
            "Synap сохраняет вопрос, ответ, сущности, позицию и источники, чтобы специалист проверял утверждение, а не полагался на индекс. Город и рынок делают вопросы релевантнее; варианты названия снижают пропуск упоминаний в разных написаниях и языках.",
            "Инструмент измеряет сгенерированный результат. Он не проверяет профессиональную квалификацию и не сертифицирует точность ответа; чувствительные факты должен подтверждать компетентный человек.",
          ],
        },
      ],
      related: [
        { path: "/privacy", label: "Приватность отчёта" },
        { path: "/blogs/audit-ai-generated-brand-information", label: "Аудит фактической точности" },
        { path: "/methodology", label: "Ограничения извлечения" },
      ],
    }),
  },
  "/pricing": {
    en: en({
      eyebrow: "Pricing",
      h1: "Start with a free visibility scan",
      lead:
        "Synap separates the measurable scan from any later advisory or implementation work.",
      summaryTitle: "Current pricing status",
      summary:
        "Visibility scans are free subject to account, network, daily and provider-budget limits. No fixed paid subscription or guaranteed outcome is currently published.",
      sections: [
        {
          heading: "Free scan",
          bullets: [
            "Business research and a 25-prompt set under the current default configuration.",
            "Coverage across ChatGPT, Gemini and Perplexity model families using the configured free-scan plan.",
            "Visibility Score, branded diagnostic, answers, prompts, competitors, citations and Share of Voice.",
            "Private report access through a verified account in production.",
          ],
        },
        {
          heading: "Review and implementation",
          paragraphs: [
            "A review call can scope work such as correcting public entity facts, improving crawlability, strengthening first-party documentation or measuring changes. Price and deliverables depend on the business and are not implied by the free scan.",
            "Synap does not sell a guarantee that a model will cite or recommend a business. Providers, model versions and retrieval systems remain outside Synap's control.",
          ],
        },
        {
          heading: "Limits are part of the service",
          paragraphs: [
            "Account quotas, network abuse controls, a global daily cap and a provider-cost budget protect service availability. If a limit is reached, the application reports the condition instead of generating placeholder results.",
          ],
        },
      ],
      related: [
        { path: "/product", label: "See what the scan includes" },
        { path: "/methodology", label: "Read how metrics are calculated" },
        { path: "/contact", label: "Discuss a report" },
      ],
    }),
    ru: ru({
      eyebrow: "Тарифы",
      h1: "Начните с бесплатной проверки видимости",
      lead:
        "Synap отделяет измеримую проверку от последующей консультационной работы или внедрения.",
      summaryTitle: "Текущий статус цены",
      summary:
        "Проверки видимости бесплатны в рамках лимитов аккаунта, сети, дня и бюджета провайдера. Фиксированная платная подписка и гарантированный результат сейчас не заявлены.",
      sections: [
        {
          heading: "Бесплатная проверка",
          bullets: [
            "Исследование бизнеса и набор из 25 вопросов в текущей стандартной конфигурации.",
            "Покрытие семейств ChatGPT, Gemini и Perplexity по настроенному бесплатному плану.",
            "Индекс видимости, брендовый показатель, ответы, вопросы, конкуренты, источники и доля голоса.",
            "Приватный отчёт через подтверждённый аккаунт в рабочей среде.",
          ],
        },
        {
          heading: "Разбор и внедрение",
          paragraphs: [
            "На созвоне можно оценить исправление публичных фактов о сущности, доступность для обхода, первичную документацию и измерение изменений. Цена и состав зависят от бизнеса и не следуют автоматически из бесплатной проверки.",
            "Synap не продаёт гарантию цитирования или рекомендации. Провайдеры, версии моделей и системы извлечения находятся вне контроля Synap.",
          ],
        },
        {
          heading: "Лимиты — часть сервиса",
          paragraphs: [
            "Квоты аккаунта, защита от злоупотреблений по сети, общий дневной предел и бюджет провайдера сохраняют доступность. При достижении лимита приложение сообщает об этом и не генерирует подставные результаты.",
          ],
        },
      ],
      related: [
        { path: "/product", label: "Состав проверки" },
        { path: "/methodology", label: "Расчёт метрик" },
        { path: "/contact", label: "Обсудить отчёт" },
      ],
    }),
  },
  "/faq": {
    en: en({
      eyebrow: "FAQ",
      h1: "Frequently asked questions about Synap",
      lead: "Concise answers about the product, methodology, availability and privacy.",
      summaryTitle: "Start here",
      summary:
        "Synap measures a dated sample of generated answers. It improves evidence and visibility measurement; it does not guarantee training-data inclusion, citations or recommendations.",
      sections: [],
      related: [
        { path: "/methodology", label: "Read the full methodology" },
        { path: "/docs", label: "Open product documentation" },
        { path: "/contact", label: "Ask a product question" },
      ],
    }),
    ru: ru({
      eyebrow: "FAQ",
      h1: "Частые вопросы о Synap",
      lead: "Краткие ответы о продукте, методологии, доступности и приватности.",
      summaryTitle: "Главное",
      summary:
        "Synap измеряет датированную выборку сгенерированных ответов. Платформа улучшает доказательность и измерение видимости, но не гарантирует попадание в обучающие данные, цитирование или рекомендацию.",
      sections: [],
      related: [
        { path: "/methodology", label: "Полная методология" },
        { path: "/docs", label: "Документация продукта" },
        { path: "/contact", label: "Задать вопрос" },
      ],
    }),
  },
  "/about": {
    en: en({
      eyebrow: "About",
      h1: "Synap makes AI visibility inspectable",
      lead:
        "The product exists to replace vague claims about ‘being visible in AI’ with prompts, answers, entities, sources and versioned measurements that a business can review.",
      summaryTitle: "What Synap is",
      summary:
        "Synap is a browser-based software product and analytics platform for businesses, marketing teams and agencies. It also offers an optional review route for separately scoped improvement work.",
      sections: [
        {
          heading: "The problem",
          paragraphs: [
            "Traditional search tools show where URLs rank. They do not directly show whether a generated answer identifies a business, recommends it among alternatives, describes it correctly or relies on a competitor's sources. Synap collects that missing answer-level evidence.",
          ],
        },
        {
          heading: "What a scan means",
          paragraphs: [
            "A scan is a dated measurement run. It researches the business, generates realistic prompts, queries supported model families and extracts mentions, positions, entities and citations. The primary Visibility Score focuses on unbranded discovery; Share of Voice shows each qualifying business's share of qualifying entity mentions.",
          ],
        },
        {
          heading: "Availability",
          paragraphs: [
            "Synap is available through a web browser. The interface and public documentation support English and Russian. Prompt mixes support Kazakhstan, Russia and a global market setting, with an optional city for local questions. Authenticated reports remain private.",
          ],
        },
        {
          heading: "Product record",
          paragraphs: [
            "The current public methodology is version 2. This public changelog begins on August 2, 2026 and records only repository-verified updates. Founding date, legal operator details, team biographies, registered location and official social profiles are not present in the repository and are not invented here.",
          ],
        },
      ],
      related: [
        { path: "/methodology", label: "Verify the metric definitions" },
        { path: "/changelog", label: "See dated product updates" },
        { path: "/contact", label: "Contact Synap" },
      ],
    }),
    ru: ru({
      eyebrow: "О продукте",
      h1: "Synap делает видимость в ИИ проверяемой",
      lead:
        "Продукт заменяет расплывчатые заявления о «видимости в ИИ» вопросами, ответами, сущностями, источниками и версионированными измерениями, которые бизнес может проверить.",
      summaryTitle: "Что такое Synap",
      summary:
        "Synap — браузерный программный продукт и аналитическая платформа для компаний, маркетинговых команд и агентств. Отдельно доступен разбор для оценки работ по улучшению.",
      sections: [
        {
          heading: "Проблема",
          paragraphs: [
            "Традиционные поисковые инструменты показывают позиции URL. Они не отвечают напрямую, распознаёт ли сгенерированный ответ бизнес, рекомендует ли среди альтернатив, корректно ли описывает и использует ли источники конкурента. Synap собирает недостающие доказательства на уровне ответа.",
          ],
        },
        {
          heading: "Что означает проверка",
          paragraphs: [
            "Проверка — датированный запуск измерения. Она исследует бизнес, создаёт реалистичные вопросы, запрашивает поддерживаемые модели и извлекает упоминания, позиции, сущности и источники. Основной Индекс видимости сосредоточен на небрендовом обнаружении; доля голоса показывает долю бизнеса среди подходящих упоминаний.",
          ],
        },
        {
          heading: "Доступность",
          paragraphs: [
            "Synap работает в браузере. Интерфейс и публичная документация доступны на русском и английском. Вопросы настраиваются для Казахстана, России и глобального рынка; для локальных запросов можно указать город. Отчёты доступны только после авторизации.",
          ],
        },
        {
          heading: "История продукта",
          paragraphs: [
            "Текущая публичная методология имеет версию 2. Журнал публичных изменений начинается 2 августа 2026 года и содержит только подтверждённые репозиторием обновления. Дата основания, юридический оператор, биографии команды, адрес регистрации и официальные социальные профили в репозитории отсутствуют и здесь не выдумываются.",
          ],
        },
      ],
      related: [
        { path: "/methodology", label: "Определения метрик" },
        { path: "/changelog", label: "Датированные обновления" },
        { path: "/contact", label: "Связаться с Synap" },
      ],
    }),
  },
  "/contact": {
    en: en({
      eyebrow: "Contact",
      h1: "Contact Synap",
      lead:
        "Use the in-product request form to discuss access, a visibility report, support or separately scoped implementation work.",
      summaryTitle: "Before you send",
      summary:
        "Describe the business and the question you want to resolve. Do not send passwords, access tokens, billing details, private scan answers or customer personal data.",
      sections: [
        {
          heading: "Product and report questions",
          paragraphs: [
            "A review request can cover scan access, an unexpected metric, a competitor classification or the scope of an improvement plan. Include the business name and a non-sensitive summary; authenticated report details can be reviewed after access is confirmed.",
          ],
        },
        {
          heading: "Availability and response route",
          paragraphs: [
            "The current public contact route is the Book a call form available on this page and inside the product. A public support email, legal operator address and office location are not configured in this repository, so they are not displayed as facts.",
          ],
        },
        {
          heading: "Security reports",
          paragraphs: [
            "Do not include exploit details or credentials in a general lead form. A dedicated public security contact has not yet been supplied; the product owner should add one before a broad launch.",
          ],
        },
      ],
      related: [
        { path: "/faq", label: "Check common questions first" },
        { path: "/privacy", label: "Review data handling" },
        { path: "/pricing", label: "Understand current access" },
      ],
    }),
    ru: ru({
      eyebrow: "Контакты",
      h1: "Связаться с Synap",
      lead:
        "Используйте форму обращения в продукте, чтобы обсудить доступ, отчёт о видимости, поддержку или отдельно оцениваемое внедрение.",
      summaryTitle: "Перед отправкой",
      summary:
        "Опишите бизнес и вопрос, который хотите решить. Не отправляйте пароли, токены доступа, платёжные данные, приватные ответы проверки и персональные данные клиентов.",
      sections: [
        {
          heading: "Вопросы о продукте и отчёте",
          paragraphs: [
            "Обращение может касаться доступа, неожиданной метрики, классификации конкурента или объёма плана улучшений. Укажите название бизнеса и нечувствительное описание; детали отчёта можно разобрать после подтверждения доступа.",
          ],
        },
        {
          heading: "Канал связи",
          paragraphs: [
            "Текущий публичный канал — форма «Записаться на созвон» на этой странице и внутри продукта. Публичная почта поддержки, юридический адрес оператора и офис в репозитории не настроены, поэтому не отображаются как факты.",
          ],
        },
        {
          heading: "Сообщения о безопасности",
          paragraphs: [
            "Не отправляйте детали уязвимости и учётные данные через общую форму. Отдельный публичный контакт безопасности пока не указан; владелец продукта должен добавить его до широкого запуска.",
          ],
        },
      ],
      related: [
        { path: "/faq", label: "Частые вопросы" },
        { path: "/privacy", label: "Обработка данных" },
        { path: "/pricing", label: "Текущий доступ" },
      ],
    }),
  },
  "/docs": {
    en: en({
      eyebrow: "Documentation",
      h1: "Using Synap reports",
      lead:
        "This guide covers the current authenticated workflow and explains what each report view can and cannot tell you.",
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
      ],
      related: [
        { path: "/methodology", label: "Check the implemented formula" },
        { path: "/faq", label: "Read common product answers" },
        { path: "/contact", label: "Request help with a report" },
      ],
    }),
    ru: ru({
      eyebrow: "Документация",
      h1: "Работа с отчётами Synap",
      lead:
        "Руководство описывает текущий процесс после авторизации и объясняет, что каждый раздел отчёта показывает и чего не доказывает.",
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
      ],
      related: [
        { path: "/methodology", label: "Реализованная формула" },
        { path: "/faq", label: "Частые вопросы" },
        { path: "/contact", label: "Помощь с отчётом" },
      ],
    }),
  },
  "/blogs": {
    en: {
      eyebrow: "Synap Blog",
      h1: "Synap Blog — AI Visibility in Kazakhstan",
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
      eyebrow: "Блог Synap",
      h1: "Блог Synap — видимость бизнеса в ответах ИИ",
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
        { path: "/methodology", label: "Use Synap's extraction definitions" },
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
        { path: "/methodology", label: "Определения извлечения Synap" },
        { path: "/generative-engine-optimization", label: "План GEO по результатам" },
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
    }),
  },
  "/changelog": {
    en: en({
      eyebrow: "Changelog",
      h1: "Synap product updates",
      lead: "Only changes verified in the repository are recorded here; no historical releases are reconstructed.",
      summaryTitle: "Latest update",
      summary:
        "On August 2, 2026, the product adopted the Synap brand and added a public, bilingual entity and methodology layer for crawlability and verification.",
      sections: [
        {
          heading: "August 2, 2026 — Public entity and methodology release",
          bullets: [
            "Unified the public product name as Synap while retaining the former name only as structured entity continuity data.",
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
      h1: "История обновлений Synap",
      lead: "Здесь фиксируются только подтверждённые репозиторием изменения; прошлые релизы не реконструируются.",
      summaryTitle: "Последнее обновление",
      summary:
        "2 августа 2026 года продукт перешёл на бренд Synap и получил публичный двуязычный слой сущности и методологии для обхода и проверки.",
      sections: [
        {
          heading: "2 августа 2026 года — публичная сущность и методология",
          bullets: [
            "Публичное название унифицировано как Synap; прежнее имя сохранено только в структурированных данных для связи сущности.",
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
    }),
  },
  "/privacy": {
    en: en({
      eyebrow: "Privacy",
      h1: "Synap privacy policy",
      lead:
        "Public discoverability applies to product information only. Customer profiles, prompts, answers and reports remain access-controlled.",
      summaryTitle: "Privacy boundary",
      summary:
        "Synap processes account and scan data to provide private visibility reports. Public SEO resources contain no customer scans, user emails, access tokens, billing data or private provider responses.",
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
            "Synap uses an HTTP-only session cookie after authentication and local browser storage for language and pending form preferences. A production retention schedule, legal operator identity, jurisdiction-specific rights process and privacy contact are not configured in this repository. The product owner must supply them before relying on this page as a complete jurisdictional notice.",
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
      h1: "Политика конфиденциальности Synap",
      lead:
        "Публичная обнаруживаемость относится только к информации о продукте. Клиентские профили, вопросы, ответы и отчёты остаются закрытыми.",
      summaryTitle: "Граница приватности",
      summary:
        "Synap обрабатывает данные аккаунта и проверки для приватного отчёта. Публичные SEO-ресурсы не содержат клиентские проверки, почту пользователей, токены, платёжные данные и приватные ответы провайдера.",
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
            "После входа Synap использует HTTP-only cookie сессии, а локальное хранилище браузера — для языка и незавершённых полей формы. Срок хранения в рабочей среде, юридический оператор, процесс прав по юрисдикциям и контакт приватности в репозитории не настроены. Владелец должен добавить их до использования страницы как полного юридического уведомления.",
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
    }),
  },
  "/terms": {
    en: en({
      eyebrow: "Terms",
      h1: "Synap terms of service",
      lead:
        "These terms describe the current product behavior. Synap is the product name; verified legal-operator details still need to be supplied for a production legal notice.",
      summaryTitle: "Core terms",
      summary:
        "Use Synap only for businesses and data you are authorized to evaluate. Treat generated answers and metrics as variable analytical evidence, not guarantees or professional advice.",
      sections: [
        {
          heading: "Accounts and acceptable use",
          bullets: [
            "Keep account access secure and provide accurate profile information.",
            "Do not scan or submit private personal data, credentials or confidential customer material.",
            "Do not bypass quotas, interfere with providers, scrape authenticated reports or use the service unlawfully.",
            "Do not present Synap output as a guaranteed model ranking, endorsement or verified professional advice.",
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
            "Users retain responsibility for the business information they submit. Third-party model names, answers and cited content remain subject to their respective rights and terms. Synap software, original documentation and brand assets may not be misrepresented as a third-party endorsement.",
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
        { path: "/contact", label: "Contact Synap" },
      ],
    }),
    ru: ru({
      eyebrow: "Условия",
      h1: "Условия использования Synap",
      lead:
        "Условия описывают текущее поведение продукта. Synap — название продукта; подтверждённые данные юридического оператора ещё нужно добавить для рабочего юридического документа.",
      summaryTitle: "Основные условия",
      summary:
        "Используйте Synap только для бизнеса и данных, которые вы вправе проверять. Рассматривайте ответы и метрики как изменчивые аналитические доказательства, а не гарантии или профессиональную консультацию.",
      sections: [
        {
          heading: "Аккаунты и допустимое использование",
          bullets: [
            "Защищайте доступ к аккаунту и указывайте точные данные профиля.",
            "Не отправляйте приватные персональные данные, учётные данные и конфиденциальные клиентские материалы.",
            "Не обходите квоты, не мешайте провайдерам, не извлекайте закрытые отчёты автоматически и не нарушайте закон.",
            "Не представляйте результат Synap как гарантированную позицию, одобрение или профессиональную консультацию.",
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
            "Пользователь отвечает за отправленную информацию о бизнесе. Названия моделей, их ответы и процитированный контент регулируются правами и условиями соответствующих сторон. Нельзя выдавать ПО, документацию и бренд Synap за одобрение третьей стороны.",
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
        { path: "/contact", label: "Связаться с Synap" },
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
