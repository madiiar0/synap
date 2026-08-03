import { Menu, X } from "lucide-react";
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
  const [menuOpen, setMenuOpen] = useState(false);
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

  const links = [
    { href: `${localizedPath("/")}#product`, label: t("nav.product") },
    { href: `${localizedPath("/")}#how`, label: t("nav.howItWorks") },
    { href: `${localizedPath("/")}#faq`, label: t("nav.faq") },
    { href: localizedPath("/blogs"), label: t("nav.blogs") },
  ];

  return (
    <nav className="fixed inset-x-0 top-0 z-40">
      {/* §5: below md the island morph is replaced by a plain solid bar. */}
      <div
        className={`nav-inner mx-auto flex items-center justify-between px-4 backdrop-blur-xl saturate-150 sm:px-6 ${
          island ? "md:nav-inner-island nav-inner-top" : "nav-inner-top"
        }`}
      >
        <Link to={localizedPath("/")} aria-label="Synap">
          <Logo size={20} className="text-lg" />
        </Link>
        <div className="hidden items-center gap-8 text-sm text-sub md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-ink">
              {link.label}
            </a>
          ))}
        </div>
        {/* §5: mobile shows only a hamburger; everything moves into the sheet. */}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label={t("nav.openMenu")}
          aria-expanded={menuOpen}
          className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-ink md:hidden"
        >
          <Menu size={22} />
        </button>

        <div className="hidden items-center gap-4 text-sm md:flex">
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

      {/* §5: full-screen mobile sheet with every nav action. */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-base md:hidden"
          style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between px-4 py-4">
            <Logo size={20} className="text-lg" />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label={t("nav.closeMenu")}
              className="flex h-11 w-11 items-center justify-center rounded-full text-ink"
            >
              <X size={22} />
            </button>
          </div>
          <div className="flex flex-1 flex-col gap-1 px-4 pt-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex min-h-[44px] items-center border-b border-line py-3 text-lg text-ink"
              >
                {link.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => {
                setLocale(currentLocale() === "ru" ? "en" : "ru");
                setMenuOpen(false);
              }}
              className="flex min-h-[44px] items-center border-b border-line py-3 text-left text-lg text-sub"
            >
              {t("nav.switchLanguage")}
            </button>

            <div className="mt-auto flex flex-col gap-3 py-6">
              {session.state === "signedIn" ? (
                <Link
                  to="/app"
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-[48px] items-center justify-center rounded-full bg-ink px-6 text-[1rem] font-semibold text-white"
                >
                  {t("nav.dashboard")}
                </Link>
              ) : (
                <>
                  <Link
                    to={localizedPath("/login")}
                    onClick={() => setMenuOpen(false)}
                    className="flex min-h-[48px] items-center justify-center rounded-full border border-line bg-white px-6 text-[1rem] font-medium text-ink"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    to={localizedPath("/login")}
                    onClick={() => setMenuOpen(false)}
                    className="flex min-h-[48px] items-center justify-center rounded-full bg-ink px-6 text-[1rem] font-semibold text-white"
                  >
                    {t("nav.checkBrand")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
