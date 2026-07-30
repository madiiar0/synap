/**
 * RU↔EN transliteration for brand-alias matching. Not a linguistic
 * round-tripper — the goal is generating plausible alias variants
 * («Астра» → "astra", "astra" → «астра») that the fuzzy matcher can use.
 */

const RU_TO_EN: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
  з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
  п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts",
  ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu",
  я: "ya",
};

/** Digraphs first (longest match wins), then single letters. */
const EN_TO_RU_PAIRS: [string, string][] = [
  ["shch", "щ"], ["zh", "ж"], ["kh", "х"], ["ts", "ц"], ["ch", "ч"],
  ["sh", "ш"], ["yu", "ю"], ["ya", "я"], ["yo", "ё"],
  ["a", "а"], ["b", "б"], ["c", "к"], ["d", "д"], ["e", "е"], ["f", "ф"],
  ["g", "г"], ["h", "х"], ["i", "и"], ["j", "дж"], ["k", "к"], ["l", "л"],
  ["m", "м"], ["n", "н"], ["o", "о"], ["p", "п"], ["q", "к"], ["r", "р"],
  ["s", "с"], ["t", "т"], ["u", "у"], ["v", "в"], ["w", "в"], ["x", "кс"],
  ["y", "й"], ["z", "з"],
];

export function ruToEn(input: string): string {
  let out = "";
  for (const ch of input.toLowerCase()) {
    out += RU_TO_EN[ch] ?? ch;
  }
  return out;
}

export function enToRu(input: string): string {
  const s = input.toLowerCase();
  let out = "";
  let i = 0;
  while (i < s.length) {
    let matched = false;
    for (const [en, ru] of EN_TO_RU_PAIRS) {
      if (s.startsWith(en, i)) {
        out += ru;
        i += en.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      out += s[i];
      i += 1;
    }
  }
  return out;
}

export function hasCyrillic(input: string): boolean {
  return /[а-яё]/i.test(input);
}

export function hasLatin(input: string): boolean {
  return /[a-z]/i.test(input);
}
