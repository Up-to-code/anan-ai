"use client";

import { useState } from "react";
import { useConvexAuth } from "convex/react";
import Link from "next/link";
import { ChatHeader } from "@/client_zone/components/chat/ChatHeader";
import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import { Button } from "@/client_zone/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/client_zone/components/ui/card";

type HandoffState = {
  orderId?: string;
  propertyTitle?: string;
  createdAt?: number;
};

/**
 * WHY:   Clients need a simple confirmation step after advisor handoff without being dropped into a dashboard.
 * WHAT:  Renders the latest handoff status summary stored by the assistant flow.
 * HOW:   Reads the last local handoff snapshot from localStorage and pairs it with the route query when present.
 */
export function ClientHandoffPage({ orderId }: { orderId?: string }) {
  const { isAuthenticated } = useConvexAuth();
  const { dictionary, locale } = useLocaleDictionary();
  const [handoff] = useState<HandoffState>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem("anan-client-last-handoff");
      return raw ? (JSON.parse(raw) as HandoffState) : {};
    } catch {
      return {};
    }
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <ChatHeader isAuthenticated={isAuthenticated} />
      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{dictionary.app.handoffTitle}</CardTitle>
            <CardDescription>{dictionary.app.handoffDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p>Order ID: {orderId ?? handoff.orderId ?? "—"}</p>
              <p>Property: {handoff.propertyTitle ?? "—"}</p>
              <p>
                {handoff.createdAt
                  ? new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(handoff.createdAt)
                  : "—"}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/"><Button>{dictionary.app.backToAssistant}</Button></Link>
              <Link href="/search"><Button variant="outline">{dictionary.nav.search}</Button></Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
