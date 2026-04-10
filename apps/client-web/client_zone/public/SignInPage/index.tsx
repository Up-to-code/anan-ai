"use client";

import { SignInButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "@/app/_components/LocaleProvider";
import { Button } from "@/components/ui/button";

/**
 * WHY:   Advisor and saved-history flows need a continuation-safe entry point even before full auth UX is rebuilt.
 * WHAT:  Renders the buyer sign-in continuation page with a safe return target.
 * HOW:   Accepts a sanitized internal route and keeps the user moving through the buyer journey without exposing unsafe redirects.
 */
export default function SignInPage({
  returnTo,
  intent,
}: {
  returnTo: string;
  intent?: string;
}) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { dictionary } = useLocale();
  const heading =
    intent === "advisor"
      ? dictionary.signIn.advisorTitle
      : intent === "history"
        ? dictionary.signIn.historyTitle
        : dictionary.signIn.defaultTitle;

  return (
    <main className="min-h-screen bg-background px-6 py-14 sm:px-10">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 rounded-[36px] border border-[var(--workspace-border)] bg-[var(--workspace-panel)] p-8 text-right shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--workspace-muted)]">{dictionary.signIn.eyebrow}</p>
        <h1 className="text-3xl font-black text-slate-950 dark:text-slate-50">{heading}</h1>
        <p className="text-base leading-8 text-slate-600 dark:text-slate-300">
          {dictionary.signIn.body}
        </p>
        <div className="rounded-[24px] border border-[var(--workspace-border)] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_8%,white)] px-5 py-4 text-sm text-slate-700 dark:bg-[color:color-mix(in_srgb,var(--workspace-highlight)_12%,var(--workspace-panel))] dark:text-slate-200">
          <span className="font-black">{dictionary.signIn.returnLabel}</span> {returnTo}
        </div>
        <div className="flex flex-wrap justify-end gap-3">
          {isSignedIn ? (
            <Button className="rounded-full px-6" onClick={() => router.push(returnTo)}>
              {dictionary.signIn.continueCta}
            </Button>
          ) : (
            <SignInButton mode="modal" fallbackRedirectUrl={returnTo} forceRedirectUrl={returnTo}>
              <Button className="rounded-full px-6">{dictionary.signIn.continueCta}</Button>
            </SignInButton>
          )}
          <Link href="/app">
            <Button variant="outline" className="rounded-full px-6">{dictionary.signIn.assistantCta}</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
