"use client";

import { useState } from "react";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";

/**
 * WHY:   Admin client components use Convex auth hooks for sign-in and sign-out actions.
 * WHAT:  Provides one browser-stable Convex React client bridged through the Next.js auth provider.
 * HOW:   Lazily creates the client once per session using the same public Convex URL configured for the app.
 */
export default function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  type ProviderClient = React.ComponentProps<typeof ConvexAuthNextjsProvider>["client"];
  const [client] = useState<ProviderClient>(
    () =>
      new ConvexReactClient(
        process.env.NEXT_PUBLIC_CONVEX_URL as string,
      ) as unknown as ProviderClient,
  );

  return <ConvexAuthNextjsProvider client={client}>{children}</ConvexAuthNextjsProvider>;
}
