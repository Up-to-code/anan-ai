"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
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
      className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide"
    >
      {properties.map((property) => (
        <Card key={String(property.id)} className="max-w-[280px] min-w-[280px] shrink-0 border-primary/10 shadow-lg">
          <div className="aspect-video relative overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={property.media[0] || "/placeholder-property.jpg"}
              alt={property.title}
              className="object-cover w-full h-full"
            />
            <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter">
              {formatLocaleNumber(locale, property.price, { style: "currency", currency: "SAR", maximumFractionDigits: 0 })}
            </div>
          </div>
          <CardContent className="p-4">
            <h4 className="font-black text-sm line-clamp-1 mb-1">{property.title}</h4>
            <p className="text-[10px] text-muted-foreground line-clamp-1 mb-3">{property.address}</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-muted p-2 rounded-lg text-center">
                <div className="text-[10px] font-black">{property.beds}</div>
                <div className="text-[8px] text-muted-foreground uppercase">{dictionary.property.beds}</div>
              </div>
              <div className="bg-muted p-2 rounded-lg text-center">
                <div className="text-[10px] font-black">{property.baths}</div>
                <div className="text-[8px] text-muted-foreground uppercase">{dictionary.property.baths}</div>
              </div>
              <div className="bg-muted p-2 rounded-lg text-center">
                <div className="text-[10px] font-black">{property.sqft ?? "—"}</div>
                <div className="text-[8px] text-muted-foreground uppercase">{dictionary.property.sqft}</div>
              </div>
            </div>
            <Link
              data-testid="client-property-result-link"
              href={`/app/property/${property.id}`}
              className="mt-4 inline-flex rounded-full border border-[var(--workspace-border)] px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[var(--workspace-highlight)] transition hover:border-[color:color-mix(in_srgb,var(--workspace-highlight)_24%,transparent)] hover:bg-[color:color-mix(in_srgb,var(--workspace-highlight)_6%,white)]"
            >
              {dictionary.property.viewDetails}
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
