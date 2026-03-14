import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import ConvexClientProvider from "../ConvexClientProvider";

/**
 * WHY:   Workspace routes need authenticated Convex providers for live queries, mutations, and session bridging.
 * WHAT:  Wraps the `(ws)` route group with Convex Auth (server + client) providers only where needed.
 * HOW:   Keeps the root layout static for public pages while enabling Convex context for `/ws` descendants.
 */
export default function WorkspaceGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConvexAuthNextjsServerProvider>
      <ConvexClientProvider>{children}</ConvexClientProvider>
    </ConvexAuthNextjsServerProvider>
  );
}

