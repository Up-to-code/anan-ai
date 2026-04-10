"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

/**
 * WHY:   The client web surface still needs authenticated and guest-friendly Convex hooks after the Clerk migration.
 * WHAT:  Creates one browser-stable Convex React client bridged through Clerk auth.
 * HOW:   Lazily instantiates the client once and passes Clerk's `useAuth` hook to `ConvexProviderWithClerk`.
 */
export default function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.trim();
  const [client] = useState<ConvexReactClient | null>(() => {
    if (!convexUrl) return null;

    try {
      new URL(convexUrl);
      return new ConvexReactClient(convexUrl);
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

  return <ConvexProviderWithClerk client={client} useAuth={useAuth}>{children}</ConvexProviderWithClerk>;
}
