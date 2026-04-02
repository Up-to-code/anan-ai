"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { Bath, BedDouble, MapPin, Ruler } from "lucide-react";
import { api } from "@/lib/convexApi";
import { useLocale } from "@/app/_components/LocaleProvider";
import { Button } from "@/components/ui/button";
import { formatLocaleNumber } from "@/lib/locale";

/**
 * WHY:   Buyers need a focused property detail route outside the scrolling assistant transcript.
 * WHAT:  Renders one buyer-facing property detail page using the existing `user_zone/web` property contract.
 * HOW:   Queries the property directly from Convex and keeps the presentation aligned with the rebuilt buyer shell.
 */
export default function BuyerPropertyPage({ propertyId }: { propertyId: string }) {
  const { locale, dictionary } = useLocale();
  const property = useQuery(api.user_zone.web.properties.getPropertyDetail, {
    propertyId: propertyId as never,
  });

  if (property === undefined) {
    return <BuyerPropertyState title={dictionary.common.loading} body={dictionary.common.loadingBody} />;
  }

  if (!property) {
    return <BuyerPropertyState title={dictionary.common.error} body={dictionary.property.notFound} />;
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 sm:px-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href={`/app?propertyId=${property.id}`}>
            <Button data-testid="client-property-finance-cta" className="rounded-full px-6">{dictionary.property.continueInAssistant}</Button>
          </Link>
          <div className="text-right">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--workspace-muted)]">{dictionary.property.detailEyebrow}</p>
            <h1 className="text-3xl font-black">{property.title}</h1>
          </div>
        </div>

        <div className="overflow-hidden rounded-[36px] border border-[var(--workspace-border)] bg-[var(--workspace-panel)] shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={property.media[0] ?? "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80"}
            alt={property.title}
            className="h-[360px] w-full object-cover"
          />

          <div className="grid gap-8 px-6 py-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5 text-right">
              <div className="flex flex-wrap justify-end gap-3">
                <FactChip icon={MapPin} label={property.area ?? property.location ?? property.address} />
                <FactChip icon={BedDouble} label={`${property.beds} ${dictionary.property.beds}`} />
                <FactChip icon={Bath} label={`${property.baths} ${dictionary.property.baths}`} />
                <FactChip icon={Ruler} label={`${property.sqft ?? "—"} ${dictionary.property.sqft}`} />
              </div>
              <p className="text-base leading-8 text-slate-600 dark:text-slate-300">
                {property.aiSummary ?? dictionary.property.summaryFallback}
              </p>
            </div>

            <aside className="rounded-[28px] border border-[var(--workspace-border)] bg-background p-5 text-right">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--workspace-muted)]">{dictionary.property.price}</p>
              <p className="mt-2 text-3xl font-black text-[var(--workspace-highlight)]">
                {formatLocaleNumber(locale, property.price, { style: "currency", currency: "SAR", maximumFractionDigits: 0 })}
              </p>
              <div className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <p><span className="font-black text-slate-900 dark:text-slate-50">{dictionary.property.owner}:</span> {property.owner.name}</p>
                <p><span className="font-black text-slate-900 dark:text-slate-50">{dictionary.property.status}:</span> {property.status ?? dictionary.property.availableNow}</p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}

function BuyerPropertyState({ title, body }: { title: string; body: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-xl rounded-[32px] border border-[var(--workspace-border)] bg-[var(--workspace-panel)] px-8 py-8 text-right shadow-sm">
        <h1 className="text-2xl font-black">{title}</h1>
        <p className="mt-3 text-base leading-8 text-slate-600 dark:text-slate-300">{body}</p>
      </div>
    </main>
  );
}

function FactChip({ icon: Icon, label }: { icon: typeof MapPin; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--workspace-border)] bg-background px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200">
      <Icon className="h-4 w-4 text-[var(--workspace-highlight)]" />
      <span>{label}</span>
    </div>
  );
}
