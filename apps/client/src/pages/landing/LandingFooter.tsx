import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Logo from "../../components/Logo";
import { currentLocale, setLocale, localizedPath } from "../../lib/i18n";

export default function LandingFooter(): JSX.Element {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-line bg-base py-10">
      <div className="mx-auto flex max-w-container flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <Logo size={16} className="text-sm" />
        <div className="flex items-center gap-6 text-sm text-sub">
          <a href={`${localizedPath("/")}#how`.replace("//#", "/#")} className="hover:text-ink">
            {t("nav.howItWorks")}
          </a>
          <a href={`${localizedPath("/")}#faq`.replace("//#", "/#")} className="hover:text-ink">
            {t("nav.faq")}
          </a>
          <Link to={localizedPath("/login")} className="hover:text-ink">
            {t("nav.login")}
          </Link>
          <button
            type="button"
            onClick={() => setLocale(currentLocale() === "ru" ? "en" : "ru")}
            className="hover:text-ink"
          >
            {currentLocale() === "ru" ? "EN" : "RU"}
          </button>
        </div>
      </div>
      <p className="mt-6 px-6 text-center text-xs text-sub">{t("common.copyright")}</p>
    </footer>
  );
}
