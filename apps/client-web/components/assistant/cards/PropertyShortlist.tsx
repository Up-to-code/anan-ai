import { type BuyerProperty } from "@anan/client-assistant";
import { Card, CardContent } from "@/components/ui/card";
import { useLocale } from "@/app/_components/LocaleProvider";
import { formatLocaleNumber } from "@/lib/locale";

interface PropertyShortlistProps {
  properties: BuyerProperty[];
}

export function PropertyShortlist({ properties }: PropertyShortlistProps) {
  const { locale, dictionary } = useLocale();

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
      {properties.map((property) => (
        <Card key={property.id} className="min-w-[280px] max-w-[280px] shrink-0 border-primary/10 shadow-lg">
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
                <div className="text-[10px] font-black">{property.area}</div>
                <div className="text-[8px] text-muted-foreground uppercase">{dictionary.property.sqft}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
