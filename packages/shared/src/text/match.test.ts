import { describe, expect, it } from "vitest";
import { detectBrands, expandAliases, matchBrand, normalizedKey } from "./match.js";
import { levenshtein, normalizeText } from "./normalize.js";

const astra = { name: "Astra Dental", aliases: ["Астра Дентал"] };

describe("levenshtein", () => {
  it("computes distances", () => {
    expect(levenshtein("astra", "astra")).toBe(0);
    expect(levenshtein("astra", "astro")).toBe(1);
    expect(levenshtein("astra", "bstro")).toBe(2);
  });

  it("early-exits past the cap", () => {
    expect(levenshtein("aaaaaaaa", "bbbbbbbb", 2)).toBe(3);
  });
});

describe("expandAliases", () => {
  it("includes transliterated + space-free variants", () => {
    const variants = expandAliases(astra);
    expect(variants).toContain("astra dental");
    expect(variants).toContain("астра дентал");
    expect(variants).toContain("astradental");
    // RU alias transliterated to EN
    expect(variants.some((v) => v.startsWith("astra"))).toBe(true);
  });
});

describe("matchBrand", () => {
  it("matches exact mentions with «» quotes", () => {
    expect(matchBrand("Рекомендую клинику «Астра Дентал» в Алматы.", astra).matched).toBe(true);
  });

  it("matches transliterated mentions across scripts", () => {
    expect(matchBrand("Лучший выбор — клиника Астра Дентал.", { name: "Astra Dental" }).matched).toBe(
      true,
    );
    expect(matchBrand("Astra Dental is a solid choice.", { name: "Астра Дентал" }).matched).toBe(true);
  });

  it("matches small typos in non-anchor words (first word must be exact)", () => {
    expect(matchBrand("Try Astra Dentall for implants.", astra).matched).toBe(true);
  });

  it("does not credit 1-edit rival names to the brand", () => {
    expect(matchBrand("Рекомендую Mega Clinics.", { name: "Vega Clinic" }).matched).toBe(false);
    expect(matchBrand("Alga Bank is popular.", { name: "Alfa Bank" }).matched).toBe(false);
    expect(matchBrand("Astro Dental is nearby.", astra).matched).toBe(false);
  });

  it("matches hyphenated and spaced name variants both ways", () => {
    expect(matchBrand("Советуют клинику Astra-Dental.", { name: "Astra Dental" }).matched).toBe(
      true,
    );
    expect(matchBrand("Go to Astra Dental today.", { name: "Astra-Dental" }).matched).toBe(true);
  });

  it("does not match short words inside longer ones", () => {
    expect(matchBrand("An astral projection guide.", { name: "Astra" }).matched).toBe(false);
  });

  it("does not match unrelated text", () => {
    expect(matchBrand("Лучшие стоматологии Алматы: Дента Люкс и SmileCity.", astra).matched).toBe(
      false,
    );
  });
});

describe("detectBrands", () => {
  it("ranks brands by first mention", () => {
    const text = "Топ-3: 1) Nurly Dent — премиум. 2) Astra Dental — оптимально. 3) Vega Clinic.";
    const detected = detectBrands(text, [
      astra,
      { name: "Vega Clinic" },
      { name: "Nurly Dent" },
    ]);
    expect(detected.map((d) => d.name)).toEqual(["Nurly Dent", "Astra Dental", "Vega Clinic"]);
    expect(detected[1].position).toBe(2);
  });

  it("credits one text span to a single brand", () => {
    const detected = detectBrands("Visit Astra Dental now.", [
      { name: "Astra Dental" },
      { name: "Astra Dental Care" },
    ]);
    expect(detected).toHaveLength(1);
  });
});

describe("normalizedKey", () => {
  it("normalizes case, quotes and spacing", () => {
    expect(normalizedKey("Астра Дентал", "Стоматология", "Алматы")).toBe(
      normalizedKey("«астра  дентал»", "стоматология", "АЛМАТЫ"),
    );
  });

  it("normalizeText strips quotes and unifies ё", () => {
    expect(normalizeText("«Тёплый Дом»")).toBe("теплый дом");
  });
});
