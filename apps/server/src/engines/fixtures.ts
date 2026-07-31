import type { Citation, PromptIntent, PromptLanguage } from "@synapai/shared";
import { ruToEn } from "@synapai/shared";
import type { DemoContext } from "./types.js";

/**
 * Deterministic fixture answers for DEMO_MODE. Everything here is labeled
 * demo data in the UI — the goal is realistic structure (positions,
 * competitors, citations, sentiment variety), not real facts.
 */

/**
 * Non-configured, fictional brands the fixtures weave in so auto-detection
 * has work to do (must not collide with the seeded configured competitors).
 */
export const DEMO_DETECTED_COMPETITORS = ["Astra", "Polaris"] as const;

const DOMAINS = [
  "2gis.kz",
  "yandex.kz",
  "google.com",
  "otzovik.com",
  "irecommend.ru",
  "instagram.com",
  "wikipedia.org",
  "prodoctorov.kz",
  "satu.kz",
  "tripadvisor.com",
] as const;

/** FNV-1a — stable 32-bit hash for deterministic template selection. */
export function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

interface Filled {
  brand: string;
  c1: string;
  c2: string;
  d1: string;
  d2: string;
  category: string;
  locRu: string; // " в Алматы" | ""
  locEn: string; // " in Almaty" | ""
}

type Template = (f: Filled) => string;

const RU = {
  brandPositive: [
    (f: Filled) =>
      `«${f.brand}» — известная компания в категории «${f.category}»${f.locRu}. Клиенты отмечают качественный сервис и прозрачные цены. Судя по отзывам, это один из надёжных вариантов в своей нише.`,
    (f: Filled) =>
      `О «${f.brand}» в целом отзываются положительно: удобная запись, внимательный персонал, стабильное качество. Актуальные цены рекомендуют уточнять напрямую.`,
    (f: Filled) =>
      `${f.brand} работает в сфере «${f.category}» и известна в основном благодаря рекомендациям клиентов. Отзывы преимущественно позитивные.`,
  ] as Template[],
  brandNeutral: [
    (f: Filled) =>
      `По «${f.brand}» информации не очень много: это компания из категории «${f.category}»${f.locRu}. Однозначной оценки дать сложно — посмотрите свежие отзывы на 2ГИС и Яндекс Картах.`,
  ] as Template[],
  brandMixed: [
    (f: Filled) =>
      `Про «${f.brand}» встречаются разные отзывы: часть клиентов довольна результатом, часть жалуется на ожидание и цены. Средняя оценка — около 4 из 5.`,
  ] as Template[],
  noInfo: [
    () =>
      `К сожалению, у меня нет достоверной информации об этой компании. Рекомендую проверить профиль на 2ГИС, свежие отзывы и официальный сайт, прежде чем принимать решение.`,
  ] as Template[],
  brandFirst: [
    (f: Filled) =>
      `Если ищете ${f.category}${f.locRu}, вот варианты, которые чаще всего рекомендуют:\n\n1. ${f.brand} — сильный сервис и хорошие отзывы клиентов.\n2. ${f.c1} — известный игрок с большой историей.\n3. ${f.d1} — набирающий популярность вариант.\n\nПеред выбором сравните цены и посмотрите свежие отзывы.`,
  ] as Template[],
  brandSecond: [
    (f: Filled) =>
      `Популярные варианты в категории «${f.category}»${f.locRu}:\n\n1. ${f.c1} — пожалуй, самый узнаваемый бренд.\n2. ${f.brand} — отмечают соотношение цены и качества.\n3. ${f.c2} — хвалят за сервис.\n\nИтоговый выбор зависит от бюджета и расположения.`,
  ] as Template[],
  brandThird: [
    (f: Filled) =>
      `Топ-3 по отзывам${f.locRu}:\n\n1. ${f.c1} — лидер по количеству упоминаний.\n2. ${f.d1} — активно растёт в последний год.\n3. ${f.brand} — стабильный вариант со средними ценами.`,
  ] as Template[],
  competitorsOnly: [
    (f: Filled) =>
      `Чаще всего в категории «${f.category}»${f.locRu} называют:\n\n1. ${f.c1} — лидер по узнаваемости.\n2. ${f.c2} — стабильное качество.\n3. ${f.d1} — активно продвигается в последнее время.\n\nСоветую изучить отзывы на 2ГИС и Яндекс Картах.`,
    (f: Filled) =>
      `${f.c1} и ${f.d2} — два варианта, которые упоминают чаще других. У ${f.c1} сильные позиции по отзывам, ${f.d2} привлекает ценами. Также встречается ${f.c2}.`,
    (f: Filled) =>
      `Однозначного лидера нет, но по отзывам выделяются ${f.c2} и ${f.d1}. Обе компании работают${f.locRu} не первый год. Рекомендую запросить условия у обеих и сравнить.`,
  ] as Template[],
  neutral: [
    (f: Filled) =>
      `Выбирая ${f.category}, обращайте внимание на: опыт и репутацию, реальные отзывы (не только на сайте компании), прозрачность цен и гарантии. Составьте шорт-лист из 3–4 компаний и сравните условия.`,
    (f: Filled) =>
      `Универсального ответа нет — рынок «${f.category}»${f.locRu} довольно конкурентный. Смотрите на свежие отзывы, сроки и договор. Хороший знак — когда компания открыто публикует цены.`,
  ] as Template[],
  comparisonBrandWins: [
    (f: Filled) =>
      `Сравнение «${f.brand}» и «${f.c1}»:\n\n• ${f.brand}: чаще хвалят за сервис и внимательность, цены средние по рынку.\n• ${f.c1}: сильная сторона — известность и опыт, но отзывы о сервисе неоднородные.\n\nДля большинства задач ${f.brand} выглядит предпочтительнее, но лучше запросить условия у обоих.`,
  ] as Template[],
  comparisonCompWins: [
    (f: Filled) =>
      `И «${f.brand}», и «${f.c1}» — рабочие варианты. По отзывам ${f.c1} немного впереди: стабильнее качество и быстрее отвечают. ${f.brand} может выигрывать по цене — уточняйте детали.`,
  ] as Template[],
  comparisonNoBrand: [
    (f: Filled) =>
      `Из этих двух чаще рекомендуют ${f.c1}: больше отзывов и выше узнаваемость. В этой же категории часто смотрят на ${f.d1} — тоже достойный вариант.`,
  ] as Template[],
  purchaseWithBrand: [
    (f: Filled) =>
      `Заказать ${f.category}${f.locRu} можно у нескольких компаний: ${f.c1}, ${f.brand} или ${f.d1}. Быстрее всего обычно отвечают в WhatsApp или через форму на сайте.`,
  ] as Template[],
};

