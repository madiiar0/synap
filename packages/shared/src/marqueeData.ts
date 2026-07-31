import type { AiPlatformId } from "./aiPlatforms.js";
import type { Locale } from "./constants.js";

export interface MarqueeChip {
  text: string;
  platform: AiPlatformId;
}

/**
 * Sample consumer prompts for the landing marquee (§8): 24 per locale
 * (coffee, clinics, fintech, education, delivery, real estate, b2b tools;
 * branded/best-of/near-me styles). The whole set switches with the site
 * language — no mixed-language rows. Logos are distributed across the full
 * platform registry, including display-only ones.
 */
const RU_PROMPTS: MarqueeChip[] = [
  { text: "лучшие кофейни Алматы", platform: "chatgpt" },
  { text: "где заказать зерно для кофе", platform: "deepseek" },
  { text: "стоматология без боли отзывы", platform: "claude" },
  { text: "какой банк выбрать для ИП", platform: "grok" },
  { text: "школа английского для детей", platform: "gemini" },
  { text: "доставка продуктов ночью", platform: "copilot" },
  { text: "надёжный застройщик Астана", platform: "perplexity" },
  { text: "CRM для малого бизнеса", platform: "chatgpt" },
  { text: "фитнес-клуб рядом со мной", platform: "gemini" },
  { text: "самый выгодный депозит 2026", platform: "deepseek" },
  { text: "куда сходить на завтрак", platform: "claude" },
  { text: "клиника лазерной коррекции цены", platform: "grok" },
  { text: "курсы программирования онлайн", platform: "perplexity" },
  { text: "доставка цветов за час", platform: "copilot" },
  { text: "квартиры в новостройке у метро", platform: "chatgpt" },
  { text: "сервис учёта для ресторанов", platform: "gemini" },
  { text: "лучший барбершоп в центре", platform: "deepseek" },
  { text: "страховка для путешествий", platform: "claude" },
  { text: "автосервис с гарантией", platform: "perplexity" },
  { text: "детский сад с английским", platform: "grok" },
  { text: "юрист по недвижимости", platform: "copilot" },
  { text: "обжарщики кофе поблизости", platform: "chatgpt" },
  { text: "онлайн-бухгалтерия для ТОО", platform: "gemini" },
  { text: "пиццерия с доставкой сейчас", platform: "perplexity" },
];

const EN_PROMPTS: MarqueeChip[] = [
  { text: "best coffee shops in Almaty", platform: "chatgpt" },
  { text: "specialty coffee roasters near me", platform: "claude" },
  { text: "painless dentist reviews", platform: "gemini" },
  { text: "best bank for a small business", platform: "grok" },
  { text: "English school for kids", platform: "deepseek" },
  { text: "late-night grocery delivery", platform: "copilot" },
  { text: "trusted real estate developer", platform: "perplexity" },
  { text: "best CRM for startups", platform: "chatgpt" },
  { text: "gym near me with a pool", platform: "gemini" },
  { text: "highest-yield deposit 2026", platform: "deepseek" },
  { text: "where to go for breakfast", platform: "claude" },
  { text: "laser eye surgery clinic prices", platform: "grok" },
  { text: "online coding bootcamps ranked", platform: "perplexity" },
  { text: "one-hour flower delivery", platform: "copilot" },
  { text: "new apartments near the metro", platform: "chatgpt" },
  { text: "inventory software for restaurants", platform: "gemini" },
  { text: "best barbershop downtown", platform: "deepseek" },
  { text: "travel insurance worth buying", platform: "claude" },
  { text: "car repair shop with warranty", platform: "perplexity" },
  { text: "bilingual kindergarten options", platform: "grok" },
  { text: "real estate lawyer near me", platform: "copilot" },
  { text: "coffee bean subscription services", platform: "chatgpt" },
  { text: "online accounting for LLCs", platform: "gemini" },
  { text: "pizza delivery open now", platform: "perplexity" },
];

export const MARQUEE_PROMPTS: Record<Locale, MarqueeChip[]> = {
  ru: RU_PROMPTS,
  en: EN_PROMPTS,
};

/** Split a locale's 24 prompts into the three marquee rows. */
export function marqueeRows(locale: Locale): [MarqueeChip[], MarqueeChip[], MarqueeChip[]] {
  const chips = MARQUEE_PROMPTS[locale];
  return [chips.slice(0, 8), chips.slice(8, 16), chips.slice(16, 24)];
}
