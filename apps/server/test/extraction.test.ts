import { describe, expect, it } from "vitest";
import {
  deterministicExtract,
  extractionCallCount,
  keywordSentiment,
  parseLlmBatch,
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

describe("parseLlmBatch (defensive batched LLM output parsing)", () => {
  const valid =
    '[{"index":0,"mentioned":true,"matchedAlias":"Astra","position":2,"sentiment":"pos","brands":[{"name":"Astra","position":2}]},' +
    '{"index":1,"mentioned":false,"matchedAlias":null,"position":null,"sentiment":"na","brands":[]}]';

  it("parses a clean JSON array", () => {
    const batch = parseLlmBatch(valid);
    expect(batch).toHaveLength(2);
    expect(batch?.[0].mentioned).toBe(true);
    expect(batch?.[1].index).toBe(1);
  });

  it("strips markdown fences", () => {
    expect(parseLlmBatch("```json\n" + valid + "\n```")?.[0].position).toBe(2);
  });

  it("extracts the array wrapped in prose", () => {
    expect(parseLlmBatch("Here are the results:\n" + valid + "\nHope that helps!")).toHaveLength(
      2,
    );
  });

  it("returns null on garbage without throwing", () => {
    expect(parseLlmBatch("I could not process this request.")).toBeNull();
    expect(parseLlmBatch('[{"index":0,"mentioned":"yes"}]')).toBeNull();
    expect(parseLlmBatch("")).toBeNull();
  });
});

describe("extractionCallCount (§4 call budget)", () => {
  it("chunks answers into batches of 10", () => {
    expect(extractionCallCount(0)).toBe(0);
    expect(extractionCallCount(10)).toBe(1);
    expect(extractionCallCount(41)).toBe(5);
    expect(extractionCallCount(125)).toBe(13);
  });
});
