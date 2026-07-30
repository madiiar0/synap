import { describe, expect, it } from "vitest";
import { enToRu, hasCyrillic, hasLatin, ruToEn } from "./translit.js";

describe("ruToEn", () => {
  it("transliterates simple brand names", () => {
    expect(ruToEn("Астра")).toBe("astra");
    expect(ruToEn("Нурлы")).toBe("nurly");
  });

  it("handles digraph letters", () => {
    expect(ruToEn("Чехов")).toBe("chekhov");
    expect(ruToEn("Щит")).toBe("shchit");
    expect(ruToEn("Юрта")).toBe("yurta");
  });

  it("transliterates Kazakh Cyrillic letters", () => {
    expect(ruToEn("Жаңа")).toBe("zhana");
    expect(ruToEn("Қазақ")).toBe("kazak");
    expect(ruToEn("Әсем")).toBe("asem");
    expect(ruToEn("Түркістан")).toBe("turkistan");
  });

  it("drops soft/hard signs", () => {
    expect(ruToEn("Альфа")).toBe("alfa");
  });
});

describe("enToRu", () => {
  it("transliterates latin brand names", () => {
    expect(enToRu("astra")).toBe("астра");
    expect(enToRu("vega")).toBe("вега");
  });

  it("prefers longest digraphs", () => {
    expect(enToRu("shchi")).toBe("щи");
    expect(enToRu("zhuk")).toBe("жук");
    expect(enToRu("chai")).toBe("чаи");
  });

  it("keeps digits and separators", () => {
    expect(enToRu("dental 24")).toBe("дентал 24");
  });
});

describe("script detection", () => {
  it("detects scripts", () => {
    expect(hasCyrillic("Астра")).toBe(true);
    expect(hasCyrillic("astra")).toBe(false);
    expect(hasLatin("astra")).toBe(true);
    expect(hasLatin("Астра")).toBe(false);
  });
});
