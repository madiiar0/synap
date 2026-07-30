/** Lowercase, unify quotes/dashes, drop «»/quote marks, collapse whitespace. */
export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[«»„“”"'’`]/g, " ")
    .replace(/[–—]/g, "-")
    .replace(/ё/g, "е")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Like normalizeText but also strips punctuation to bare words (for token
 * matching). Hyphens become spaces so "Astra-Dental" ≡ "Astra Dental" on
 * both the alias and the answer side.
 */
export function normalizeForMatch(input: string): string {
  return normalizeText(input)
    .replace(/-/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(input: string): string[] {
  const norm = normalizeForMatch(input);
  return norm.length === 0 ? [] : norm.split(" ");
}

/** Levenshtein distance with an early-exit cap (returns cap+1 when exceeded). */
export function levenshtein(a: string, b: string, cap = 3): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > cap) return cap + 1;
  const m = a.length;
  const n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const curr = new Array<number>(n + 1);
    curr[0] = i;
    let rowMin = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      if (curr[j] < rowMin) rowMin = curr[j];
    }
    if (rowMin > cap) return cap + 1;
    prev = curr;
  }
  return prev[n];
}
