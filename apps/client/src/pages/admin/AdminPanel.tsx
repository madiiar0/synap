import { useTranslation } from "react-i18next";

/** Placeholder — the full admin panel (leads/scans/usage/engines) lands in P4. */
export default function AdminPanel(): JSX.Element {
  const { t } = useTranslation();
  return <div className="py-24 text-center text-sub">{t("admin.title")} — P4</div>;
}
