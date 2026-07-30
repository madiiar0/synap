import type { EngineId } from "./constants.js";

export interface MarqueeChip {
  text: string;
  engine: EngineId;
}

/**
 * Real-sounding sample prompts for the landing marquee (§12.4). Deliberately
 * a RU/EN mix in every locale — they illustrate consumer queries, not UI copy.
 */
export const MARQUEE_ROW_1: MarqueeChip[] = [
  { text: "лучшая стоматология Алматы", engine: "chatgpt" },
  { text: "best CRM for startups", engine: "perplexity" },
  { text: "самый надёжный депозит", engine: "gemini" },
  { text: "какой фитнес-клуб выбрать", engine: "claude" },
  { text: "top coffee roasters near me", engine: "chatgpt" },
  { text: "куда отдать ребёнка на английский", engine: "perplexity" },
  { text: "надёжный застройщик Астана", engine: "gemini" },
  { text: "which laptop should I buy", engine: "claude" },
  { text: "клиника лазерной коррекции отзывы", engine: "chatgpt" },
];

export const MARQUEE_ROW_2: MarqueeChip[] = [
  { text: "где заказать доставку цветов", engine: "gemini" },
  { text: "best accounting software 2026", engine: "chatgpt" },
  { text: "автосервис рядом со мной", engine: "claude" },
  { text: "хороший барбершоп в центре", engine: "perplexity" },
  { text: "reliable moving company reviews", engine: "gemini" },
  { text: "юрист по недвижимости кого выбрать", engine: "chatgpt" },
  { text: "best pizza delivery tonight", engine: "claude" },
  { text: "школа программирования для детей", engine: "perplexity" },
  { text: "страховка для путешествий что взять", engine: "chatgpt" },
];
