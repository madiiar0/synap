import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { SessionUserDto } from "@synapai/shared";
import { apiPost } from "../lib/api";

export default function AuthVerify(): JSX.Element {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);
  const attempted = useRef(false);

  useEffect(() => {
    const token = params.get("token");
    if (!token || attempted.current) {
      if (!token) setFailed(true);
      return;
    }
    attempted.current = true;
    apiPost<SessionUserDto>("/api/auth/verify", { token })
      .then((user) => navigate(user.role === "admin" ? "/admin" : "/app", { replace: true }))
      .catch(() => setFailed(true));
  }, [params, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      {failed ? (
        <>
          <p className="text-lg">{t("auth.verifyFailed")}</p>
          <Link to="/login" className="text-sm text-accent underline">
            {t("nav.login")}
          </Link>
        </>
      ) : (
        <p className="text-sub">{t("auth.verifying")}</p>
      )}
    </div>
  );
}
