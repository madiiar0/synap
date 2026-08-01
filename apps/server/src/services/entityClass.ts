import { normalizedKey } from "@synapai/shared";

/**
 * §5: classify a name extracted from an AI answer before it is allowed to
 * become a competitor row.
 *
 * Two failure modes were shipping invalid rows:
 *   1. Platforms cited as SOURCES (2GIS, Yandex, Instagram) were treated as
 *      competitors, because anything named in an answer became an entity.
 *   2. Descriptive phrases ("другие локальные кондитерские", "other local
 *      bakeries") became rows, because no check distinguished a company name
 *      from prose.
 *
 * Nothing here is industry specific: the directory list is a platform list,
 * and generic phrases are detected structurally by their leading quantifier or
 * category word plus the absence of a proper-noun token.
 */
export type EntityType =
  | "direct_competitor"
  | "indirect_competitor"
  | "directory"
  | "marketplace"
  | "source"
  | "irrelevant"
  | "unknown";

/** Types allowed into the main Competitors table. */
export const COMPETITOR_TYPES: readonly EntityType[] = [
  "direct_competitor",
  "indirect_competitor",
];

/**
 * Maps, directories, marketplaces, aggregators, search engines, social and
 * media platforms. These are where an assistant FOUND the businesses, not
 * businesses competing with the target.
 */
const PLATFORMS: Record<string, EntityType> = {
  "2gis": "directory",
  "2гис": "directory",
  дубльгис: "directory",
  yandex: "directory",
  яндекс: "directory",
  "yandex maps": "directory",
  "яндекс карты": "directory",
  google: "directory",
  "google maps": "directory",
  "google карты": "directory",
  tripadvisor: "directory",
  foursquare: "directory",
  zoon: "directory",
  flamp: "directory",
  otzovik: "directory",
  irecommend: "directory",
  wikipedia: "source",
  instagram: "source",
  facebook: "source",
  tiktok: "source",
  youtube: "source",
  telegram: "source",
  whatsapp: "source",
  vk: "source",
  вконтакте: "source",
  pinterest: "source",
  wolt: "marketplace",
  glovo: "marketplace",
  chocofood: "marketplace",
  "yandex eda": "marketplace",
  "яндекс еда": "marketplace",
  wildberries: "marketplace",
  ozon: "marketplace",
  kaspi: "marketplace",
  "kaspi магазин": "marketplace",
  avito: "marketplace",
  olx: "marketplace",
  uber: "marketplace",
  bolt: "marketplace",
};

/**
 * Leading words that mark a descriptive phrase rather than a name. A real
 * business name does not begin with a quantifier or a bare category word.
 */
const PHRASE_LEADERS = new Set([
  "другие",
  "другой",
  "другая",
  "прочие",
  "разные",
  "местные",
  "локальные",
  "небольшие",
  "мелкие",
  "several",
  "some",
  "other",
  "others",
  "various",
  "many",
  "local",
  "nearby",
  "small",
  "independent",
  "additional",
  "alternative",
  "alternatives",
  "similar",
]);

/** Words that describe a category, never a company on their own. */
const CATEGORY_WORDS = new Set([
  "кондитерские",
  "кондитерская",
  "пекарни",
  "пекарня",
  "кофейни",
  "кофейня",
  "магазины",
  "компании",
  "фирмы",
  "сервисы",
  "студии",
  "салоны",
  "клиники",
  "bakeries",
  "bakery",
  "cafes",
  "cafe",
  "shops",
  "stores",
  "companies",
  "providers",
  "services",
  "studios",
  "salons",
  "clinics",
  "options",
  "places",
  "businesses",
  "brands",
  "vendors",
  "suppliers",
]);

export interface Classification {
  type: EntityType;
  /** 0..1; low confidence keeps an entity out of the main table. */
  confidence: number;
  reason: string;
}

/** True when the string reads as prose rather than a business name. */
export function isGenericPhrase(name: string): boolean {
  const tokens = normalizedKey(name).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;
  if (PHRASE_LEADERS.has(tokens[0])) return true;
  // Every token is a common category word: "local bakeries", "кондитерские".
  if (tokens.every((tk) => CATEGORY_WORDS.has(tk) || PHRASE_LEADERS.has(tk))) return true;
  // Prose fragments: long, or ending in an ellipsis / trailing conjunction.
  if (tokens.length > 6) return true;
  if (/[…]|\.\.\.$/.test(name.trim())) return true;
  return false;
}

/** Platform lookup on the normalized name and its first token. */
function platformType(name: string): EntityType | null {
  const key = normalizedKey(name);
  if (PLATFORMS[key]) return PLATFORMS[key];
  const first = key.split(/\s+/)[0];
  return first && PLATFORMS[first] ? PLATFORMS[first] : null;
}

export interface ClassifyInput {
  name: string;
  /** Names the owner typed; always trusted as genuine competitors. */
  userCompetitors?: string[];
  /** How many distinct eligible prompts the name appeared in. */
  promptAppearances?: number;
  /** True when it appeared inside a recommendation or comparison context. */
  inRecommendation?: boolean;
}

export function classifyEntity(input: ClassifyInput): Classification {
  const name = input.name.trim();
  if (!name) return { type: "irrelevant", confidence: 1, reason: "empty" };

  // The owner's own list wins over every heuristic.
  const userSet = new Set((input.userCompetitors ?? []).map((c) => normalizedKey(c)));
  if (userSet.has(normalizedKey(name))) {
    return { type: "direct_competitor", confidence: 1, reason: "declared by the owner" };
  }

  if (isGenericPhrase(name)) {
    return { type: "irrelevant", confidence: 0.95, reason: "descriptive phrase, not a business" };
  }

  const platform = platformType(name);
  if (platform) {
    return { type: platform, confidence: 0.9, reason: "known platform, directory or marketplace" };
  }

  // A single appearance in prose is weak evidence; require either a
  // recommendation context or repetition across prompts.
  const appearances = input.promptAppearances ?? 1;
  if (!input.inRecommendation && appearances < 2) {
    return { type: "unknown", confidence: 0.4, reason: "insufficient evidence" };
  }

  return {
    type: "direct_competitor",
    confidence: appearances >= 2 ? 0.85 : 0.7,
    reason: input.inRecommendation
      ? "named in a recommendation among alternatives"
      : "named across multiple prompts",
  };
}

/** Should this entity appear in the main Competitors table? */
export function isCompetitorRow(c: Classification): boolean {
  return COMPETITOR_TYPES.includes(c.type) && c.confidence >= 0.6;
}
