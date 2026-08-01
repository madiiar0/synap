import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Logo from "../../components/Logo";
import { apiPost } from "../../lib/api";
import { currentLocale, setLocale, localizedPath } from "../../lib/i18n";
import { useSession } from "../../lib/queries";

/** §1: avatar menu for a signed-in visitor on the public pages. */
function AccountMenu({ email }: { email: string }): JSX.Element {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDocClick = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("nav.account")}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-sm font-semibold uppercase text-ink transition-colors hover:border-[#D4D4D4]"
      >
        {email.charAt(0)}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-11 w-56 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-lg"
        >
          <p className="truncate px-4 py-2 text-xs text-sub">{email}</p>
          <Link
            to="/app"
            role="menuitem"
            className="block px-4 py-2 text-sm text-ink transition-colors hover:bg-base"
          >
            {t("nav.dashboard")}
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              void apiPost("/api/auth/logout").then(() => {
                window.location.href = localizedPath("/");
              });
            }}
            className="block w-full px-4 py-2 text-left text-sm text-sub transition-colors hover:bg-base hover:text-ink"
          >
            {t("common.logout")}
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * §3 liquid-glass navbar: full-width transparent glass at the top,
 * morphing into a floating rounded island once scrolled (scrollY ≥ 32).
 * rAF-throttled scroll listener toggles a single class; the page reserves
 * top padding so content never jumps (the wrapper is fixed).
 */
export default function LandingNav(): JSX.Element {
  const { t } = useTranslation();
  const session = useSession();
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
        <Link to={localizedPath("/")} aria-label="SynapAI">
          <Logo size={20} className="text-lg" />
        </Link>
        <div className="hidden items-center gap-8 text-sm text-sub md:flex">
          <a href={`${localizedPath("/")}#product`.replace("//#", "/#")} className="transition-colors hover:text-ink">
            {t("nav.product")}
          </a>
          <a href={`${localizedPath("/")}#how`.replace("//#", "/#")} className="transition-colors hover:text-ink">
            {t("nav.howItWorks")}
          </a>
          <a href={`${localizedPath("/")}#faq`.replace("//#", "/#")} className="transition-colors hover:text-ink">
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
          {/* §1: signed in shows one primary pill plus the account menu;
              while resolving, a same-size placeholder avoids a state flash. */}
          {session.state === "loading" && (
            <span
              aria-hidden
              className="inline-block animate-pulse rounded-full bg-[#EDEDED] px-5 py-2 font-semibold text-transparent"
            >
              {t("nav.checkBrand")}
            </span>
          )}
          {session.state === "signedOut" && (
            <>
              <Link
                to={localizedPath("/login")}
                className="hidden rounded-full border border-line bg-white px-4 py-2 font-medium text-ink transition-colors hover:border-[#D4D4D4] sm:block"
              >
                {t("nav.login")}
              </Link>
              <Link
                to={localizedPath("/login")}
                className="rounded-full bg-ink px-5 py-2 font-semibold text-white transition-opacity hover:opacity-85"
              >
                {t("nav.checkBrand")}
              </Link>
            </>
          )}
          {session.state === "signedIn" && session.user && (
            <>
              <Link
                to="/app"
                className="rounded-full bg-ink px-5 py-2 font-semibold text-white transition-opacity hover:opacity-85"
              >
                {t("nav.dashboard")}
              </Link>
              <AccountMenu email={session.user.email} />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