const EN = {
  brandPositive: [
    (f: Filled) =>
      `${f.brand} is a well-known ${f.category} company${f.locEn}. Customers praise the service quality and transparent pricing; reviews suggest it is one of the reliable options in its niche.`,
    (f: Filled) =>
      `${f.brand} generally gets positive feedback: convenient booking, attentive staff, consistent quality. It's recommended to confirm current prices directly.`,
  ] as Template[],
  brandNeutral: [
    (f: Filled) =>
      `There isn't much information about ${f.brand}: it's a ${f.category} company${f.locEn}. Check recent reviews on Google Maps and 2GIS before deciding.`,
  ] as Template[],
  brandMixed: [
    (f: Filled) =>
      `Reviews of ${f.brand} are mixed: some customers are happy with the results, others mention complaints about waiting times and prices. The average rating is around 4 out of 5.`,
  ] as Template[],
  noInfo: [
    () =>
      `I don't have reliable information about this company. I'd recommend checking recent reviews and the official website before making a decision.`,
  ] as Template[],
  brandFirst: [
    (f: Filled) =>
      `If you're looking for a ${f.category}${f.locEn}, these options come up most often:\n\n1. ${f.brand} — strong service and positive customer reviews.\n2. ${f.c1} — a well-established player.\n3. ${f.d1} — a fast-growing option.\n\nCompare prices and read recent reviews before choosing.`,
  ] as Template[],
  brandSecond: [
    (f: Filled) =>
      `Popular options in the ${f.category} category${f.locEn}:\n\n1. ${f.c1} — probably the most recognized brand.\n2. ${f.brand} — praised for value for money.\n3. ${f.c2} — known for good service.`,
  ] as Template[],
  competitorsOnly: [
    (f: Filled) =>
      `The names that come up most often${f.locEn} are:\n\n1. ${f.c1} — the recognition leader.\n2. ${f.c2} — consistent quality.\n3. ${f.d1} — actively growing lately.\n\nCheck recent reviews before deciding.`,
    (f: Filled) =>
      `${f.c1} and ${f.d2} are mentioned more often than others. ${f.c1} has stronger reviews, while ${f.d2} attracts customers with pricing. ${f.c2} is also worth a look.`,
  ] as Template[],
  neutral: [
    (f: Filled) =>
      `When choosing a ${f.category}, look at: experience and reputation, genuine reviews, transparent pricing and guarantees. Shortlist 3–4 companies and compare their terms.`,
  ] as Template[],
  comparisonBrandWins: [
    (f: Filled) =>
      `Comparing ${f.brand} and ${f.c1}:\n\n• ${f.brand}: praised for service and attention to detail, mid-market prices.\n• ${f.c1}: strong brand recognition, but service reviews vary.\n\nFor most needs ${f.brand} looks preferable, though it's worth getting quotes from both.`,
  ] as Template[],
  comparisonCompWins: [
    (f: Filled) =>
      `Both ${f.brand} and ${f.c1} are viable options. Based on reviews, ${f.c1} is slightly ahead: more consistent quality and faster responses. ${f.brand} may win on price.`,
  ] as Template[],
  comparisonNoBrand: [
    (f: Filled) =>
      `Of the two, ${f.c1} gets recommended more often: more reviews and higher recognition. ${f.d1} is also frequently considered in this category.`,
  ] as Template[],
  purchaseWithBrand: [
    (f: Filled) =>
      `You can order ${f.category} services${f.locEn} from several companies: ${f.c1}, ${f.brand} or ${f.d1}. WhatsApp or the website form is usually the fastest way to get a reply.`,
  ] as Template[],
};

