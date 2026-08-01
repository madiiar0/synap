/**
 * Auth-page quote carousel.
 *
 * Only the stable identity of each quote lives here: the id (used to look the
 * content up in the i18n bundles) and the author's name, which is a proper
 * noun and identical in every language. The quote text, the role line and the
 * net-worth figure are localized under `auth.quotes.<id>.*`, so switching
 * language re-renders them through `t()` with no page reload and no chance of
 * mixing languages.
 */
export interface Quote {
  id: string;
  author: string;
}

export const QUOTES: readonly Quote[] = [
  { id: "rauch", author: "Guillermo Rauch" },
  { id: "gates", author: "Bill Gates" },
  { id: "nadella", author: "Satya Nadella" },
  { id: "pichai", author: "Sundar Pichai" },
  { id: "shah", author: "Dharmesh Shah" },
];
