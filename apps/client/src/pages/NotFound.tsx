import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function NotFound(): JSX.Element {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p className="text-4xl font-semibold tracking-tight">404</p>
      <Link to="/" className="text-sm text-accent underline">
        {t("common.back")}
      </Link>
    </div>
  );
}
