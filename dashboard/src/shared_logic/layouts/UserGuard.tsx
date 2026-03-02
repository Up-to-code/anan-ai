import { type ReactNode, useEffect, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { useSession } from "@/_core/lib/auth-client";
import { useRole } from "@/_core/hooks/useRole";
import { useConvexAuth } from "convex/react";

export default function UserGuard({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();
  const { isLoading: convexAuthLoading } = useConvexAuth();
  const role = useRole();
  const location = useLocation();
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);

  const isLoading = isPending || convexAuthLoading;

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
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (role !== "normal" && role !== "user" && location.pathname.includes("/dashboard/user")) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold">404</h1>
        <p className="text-muted-foreground">Not found</p>
        <a href="/" className="text-primary hover:underline">
          Go home
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
