import { normalizedKey } from "@synapai/shared";

/**
 * #6: resolve who the business actually IS before prompts are written or
 * mentions are counted.
 *
 * The failure this fixes is general, not specific to one company: research
 * returns names that belong to the SAME business ecosystem ("Kaspi",
 * "Kaspi Bank", "Kaspi Red") in the competitor list, so the audit treats one
 * business as several rivals and its own visibility is split across them.
 *
 * The rule is structural, never a per-company exception: a candidate that
 * contains the business's full distinctive name as a whole-word sequence is a
 * sub-brand or product of that business, not a competitor. A candidate that
 * does not is left alone.
 */

/** Words too generic to make a name distinctive on their own. */
const GENERIC_TOKENS = new Set([
  "bank",
  "банк",
  "group",
  "групп",
  "групп а",
  "company",
  "компания",
  "shop",
  "store",
  "магазин",
  "cafe",
  "кафе",
  "coffee",
  "кофе",
  "market",
  "маркет",
  "center",
  "центр",
  "clinic",
  "клиника",
  "studio",
  "студия",
  "kz",
  "kazakhstan",
  "казахстан",
  "ltd",
  "llc",
  "too",
  "тоо",
  "ип",
  "ao",
  "ао",
]);

function tokens(value: string): string[] {
  // Punctuation separates tokens too, so "Kaspi.kz" is ["kaspi", "kz"].
  return normalizedKey(value)
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

/**
 * A name is distinctive enough to anchor sub-brand detection when it has at
 * least one non-generic token of 3+ characters. "Kaspi" qualifies; "Coffee"
 * and "Bank" alone do not, so "Coffee House" is never folded into "Coffee".
 */
export function distinctiveTokens(name: string): string[] {
  return tokens(name).filter((t) => t.length >= 3 && !GENERIC_TOKENS.has(t));
}

/** True when `candidate` contains every distinctive token of `brand`, in order. */
export function isSameEcosystem(brandName: string, candidate: string): boolean {
  const anchor = distinctiveTokens(brandName);
  if (anchor.length === 0) return false;

  const brandTokens = tokens(brandName);
  const candidateTokens = tokens(candidate);
  if (candidateTokens.length === 0 || brandTokens.length === 0) return false;

  // Exact match on the normalized whole string is trivially the same entity.
  if (normalizedKey(brandName) === normalizedKey(candidate)) return true;

  // The candidate must BEGIN with the business's complete name:
  //   "kaspi bank" starts with ["kaspi"]                       -> same
  //   "coffee boom dostyk plaza" starts with ["coffee","boom"] -> same
  //   "halyk bank" does not start with ["kaspi"]               -> rival
  //   "coffee house" does not start with ["coffee","boom"]     -> rival
  //   "old kaspi road cafe" does not start with ["kaspi"]      -> rival
  if (candidateTokens.length < brandTokens.length) return false;
  return brandTokens.every((tok, i) => candidateTokens[i] === tok);
}

export interface ResolvedIdentity {
  /** Everything that refers to the business itself: aliases + sub-brands. */
  aliases: string[];
  /** Names that were proposed as competitors but belong to the business. */
  reclaimed: string[];
  /** Genuine third-party competitors. */
  competitors: string[];
}

/**
 * Split a research result into "this is us" and "this is a rival".
 * `declaredSubBrands` are names the researcher explicitly marked as products or
 * sub-brands of the business; they are always treated as the business itself.
 */
export function resolveIdentity(input: {
  brandName: string;
  userAliases: string[];
  researchAliases: string[];
  declaredSubBrands: string[];
  candidateCompetitors: string[];
  /** Competitor names the OWNER typed; always respected as competitors. */
  userCompetitors: string[];
}): ResolvedIdentity {
  const seen = new Set<string>();
  const aliases: string[] = [];
  const pushAlias = (value: string): void => {
    const trimmedValue = value.trim();
    const key = normalizedKey(trimmedValue);
    if (!trimmedValue || !key || key === normalizedKey(input.brandName) || seen.has(key)) return;
    seen.add(key);
    aliases.push(trimmedValue);
  };

  for (const alias of input.userAliases) pushAlias(alias);
  for (const alias of input.researchAliases) pushAlias(alias);
  for (const sub of input.declaredSubBrands) pushAlias(sub);

  // The owner's own competitor list wins: if they call it a rival, it is one.
  const userCompetitorKeys = new Set(input.userCompetitors.map((c) => normalizedKey(c)));

  const reclaimed: string[] = [];
  const competitors: string[] = [];
  const competitorSeen = new Set<string>();

  for (const candidate of input.candidateCompetitors) {
    const name = candidate.trim();
    const key = normalizedKey(name);
    if (!name || !key) continue;

    if (!userCompetitorKeys.has(key) && isSameEcosystem(input.brandName, name)) {
      // Same business under another name: count it as us, never against us.
      if (!seen.has(key)) reclaimed.push(name);
      pushAlias(name);
      continue;
    }
    if (competitorSeen.has(key)) continue;
    competitorSeen.add(key);
    competitors.push(name);
  }

  return { aliases, reclaimed, competitors };
}
