import { ReactNode } from "react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { ConvexReactClient } from "convex/react";
import { authClient } from "@/lib/auth-client";
import { getMobileBackendReadiness } from "@/lib/mobileEnv";

const convexUrl = getMobileBackendReadiness().convexUrl;
const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null;

/**
 * WHY:   Convex remains the only runtime data source for the shipped mobile buyer app.
 * WHAT:  Wraps children in the live Convex provider when the backend config is valid.
 * HOW:   Uses the validated mobile readiness helper and otherwise stays pass-through so the blocking shell can render.
 */
export function ConvexProvider({ children }: { children: ReactNode }) {
  if (!convexClient) {
    return children;
  }

  return (
    <ConvexBetterAuthProvider client={convexClient} authClient={authClient}>
      {children}
    </ConvexBetterAuthProvider>
  );
}
