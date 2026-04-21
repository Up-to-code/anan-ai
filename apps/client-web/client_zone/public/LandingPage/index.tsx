"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { Bath, BedDouble, Building2, MapPin, MessageSquareText, Ruler, ShieldCheck } from "lucide-react";
import { api } from "@/lib/convexApi";
import { useLocale } from "@/app/_components/LocaleProvider";
import { Button } from "@/components/ui/button";
import { PropertyShortlist } from "@/components/assistant/cards/PropertyShortlist";
import { formatLocaleNumber } from "@/lib/locale";
import type { BuyerProperty } from "@/client_zone/shared/types";

/**
 * WHY:   Buyers need a polished entry point before they start the assistant journey.
 * WHAT:  Renders the public buyer landing page with hero messaging, featured properties, and CTAs into the chat flow.
 * HOW:   Pulls featured inventory from the existing buyer-web Convex surface and presents it with the same brand tokens used in `apps/web`.
 */
export default function LandingPage() {
  const { locale, dictionary } = useLocale();
  const featured = useQuery(api.user_zone.web.properties.listFeaturedProperties, { limit: 4 }) ?? [];
  const heroProperty = featured[0];
  const railProperties = featured.slice(1, 3);

  return (
    <main className="min-h-screen bg-[#f7f7f3] text-slate-950 dark:bg-[var(--workspace-shell)] dark:text-slate-50">
      <section className="mx-auto flex min-h-[92vh] w-full max-w-7xl flex-col px-4 py-5 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between rounded-[6px] bg-white/88 px-4 py-3 shadow-[0_20px_70px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04] backdrop-blur dark:bg-[var(--workspace-panel)] dark:ring-white/[0.06]">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="text-right">
              <p className="text-[12px] font-black uppercase text-slate-950 dark:text-slate-50">
                Anan Buyer
              </p>
              <p className="hidden text-[11px] font-medium text-slate-500 dark:text-slate-400 sm:block">
                {dictionary.nav.brandTagline}
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 dark:border-white/10 dark:bg-slate-950/30 md:flex">
            <Link href="/" className="rounded-full px-4 py-2 text-[12px] font-semibold text-slate-700 dark:text-slate-200">
              {dictionary.nav.home}
            </Link>
            <Link href="/about" className="text-sm font-bold text-slate-600 transition hover:text-[var(--workspace-highlight)] dark:text-slate-300">
              {dictionary.nav.about}
            </Link>
            <Link href="/search" className="rounded-full px-4 py-2 text-[12px] font-semibold text-slate-700 transition hover:text-[var(--workspace-highlight)] dark:text-slate-200">
              Property
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/signin">
              <Button className="h-10 rounded-full bg-slate-950 px-5 text-[12px] font-black text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
                {dictionary.nav.signIn}
              </Button>
            </Link>
          </div>
        </header>

        <div className="grid flex-1 gap-10 py-8 lg:grid-cols-[1fr_330px] lg:items-start">
          <div className="grid gap-4 lg:grid-cols-[1.45fr_0.65fr]">
            <div className="space-y-7">
              <div className="relative aspect-[1.55] overflow-hidden rounded-[6px] bg-slate-200 dark:bg-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroProperty?.media[0] || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80"}
                  alt={heroProperty?.title ?? "Anan featured property"}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="grid gap-6 text-right md:grid-cols-[1fr_auto] md:items-start">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--workspace-highlight)]">{dictionary.landing.badge}</p>
                  <h1 className="mt-3 text-[34px] font-semibold leading-[1.05] text-slate-950 dark:text-slate-50 sm:text-[44px]">
                    {heroProperty?.title ?? dictionary.landing.title}
                  </h1>
                  <div className="mt-4 flex flex-wrap justify-end gap-x-5 gap-y-2 text-[13px] font-medium text-slate-500 dark:text-slate-400">
                    {heroProperty ? (
                      <>
                        <PropertyMeta icon={MapPin} label={heroProperty.area ?? heroProperty.location ?? heroProperty.address} />
                        <PropertyMeta icon={BedDouble} label={`${heroProperty.beds} ${dictionary.property.beds}`} />
                        <PropertyMeta icon={Bath} label={`${heroProperty.baths} ${dictionary.property.baths}`} />
                        <PropertyMeta icon={Ruler} label={`${heroProperty.sqft ?? "—"} ${dictionary.property.sqft}`} />
                      </>
                    ) : (
                      <span>{dictionary.landing.subtitle}</span>
                    )}
                  </div>
                </div>

                <div className="text-right md:min-w-[180px]">
                  <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{dictionary.property.price}</p>
                  <p className="mt-2 text-[32px] font-semibold text-slate-950 dark:text-slate-50">
                    {heroProperty
                      ? formatLocaleNumber(locale, heroProperty.price, { style: "currency", currency: "SAR", maximumFractionDigits: 0 })
                      : "Anan"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {(railProperties.length ? railProperties : [undefined, undefined]).map((property, index) => (
                <SmallVisualProperty key={property?.id ?? index} property={property} />
              ))}
            </div>
          </div>

          <aside className="space-y-6 pt-0 text-right lg:pt-2">
            <div>
              <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400">{dictionary.landing.previewEyebrow}</p>
              <h2 className="mt-1 text-[28px] font-semibold leading-tight text-slate-950 dark:text-slate-50">Recommended Properties</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {featured.slice(0, 2).map((property) => (
                <RecommendationCard key={String(property.id)} property={property} />
              ))}
            </div>

            <div className="rounded-[6px] bg-slate-950 px-6 py-7 text-right text-white dark:bg-white dark:text-slate-950">
              <h2 className="text-[24px] font-semibold leading-tight">{dictionary.landing.title}</h2>
              <p className="mt-4 text-[14px] leading-7 text-white/72 dark:text-slate-600">{dictionary.landing.subtitle}</p>
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <Link href="/app">
                  <Button className="h-11 rounded-full bg-white px-5 text-[12px] font-black text-slate-950 hover:bg-slate-200 dark:bg-slate-950 dark:text-white">
                    {dictionary.landing.primaryCta}
                  </Button>
                </Link>
                <Link href="/app/history">
                  <Button variant="outline" className="h-11 rounded-full border-white/24 bg-transparent px-5 text-[12px] font-black text-white hover:bg-white/10 dark:border-slate-950/20 dark:text-slate-950">
                    {dictionary.landing.secondaryCta}
                  </Button>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-8 lg:px-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 text-right">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--workspace-highlight)]">{dictionary.landing.previewEyebrow}</p>
            <h2 className="mt-2 text-[30px] font-semibold text-slate-950 dark:text-slate-50">{dictionary.landing.previewTitle}</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <FeaturePill icon={MessageSquareText} title={dictionary.landing.features.chatTitle} />
            <FeaturePill icon={ShieldCheck} title={dictionary.landing.features.verifyTitle} />
            <FeaturePill icon={Building2} title={dictionary.landing.features.inventoryTitle} />
          </div>
        </div>
        <PropertyShortlist properties={featured} />
      </section>
    </main>
  );
}

