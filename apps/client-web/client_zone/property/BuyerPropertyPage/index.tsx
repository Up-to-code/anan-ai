"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { ArrowLeft, Bath, BedDouble, Building2, Mail, MapPin, MessageSquareText, Phone, Ruler, UserRound } from "lucide-react";
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

  const fallbackImages = [
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=900&q=80",
  ];
  const gallery = [...property.media, ...fallbackImages].filter(Boolean).slice(0, 3);
  const location = property.area ?? property.location ?? property.address;

  return (
    <main className="min-h-screen bg-[#f7f7f3] px-4 py-5 text-slate-950 dark:bg-[var(--workspace-shell)] dark:text-slate-50 sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="flex items-center justify-between rounded-[6px] bg-white/88 px-4 py-3 shadow-[0_20px_70px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04] backdrop-blur dark:bg-[var(--workspace-panel)] dark:ring-white/[0.06]">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-[12px] font-black uppercase text-slate-950 dark:text-slate-50">Anan Buyer</span>
          </Link>

          <Link href="/search" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[12px] font-black text-slate-700 transition hover:border-[var(--workspace-highlight)] hover:text-[var(--workspace-highlight)] dark:border-white/10 dark:bg-slate-950/30 dark:text-slate-200">
            <span>{dictionary.nav.home}</span>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="relative aspect-[1.65] overflow-hidden rounded-[6px] bg-slate-200 dark:bg-slate-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={gallery[0]} alt={property.title} className="h-full w-full object-cover" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {gallery.slice(1, 3).map((image) => (
              <div key={image} className="aspect-[1.65] overflow-hidden rounded-[6px] bg-slate-200 dark:bg-slate-800 lg:aspect-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt={property.title} className="h-full min-h-[180px] w-full object-cover" />
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
          <div className="space-y-8 text-right">
            <div className="grid gap-5 border-b border-[var(--workspace-border)] pb-7 md:grid-cols-[1fr_auto] md:items-start">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--workspace-highlight)]">{dictionary.property.detailEyebrow}</p>
                <h1 className="mt-3 text-[34px] font-semibold leading-[1.05] text-slate-950 dark:text-slate-50 sm:text-[44px]">
                  {property.title}
                </h1>
                <div className="mt-4 flex flex-wrap justify-end gap-x-5 gap-y-2 text-[13px] font-medium text-slate-500 dark:text-slate-400">
                  <DetailMeta icon={MapPin} label={location} />
                  <DetailMeta icon={BedDouble} label={`${property.beds} ${dictionary.property.beds}`} />
                  <DetailMeta icon={Bath} label={`${property.baths} ${dictionary.property.baths}`} />
                  <DetailMeta icon={Ruler} label={`${property.sqft ?? "—"} ${dictionary.property.sqft}`} />
                </div>
              </div>

              <div className="md:min-w-[210px]">
                <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{dictionary.property.price}</p>
                <p className="mt-2 text-[34px] font-semibold text-slate-950 dark:text-slate-50">
                  {formatLocaleNumber(locale, property.price, { style: "currency", currency: "SAR", maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-[18px] font-semibold text-slate-950 dark:text-slate-50">Description:</h2>
              <p className="max-w-4xl text-[15px] leading-8 text-slate-600 dark:text-slate-300">
                {property.aiSummary ?? dictionary.property.summaryFallback}
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-[18px] font-semibold text-slate-950 dark:text-slate-50">Key features:</h2>
              <div className="rounded-[6px] border border-[var(--workspace-border)] bg-white px-5 py-5 dark:bg-[var(--workspace-panel)]">
                <p className="border-b border-[var(--workspace-border)] pb-4 text-[16px] font-semibold text-slate-950 dark:text-slate-50">Amenities</p>
                <div className="grid gap-4 pt-5 text-[14px] font-medium text-slate-600 dark:text-slate-300 sm:grid-cols-2 lg:grid-cols-4">
                  <Amenity icon={BedDouble} label={`${property.beds} Beds`} />
                  <Amenity icon={Bath} label={`${property.baths} Baths`} />
                  <Amenity icon={Ruler} label={`${property.sqft ?? "—"} Sq ft`} />
                  <Amenity icon={MapPin} label={location} />
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-5 rounded-[6px] bg-white px-5 py-5 text-right shadow-[0_20px_70px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04] dark:bg-[var(--workspace-panel)] dark:ring-white/[0.06]">
            <div className="flex items-center justify-end gap-3">
              <div>
                <p className="text-[15px] font-semibold text-slate-950 dark:text-slate-50">{property.owner.name}</p>
                <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400">{dictionary.property.owner}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                <UserRound className="h-5 w-5" />
              </div>
            </div>

            <div className="space-y-3">
              <FormField icon={UserRound} label="Full Name" value="Jane Doe" />
              <FormField icon={Mail} label="Email Address" value="yourmail@gmail.com" />
              <FormField icon={Phone} label="Phone" value="+880" />
              <FormField icon={MessageSquareText} label="Message" value="Write here..." large />
            </div>

            <Link href={`/app?propertyId=${property.id}`}>
              <Button data-testid="client-property-finance-cta" className="h-12 w-full rounded-full bg-slate-950 text-[12px] font-black text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
                {dictionary.property.continueInAssistant}
              </Button>
            </Link>

            <div className="border-t border-[var(--workspace-border)] pt-4 text-[13px] leading-6 text-slate-500 dark:text-slate-400">
              <p><span className="font-semibold text-slate-950 dark:text-slate-50">{dictionary.property.status}:</span> {property.status ?? dictionary.property.availableNow}</p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function BuyerPropertyState({ title, body }: { title: string; body: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f7f3] px-6 dark:bg-[var(--workspace-shell)]">
      <div className="max-w-xl rounded-[6px] border border-[var(--workspace-border)] bg-[var(--workspace-panel)] px-8 py-8 text-right shadow-sm">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-3 text-base leading-8 text-slate-600 dark:text-slate-300">{body}</p>
      </div>
    </main>
  );
}

function DetailMeta({ icon: Icon, label }: { icon: typeof MapPin; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="h-4 w-4 text-slate-400" />
      {label}
    </span>
  );
}

function Amenity({ icon: Icon, label }: { icon: typeof BedDouble; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Icon className="h-4 w-4 text-slate-400" />
      {label}
    </span>
  );
}

function FormField({
  icon: Icon,
  label,
  value,
  large,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
  large?: boolean;
}) {
  return (
    <label className="block text-left">
      <span className="mb-2 block text-[12px] font-semibold text-slate-700 dark:text-slate-300">{label}</span>
      <span className={`flex items-start gap-2 rounded-[6px] bg-slate-50 px-3 py-3 text-[13px] font-medium text-slate-400 dark:bg-slate-950/40 ${large ? "min-h-[88px]" : ""}`}>
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
        {value}
      </span>
    </label>
  );
}
