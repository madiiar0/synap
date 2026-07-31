import {
  INTENT_MIX,
  LANGUAGE_MIX,
  llmPromptGenSchema,
  normalizedKey,
  PROMPT_INTENTS,
  type CompetitorRef,
  type Market,
  type PromptIntent,
  type PromptLanguage,
} from "@synapai/shared";
import { env } from "../config/env.js";
import { extractionAvailable, extractionModelCall } from "../engines/perplexityAgent.js";
import { logger } from "../lib/logger.js";
import { recordUsage } from "./usage.js";

export interface PromptSpec {
  text: string;
  language: PromptLanguage;
  intent: PromptIntent;
}

export interface PromptGenBrand {
  name: string;
  category: string;
  city?: string;
  market: Market;
  competitors: CompetitorRef[];
  disabledPrompts?: string[];
}

interface Ctx {
  brand: string;
  category: string;
  place: string; // city, or a market-level fallback
}

type Tpl = (ctx: Ctx) => string;

// Search-style suffix modifiers create enough unique variants for large scans.
const RU_MODS = ["", " отзывы", " 2026", " рейтинг", " недорого", " рядом"];
const EN_MODS = ["", " reviews", " 2026", " ranked", " affordable", " near me"];

const RU_TEMPLATES: Record<Exclude<PromptIntent, "comparison">, Tpl[]> = {
  branded: [
    (c) => `Что такое ${c.brand}?`,
    (c) => `${c.brand} отзывы`,
    (c) => `Стоит ли обращаться в ${c.brand}?`,
    (c) => `${c.brand}: надёжная компания?`,
    (c) => `Расскажи про ${c.brand}`,
    (c) => `${c.brand} цены и условия`,
  ],
  category: [
    (c) => `Посоветуй ${c.category} в ${c.place}`,
    (c) => `${c.category}: кого выбрать в ${c.place}?`,
    (c) => `Нужен ${c.category} в ${c.place}, что посоветуешь?`,
    (c) => `Какой ${c.category} выбрать?`,
    (c) => `${c.category} ${c.place}: варианты`,
  ],
  best_of: [
    (c) => `Лучшие ${c.category} в ${c.place}`,
    (c) => `Топ ${c.category} ${c.place}`,
    (c) => `Кто лучший в категории «${c.category}» в ${c.place}?`,
    (c) => `Самые известные ${c.category} в ${c.place}`,
  ],
  informational: [
    (c) => `Сколько стоит ${c.category} в ${c.place}?`,
    (c) => `Как выбрать ${c.category}?`,
    (c) => `На что смотреть при выборе ${c.category}?`,
    (c) => `${c.category}: частые ошибки при выборе`,
  ],
  purchase: [
    (c) => `Где заказать ${c.category} в ${c.place}?`,
    (c) => `Хочу записаться в ${c.category} в ${c.place}, куда обратиться?`,
    (c) => `Где найти ${c.category} недорого в ${c.place}?`,
  ],
};

const EN_TEMPLATES: Record<Exclude<PromptIntent, "comparison">, Tpl[]> = {
  branded: [
    (c) => `What do you know about ${c.brand}?`,
    (c) => `${c.brand} reviews`,
    (c) => `Is ${c.brand} a reliable company?`,
    (c) => `Tell me about ${c.brand}`,
  ],
  category: [
    (c) => `Recommend a ${c.category} in ${c.place}`,
    (c) => `Which ${c.category} should I choose in ${c.place}?`,
    (c) => `Looking for a ${c.category} in ${c.place}: any suggestions?`,
  ],
  best_of: [
    (c) => `Best ${c.category} in ${c.place}`,
    (c) => `Top ${c.category} companies ${c.place}`,
    (c) => `Most recommended ${c.category} in ${c.place}`,
  ],
  informational: [
    (c) => `How much does a ${c.category} cost in ${c.place}?`,
    (c) => `How to choose a ${c.category}?`,
  ],
  purchase: [
    (c) => `Where can I order ${c.category} services in ${c.place}?`,
    (c) => `Where to book a ${c.category} in ${c.place}?`,
  ],
};

const RU_COMPARISON: ((ctx: Ctx, competitor: string) => string)[] = [
  (c, comp) => `Сравни ${c.brand} и ${comp}`,
  (c, comp) => `${c.brand} или ${comp}: что лучше?`,
  (c, comp) => `Чем ${c.brand} отличается от ${comp}?`,
];

const EN_COMPARISON: ((ctx: Ctx, competitor: string) => string)[] = [
  (c, comp) => `${c.brand} vs ${comp}: which is better?`,
  (c, comp) => `Compare ${c.brand} and ${comp}`,
];

