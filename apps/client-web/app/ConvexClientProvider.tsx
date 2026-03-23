"use client";

import { useState } from "react";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";

/**
 * WHY:   The client web surface needs authenticated and guest-friendly Convex hooks in the browser.
 * WHAT:  Creates one browser-stable Convex React client under the Next.js auth bridge.
 * HOW:   Lazily instantiates the client once and passes it to `ConvexAuthNextjsProvider`.
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
