import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { PrivatePageMetadata } from "../components/PageMetadata";
import { localizedPath } from "../lib/i18n";

export default function NotFound(): JSX.Element {
  const { t } = useTranslation();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <PrivatePageMetadata title={t("notFound.title")} />
      <p className="text-sm font-semibold text-sub">404</p>
      <h1 className="text-4xl font-semibold tracking-tight">{t("notFound.title")}</h1>
      <p className="max-w-md text-sm leading-6 text-sub">{t("notFound.body")}</p>
      <Link to={localizedPath("/")} className="text-sm text-accent underline">
        {t("common.back")}
      </Link>
    </main>
  );
}
