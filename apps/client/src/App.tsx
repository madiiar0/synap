import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import QuotaModal from "./components/QuotaModal";
import VerifyEmailModal from "./components/VerifyEmailModal";
import Toaster from "./components/Toaster";
import { currentLocale, setLocale } from "./lib/i18n";
import EnvBanners from "./components/EnvBanners";
import RequireAuth from "./components/RequireAuth";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ScanProgress from "./pages/ScanProgress";
import VerifyEmail from "./pages/VerifyEmail";
import AppShell from "./pages/app/AppShell";
import Onboarding from "./pages/app/Onboarding";

/** §1.4: /en-prefixed public routes render the English variant. */
function EnRoute({ children }: { children: JSX.Element }): JSX.Element {
  useEffect(() => {
    if (currentLocale() !== "en") setLocale("en");
  }, []);
  return children;
}

export default function App(): JSX.Element {
  return (
    <>
      <Toaster />
      <QuotaModal />
      <VerifyEmailModal />
      <EnvBanners />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/en" element={<EnRoute><Landing /></EnRoute>} />
        <Route path="/scan/:id" element={<ScanProgress />} />
        <Route path="/login" element={<Login />} />
        <Route path="/en/login" element={<EnRoute><Login /></EnRoute>} />
        <Route path="/verify-email" element={<RequireAuth><VerifyEmail /></RequireAuth>} />
        {/* §3: onboarding is authenticated but renders without the dashboard chrome. */}
        <Route path="/app/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
        <Route path="/app/*" element={<AppShell />} />
        <Route path="/admin/*" element={<AppShell admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
