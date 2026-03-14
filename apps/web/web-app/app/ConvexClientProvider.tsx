"use client";

import { useState } from "react";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";

/**
 * WHY:   Client workspace surfaces need authenticated Convex hooks for live queries and mutations.
 * WHAT:  Provides one browser-stable Convex React client under the existing Next.js auth provider.
 * HOW:   Lazily creates the client once per browser session and bridges auth through Convex Auth Next.js.
 */
export default function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [client] = useState(
    () => new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL as string),
  );

  return <ConvexAuthNextjsProvider client={client}>{children}</ConvexAuthNextjsProvider>;
}
