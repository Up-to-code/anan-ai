import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "@/_core/lib/auth-client";
import { useConvexAuth } from "convex/react";

const BOOTSTRAP_TIMEOUT_MS = 6000;

/**
 * Centralized gating for protected Convex queries.
 * Only run protected queries when a session exists AND Convex auth is ready.
 * isBootstrapTimedOut is exposed so callers can show "please refresh" UX when
 * auth sync takes too long, instead of running queries that would UNAUTHORIZE.
 */
export function useConvexBootstrapState() {
  const { data: session, isPending: sessionPending } = useSession();
  const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth();
  const startedAt = useRef<number>(Date.now());
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, []);

  const isBootstrapTimedOut = now - startedAt.current >= BOOTSTRAP_TIMEOUT_MS;
  const isConvexAuthReady = isAuthenticated && !convexAuthLoading;
  const shouldRunProtectedQueries = Boolean(session?.user) && isConvexAuthReady;

  return useMemo(
    () => ({
      isSessionPending: sessionPending,
      isConvexAuthReady,
      isConvexAuthPending: !isConvexAuthReady,
      shouldRunProtectedQueries,
      isBootstrapTimedOut,
    }),
    [isConvexAuthReady, shouldRunProtectedQueries, isBootstrapTimedOut, sessionPending],
  );
}
