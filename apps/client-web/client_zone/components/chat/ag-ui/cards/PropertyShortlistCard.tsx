import Link from "next/link";
import { Bath, BedDouble, MapPin } from "lucide-react";
import { Badge } from "@/client_zone/components/ui/badge";
import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import { formatCurrency } from "@/client_zone/lib/formatters";
import { AgUiCardHeading, AgUiCardShell, CardContent, agUiInnerPanelClassName } from "../AgUiCardPrimitives";
import type { PropertyShortlistCardProps } from "../types";

/**
 * WHY:   The assistant needs one client-safe way to present multiple surfaced properties without falling back to oversized marketplace cards.
 * WHAT:  Renders a compact shortlist grid for the assistant thread.
 * HOW:   Keeps each item dense, readable, and fully width-aware inside the AG UI canvas.
 */
export function PropertyShortlistCard({ properties }: PropertyShortlistCardProps) {
  const { locale } = useLocaleDictionary();

  return (
    <AgUiCardShell className="overflow-hidden">
      <AgUiCardHeading title="Shortlist" summary={`${properties.length} surfaced matches`} />
      <CardContent className="grid gap-3 pt-0 sm:grid-cols-2 xl:grid-cols-3">
        {properties.map((property) => (
          <article key={property.id} className={`overflow-hidden ${agUiInnerPanelClassName()}`}>
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
                <Badge className="bg-[var(--workspace-panel)]"><MapPin className="me-1 h-3 w-3" />{property.area ?? property.location ?? property.address}</Badge>
                <Badge className="bg-[var(--workspace-panel)]"><BedDouble className="me-1 h-3 w-3" />{property.beds}</Badge>
                <Badge className="bg-[var(--workspace-panel)]"><Bath className="me-1 h-3 w-3" />{property.baths}</Badge>
              </div>
              <Link
                href={`/app/property/${property.id}`}
                className="inline-flex text-sm font-black text-[var(--workspace-highlight)] underline underline-offset-4"
                data-testid="client-property-result-link"
                data-analytics-event="client_property_selected"
                data-analytics-owner-type={property.owner.type}
                data-analytics-property-id={String(property.id)}
                data-analytics-selection-mode="shortlist_link"
              >
                View property
              </Link>
            </div>
          </article>
        ))}
      </CardContent>
    </AgUiCardShell>
  );
}
