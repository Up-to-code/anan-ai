"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

/**
 * WHY:   Client workspace surfaces need authenticated Convex hooks for live queries and mutations after the Clerk cutover.
 * WHAT:  Provides one browser-stable Convex React client bridged through Clerk auth.
 * HOW:   Lazily creates the client once per browser session and passes Clerk's `useAuth` hook to `ConvexProviderWithClerk`.
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

  return <ConvexProviderWithClerk client={client} useAuth={useAuth}>{children}</ConvexProviderWithClerk>;
}
