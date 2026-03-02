import { type ReactNode, useEffect, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { useSession } from "@/_core/lib/auth-client";
import { useRole } from "@/_core/hooks/useRole";
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "convex/_generated/api";

export default function REDGuard({ children }: { children: ReactNode }) {
  const { data: session, isPending: sessionPending } = useSession();
  const { isLoading: convexAuthLoading } = useConvexAuth();
  const role = useRole();
  const location = useLocation();
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);

  const profile = useQuery(
    api.shared_logic.dashboard.queries.getUserProfile,
    session?.user?.id ? { authUserId: session.user.id } : "skip",
  );

  const redRecord = useQuery(
    api.shared_logic.dashboard.queries.getRED,
    profile?.REDId ? { redId: profile.REDId } : "skip",
  );

  const isLoading =
    sessionPending ||
    convexAuthLoading ||
    (session?.user?.id && profile === undefined) ||
    (profile?.REDId && redRecord === undefined);

  useEffect(() => {
    if (!isLoading) {
      setLoadingTimedOut(false);
      return;
    }
    const timer = setTimeout(() => setLoadingTimedOut(true), 6000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (!loadingTimedOut && isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (role !== "RED" && location.pathname.includes("/dashboard/red")) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
