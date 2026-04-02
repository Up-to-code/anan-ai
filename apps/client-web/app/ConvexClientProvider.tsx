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
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.trim();
  const [client] = useState<ProviderClient | null>(() => {
    if (!convexUrl) return null;

    try {
      new URL(convexUrl);
      return new ConvexReactClient(convexUrl) as unknown as ProviderClient;
    } catch {
      return null;
    }
  });

  if (!client) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[var(--workspace-shell)] px-6 py-12">
        <div className="w-full max-w-xl rounded-[32px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-[var(--workspace-bubble-other-foreground)]">
            Missing client-web configuration
          </h1>
          <p className="mt-3 text-sm leading-7 text-[var(--workspace-muted)]">
            Set <code>NEXT_PUBLIC_CONVEX_URL</code> in <code>apps/client-web/.env.local</code> to an absolute
            Convex deployment URL before starting this app.
          </p>
        </div>
      </main>
    );
  }

  return <ConvexAuthNextjsProvider client={client}>{children}</ConvexAuthNextjsProvider>;
}
