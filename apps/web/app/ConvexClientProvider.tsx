"use client";

import { useState } from "react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { ConvexReactClient } from "convex/react";
import { authClient } from "@/lib/auth-client";

/**
 * WHY:   Client workspace surfaces need authenticated Convex hooks for live queries and mutations.
 * WHAT:  Provides one browser-stable Convex React client bridged through Better Auth.
 * HOW:   Lazily creates the client once per browser session and passes the SSR token into the Better Auth provider.
 */
export default function ConvexClientProvider({
  children,
  initialToken,
}: {
  children: React.ReactNode;
  initialToken?: string | null;
}) {
  const [client] = useState(
    () =>
      new ConvexReactClient(
        process.env.NEXT_PUBLIC_CONVEX_URL as string,
      ),
  );

  return (
    <ConvexBetterAuthProvider client={client} authClient={authClient} initialToken={initialToken}>
      {children}
    </ConvexBetterAuthProvider>
  );
}
