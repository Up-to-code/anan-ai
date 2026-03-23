import { MapPin, BedDouble, Bath } from "lucide-react";
import Link from "next/link";
import type { ClientProperty } from "@/client_zone/lib/types";
import { formatCurrency } from "@/client_zone/lib/formatters";
import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import { Card, CardContent } from "@/client_zone/components/ui/card";
import { Button } from "@/client_zone/components/ui/button";
import { Badge } from "@/client_zone/components/ui/badge";

/**
 * WHY:   Property matches should stay inside the thread in a compact, chat-native format.
 * WHAT:  Renders a lightweight property result block with two follow-up actions.
 * HOW:   Compresses the property preview into a small card instead of the old large browsing card.
 */
export function ChatPropertyResult({
  property,
  onAskAboutProperty,
}: {
  property: ClientProperty;
  onAskAboutProperty: (property: ClientProperty) => void;
}) {
  const { locale, dictionary } = useLocaleDictionary();

  return (
    <Card className="max-w-[85%] overflow-hidden">
      {property.media[0] ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={property.media[0]} alt={property.title} className="h-32 w-full object-cover" />
      ) : null}
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-900">{property.title}</h4>
            <p className="text-xs text-slate-500">{property.aiSummary}</p>
          </div>
          <span className="text-sm font-semibold text-slate-900">{formatCurrency(property.price, locale)}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge><MapPin className="me-1 h-3 w-3" />{property.area ?? property.location ?? property.address}</Badge>
          <Badge><BedDouble className="me-1 h-3 w-3" />{property.beds}</Badge>
          <Badge><Bath className="me-1 h-3 w-3" />{property.baths}</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => onAskAboutProperty(property)}>
            {dictionary.app.askAboutThis}
          </Button>
          <Link href={`/app/property/${property.id}`}>
            <Button size="sm" variant="outline">{dictionary.app.continueInChat}</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
