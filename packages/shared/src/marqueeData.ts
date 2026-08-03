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
 * scannable platform registry. Display-only logos are deliberately excluded
 * so the marketing surface cannot imply coverage the product does not have.
 */
const RU_PROMPTS: MarqueeChip[] = [
  { text: "лучшие кофейни Алматы", platform: "chatgpt" },
  { text: "где заказать зерно для кофе", platform: "perplexity" },
  { text: "стоматология без боли отзывы", platform: "claude" },
  { text: "какой банк выбрать для ИП", platform: "grok" },
  { text: "школа английского для детей", platform: "gemini" },
  { text: "доставка продуктов ночью", platform: "chatgpt" },
  { text: "надёжный застройщик Астана", platform: "perplexity" },
  { text: "CRM для малого бизнеса", platform: "chatgpt" },
  { text: "фитнес-клуб рядом со мной", platform: "gemini" },
  { text: "самый выгодный депозит 2026", platform: "grok" },
  { text: "куда сходить на завтрак", platform: "claude" },
  { text: "клиника лазерной коррекции цены", platform: "grok" },
  { text: "курсы программирования онлайн", platform: "perplexity" },
  { text: "доставка цветов за час", platform: "gemini" },
  { text: "квартиры в новостройке у метро", platform: "chatgpt" },
  { text: "сервис учёта для ресторанов", platform: "gemini" },
  { text: "лучший барбершоп в центре", platform: "chatgpt" },
  { text: "страховка для путешествий", platform: "claude" },
  { text: "автосервис с гарантией", platform: "perplexity" },
  { text: "детский сад с английским", platform: "grok" },
  { text: "юрист по недвижимости", platform: "claude" },
  { text: "обжарщики кофе поблизости", platform: "chatgpt" },
  { text: "онлайн-бухгалтерия для ТОО", platform: "gemini" },
  { text: "пиццерия с доставкой сейчас", platform: "perplexity" },
];

const EN_PROMPTS: MarqueeChip[] = [
  { text: "best coffee shops in Almaty", platform: "chatgpt" },
  { text: "specialty coffee roasters near me", platform: "claude" },
  { text: "painless dentist reviews", platform: "gemini" },
  { text: "best bank for a small business", platform: "grok" },
  { text: "English school for kids", platform: "perplexity" },
  { text: "late-night grocery delivery", platform: "chatgpt" },
  { text: "trusted real estate developer", platform: "perplexity" },
  { text: "best CRM for startups", platform: "chatgpt" },
  { text: "gym near me with a pool", platform: "gemini" },
  { text: "highest-yield deposit 2026", platform: "grok" },
  { text: "where to go for breakfast", platform: "claude" },
  { text: "laser eye surgery clinic prices", platform: "grok" },
  { text: "online coding bootcamps ranked", platform: "perplexity" },
  { text: "one-hour flower delivery", platform: "gemini" },
  { text: "new apartments near the metro", platform: "chatgpt" },
  { text: "inventory software for restaurants", platform: "gemini" },
  { text: "best barbershop downtown", platform: "chatgpt" },
  { text: "travel insurance worth buying", platform: "claude" },
  { text: "car repair shop with warranty", platform: "perplexity" },
  { text: "bilingual kindergarten options", platform: "grok" },
  { text: "real estate lawyer near me", platform: "claude" },
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
