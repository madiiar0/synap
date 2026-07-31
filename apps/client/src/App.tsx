import { Route, Routes } from "react-router-dom";
import Toaster from "./components/Toaster";
import AuthVerify from "./pages/AuthVerify";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ScanPage from "./pages/ScanPage";
import ScanProgress from "./pages/ScanProgress";
import Teaser from "./pages/Teaser";
import AppShell from "./pages/app/AppShell";

export default function App(): JSX.Element {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/scan/:id" element={<ScanProgress />} />
        <Route path="/scan/:id/teaser" element={<Teaser />} />
        <Route path="/auth/verify" element={<AuthVerify />} />
        <Route path="/login" element={<Login />} />
        <Route path="/app/*" element={<AppShell />} />
        <Route path="/admin/*" element={<AppShell admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
