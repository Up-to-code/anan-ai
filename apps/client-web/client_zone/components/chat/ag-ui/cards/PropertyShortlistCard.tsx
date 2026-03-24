import Link from "next/link";
import { Bath, BedDouble, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/client_zone/components/ui/card";
import { Badge } from "@/client_zone/components/ui/badge";
import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import { formatCurrency } from "@/client_zone/lib/formatters";
import type { PropertyShortlistCardProps } from "../types";

/**
 * WHY:   The assistant needs one client-safe way to present multiple surfaced properties without falling back to oversized marketplace cards.
 * WHAT:  Renders a compact shortlist grid for the assistant thread.
 * HOW:   Keeps each item dense, readable, and fully width-aware inside the AG UI canvas.
 */
export function PropertyShortlistCard({ properties }: PropertyShortlistCardProps) {
  const { locale } = useLocaleDictionary();

  return (
    <Card className="overflow-hidden border-slate-200">
      <CardHeader>
        <CardTitle className="text-sm">Shortlist</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {properties.map((property) => (
          <article key={property.id} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            {property.media[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={property.media[0]} alt={property.title} className="h-40 w-full object-cover" />
            ) : null}
            <div className="space-y-3 p-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-900">{property.title}</h3>
                <p className="text-sm text-slate-500">{property.aiSummary}</p>
              </div>
              <div className="text-sm font-semibold text-slate-900">{formatCurrency(property.price, locale)}</div>
              <div className="flex flex-wrap gap-2">
                <Badge className="rounded-md bg-white"><MapPin className="me-1 h-3 w-3" />{property.area ?? property.location ?? property.address}</Badge>
                <Badge className="rounded-md bg-white"><BedDouble className="me-1 h-3 w-3" />{property.beds}</Badge>
                <Badge className="rounded-md bg-white"><Bath className="me-1 h-3 w-3" />{property.baths}</Badge>
              </div>
              <Link href={`/app/property/${property.id}`} className="inline-flex text-sm font-medium text-slate-900 underline underline-offset-4">
                View property
              </Link>
            </div>
          </article>
        ))}
      </CardContent>
    </Card>
  );
}
