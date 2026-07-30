import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import type { Locale } from "@synapai/shared";
import en from "@synapai/shared/i18n/en.json";
import ru from "@synapai/shared/i18n/ru.json";

const STORAGE_KEY = "synapai_locale";

function initialLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY);
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

export function setLocale(locale: Locale): void {
  localStorage.setItem(STORAGE_KEY, locale);
  void i18n.changeLanguage(locale);
}

export function currentLocale(): Locale {
  return i18n.language === "en" ? "en" : "ru";
}

export default i18n;
