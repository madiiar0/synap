import coffeeBoom from "../assets/brand-logos/coffee-boom.png";
import globalCoffee from "../assets/brand-logos/global-coffee.png";
import masterCoffee from "../assets/brand-logos/master-coffee.jpg";

/**
 * Real coffee-brand logos (owner-provided). Looked up case-insensitively,
 * ignoring spaces; components fall back to an initial-letter square when a
 * name is missing here.
 */
const LOGOS: Record<string, string> = {
  coffeeboom: coffeeBoom,
  globalcoffee: globalCoffee,
  mastercoffee: masterCoffee,
};

export function brandLogo(name: string): string | undefined {
  return LOGOS[name.toLowerCase().replace(/[\s_-]+/g, "")];
}
