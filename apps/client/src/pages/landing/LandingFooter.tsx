import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Logo from "../../components/Logo";
import { nextLocale, setLocale, localizedPath } from "../../lib/i18n";

export default function LandingFooter(): JSX.Element {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-line bg-base py-10">
      <div className="mx-auto flex max-w-container flex-col items-center justify-between gap-6 px-6 sm:flex-row sm:items-start">
        <Logo size={16} className="text-sm" />
        <nav aria-label={t("nav.footer")} className="flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-sub sm:justify-end">
          <Link to={localizedPath("/product")} className="hover:text-ink">{t("nav.product")}</Link>
          <Link to={localizedPath("/methodology")} className="hover:text-ink">{t("nav.methodology")}</Link>
          <Link to={localizedPath("/docs")} className="hover:text-ink">{t("nav.docs")}</Link>
          <Link to={localizedPath("/blogs")} className="hover:text-ink">{t("nav.blogs")}</Link>
          <Link to={localizedPath("/about")} className="hover:text-ink">{t("nav.about")}</Link>
          <Link to={localizedPath("/faq")} className="hover:text-ink">{t("nav.faq")}</Link>
          <Link to={localizedPath("/contact")} className="hover:text-ink">{t("nav.contact")}</Link>
          <Link to={localizedPath("/privacy")} className="hover:text-ink">{t("nav.privacy")}</Link>
          <Link to={localizedPath("/terms")} className="hover:text-ink">{t("nav.terms")}</Link>
          <Link to={localizedPath("/login")} className="hover:text-ink">
            {t("nav.login")}
          </Link>
          <button
            type="button"
            onClick={() => setLocale(nextLocale())}
            className="hover:text-ink"
          >
            {nextLocale().toUpperCase()}
          </button>
        </nav>
      </div>
      <p className="mt-6 px-6 text-center text-xs text-sub">{t("common.copyright")}</p>
    </footer>
  );
}
