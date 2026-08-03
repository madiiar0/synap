import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { localizedPath } from "../lib/i18n";
import { useSession } from "../lib/queries";
import { trackPublicEvent } from "../lib/publicAnalytics";

/**
 * §1: the single entry point into the funnel. Signed out it goes to sign-in,
 * signed in it goes straight to the dashboard. While the session resolves it
 * renders a neutral placeholder of the same size, so the signed-out label
 * never flashes for an authenticated visitor.
 */
export default function StartCta({
  className = "",
  label,
}: {
  className?: string;
  label?: string;
}): JSX.Element {
  const { t } = useTranslation();
  const { state } = useSession();

  if (state === "loading") {
    return (
      <span
        aria-hidden
        className={`pointer-events-none inline-block animate-pulse rounded-full bg-[#EDEDED] text-transparent ${className}`}
      >
        {label ?? t("nav.checkBrand")}
      </span>
    );
  }

  const signedIn = state === "signedIn";
  return (
    <Link
      to={signedIn ? "/app" : localizedPath("/login")}
      className={className}
      onClick={() => trackPublicEvent("signup_intent")}
    >
      {signedIn ? t("nav.dashboard") : (label ?? t("nav.checkBrand"))}
    </Link>
  );
}
