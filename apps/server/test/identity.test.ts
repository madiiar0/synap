import { describe, expect, it } from "vitest";
import { distinctiveTokens, isSameEcosystem, resolveIdentity } from "../src/services/identity.js";

/**
 * #6: alternative names, sub-brands and products of the same business must not
 * be scored as independent competitors. The rule must be structural, so it
 * generalises beyond the reported Kaspi case.
 */
describe("business identity resolution (#6)", () => {
  it("ignores generic words when deciding what is distinctive", () => {
    expect(distinctiveTokens("Kaspi")).toEqual(["kaspi"]);
    expect(distinctiveTokens("Coffee")).toEqual([]); // too generic to anchor
    expect(distinctiveTokens("Kaspi Bank")).toEqual(["kaspi"]);
  });

  it("treats sub-brands and products as the same business", () => {
    expect(isSameEcosystem("Kaspi", "Kaspi Bank")).toBe(true);
    expect(isSameEcosystem("Kaspi", "Kaspi Red")).toBe(true);
    expect(isSameEcosystem("Kaspi", "Kaspi.kz")).toBe(true);
    expect(isSameEcosystem("Coffee BOOM", "Coffee BOOM Dostyk Plaza")).toBe(true);
  });

  it("does not swallow unrelated businesses with similar words", () => {
    expect(isSameEcosystem("Kaspi", "Halyk Bank")).toBe(false);
    expect(isSameEcosystem("Kaspi", "Jusan Bank")).toBe(false);
    // A generic first word must never anchor a match.
    expect(isSameEcosystem("Coffee", "Coffee House")).toBe(false);
    // Same token but not leading: a different business that mentions the word.
    expect(isSameEcosystem("Kaspi", "Old Kaspi Road Cafe")).toBe(false);
  });

  it("reclaims ecosystem names out of the competitor list", () => {
    const result = resolveIdentity({
      brandName: "Kaspi",
      userAliases: ["Каспи"],
      researchAliases: ["Kaspi.kz"],
      declaredSubBrands: ["Kaspi Red", "Kaspi Gold"],
      candidateCompetitors: ["Kaspi Bank", "Halyk Bank", "Jusan Bank"],
      userCompetitors: [],
    });

    expect(result.competitors).toEqual(["Halyk Bank", "Jusan Bank"]);
    expect(result.reclaimed).toContain("Kaspi Bank");
    for (const name of ["Каспи", "Kaspi.kz", "Kaspi Red", "Kaspi Gold", "Kaspi Bank"]) {
      expect(result.aliases).toContain(name);
    }
    // The business's own name is never listed as its own alias.
    expect(result.aliases).not.toContain("Kaspi");
  });

  it("respects a competitor the owner typed themselves", () => {
    // If the owner insists a same-prefix business is a rival, believe them.
    const result = resolveIdentity({
      brandName: "Kaspi",
      userAliases: [],
      researchAliases: [],
      declaredSubBrands: [],
      candidateCompetitors: ["Kaspi Bank"],
      userCompetitors: ["Kaspi Bank"],
    });
    expect(result.competitors).toEqual(["Kaspi Bank"]);
    expect(result.reclaimed).toHaveLength(0);
  });

  it("deduplicates case and spacing variants", () => {
    const result = resolveIdentity({
      brandName: "Coffee BOOM",
      userAliases: ["Coffee Boom"],
      researchAliases: ["COFFEE BOOM", "Кофе Бум"],
      declaredSubBrands: [],
      candidateCompetitors: ["Starbucks", "starbucks"],
      userCompetitors: [],
    });
    expect(result.competitors).toEqual(["Starbucks"]);
    expect(result.aliases).toContain("Кофе Бум");
    // "Coffee Boom" normalizes to the brand name itself, so it is not an alias.
    expect(result.aliases.filter((a) => a.toLowerCase() === "coffee boom")).toHaveLength(0);
  });
});
