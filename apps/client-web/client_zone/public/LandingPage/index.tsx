"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { ArrowLeft, Building2, MessageSquareText, ShieldCheck } from "lucide-react";
import { api } from "@/lib/convexApi";
import { useLocale } from "@/app/_components/LocaleProvider";
import { Button } from "@/components/ui/button";
import { PropertyShortlist } from "@/components/assistant/cards/PropertyShortlist";

/**
 * WHY:   Buyers need a polished entry point before they start the assistant journey.
 * WHAT:  Renders the public buyer landing page with hero messaging, featured properties, and CTAs into the chat flow.
 * HOW:   Pulls featured inventory from the existing buyer-web Convex surface and presents it with the same brand tokens used in `apps/web`.
 */
export default function LandingPage() {
  const { dictionary, isRtl } = useLocale();
  const featured = useQuery(api.user_zone.web.properties.listFeaturedProperties, { limit: 4 }) ?? [];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fafc_28%,#ffffff_62%)] text-slate-950 dark:bg-[radial-gradient(circle_at_top,#1d4ed8_0%,#09090b_24%,#09090b_100%)] dark:text-slate-50">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--workspace-highlight)] text-white shadow-lg shadow-blue-500/20">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="text-right">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[var(--workspace-muted)]">
                Anan Buyer
              </p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {dictionary.nav.brandTagline}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/about" className="text-sm font-bold text-slate-600 transition hover:text-[var(--workspace-highlight)] dark:text-slate-300">
              {dictionary.nav.about}
            </Link>
            <Link href="/signin">
              <Button variant="outline" className="rounded-full px-5">
                {dictionary.nav.signIn}
              </Button>
            </Link>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8 text-right">
            <span className="inline-flex rounded-full border border-[color:color-mix(in_srgb,var(--workspace-highlight)_18%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_8%,white)] px-4 py-2 text-[12px] font-black text-[var(--workspace-highlight)] dark:bg-[color:color-mix(in_srgb,var(--workspace-highlight)_12%,var(--workspace-panel))]">
              {dictionary.landing.badge}
            </span>
            <div className="space-y-5">
              <h1 className="max-w-2xl text-4xl font-black leading-tight text-slate-950 dark:text-slate-50 sm:text-5xl">
                {dictionary.landing.title}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                {dictionary.landing.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <Link href="/app">
                <Button className="h-12 rounded-full px-6 text-sm font-black">
                  {dictionary.landing.primaryCta}
                </Button>
              </Link>
              <Link href="/app/history">
                <Button variant="outline" className="h-12 rounded-full px-6 text-sm font-black">
                  {dictionary.landing.secondaryCta}
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <FeaturePill icon={MessageSquareText} title={dictionary.landing.features.chatTitle} body={dictionary.landing.features.chatBody} />
              <FeaturePill icon={ShieldCheck} title={dictionary.landing.features.verifyTitle} body={dictionary.landing.features.verifyBody} />
              <FeaturePill icon={Building2} title={dictionary.landing.features.inventoryTitle} body={dictionary.landing.features.inventoryBody} />
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[40px] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--workspace-highlight)_22%,transparent),transparent_60%)] blur-3xl" />
            <div className="relative overflow-hidden rounded-[40px] border border-[var(--workspace-border)] bg-[color:color-mix(in_srgb,var(--workspace-panel)_92%,white)] p-6 shadow-[0_30px_120px_rgba(37,99,235,0.18)] dark:bg-[color:color-mix(in_srgb,var(--workspace-panel)_92%,#09090b)]">
              <div className="flex items-center justify-between border-b border-[var(--workspace-border)] pb-4">
                <div className="text-right">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--workspace-muted)]">
                    {dictionary.landing.previewEyebrow}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {dictionary.landing.previewTitle}
                  </p>
                </div>
                <ArrowLeft className={`h-5 w-5 text-[var(--workspace-highlight)] ${isRtl ? "" : "rotate-180"}`} />
              </div>

              <div className="mt-6">
                <PropertyShortlist properties={featured} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function FeaturePill({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof MessageSquareText;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[28px] border border-[var(--workspace-border)] bg-white/80 px-5 py-5 text-right shadow-sm backdrop-blur dark:bg-[var(--workspace-panel)]">
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:color-mix(in_srgb,var(--workspace-highlight)_12%,white)] text-[var(--workspace-highlight)] dark:bg-[color:color-mix(in_srgb,var(--workspace-highlight)_16%,var(--workspace-panel))]">
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="text-sm font-black text-slate-900 dark:text-slate-50">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{body}</p>
    </div>
  );
}
