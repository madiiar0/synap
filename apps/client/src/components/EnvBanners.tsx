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
  if (!memory && !mockAuth) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-wrap items-center justify-center gap-2 p-2">
      {memory && (
        <p
          role="status"
          className="pointer-events-auto rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 text-center text-xs font-medium text-amber-900 shadow-sm"
        >
          {t("env.memoryDb")}
        </p>
      )}
      {mockAuth && (
        <p
          role="status"
          className="pointer-events-auto rounded-full border border-amber-300 bg-amber-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-amber-900 shadow-sm"
        >
          {t("env.mockAuth")}
        </p>
      )}
    </div>
  );
}
