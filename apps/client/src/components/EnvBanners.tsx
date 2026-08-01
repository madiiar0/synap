import { useTranslation } from "react-i18next";
import { useAppConfig } from "./BookCallButton";

/**
 * §0.1/§0.2: two development-only warnings that must never be mistaken for a
 * UI bug: an in-memory database (nothing persists) and mock auth (no real
 * sign-in). Fixed to the bottom so no page layout shifts.
 */
export default function EnvBanners(): JSX.Element | null {
  const { t } = useTranslation();
  const config = useAppConfig();
  if (!config) return null;

  const memory = config.memoryDb;
  const mockAuth = config.isDev && config.authMode === "mock";
  const demo = config.demo;
  if (!memory && !mockAuth && !demo) return null;

  return (
    <div
      // §5: sit ABOVE the mobile bottom tab bar so navigation is never covered.
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-wrap items-center justify-center gap-1.5 px-2 pb-[calc(4.25rem+env(safe-area-inset-bottom))] pt-2 md:gap-2 md:pb-2"
    >
      {/* §1.1: fixtures are not real data, so this says so everywhere. */}
      {demo && (
        <p
          role="status"
          className="pointer-events-auto rounded-full border border-amber-400 bg-amber-100 px-3 py-1 text-center text-[11px] font-semibold text-amber-900 shadow-sm"
        >
          {t("env.demoMode")}
        </p>
      )}
      {memory && (
        <p
          role="status"
          className="pointer-events-auto rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-center text-[11px] font-medium text-amber-900 shadow-sm"
        >
          {t("env.memoryDb")}
        </p>
      )}
      {mockAuth && (
        <p
          role="status"
          className="pointer-events-auto rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-900 shadow-sm"
        >
          {t("env.mockAuth")}
        </p>
      )}
    </div>
  );
}