function FeaturePill({
  icon: Icon,
  title,
}: {
  icon: typeof MessageSquareText;
  title: string;
}) {
  return (
    <div className="inline-flex items-center justify-end gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-[11px] font-black text-slate-600 dark:border-white/10 dark:bg-[var(--workspace-panel)] dark:text-slate-300">
      <span>{title}</span>
      <Icon className="h-4 w-4 text-[var(--workspace-highlight)]" />
    </div>
  );
}

function PropertyMeta({ icon: Icon, label }: { icon: typeof MapPin; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="h-4 w-4 text-slate-400" />
      {label}
    </span>
  );
}

function SmallVisualProperty({ property }: { property?: BuyerProperty }) {
  return (
    <Link href={property ? `/app/property/${property.id}` : "/search"} className="group block">
      <div className="aspect-[1.45] overflow-hidden rounded-[6px] bg-slate-200 dark:bg-slate-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={property?.media[0] || "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=80"}
          alt={property?.title ?? "Anan property"}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </div>
    </Link>
  );
}

function RecommendationCard({ property }: { property: BuyerProperty }) {
  const { locale, dictionary } = useLocale();

  return (
    <Link href={`/app/property/${property.id}`} className="group block">
      <article className="space-y-3">
        <div className="relative aspect-[1.45] overflow-hidden rounded-[6px] bg-slate-200 dark:bg-slate-800">
          <span className="absolute right-3 top-3 z-10 rounded-full bg-white/92 px-3 py-1 text-[10px] font-black text-slate-950 dark:bg-slate-950/86 dark:text-slate-50">
            For sale
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={property.media[0]} alt={property.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-slate-950 dark:text-slate-50">
            {formatLocaleNumber(locale, property.price, { style: "currency", currency: "SAR", maximumFractionDigits: 0 })}
          </p>
          <h3 className="mt-1 line-clamp-1 text-[15px] font-semibold text-slate-950 dark:text-slate-50">{property.title}</h3>
          <p className="mt-1 line-clamp-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">{property.area ?? property.location ?? property.address}</p>
          <div className="mt-3 flex flex-wrap gap-3 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <PropertyMeta icon={BedDouble} label={`${property.beds} ${dictionary.property.beds}`} />
            <PropertyMeta icon={Bath} label={`${property.baths} ${dictionary.property.baths}`} />
            <PropertyMeta icon={Ruler} label={`${property.sqft ?? "—"} ${dictionary.property.sqft}`} />
          </div>
        </div>
      </article>
    </Link>
  );
}
