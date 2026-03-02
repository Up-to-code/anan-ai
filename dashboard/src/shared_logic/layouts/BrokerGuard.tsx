import { type ReactNode, useEffect, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { useSession } from "@/_core/lib/auth-client";
import { useRole } from "@/_core/hooks/useRole";
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "convex/_generated/api";

export default function BrokerGuard({ children }: { children: ReactNode }) {
  const { data: session, isPending: sessionPending } = useSession();
  const { isLoading: convexAuthLoading } = useConvexAuth();
  const role = useRole();
  const location = useLocation();
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);

  const profile = useQuery(
    api.shared_logic.dashboard.queries.getUserProfile,
    session?.user?.id ? { authUserId: session.user.id } : "skip",
  );

  const brokerRecord = useQuery(
    api.shared_logic.dashboard.queries.getBroker,
    profile?.brokerId ? { brokerId: profile.brokerId } : "skip",
  );

  const isLoading =
    sessionPending ||
    convexAuthLoading ||
    (session?.user?.id && profile === undefined) ||
    (profile?.brokerId && brokerRecord === undefined);

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

  if (role !== "broker" && location.pathname.includes("/dashboard/broker")) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
