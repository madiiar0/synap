import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import {
  LEGACY_PUBLIC_REDIRECTS,
  localizedPublicPath,
  PUBLIC_PATHS,
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

/** §1.4: /en-prefixed public routes render the English variant. */
function EnRoute({ children }: { children: JSX.Element }): JSX.Element {
  useEffect(() => {
    if (currentLocale() !== "en") setLocale("en");
  }, []);
  return children;
}

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
        <Route path="/en" element={<EnRoute><Landing /></EnRoute>} />
        {contentPaths.map((path) => (
          <Route key={path} path={path} element={<PublicPage />} />
        ))}
        {contentPaths.map((path) => (
          <Route key={`/en${path}`} path={`/en${path}`} element={<EnRoute><PublicPage /></EnRoute>} />
        ))}
        {LEGACY_PUBLIC_REDIRECTS.map(({ from, to }) => (
          <Route
            key={from}
            path={from}
            element={<LegacyPublicRedirect to={localizedPublicPath(to, "ru")} />}
          />
        ))}
        {LEGACY_PUBLIC_REDIRECTS.map(({ from, to }) => (
          <Route
            key={`/en${from}`}
            path={`/en${from}`}
            element={<LegacyPublicRedirect to={localizedPublicPath(to, "en")} />}
          />
        ))}
        <Route path="/scan/:id" element={<Suspense fallback={null}><ScanProgress /></Suspense>} />
        <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
        <Route
          path="/en/login"
          element={<PublicOnly><EnRoute><Login /></EnRoute></PublicOnly>}
        />
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