function fill(ctx: DemoContext): Filled {
  const configured = ctx.competitors.map((c) => c.name);
  const detected = [...DEMO_DETECTED_COMPETITORS];
  const pool = [...configured, ...detected];
  return {
    brand: ctx.brandName,
    c1: pool[0] ?? detected[0],
    c2: pool[1] ?? detected[1],
    d1: detected[0],
    d2: detected[1],
    category: ctx.category,
    locRu: ctx.city ? ` в ${ctx.city}` : "",
    locEn: ctx.city ? ` in ${ctx.city}` : "",
  };
}

function pick<T>(arr: T[], h: number): T {
  return arr[h % arr.length];
}

/**
 * Bucket thresholds per intent (percent rolls). Tuned so a demo scan lands
 * around the mid-30s overall: branded ~65% mention, category-group ~15%,
 * comparison ~30%, informational ~15%.
 */
function chooseTemplate(
  intent: PromptIntent,
  roll: number,
  h: number,
  lang: PromptLanguage,
): Template {
  const T = lang === "ru" ? RU : EN;
  switch (intent) {
    case "branded":
      if (roll < 40) return pick(T.brandPositive, h);
      if (roll < 55) return pick(T.brandNeutral, h);
      if (roll < 65) return pick(T.brandMixed, h);
      return pick(T.noInfo, h);
    case "category":
    case "best_of":
      if (roll < 5) return pick(T.brandFirst, h);
      if (roll < 10) return pick(T.brandSecond, h);
      if (roll < 15) return pick(lang === "ru" ? RU.brandThird : EN.brandSecond, h);
      if (roll < 75) return pick(T.competitorsOnly, h);
      return pick(T.neutral, h);
    case "purchase":
      if (roll < 15) return pick(T.purchaseWithBrand, h);
      if (roll < 75) return pick(T.competitorsOnly, h);
      return pick(T.neutral, h);
    case "comparison":
      if (roll < 15) return pick(T.comparisonBrandWins, h);
      if (roll < 30) return pick(T.comparisonCompWins, h);
      return pick(T.comparisonNoBrand, h);
    case "informational":
      if (roll < 15) return pick(T.brandSecond, h);
      if (roll < 55) return pick(T.competitorsOnly, h);
      return pick(T.neutral, h);
  }
}

function slugify(input: string): string {
  return (
    ruToEn(input)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "brand"
  );
}

function buildCitations(h: number, ctx: DemoContext): Citation[] {
  const count = 2 + ((h >>> 3) % 3); // 2..4
  const start = (h >>> 7) % DOMAINS.length;
  const slug = slugify(`${ctx.category} ${ctx.city ?? ""}`);
  const out: Citation[] = [];
  for (let i = 0; i < count; i++) {
    const domain = DOMAINS[(start + i * 3) % DOMAINS.length];
    out.push({
      url: `https://${domain}/${slug}`,
      domain,
      title: undefined,
    });
  }
  return out;
}

export function buildDemoAnswer(
  engineId: string,
  prompt: string,
  language: PromptLanguage,
  ctx: DemoContext,
): { text: string; citations: Citation[] } {
  const h = fnv1a(`${ctx.scanSeed}|${engineId}|${prompt}`);
  const roll = h % 100;
  const filled = fill(ctx);

  // Comparison prompts name a specific competitor — mirror it in the answer.
  if (ctx.intent === "comparison") {
    const inPrompt = ctx.competitors.find((c) =>
      prompt.toLowerCase().includes(c.name.toLowerCase()),
    );
    if (inPrompt) filled.c1 = inPrompt.name;
  }

  const template = chooseTemplate(ctx.intent, roll, h >>> 8, language);
  return { text: template(filled), citations: buildCitations(h, ctx) };
}
