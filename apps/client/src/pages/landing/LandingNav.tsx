import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { currentLocale, setLocale } from "../../lib/i18n";

/** Sticky nav: transparent over the dark hero → solid dark surface on scroll. */
export default function LandingNav(): JSX.Element {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled ? "border-b border-darkline bg-dark/90 backdrop-blur" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-container items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-darktext">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-accent" aria-hidden />
          {t("common.brand")}
        </Link>
        <div className="hidden items-center gap-8 text-sm text-sub md:flex">
          <a href="#product" className="transition-colors hover:text-darktext">
            {t("nav.product")}
          </a>
          <a href="#how" className="transition-colors hover:text-darktext">
            {t("nav.howItWorks")}
          </a>
          <a href="#faq" className="transition-colors hover:text-darktext">
            {t("nav.faq")}
          </a>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <button
            type="button"
            onClick={() => setLocale(currentLocale() === "ru" ? "en" : "ru")}
            className="text-sub transition-colors hover:text-darktext"
          >
            {currentLocale() === "ru" ? "EN" : "RU"}
          </button>
          <Link to="/login" className="hidden text-sub transition-colors hover:text-darktext sm:block">
            {t("nav.login")}
          </Link>
          <a
            href="#scan-form"
            className="rounded-full bg-white px-5 py-2 font-semibold text-ink transition-opacity hover:opacity-90"
          >
            {t("nav.checkBrand")}
          </a>
        </div>
      </div>
    </nav>
  );
}
