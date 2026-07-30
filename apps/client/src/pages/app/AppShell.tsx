import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { SessionUserDto } from "@synapai/shared";
import { apiGet } from "../../lib/api";

/** Placeholder shell — the full dashboard/admin lands in P2/P4. */
export default function AppShell({ admin = false }: { admin?: boolean }): JSX.Element {
  const { t } = useTranslation();
  const { data: user, isError } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiGet<SessionUserDto>("/api/auth/me"),
    retry: false,
  });

  if (isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-sub">{t("auth.title")}</p>
        <Link to="/login" className="text-sm text-accent underline">
          {t("nav.login")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center text-sub">
      {user ? `${admin ? "Admin" : "Dashboard"} — ${user.email}` : t("common.loading")}
    </div>
  );
}
