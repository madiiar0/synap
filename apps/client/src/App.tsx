import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import {
  DEFAULT_LOCALE,
  LEGACY_PUBLIC_REDIRECTS,
  LOCALE_PREFIX,
  LOCALES,
  localizedPublicPath,
  PUBLIC_PATHS,
  type Locale,
} from "@synapai/shared";
import QuotaModal from "./components/QuotaModal";
import VerifyEmailModal from "./components/VerifyEmailModal";
import Toaster from "./components/Toaster";
import { currentLocale, setLocale } from "./lib/i18n";
import EnvBanners from "./components/EnvBanners";
import PublicOnly from "./components/PublicOnly";
import RequireAuth from "./components/RequireAuth";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import PublicPage from "./pages/PublicPage";

// Keep authenticated dashboard/chart code out of the public marketing bundle.
const ScanProgress = lazy(() => import("./pages/ScanProgress"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const AppShell = lazy(() => import("./pages/app/AppShell"));
const Onboarding = lazy(() => import("./pages/app/Onboarding"));

/**
 * §1.4: a prefixed public route renders that locale's variant. The default
 * locale is served unprefixed and needs no wrapper, so this is registered only
 * for the additional locales.
 */
function LocaleRoute({ locale, children }: { locale: Locale; children: JSX.Element }): JSX.Element {
  useEffect(() => {
    if (currentLocale() !== locale) setLocale(locale);
  }, [locale]);
  return children;
}

/** Every locale served under a prefix, i.e. all but the default. */
const PREFIXED_LOCALES = LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);

function LegacyPublicRedirect({ to }: { to: string }): JSX.Element {
  const location = useLocation();
  return <Navigate replace to={`${to}${location.search}${location.hash}`} />;
}

export default function App(): JSX.Element {
  const contentPaths = PUBLIC_PATHS.filter((path) => path !== "/" && path !== "/login");
  return (
    <>
      <Toaster />
      <QuotaModal />
      <VerifyEmailModal />
      <EnvBanners />
      <Routes>
        <Route path="/" element={<Landing />} />
        {PREFIXED_LOCALES.map((locale) => (
          <Route
            key={LOCALE_PREFIX[locale]}
            path={LOCALE_PREFIX[locale]}
            element={<LocaleRoute locale={locale}><Landing /></LocaleRoute>}
          />
        ))}
        {contentPaths.map((path) => (
          <Route key={path} path={path} element={<PublicPage />} />
        ))}
        {PREFIXED_LOCALES.flatMap((locale) =>
          contentPaths.map((path) => (
            <Route
              key={`${LOCALE_PREFIX[locale]}${path}`}
              path={`${LOCALE_PREFIX[locale]}${path}`}
              element={<LocaleRoute locale={locale}><PublicPage /></LocaleRoute>}
            />
          )),
        )}
        {LEGACY_PUBLIC_REDIRECTS.map(({ from, to }) => (
          <Route
            key={from}
            path={from}
            element={<LegacyPublicRedirect to={localizedPublicPath(to, DEFAULT_LOCALE)} />}
          />
        ))}
        {PREFIXED_LOCALES.flatMap((locale) =>
          LEGACY_PUBLIC_REDIRECTS.map(({ from, to }) => (
            <Route
              key={`${LOCALE_PREFIX[locale]}${from}`}
              path={`${LOCALE_PREFIX[locale]}${from}`}
              element={<LegacyPublicRedirect to={localizedPublicPath(to, locale)} />}
            />
          )),
        )}
        <Route path="/scan/:id" element={<Suspense fallback={null}><ScanProgress /></Suspense>} />
        <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
        {PREFIXED_LOCALES.map((locale) => (
          <Route
            key={`${LOCALE_PREFIX[locale]}/login`}
            path={`${LOCALE_PREFIX[locale]}/login`}
            element={
              <PublicOnly>
                <LocaleRoute locale={locale}><Login /></LocaleRoute>
              </PublicOnly>
            }
          />
        ))}
        <Route path="/verify-email" element={<RequireAuth><Suspense fallback={null}><VerifyEmail /></Suspense></RequireAuth>} />
        {/* §3: onboarding is authenticated but renders without the dashboard chrome. */}
        <Route path="/app/onboarding" element={<RequireAuth><Suspense fallback={null}><Onboarding /></Suspense></RequireAuth>} />
        <Route path="/app/*" element={<Suspense fallback={null}><AppShell /></Suspense>} />
        <Route path="/admin/*" element={<Suspense fallback={null}><AppShell admin /></Suspense>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
