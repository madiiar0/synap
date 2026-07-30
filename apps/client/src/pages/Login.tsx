import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import type { SessionUserDto } from "@synapai/shared";
import { apiPost } from "../lib/api";
import { currentLocale } from "../lib/i18n";

export default function Login(): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminMode, setAdminMode] = useState(false);

  const requestLink = useMutation({
    mutationFn: () => apiPost("/api/auth/request-link", { email, locale: currentLocale() }),
  });

  const adminLogin = useMutation({
    mutationFn: () => apiPost<SessionUserDto>("/api/auth/login", { email, password }),
    onSuccess: (user) => navigate(user.role === "admin" ? "/admin" : "/app"),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-6">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8">
        <Link to="/" className="text-lg font-bold tracking-tight">
          {t("common.brand")}
        </Link>
        <h1 className="mt-6 text-xl font-semibold tracking-tight">
          {adminMode ? t("auth.adminTitle") : t("auth.title")}
        </h1>
        {!adminMode && <p className="mt-1 text-sm text-sub">{t("auth.requestText")}</p>}

        {requestLink.isSuccess && !adminMode ? (
          <p className="mt-6 text-sm">{t("auth.requestSent")}</p>
        ) : (
          <div className="mt-6 space-y-3">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder={t("common.emailPlaceholder")}
              className="w-full rounded-xl border border-line bg-base px-4 py-3 text-sm outline-none focus:border-ink"
            />
            {adminMode && (
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder={t("auth.password")}
                className="w-full rounded-xl border border-line bg-base px-4 py-3 text-sm outline-none focus:border-ink"
              />
            )}
            {(requestLink.isError || adminLogin.isError) && (
              <p className="text-sm text-red-500">{t("common.error")}</p>
            )}
            <button
              type="button"
              disabled={requestLink.isPending || adminLogin.isPending || !email.includes("@")}
              onClick={() => (adminMode ? adminLogin.mutate() : requestLink.mutate())}
              className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white disabled:opacity-40"
            >
              {adminMode ? t("auth.loginButton") : t("auth.requestButton")}
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setAdminMode((v) => !v)}
          className="mt-6 text-xs text-sub hover:text-ink"
        >
          {adminMode ? t("auth.title") : t("auth.adminTitle")}
        </button>
      </div>
    </div>
  );
}
