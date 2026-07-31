import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import QuotaModal from "./components/QuotaModal";
import Toaster from "./components/Toaster";
import { currentLocale, setLocale } from "./lib/i18n";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ScanPage from "./pages/ScanPage";
import ScanProgress from "./pages/ScanProgress";
import AppShell from "./pages/app/AppShell";

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
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/en" element={<EnRoute><Landing /></EnRoute>} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/en/scan" element={<EnRoute><ScanPage /></EnRoute>} />
        <Route path="/scan/:id" element={<ScanProgress />} />
        <Route path="/login" element={<Login />} />
        <Route path="/en/login" element={<EnRoute><Login /></EnRoute>} />
        <Route path="/app/*" element={<AppShell />} />
        <Route path="/admin/*" element={<AppShell admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
