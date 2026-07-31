import { useTranslation } from "react-i18next";
import LandingNav from "./landing/LandingNav";
import ScanForm from "./landing/ScanForm";

/** §5.2: the scan page hosts the form; sign-in happens before the scan
 * starts, with the entered data carried through the redirect. */
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
      <footer className="border-t border-line py-8 text-center text-xs text-sub">
        {t("common.copyright")}
      </footer>
    </div>
  );
}
