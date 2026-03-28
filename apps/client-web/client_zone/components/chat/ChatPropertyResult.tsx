import { MapPin, BedDouble, Bath } from "lucide-react";
import Link from "next/link";
import type { ClientProperty } from "@/client_zone/lib/types";
import { formatCurrency } from "@/client_zone/lib/formatters";
import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import { Button } from "@/client_zone/components/ui/button";
import { Badge } from "@/client_zone/components/ui/badge";
import { AgUiCardHeading, AgUiCardShell, CardContent } from "./ag-ui/AgUiCardPrimitives";

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
    <AgUiCardShell className="overflow-hidden">
      {property.media[0] ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={property.media[0]} alt={property.title} className="h-44 w-full object-cover" />
      ) : null}
      <AgUiCardHeading
        title={property.title}
        summary={property.aiSummary}
        aside={
          <span className="text-sm font-black text-[var(--workspace-bubble-other-foreground)]">
            {formatCurrency(property.price, locale)}
          </span>
        }
      />
      <CardContent className="space-y-4 pt-0">
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
    </AgUiCardShell>
  );
}
