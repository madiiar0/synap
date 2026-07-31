import { useTranslation } from "react-i18next";
import LandingNav from "./landing/LandingNav";
import ScanForm from "./landing/ScanForm";

/** The scan form's own light page: every "check" CTA routes here. */
export default function ScanPage(): JSX.Element {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col bg-base text-ink">
      <LandingNav />
      <main className="mx-auto w-full max-w-container flex-1 px-6 pb-24 pt-40">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
            {t("landing.scanPage.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sub">{t("landing.scanPage.subtitle")}</p>
        </div>
        <div className="mt-12">
          <ScanForm />
        </div>
      </main>
      {/* No duplicated nav links here (§12): just the copyright line. */}
      <footer className="border-t border-line py-8 text-center text-xs text-sub">
        {t("common.copyright")}
      </footer>
    </div>
  );
}
