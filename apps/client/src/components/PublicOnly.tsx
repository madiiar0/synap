import { Navigate, useSearchParams } from "react-router-dom";
import { Skeleton } from "./ui";
import { useSession } from "../lib/queries";

/**
 * §1: routes that an authenticated user must never sit on (login, signup,
 * password recovery). Previously `/login` rendered regardless of session, so a
 * signed-in user opening it stayed on the form.
 *
 * While the session is unresolved this renders a neutral placeholder rather
 * than the form, which is what prevents the login page flashing for a user who
 * is in fact signed in.
 */

/** §1: only same-origin, absolute-path redirects are honoured. */
export function safeNext(raw: string | null): string {
  if (!raw) return "/app";
  // Reject protocol-relative ("//evil.com"), absolute URLs, and backslash
  // variants that some browsers normalise into a host.
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return "/app";
  if (/^\/+\\/.test(raw)) return "/app";
  try {
    // A parsed URL whose origin differs from ours is an open redirect attempt.
    const url = new URL(raw, window.location.origin);
    if (url.origin !== window.location.origin) return "/app";
    return url.pathname + url.search + url.hash;
  } catch {
    return "/app";
  }
}

export default function PublicOnly({ children }: { children: JSX.Element }): JSX.Element {
  const { state, user } = useSession();
  const [params] = useSearchParams();

  // Server-side render (prerender/SEO): there is no session to restore, so the
  // page must emit its real content rather than a loading placeholder.
  if (typeof window === "undefined") return children;

  if (state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <Skeleton className="h-8 w-40" />
      </div>
    );
  }

  if (state === "signedIn") {
    const next = safeNext(params.get("next"));
    const destination = user?.role === "admin" && next === "/app" ? "/admin" : next;
    return <Navigate to={destination} replace />;
  }

  return children;
}
