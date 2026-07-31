/**
 * Auth-page quote carousel. EVERY entry was web-verified before inclusion
 * (exact wording confirmed against the sourceUrl; company figures dated).
 * `text.en` is the verified original wording; `text.ru` is our translation.
 * Verified 2026-07-31 via an adversarial two-pass search workflow.
 */
export interface Quote {
  id: string;
  text: { en: string; ru: string };
  author: string;
  role: string;
  company: string;
  companyValue: { en: string; ru: string };
  sourceUrl: string;
}

export const QUOTES: readonly Quote[] = [
  {
    id: "pichai",
    text: {
      en: "We're introducing an all-new AI Mode. It's a total reimagining of Search.",
      ru: "Мы представляем полностью новый AI Mode. Это полное переосмысление Поиска.",
    },
    author: "Sundar Pichai",
    role: "CEO",
    company: "Alphabet (Google)",
    companyValue: {
      en: "Market cap ~$4.3T (as of Jul 2026)",
      ru: "Капитализация ~$4,3 трлн (июль 2026)",
    },
    sourceUrl: "https://blog.google/innovation-and-ai/technology/ai/io-2025-keynote/",
  },
  {
    id: "nadella",
    text: {
      en: "Today's announcement is all about rethinking the largest software category there is: search.",
      ru: "Сегодняшний анонс посвящён переосмыслению крупнейшей категории программного обеспечения: поиска.",
    },
    author: "Satya Nadella",
    role: "Chairman and CEO",
    company: "Microsoft",
    companyValue: {
      en: "Market cap ~$3.4T (as of Jul 2026)",
      ru: "Капитализация ~$3,4 трлн (июль 2026)",
    },
    sourceUrl:
      "https://fortune.com/2023/02/10/microsoft-ai-search-bing-compete-google-satya-nadella-made-them-dance/",
  },
  {
    id: "srinivas",
    text: {
      en: "In a world where everyone gets answers and doesn't have to click on links, the biggest loser is Google.",
      ru: "В мире, где каждый получает ответы и не должен кликать по ссылкам, больше всех теряет Google.",
    },
    author: "Aravind Srinivas",
    role: "Co-founder and CEO",
    company: "Perplexity AI",
    companyValue: {
      en: "Valuation ~$22.6B (as of Jul 2026)",
      ru: "Оценка ~$22,6 млрд (июль 2026)",
    },
    sourceUrl:
      "https://americankahani.com/business/perplexity-ai-co-founder-aravind-srinivas-is-unfazed-by-google-mocks-its-marketing-strategies-and-business-model/",
  },
  {
    id: "huang",
    text: {
      en: "So we went from a retrieval-based computing system to a generative-based computing system.",
      ru: "Мы перешли от вычислений на основе поиска информации к вычислениям на основе генерации.",
    },
    author: "Jensen Huang",
    role: "Founder and CEO",
    company: "NVIDIA",
    companyValue: {
      en: "Market cap ~$4.7T (as of Jul 2026)",
      ru: "Капитализация ~$4,7 трлн (июль 2026)",
    },
    sourceUrl: "https://lexfridman.com/jensen-huang-transcript/",
  },
  {
    id: "schmidt",
    text: {
      en: "Google is not about blue links. It's about organizing the world's information.",
      ru: "Google не про синие ссылки. Google про организацию информации всего мира.",
    },
    author: "Eric Schmidt",
    role: "Former CEO, Google",
    company: "Google",
    companyValue: {
      en: "Alphabet market cap ~$4.1T (as of Jul 2026)",
      ru: "Капитализация Alphabet ~$4,1 трлн (июль 2026)",
    },
    sourceUrl:
      "https://www.cnbc.com/video/2024/05/07/watch-cnbcas-full-interview-with-former-google-executive-chairman-and-ceo-eric-schmidt.html",
  },
] as const;
