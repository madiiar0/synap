import { Navigate, useLocation } from "react-router-dom";
import { Skeleton } from "./ui";
import { useSession } from "../lib/queries";

/** §3: authenticated-only routes rendered outside the dashboard chrome. */
export default function RequireAuth({ children }: { children: JSX.Element }): JSX.Element {
  const { state } = useSession();
  const location = useLocation();

  if (state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <Skeleton className="h-8 w-40" />
      </div>
    );
  }
  if (state === "signedOut") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
