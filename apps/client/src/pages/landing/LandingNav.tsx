import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Logo from "../../components/Logo";
import { currentLocale, setLocale } from "../../lib/i18n";

/**
 * §3 liquid-glass navbar: full-width transparent glass at the top,
 * morphing into a floating rounded island once scrolled (scrollY ≥ 32).
 * rAF-throttled scroll listener toggles a single class; the page reserves
 * top padding so content never jumps (the wrapper is fixed).
 */
export default function LandingNav(): JSX.Element {
  const { t } = useTranslation();
  const [island, setIsland] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = (): void => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        setIsland(window.scrollY >= 32);
        ticking.current = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="fixed inset-x-0 top-0 z-40">
      <div
        className={`nav-inner mx-auto flex items-center justify-between px-6 backdrop-blur-xl saturate-150 ${
          island ? "nav-inner-island" : "nav-inner-top"
        }`}
      >
        <Link to="/" aria-label="SynapAI">
          <Logo size={20} className="text-lg" />
        </Link>
        <div className="hidden items-center gap-8 text-sm text-sub md:flex">
          <a href="/#product" className="transition-colors hover:text-ink">
            {t("nav.product")}
          </a>
          <a href="/#how" className="transition-colors hover:text-ink">
            {t("nav.howItWorks")}
          </a>
          <a href="/#faq" className="transition-colors hover:text-ink">
            {t("nav.faq")}
          </a>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <button
            type="button"
            onClick={() => setLocale(currentLocale() === "ru" ? "en" : "ru")}
            className="text-sub transition-colors hover:text-ink"
          >
            {currentLocale() === "ru" ? "EN" : "RU"}
          </button>
          <Link to="/login" className="hidden text-sub transition-colors hover:text-ink sm:block">
            {t("nav.login")}
          </Link>
          <Link
            to="/scan"
            className="rounded-full bg-ink px-5 py-2 font-semibold text-white transition-opacity hover:opacity-85"
          >
            {t("nav.checkBrand")}
          </Link>
        </div>
      </div>
    </nav>
  );
}
