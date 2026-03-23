"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import Link from "next/link";
import { ChatHeader } from "@/client_zone/components/chat/ChatHeader";
import { api } from "@/lib/convexApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/client_zone/components/ui/card";
import { Button } from "@/client_zone/components/ui/button";
import { Badge } from "@/client_zone/components/ui/badge";
import { formatCurrency } from "@/client_zone/lib/formatters";
import { MOCK_PROPERTIES } from "@/client_zone/lib/mockAssistant/mockCatalog";

/**
 * WHY:   Buyers need a focused property detail view that connects directly back into the assistant flow.
 * WHAT:  Renders one published property with summary actions for financing and advisor handoff.
 * HOW:   Loads the property from the dedicated web query and reuses the shared property card presentation.
 */
export function PropertyDetailPage({ propertyId }: { propertyId: string }) {
  const { isAuthenticated } = useConvexAuth();
  const { dictionary, locale } = useLocaleDictionary();
  const isMockPropertyId = propertyId.startsWith("demo-");
  const mockProperty = isMockPropertyId
    ? (MOCK_PROPERTIES.find((property) => property.id === propertyId) ?? null)
    : null;
  const liveProperty = useQuery(
    api.user_zone.web.properties.getPropertyDetail,
    isMockPropertyId ? "skip" : { propertyId: propertyId as never },
  );
  const property = mockProperty ?? liveProperty;

  return (
    <div className="min-h-screen bg-slate-50">
      <ChatHeader isAuthenticated={isAuthenticated} />
      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        {property === undefined ? (
          <div className="h-96 animate-pulse rounded-xl border border-slate-200 bg-white" />
        ) : property ? (
          <Card className="overflow-hidden">
            {property.media[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={property.media[0]} alt={property.title} className="h-56 w-full object-cover" />
            ) : null}
            <CardHeader>
              <CardTitle>{property.title}</CardTitle>
              <CardDescription>{property.aiSummary}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-base font-semibold text-slate-900">{formatCurrency(property.price, locale)}</div>
              <div className="flex flex-wrap gap-2">
                <Badge>{property.area ?? property.location ?? property.address}</Badge>
                <Badge>{property.beds}</Badge>
                <Badge>{property.baths}</Badge>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href={`/?prompt=${encodeURIComponent(locale === "ar" ? `أريد تفاصيل أكثر عن ${property.title}` : `Tell me more about ${property.title}`)}`}>
                  <Button>{dictionary.app.continueInChat}</Button>
                </Link>
                <Link href={`/?prompt=${encodeURIComponent(locale === "ar" ? `أريد خطة تمويل لعقار ${property.title}` : `Show financing options for ${property.title}`)}`}>
                  <Button variant="outline">{dictionary.app.financeCta}</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card><CardContent className="p-6 text-sm text-slate-600">{dictionary.app.propertyNotFound}</CardContent></Card>
        )}
      </main>
    </div>
  );
}
