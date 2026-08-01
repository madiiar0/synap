import { describe, expect, it } from "vitest";
import en from "./en.json";
import ru from "./ru.json";

type Dict = { [key: string]: string | Dict };

function leaves(obj: Dict, prefix = ""): { key: string; value: string }[] {
  const out: { key: string; value: string }[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") out.push({ key: full, value });
    else out.push(...leaves(value, full));
  }
  return out;
}

/** English UI terms that must never leak into the RU bundle (§13 fixed terms). */
const BANNED_IN_RU = [
  "Visibility Score",
  "Share of Voice",
  "Sentiment",
  "Sources",
  "Answers",
  "Competitors",
  "Overview",
  "Rankings",
  "Company",
];

/**
 * Keys whose value is intentionally identical/foreign in both locales.
 * A language switcher names the OTHER language in that language, so the EN
 * bundle legitimately carries "Русский".
 */
const CYRILLIC_ALLOWED_IN_EN = new Set(["common.langRu", "nav.switchLanguage"]);

describe("i18n purity (§13)", () => {
  it("RU bundle contains no known-English UI terms", () => {
    const offenders = leaves(ru as Dict).filter(({ value }) =>
      BANNED_IN_RU.some((term) => value.includes(term)),
    );
    expect(offenders, JSON.stringify(offenders)).toEqual([]);
  });

  it("EN bundle contains no Cyrillic", () => {
    const offenders = leaves(en as Dict).filter(
      ({ key, value }) => !CYRILLIC_ALLOWED_IN_EN.has(key) && /[А-Яа-яЁё]/.test(value),
    );
    expect(offenders, JSON.stringify(offenders)).toEqual([]);
  });

  it("RU and EN key sets mirror each other", () => {
    const ruKeys = leaves(ru as Dict).map((l) => l.key);
    const enKeys = leaves(en as Dict).map((l) => l.key);
    expect(ruKeys.sort()).toEqual(enKeys.sort());
  });
});
