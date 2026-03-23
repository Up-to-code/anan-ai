import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import ConvexClientProvider from "../ConvexClientProvider";

/**
 * WHY:   Every workspace route depends on the authenticated Convex runtime for live hooks and auth actions.
 * WHAT:  Anchors the Convex auth server/client providers at the stable `(ws)` route-group boundary.
 * HOW:   Wraps all workspace descendants once so nested zone layouts can stay focused on shell and data loading.
 */
export default function WorkspaceGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConvexAuthNextjsServerProvider>
      <ConvexClientProvider>{children}</ConvexClientProvider>
    </ConvexAuthNextjsServerProvider>
  );
}
