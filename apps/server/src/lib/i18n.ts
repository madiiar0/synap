import fs from "node:fs";
import path from "node:path";
import { DEFAULT_LOCALE, type Locale } from "@synapai/shared";
import { repoRoot } from "../config/env.js";

type Dict = { [key: string]: string | Dict };

const dictionaries: Record<Locale, Dict> = {
  ru: JSON.parse(
    fs.readFileSync(path.join(repoRoot, "packages/shared/src/i18n/ru.json"), "utf8"),
  ) as Dict,
  en: JSON.parse(
    fs.readFileSync(path.join(repoRoot, "packages/shared/src/i18n/en.json"), "utf8"),
  ) as Dict,
};

/** Server-side translation for emails: dot-path lookup + {{var}} interpolation. */
export function t(
  locale: Locale | undefined,
  key: string,
  params: Record<string, string | number> = {},
): string {
  const dict = dictionaries[locale ?? DEFAULT_LOCALE];
  let node: string | Dict | undefined = dict;
  for (const part of key.split(".")) {
    if (typeof node !== "object" || node === undefined) break;
    node = node[part];
  }
  if (typeof node !== "string") return key;
  return node.replace(/\{\{(\w+)\}\}/g, (_, name: string) => String(params[name] ?? ""));
}
