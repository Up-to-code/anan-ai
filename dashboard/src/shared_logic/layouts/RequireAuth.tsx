import { useState, useEffect, type ReactNode } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { useSession } from "@/_core/lib/auth-client";
import { useConvexBootstrapState } from "@/_core/hooks/useConvexBootstrapState";

const AUTH_BOOTSTRAP_TIMEOUT_MS = 6_000;
const AUTH_GRACE_PERIOD_MS = 1_200;

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();
  const { isConvexAuthReady, isBootstrapTimedOut } = useConvexBootstrapState();
  const location = useLocation();
  const [waitingForAuth, setWaitingForAuth] = useState(true);
  const [bootstrapTimedOut, setBootstrapTimedOut] = useState(false);

  useEffect(() => {
    // Give auth a short grace period after route entry.
    const timer = setTimeout(() => setWaitingForAuth(false), AUTH_GRACE_PERIOD_MS);
    return () => clearTimeout(timer);
  }, []);

  // Hard cap so auth bootstrap never causes infinite loading.
  useEffect(() => {
    const timer = setTimeout(() => setBootstrapTimedOut(true), AUTH_BOOTSTRAP_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  // If session arrives, stop waiting immediately
  useEffect(() => {
    if (session?.user) {
      setWaitingForAuth(false);
    }
  }, [session]);

  if (!bootstrapTimedOut && (isPending || waitingForAuth)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground animate-pulse">
          <div className="h-10 w-10 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin" />
          <span className="font-bold tracking-widest uppercase text-[10px]">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Session exists but Convex auth never synced - show refresh prompt
  if (isBootstrapTimedOut && !isConvexAuthReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100/60">
        <div className="flex flex-col items-center gap-4 max-w-sm p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-700 text-center">
            Authentication sync is taking too long. Please refresh the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