function placeFor(brand: PromptGenBrand, language: PromptLanguage): string {
  if (brand.city) return brand.city;
  if (language === "ru") {
    return brand.market === "kz" ? "Казахстане" : brand.market === "ru" ? "России" : "мире";
  }
  return brand.market === "kz" ? "Kazakhstan" : brand.market === "ru" ? "Russia" : "the world";
}

/** Largest-remainder allocation of n prompts across intents (sums to exactly n). */
export function computeIntentCounts(n: number, hasCompetitors: boolean): Record<PromptIntent, number> {
  const mix: Record<PromptIntent, number> = { ...INTENT_MIX };
  if (!hasCompetitors) {
    mix.category += mix.comparison;
    mix.comparison = 0;
  }
  const raw = PROMPT_INTENTS.map((intent) => ({ intent, exact: n * mix[intent] }));
  const counts = Object.fromEntries(
    raw.map((r) => [r.intent, Math.floor(r.exact)]),
  ) as Record<PromptIntent, number>;
  let remaining = n - raw.reduce((sum, r) => sum + Math.floor(r.exact), 0);
  const byRemainder = [...raw].sort((a, b) => (b.exact % 1) - (a.exact % 1));
  for (const r of byRemainder) {
    if (remaining <= 0) break;
    counts[r.intent] += 1;
    remaining -= 1;
  }
  return counts;
}

/** How many of `count` prompts should be RU for this market. */
export function ruShare(count: number, market: Market): number {
  return Math.round(count * LANGUAGE_MIX[market].ru);
}

function fillIntent(
  intent: Exclude<PromptIntent, "comparison">,
  count: number,
  language: PromptLanguage,
  brand: PromptGenBrand,
  used: Set<string>,
): PromptSpec[] {
  const templates = language === "ru" ? RU_TEMPLATES[intent] : EN_TEMPLATES[intent];
  const mods = language === "ru" ? RU_MODS : EN_MODS;
  const ctx: Ctx = {
    brand: brand.name,
    category: brand.category,
    place: placeFor(brand, language),
  };
  const out: PromptSpec[] = [];
  for (let m = 0; m < mods.length && out.length < count; m++) {
    const modCore = mods[m].replace(/[^\p{L}\p{N}]+/gu, " ").trim().split(" ")[0] ?? "";
    for (let t = 0; t < templates.length && out.length < count; t++) {
      const base = templates[t](ctx);
      // Skip awkward doubles like «… отзывы: отзывы».
      if (modCore && base.toLowerCase().includes(modCore.toLowerCase())) continue;
      const text = `${base}${mods[m]}`;
      const key = normalizedKey(text);
      if (used.has(key)) continue;
      used.add(key);
      out.push({ text, language, intent });
    }
  }
  return out;
}

function fillComparison(
  count: number,
  ruCount: number,
  brand: PromptGenBrand,
  used: Set<string>,
): PromptSpec[] {
  const competitors = brand.competitors.map((c) => c.name);
  if (competitors.length === 0) return [];

  const build = (language: PromptLanguage, target: number): PromptSpec[] => {
    const pool = language === "ru" ? RU_COMPARISON : EN_COMPARISON;
    const ctx: Ctx = {
      brand: brand.name,
      category: brand.category,
      place: placeFor(brand, language),
    };
    const res: PromptSpec[] = [];
    const maxUnique = pool.length * competitors.length;
    let i = 0;
    while (res.length < target && i < maxUnique) {
      const competitor = competitors[i % competitors.length]; // round-robin
      const template = pool[Math.floor(i / competitors.length) % pool.length];
      i += 1;
      const text = template(ctx, competitor);
      const key = normalizedKey(text);
      if (used.has(key)) continue;
      used.add(key);
      res.push({ text, language, intent: "comparison" });
    }
    return res;
  };

  const ru = build("ru", ruCount);
  // EN absorbs whatever the RU pool couldn't produce (small competitor lists).
  const en = build("en", count - ru.length);
  return [...ru, ...en];
}

