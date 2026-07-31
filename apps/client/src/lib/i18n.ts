import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { localizedPublicPath, type Locale, type PublicPath } from "@synapai/shared";
import en from "@synapai/shared/i18n/en.json";
import ru from "@synapai/shared/i18n/ru.json";

const STORAGE_KEY = "synapai_locale";
const isBrowser = typeof window !== "undefined";

/**
 * §1.4: the language is reflected in the URL for public routes (/en prefix),
 * so each language is independently crawlable. URL wins over localStorage.
 */
function initialLocale(): Locale {
  if (!isBrowser) return "ru";
  const path = window.location.pathname;
  if (path === "/en" || path.startsWith("/en/")) return "en";
  if (path === "/" || path === "/scan" || path === "/login") return "ru";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "en" || stored === "ru" ? stored : "ru";
}

void i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    en: { translation: en },
  },
  lng: initialLocale(),
  fallbackLng: "ru",
  interpolation: { escapeValue: false },
});

if (isBrowser) {
  document.documentElement.lang = initialLocale();
}

function publicBasePath(pathname: string): PublicPath | null {
  const stripped =
    pathname === "/en" ? "/" : pathname.startsWith("/en/") ? pathname.slice(3) : pathname;
  return stripped === "/" || stripped === "/scan" || stripped === "/login"
    ? (stripped as PublicPath)
    : null;
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
  return i18n.language === "en" ? "en" : "ru";
}

/** Locale-aware link target for public routes (keeps the /en prefix). */
export function localizedPath(path: PublicPath): string {
  return localizedPublicPath(path, currentLocale());
}

export default i18n;
