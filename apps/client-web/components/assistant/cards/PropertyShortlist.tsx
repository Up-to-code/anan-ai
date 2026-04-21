"use client";

import Link from "next/link";
import { Bath, BedDouble, MapPin, Ruler } from "lucide-react";
import { useLocale } from "@/app/_components/LocaleProvider";
import { formatLocaleNumber } from "@/lib/locale";
import type { BuyerProperty } from "@/client_zone/shared/types";

interface PropertyShortlistProps {
  properties: BuyerProperty[];
}

export function PropertyShortlist({ properties }: PropertyShortlistProps) {
  const { locale, dictionary } = useLocale();

  return (
    <div
      data-testid="client-ag-ui-card-property_shortlist"
      className="-mx-4 flex gap-5 overflow-x-auto px-4 pb-4 scrollbar-hide"
    >
      {properties.map((property) => (
        <article key={String(property.id)} className="min-w-[300px] max-w-[300px] shrink-0">
          <Link
            data-testid="client-property-result-link"
            href={`/app/property/${property.id}`}
            className="group block"
          >
            <div className="relative aspect-[1.34] overflow-hidden rounded-[6px] bg-[var(--workspace-elevated)]">
              <span className="absolute right-3 top-3 z-10 rounded-full bg-white/92 px-3 py-1 text-[10px] font-black text-slate-950 shadow-sm dark:bg-slate-950/86 dark:text-slate-50">
                {formatLocaleNumber(locale, property.price, { style: "currency", currency: "SAR", maximumFractionDigits: 0 })}
              </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={property.media[0] || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80"}
                alt={property.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
            </div>

            <div className="pt-4">
              <h4 className="line-clamp-1 text-[22px] font-semibold leading-tight text-slate-950 dark:text-slate-50">{property.title}</h4>
              <div className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-slate-500 dark:text-slate-400">
                <MapPin className="h-3.5 w-3.5" />
                <span className="line-clamp-1">{property.area ?? property.location ?? property.address}</span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[var(--workspace-border)] pb-4 text-[12px] font-medium text-slate-600 dark:text-slate-300">
                <PropertyFact icon={BedDouble} label={`${property.beds} ${dictionary.property.beds}`} />
                <PropertyFact icon={Bath} label={`${property.baths} ${dictionary.property.baths}`} />
                <PropertyFact icon={Ruler} label={`${property.sqft ?? "—"} ${dictionary.property.sqft}`} />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-[20px] font-semibold text-slate-950 dark:text-slate-50">
                  {formatLocaleNumber(locale, property.price, { style: "currency", currency: "SAR", maximumFractionDigits: 0 })}
                </span>
                <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[var(--workspace-highlight)]">
                  {dictionary.property.viewDetails}
                </span>
              </div>
            </div>
            </Link>
        </article>
      ))}
    </div>
  );
}

function PropertyFact({ icon: Icon, label }: { icon: typeof BedDouble; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5 text-slate-400" />
      {label}
    </span>
  );
}
