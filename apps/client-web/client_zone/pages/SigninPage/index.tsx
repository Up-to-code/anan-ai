"use client";

import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useEffect, useState, startTransition } from "react";
import { ChatHeader } from "@/client_zone/components/chat/ChatHeader";
import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import { Button } from "@/client_zone/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/client_zone/components/ui/card";

/**
 * WHY:   The client web app needs a dedicated auth page for saved history and advisor handoff actions.
 * WHAT:  Renders the buyer/client sign-in screen and starts Google sign-in via Convex Auth.
 * HOW:   Uses `useAuthActions` with the requested return path and keeps the UI minimal.
 */
export function SigninPage({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const { dictionary } = useLocaleDictionary();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, redirectTo, router]);

  return (
    <div className="min-h-screen bg-[var(--workspace-shell)]">
      <ChatHeader isAuthenticated={isAuthenticated} />
      <main className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md rounded-[30px] border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] shadow-[0_20px_44px_rgba(15,23,42,0.08)]">
          <CardHeader>
            <CardTitle>{dictionary.app.signInTitle}</CardTitle>
            <CardDescription>{dictionary.app.signInDescription}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button
                onClick={() => {
                  setPending(true);
                  startTransition(() => {
                    const resolvedRedirectTo = redirectTo.startsWith("/")
                      ? `${window.location.origin}${redirectTo}`
                      : redirectTo;
                    signIn("google", { redirectTo: resolvedRedirectTo }).catch(() => setPending(false));
                  });
                }}
              >
                {pending ? "..." : dictionary.app.signInButton}
            </Button>
            <Button variant="outline" onClick={() => router.push(redirectTo)}>{dictionary.app.continueGuest}</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
