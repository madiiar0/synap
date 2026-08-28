import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import {
  DEFAULT_LOCALE,
  LOCALE_PREFIX,
  LOCALES,
  localizedPublicPath,
  parseLocalizedPublicPath,
  type Locale,
  type PublicPath,
} from "@synapai/shared";
import en from "@synapai/shared/i18n/en.json";
import kk from "@synapai/shared/i18n/kk.json";
import ru from "@synapai/shared/i18n/ru.json";

const STORAGE_KEY = "synapai_locale";
const isBrowser = typeof window !== "undefined";

/**
 * §1.4: the language is reflected in the URL for public routes (/en prefix),
 * so each language is independently crawlable. URL wins over localStorage.
 */
function initialLocale(): Locale {
  if (!isBrowser) return DEFAULT_LOCALE;
  const path = window.location.pathname;
  for (const locale of LOCALES) {
    const prefix = LOCALE_PREFIX[locale];
    if (prefix && (path === prefix || path.startsWith(`${prefix}/`))) return locale;
  }
  if (path === "/" || path === "/login") return DEFAULT_LOCALE;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return (LOCALES as readonly string[]).includes(stored ?? "") ? (stored as Locale) : DEFAULT_LOCALE;
}

void i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    en: { translation: en },
    kk: { translation: kk },
  },
  lng: initialLocale(),
  fallbackLng: "ru",
  interpolation: { escapeValue: false },
});

if (isBrowser) {
  document.documentElement.lang = initialLocale();
}

function publicBasePath(pathname: string): PublicPath | null {
  return parseLocalizedPublicPath(pathname)?.path ?? null;
}

export function setLocale(locale: Locale): void {
  if (isBrowser) {
    window.localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    // Keep the URL in sync on public routes so the language stays indexable.
    const base = publicBasePath(window.location.pathname);
    if (base) {
      const target = localizedPublicPath(base, locale) + window.location.hash;
      window.history.replaceState(null, "", target);
    }
  }
  void i18n.changeLanguage(locale);
}

export function currentLocale(): Locale {
  return (LOCALES as readonly string[]).includes(i18n.language)
    ? (i18n.language as Locale)
    : DEFAULT_LOCALE;
}

/** Locale-aware link target for public routes (keeps the /en prefix). */
/**
 * The locale the switcher moves to next, cycling through LOCALES in order.
 * `setLocale` rewrites the URL to the same route in the new locale, so a reader
 * on /en/methodology lands on /kk/methodology rather than the home page.
 */
export function nextLocale(): Locale {
  const order = LOCALES as readonly Locale[];
  return order[(order.indexOf(currentLocale()) + 1) % order.length];
}

export function localizedPath(path: PublicPath): string {
  return localizedPublicPath(path, currentLocale());
}

export default i18n;
