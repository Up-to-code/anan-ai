"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

/**
 * WHY:   Admin client components still need authenticated Convex hooks after the Clerk migration.
 * WHAT:  Provides one browser-stable Convex React client bridged through Clerk auth.
 * HOW:   Lazily creates the client once per session and passes Clerk's `useAuth` hook into `ConvexProviderWithClerk`.
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
