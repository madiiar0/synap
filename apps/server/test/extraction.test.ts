import { describe, expect, it } from "vitest";
import {
  deterministicExtract,
  keywordSentiment,
  parseLlmJson,
} from "../src/services/extraction.js";

const target = {
  brand: { name: "Astra Dental", aliases: ["Астра Дентал"] },
  competitors: [
    { name: "Дента Люкс", aliases: [] },
    { name: "SmileCity", aliases: [] },
  ],
};

describe("deterministicExtract", () => {
  it("finds the brand with position and competitors", () => {
    const text =
      "Топ-3: 1. Дента Люкс — лидер. 2. Astra Dental — хвалят за сервис. 3. SmileCity — стабильно.";
    const result = deterministicExtract(text, target);
    expect(result.mentioned).toBe(true);
    expect(result.position).toBe(2);
    expect(result.brands.map((b) => b.name)).toEqual(["Дента Люкс", "Astra Dental", "SmileCity"]);
    expect(result.sentiment).toBe("pos");
  });

  it("matches the transliterated RU alias", () => {
    const result = deterministicExtract("Рекомендую клинику «Астра Дентал».", target);
    expect(result.mentioned).toBe(true);
  });

  it("reports competitors-only answers as not mentioned", () => {
    const result = deterministicExtract("Лучшие: Дента Люкс и SmileCity.", target);
    expect(result.mentioned).toBe(false);
    expect(result.sentiment).toBe("na");
    expect(result.brands).toHaveLength(2);
  });

  it("scans extra known names (demo detected pool)", () => {
    const result = deterministicExtract("Сейчас все советуют Nurly.", {
      ...target,
      extraNames: ["Nurly"],
    });
    expect(result.brands.map((b) => b.name)).toContain("Nurly");
  });
});

describe("keywordSentiment", () => {
  it("classifies positive/negative/neutral", () => {
    expect(keywordSentiment("Компанию хвалят за качественный сервис")).toBe("pos");
    expect(keywordSentiment("Много жалоб на ожидание")).toBe("neg");
    expect(keywordSentiment("Компания работает с 2010 года")).toBe("neu");
    expect(keywordSentiment("Хвалят сервис, но есть жалобы")).toBe("neu");
  });
});

describe("parseLlmJson (defensive LLM output parsing)", () => {
  const valid =
    '{"mentioned":true,"matchedAlias":"Astra","position":2,"sentiment":"pos","brands":[{"name":"Astra","position":2}]}';

  it("parses clean JSON", () => {
    expect(parseLlmJson(valid)?.mentioned).toBe(true);
  });

  it("strips markdown fences", () => {
    expect(parseLlmJson("```json\n" + valid + "\n```")?.position).toBe(2);
  });

  it("extracts JSON wrapped in prose", () => {
    expect(parseLlmJson("Here is the result:\n" + valid + "\nHope that helps!")?.sentiment).toBe(
      "pos",
    );
  });

  it("returns null on garbage without throwing", () => {
    expect(parseLlmJson("I could not process this request.")).toBeNull();
    expect(parseLlmJson('{"mentioned": "yes"}')).toBeNull();
    expect(parseLlmJson("")).toBeNull();
  });
});
