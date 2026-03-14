import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import ConvexClientProvider from "../../ConvexClientProvider";

/**
 * WHY:   The sign-in page uses Convex Auth client actions (`useAuthActions`) which require the Convex React provider.
 * WHAT:  Wraps only `/signin` with Convex Auth (server + client) providers so other public pages stay static/low-JS.
 * HOW:   Scopes providers to this route segment instead of the global root layout.
 */
export default function SigninLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConvexAuthNextjsServerProvider>
      <ConvexClientProvider>{children}</ConvexClientProvider>
    </ConvexAuthNextjsServerProvider>
  );
}

