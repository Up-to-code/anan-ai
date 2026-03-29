"use client";

import { useEffect } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import Link from "next/link";
import { ChatHeader } from "@/client_zone/components/chat/ChatHeader";
import { api } from "@/lib/convexApi";
import { capturePostHogEvent } from "@/lib/posthog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/client_zone/components/ui/card";
import { Button } from "@/client_zone/components/ui/button";
import { Badge } from "@/client_zone/components/ui/badge";
import { formatCurrency } from "@/client_zone/lib/formatters";

/**
 * WHY:   Buyers need a focused property detail view that connects directly back into the assistant flow.
 * WHAT:  Renders one published property with summary actions for financing and advisor handoff.
 * HOW:   Loads the property from the dedicated web query and reuses the shared property card presentation.
 */
export function PropertyDetailPage({ propertyId }: { propertyId: string }) {
  const { isAuthenticated } = useConvexAuth();
  const { dictionary, locale } = useLocaleDictionary();
  const liveProperty = useQuery(
    api.user_zone.web.properties.getPropertyDetail,
    { propertyId: propertyId as never },
  );
  const property = liveProperty;

  useEffect(() => {
    if (!property) return;
    capturePostHogEvent("client_property_detail_viewed", {
      ownerType: property.owner.type,
      propertyId: String(property.id),
    });
  }, [property]);

  return (
    <div className="min-h-screen bg-[var(--workspace-shell)]">
      <ChatHeader isAuthenticated={isAuthenticated} />
      <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
        {property === undefined ? (
          <div className="h-96 animate-pulse rounded-xl border border-slate-200 bg-white" />
        ) : property ? (
          <div className="space-y-5">
            <div className="rounded-full border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--workspace-muted)] w-fit ms-auto">
              {dictionary.app.continueInChat}
            </div>
            <Card className="overflow-hidden rounded-[30px] border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] shadow-[0_24px_56px_rgba(15,23,42,0.08)]">
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
                <Badge>{property.owner.type === "RED" ? "مطور" : "وسيط"}</Badge>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs text-slate-500">{property.owner.type === "RED" ? "Developer" : "Broker"}</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">{property.owner.name}</div>
                {property.owner.description ? (
                  <p className="mt-2 text-sm text-slate-600">{property.owner.description}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/?prompt=${encodeURIComponent(locale === "ar" ? `أريد تفاصيل أكثر عن ${property.title}` : `Tell me more about ${property.title}`)}`}
                  data-analytics-event="client_property_continue_in_chat_clicked"
                  data-analytics-property-id={String(property.id)}
                >
                  <Button>{dictionary.app.continueInChat}</Button>
                </Link>
                <Link
                  href={`/?prompt=${encodeURIComponent(locale === "ar" ? `أريد خطة تمويل لعقار ${property.title}` : `Show financing options for ${property.title}`)}`}
                  data-testid="client-property-finance-cta"
                  data-analytics-event="client_property_finance_cta_clicked"
                  data-analytics-property-id={String(property.id)}
                >
                  <Button variant="outline">{dictionary.app.financeCta}</Button>
                </Link>
              </div>
            </CardContent>
            </Card>
          </div>
        ) : (
          <Card><CardContent className="p-6 text-sm text-slate-600">{dictionary.app.propertyNotFound}</CardContent></Card>
        )}
      </main>
    </div>
  );
}
