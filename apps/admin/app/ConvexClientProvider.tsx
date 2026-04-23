"use client";

import { useState } from "react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { ConvexReactClient } from "convex/react";
import { authClient } from "@/lib/auth-client";

/**
 * WHY:   Admin client components need authenticated Convex hooks after the Better Auth migration.
 * WHAT:  Provides one browser-stable Convex React client bridged through Better Auth.
 * HOW:   Lazily creates the client once per browser session and lets the provider refresh Convex tokens.
 */
export default function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [client] = useState(
    () =>
      new ConvexReactClient(
        process.env.NEXT_PUBLIC_CONVEX_URL as string,
      ),
  );

  return (
    <ConvexBetterAuthProvider client={client} authClient={authClient}>
      {children}
    </ConvexBetterAuthProvider>
  );
}
