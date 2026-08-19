import { DEFAULT_LOCALE, type Locale } from "@synapai/shared";
import en from "@synapai/shared/i18n/en.json" with { type: "json" };
import kk from "@synapai/shared/i18n/kk.json" with { type: "json" };
import ru from "@synapai/shared/i18n/ru.json" with { type: "json" };

type Dict = { [key: string]: string | Dict };

const dictionaries: Record<Locale, Dict> = {
  ru: ru as Dict,
  en: en as Dict,
  kk: kk as Dict,
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
