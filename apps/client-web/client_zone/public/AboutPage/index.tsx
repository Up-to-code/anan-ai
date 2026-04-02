"use client";

import Link from "next/link";
import { Building2, Layers3, Sparkles } from "lucide-react";
import { useLocale } from "@/app/_components/LocaleProvider";
import { Button } from "@/components/ui/button";

/**
 * WHY:   Buyers need a trust-building explanation of what this surface does before they start sharing criteria.
 * WHAT:  Renders the public about page for the rebuilt buyer application.
 * HOW:   Explains the assistant-first buyer journey using the same brand language and visual system as the web workspace.
 */
export default function AboutPage() {
  const { dictionary } = useLocale();

  return (
    <main className="min-h-screen bg-background px-6 py-14 text-slate-950 dark:text-slate-50 sm:px-10 lg:px-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <div className="space-y-5 text-right">
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[var(--workspace-muted)]">
            {dictionary.about.eyebrow}
          </p>
          <h1 className="text-4xl font-black sm:text-5xl">{dictionary.about.title}</h1>
          <p className="max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            {dictionary.about.body}
          </p>
          <Link href="/app">
            <Button className="mt-3 rounded-full px-6">{dictionary.about.cta}</Button>
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <AboutCard icon={Building2} title={dictionary.about.cards.inventoryTitle} body={dictionary.about.cards.inventoryBody} />
          <AboutCard icon={Sparkles} title={dictionary.about.cards.assistantTitle} body={dictionary.about.cards.assistantBody} />
          <AboutCard icon={Layers3} title={dictionary.about.cards.brandTitle} body={dictionary.about.cards.brandBody} />
        </div>
      </div>
    </main>
  );
}

function AboutCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Building2;
  title: string;
  body: string;
}) {
  return (
    <article className="rounded-[32px] border border-[var(--workspace-border)] bg-[var(--workspace-panel)] p-6 text-right shadow-sm">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:color-mix(in_srgb,var(--workspace-highlight)_12%,white)] text-[var(--workspace-highlight)]">
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="text-lg font-black">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{body}</p>
    </article>
  );
}