/** Hard-coded template generation: always used in DEMO_MODE and as LLM fallback. */
export function generateTemplatePrompts(brand: PromptGenBrand, n: number): PromptSpec[] {
  const counts = computeIntentCounts(n, brand.competitors.length > 0);
  const used = new Set<string>((brand.disabledPrompts ?? []).map((p) => normalizedKey(p)));
  const out: PromptSpec[] = [];
  for (const intent of PROMPT_INTENTS) {
    const count = counts[intent];
    if (count === 0) continue;
    const ru = ruShare(count, brand.market);
    if (intent === "comparison") {
      out.push(...fillComparison(count, ru, brand, used));
    } else {
      out.push(...fillIntent(intent, ru, "ru", brand, used));
      out.push(...fillIntent(intent, count - ru, "en", brand, used));
    }
  }
  // Top up from the widest pools if any intent under-delivered (e.g. a tiny
  // competitor list caps comparison prompts).
  const fallbacks: Exclude<PromptIntent, "comparison">[] = [
    "category",
    "best_of",
    "informational",
    "branded",
    "purchase",
  ];
  for (const intent of fallbacks) {
    if (out.length >= n) break;
    const missing = n - out.length;
    const ru = ruShare(missing, brand.market);
    out.push(...fillIntent(intent, ru, "ru", brand, used));
    out.push(...fillIntent(intent, missing - ru, "en", brand, used));
  }
  return out.slice(0, n);
}

function buildLlmPrompt(brand: PromptGenBrand, n: number): string {
  const competitors = brand.competitors.map((c) => c.name).join(", ") || "none";
  const mix = Object.entries(computeIntentCounts(n, brand.competitors.length > 0))
    .map(([intent, count]) => `${intent}: ${count}`)
    .join(", ");
  const langMix = LANGUAGE_MIX[brand.market];
  return [
    `Generate ${n} diverse, realistic consumer-style search prompts about a business.`,
    `Business: "${brand.name}", category: "${brand.category}", city: "${brand.city ?? "-"}", competitors: ${competitors}.`,
    `Intent counts (exact): ${mix}.`,
    `Language mix: ~${Math.round(langMix.ru * 100)}% Russian, ~${Math.round(langMix.en * 100)}% English.`,
    `Comparison prompts must alternate through the competitors.`,
    `Return ONLY minified JSON: {"prompts":[{"text":string,"language":"ru"|"en","intent":"branded"|"category"|"best_of"|"comparison"|"informational"|"purchase"}]}`,
  ].join("\n");
}

/**
 * Generate ~n unique prompts. Uses a cheap LLM call when available; the
 * template generator is the guaranteed fallback and the only path in demo.
 */
export async function generatePrompts(brand: PromptGenBrand, n: number): Promise<PromptSpec[]> {
  if (!env.DEMO_MODE) {
    if (extractionAvailable()) {
      try {
        // Cheap NON-search model call (§3): no web_search, no search fee.
        const resp = await extractionModelCall(buildLlmPrompt(brand, n), 2500);
        await recordUsage("prompt-gen", resp);
        const cleaned = resp.text.replace(/```(?:json)?/g, "").trim();
        const start = cleaned.indexOf("{");
        const end = cleaned.lastIndexOf("}");
        const parsed = llmPromptGenSchema.safeParse(
          JSON.parse(cleaned.slice(start, end + 1)),
        );
        if (parsed.success) {
          const used = new Set<string>((brand.disabledPrompts ?? []).map((p) => normalizedKey(p)));
          const unique = parsed.data.prompts.filter((p) => {
            const key = normalizedKey(p.text);
            if (used.has(key)) return false;
            used.add(key);
            return true;
          });
          if (unique.length >= n * 0.6) {
            // Top up from templates if the LLM under-delivered.
            const extra = generateTemplatePrompts(brand, n).filter(
              (p) => !used.has(normalizedKey(p.text)),
            );
            return [...unique, ...extra].slice(0, n);
          }
        }
        logger.warn("prompt-gen LLM output rejected; falling back to templates");
      } catch (err) {
        logger.warn({ err }, "prompt-gen LLM failed; falling back to templates");
      }
    }
  }
  return generateTemplatePrompts(brand, n);
}

/**
 * §2.1/§3: pick which prompt indexes form the core set that runs on every
 * core engine — always ALL branded prompts, then comparison, then the rest
 * in order until `coreCount` is reached. Pure for unit testing.
 */
export function selectCoreIndices(prompts: PromptSpec[], coreCount: number): Set<number> {
  const byPriority: number[] = [];
  const push = (predicate: (p: PromptSpec) => boolean): void => {
    prompts.forEach((p, i) => {
      if (byPriority.length < coreCount && predicate(p) && !byPriority.includes(i)) {
        byPriority.push(i);
      }
    });
  };
  push((p) => p.intent === "branded");
  push((p) => p.intent === "comparison");
  push(() => true);
  return new Set(byPriority.slice(0, coreCount));
}
