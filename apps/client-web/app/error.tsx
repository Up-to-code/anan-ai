"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/client_zone/components/ui/button";
import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import { capturePostHogEvent } from "@/lib/posthog";

/**
 * WHY:   Production failures should keep buyers inside a calm recovery flow instead of exposing raw error output.
 * WHAT:  Renders the top-level client app error boundary with retry and recovery actions.
 * HOW:   Uses the active locale context and records a lightweight analytics event when the boundary opens.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { locale, dictionary } = useLocaleDictionary();
  const copy =
    locale === "ar"
      ? {
          title: "حدث خلل مؤقت",
          description: "لم نتمكن من إكمال هذه الخطوة الآن. يمكنك المحاولة مرة أخرى أو العودة إلى المحادثة.",
          retry: "أعد المحاولة",
        }
      : {
          title: "Something went wrong",
          description: "We could not complete that step right now. You can retry or return to the assistant.",
          retry: "Try again",
        };

  useEffect(() => {
    capturePostHogEvent("client_web_error_boundary_opened", {
      message: error.message || "unknown_error",
      digest: error.digest,
    });
  }, [error.digest, error.message]);

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body className="flex min-h-dvh items-center justify-center bg-[var(--workspace-shell)] px-6 py-12">
        <div className="w-full max-w-lg rounded-[32px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-8 text-center shadow-sm">
          <h1 className="text-3xl font-black text-[var(--workspace-bubble-other-foreground)]">{copy.title}</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--workspace-muted)]">{copy.description}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button onClick={reset}>{copy.retry}</Button>
            <Link href="/app">
              <Button variant="outline">{dictionary.app.backToAssistant}</Button>
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
