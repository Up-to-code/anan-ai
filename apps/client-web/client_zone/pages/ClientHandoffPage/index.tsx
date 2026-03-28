"use client";

import { useEffect } from "react";
import { useConvexAuth } from "convex/react";
import Link from "next/link";
import { ChatHeader } from "@/client_zone/components/chat/ChatHeader";
import { ChatAuthGateNotice } from "@/client_zone/components/chat/ChatAuthGateNotice";
import { useClientOrderDetail } from "@/client_zone/hooks/useClientAssistant";
import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import { capturePostHogEvent } from "@/lib/posthog";
import { Button } from "@/client_zone/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/client_zone/components/ui/card";

/**
 * WHY:   Clients need a simple confirmation step after advisor handoff without being dropped into a dashboard.
 * WHAT:  Renders the authenticated buyer's actual order summary for the requested handoff id.
 * HOW:   Reads the saved CRM order through Convex and falls back gracefully when the order is missing or not owned by the buyer.
 */
export function ClientHandoffPage({ orderId }: { orderId?: string }) {
  const { isAuthenticated } = useConvexAuth();
  const { dictionary, locale } = useLocaleDictionary();
  const handoff = useClientOrderDetail(orderId);

  useEffect(() => {
    if (!handoff) return;
    capturePostHogEvent("client_handoff_page_viewed", {
      orderId: handoff.orderId,
      propertyId: handoff.property?.id ? String(handoff.property.id) : undefined,
      status: handoff.status,
    });
  }, [handoff]);

  const labels = locale === "ar"
    ? {
        orderId: "رقم الطلب",
        status: "الحالة",
        property: "العقار",
        source: "المصدر",
        notFound: "لم نتمكن من العثور على هذا الطلب أو لا تملك صلاحية الوصول إليه.",
      }
    : {
        orderId: "Order ID",
        status: "Status",
        property: "Property",
        source: "Source",
        notFound: "We could not find this order, or it is not available to your account.",
      };

  return (
    <div className="min-h-screen bg-slate-50">
      <ChatHeader isAuthenticated={isAuthenticated} />
      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        {!isAuthenticated ? (
          <ChatAuthGateNotice returnTo={orderId ? `/app/handoff?orderId=${encodeURIComponent(orderId)}` : "/app/handoff"} />
        ) : handoff === undefined ? (
          <div className="h-56 animate-pulse rounded-xl border border-slate-200 bg-white" />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{dictionary.app.handoffTitle}</CardTitle>
              <CardDescription>{dictionary.app.handoffDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {handoff ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <p>{labels.orderId}: {handoff.orderId}</p>
                  <p>{labels.status}: {handoff.status}</p>
                  <p>{labels.property}: {handoff.property?.title ?? "—"}</p>
                  <p>{labels.source}: {handoff.sourceChannel ?? "—"}</p>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  {labels.notFound}
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <Link href={handoff?.threadId ? `/app?threadId=${encodeURIComponent(handoff.threadId)}` : "/app"}>
                  <Button>{dictionary.app.backToAssistant}</Button>
                </Link>
                <Link href="/search"><Button variant="outline">{dictionary.nav.search}</Button></Link>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
