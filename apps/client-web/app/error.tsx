"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useLocale } from "@/app/_components/LocaleProvider";
import { Button } from "@/components/ui/button";
import { capturePostHogEvent } from "@/lib/posthog";

/**
 * WHY:   Production failures should keep buyers inside a calm recovery flow instead of exposing framework internals.
 * WHAT:  Renders the top-level buyer app error boundary with retry and recovery actions.
 * HOW:   Uses the active locale context and records a lightweight analytics event when the boundary opens.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { dictionary } = useLocale();

  useEffect(() => {
    capturePostHogEvent("client_web_error_boundary_opened", {
      message: error.message || "unknown_error",
      digest: error.digest,
    });
  }, [error.digest, error.message]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[var(--workspace-shell)] px-6 py-12">
      <div className="w-full max-w-lg rounded-[32px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-8 text-center shadow-sm">
        <h1 className="text-3xl font-black text-[var(--workspace-bubble-other-foreground)]">
          {dictionary.common.error}
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--workspace-muted)]">
          {dictionary.common.loadingBody}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>{dictionary.common.retry}</Button>
          <Link href="/app">
            <Button variant="outline">{dictionary.handoff.backToAssistant}</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
