"use client";

import { useState } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";

/**
 * WHY:   Public marketing pages need Convex hooks (e.g. useMutation) but do NOT need auth.
 * WHAT:  Lightweight provider that creates a Convex client without the auth provider.
 * HOW:   Uses the plain ConvexProvider instead of ConvexAuthNextjsProvider.
 */
export default function PublicConvexProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [client] = useState(
    () => new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL as string),
  );

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
