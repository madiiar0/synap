import { levenshtein, normalizeForMatch, normalizeText } from "./normalize.js";
import { enToRu, hasCyrillic, hasLatin, ruToEn } from "./translit.js";

export interface BrandLike {
  name: string;
  aliases?: string[];
}

export interface BrandMatch {
  matched: boolean;
  alias?: string;
  /** Char offset of the first occurrence in the normalized text (for ordering). */
  index?: number;
}

/**
 * All normalized variants an alias can appear as: as-is, transliterated
 * (both directions), and space-free. Deduped, short junk filtered out.
 */
export function expandAliases(brand: BrandLike): string[] {
  const raw = [brand.name, ...(brand.aliases ?? [])];
  const out = new Set<string>();
  for (const item of raw) {
    const norm = normalizeForMatch(item);
    if (norm.length < 2) continue;
    out.add(norm);
    if (hasCyrillic(norm)) out.add(normalizeForMatch(ruToEn(norm)));
    if (hasLatin(norm)) out.add(normalizeForMatch(enToRu(norm)));
    if (norm.includes(" ")) out.add(norm.replace(/ /g, ""));
  }
  return [...out].filter((v) => v.length >= 2);
}

/** Per-word edit-distance tolerance: exact for short words, up to 2 for long ones. */
function wordTolerance(word: string): number {
  if (word.length <= 3) return 0;
  if (word.length <= 5) return 1;
  return 2;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Find `alias` in normalized `text`. Exact word-boundary substring first,
 * then a fuzzy token-window scan (Levenshtein per word, see wordTolerance).
 * Fuzzy matching is only applied to multi-word aliases — for single words the
 * false-positive rate is too high ("astra"→"astral", "vega"→"mega").
 */
export function findAliasInText(text: string, alias: string): { index: number } | null {
  const boundary = new RegExp(
    `(?:^|[^\\p{L}\\p{N}])(${escapeRegExp(alias)})(?:$|[^\\p{L}\\p{N}])`,
    "u",
  );
  const m = boundary.exec(text);
  if (m && m[1] !== undefined) return { index: m.index + m[0].indexOf(m[1]) };

  const aliasTokens = alias.split(" ").filter(Boolean);
  if (aliasTokens.length < 2) return null;

  // Token positions in the text so fuzzy hits can report a char index.
  const tokens: { word: string; index: number }[] = [];
  const re = /[\p{L}\p{N}]+/gu;
  let tm: RegExpExecArray | null;
  while ((tm = re.exec(text)) !== null) {
    tokens.push({ word: tm[0], index: tm.index });
  }

  outer: for (let i = 0; i + aliasTokens.length <= tokens.length; i++) {
    for (let j = 0; j < aliasTokens.length; j++) {
      const target = aliasTokens[j];
      const candidate = tokens[i + j].word;
      // The first (distinctive) token anchors the match and must be exact —
      // fuzzy anchors turn 1-edit rivals into false positives ("Mega
      // Clinics" ≠ "Vega Clinic", "Alga Bank" ≠ "Alfa Bank"). Later,
      // generic tokens keep the typo tolerance.
      const tol = j === 0 ? 0 : wordTolerance(target);
      if (tol === 0) {
        if (candidate !== target) continue outer;
      } else if (levenshtein(candidate, target, tol) > tol) {
        continue outer;
      }
    }
    return { index: tokens[i].index };
  }
  return null;
}

export function matchBrand(answerText: string, brand: BrandLike): BrandMatch {
  const text = normalizeForMatch(answerText);
  if (text.length === 0) return { matched: false };
  let best: { alias: string; index: number } | null = null;
  for (const alias of expandAliases(brand)) {
    const hit = findAliasInText(text, alias);
    if (hit && (best === null || hit.index < best.index)) {
      best = { alias, index: hit.index };
    }
  }
  return best ? { matched: true, alias: best.alias, index: best.index } : { matched: false };
}

export interface DetectedBrand {
  name: string;
  index: number;
  position: number; // 1-based order of first mention
}

/**
 * Detect several brands in one answer and rank them by first mention.
 * One text span credits only one brand: on identical start offsets the
 * longer (more specific / exact) alias wins.
 */
export function detectBrands(answerText: string, brands: BrandLike[]): DetectedBrand[] {
  const found: { name: string; index: number; aliasLen: number }[] = [];
  for (const brand of brands) {
    const m = matchBrand(answerText, brand);
    if (m.matched && m.index !== undefined) {
      found.push({ name: brand.name, index: m.index, aliasLen: m.alias?.length ?? 0 });
    }
  }
  found.sort((a, b) => a.index - b.index || b.aliasLen - a.aliasLen);
  const kept: { name: string; index: number }[] = [];
  let lastIndex = -1;
  for (const f of found) {
    if (f.index === lastIndex) continue;
    kept.push({ name: f.name, index: f.index });
    lastIndex = f.index;
  }
  return kept.map((f, i) => ({ ...f, position: i + 1 }));
}

/** Key used to dedupe/cache scan requests and prompt texts. */
export function normalizedKey(...parts: (string | undefined)[]): string {
  return parts
    .filter((p): p is string => Boolean(p && p.trim()))
    .map((p) => normalizeText(p))
    .join("|");
}
