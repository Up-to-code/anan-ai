"use client";

import { useConvexAuth } from "convex/react";
import Link from "next/link";
import { ChatHeader } from "@/client_zone/components/chat/ChatHeader";
import { ChatAuthGateNotice } from "@/client_zone/components/chat/ChatAuthGateNotice";
import { useClientHistory } from "@/client_zone/hooks/useClientAssistant";
import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import { Button } from "@/client_zone/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/client_zone/components/ui/card";

/**
 * WHY:   Signed-in clients need one lightweight place to revisit the sessions they decided to keep.
 * WHAT:  Renders locally saved conversation snapshots behind an auth gate.
 * HOW:   Reads the saved history hook and falls back to a sign-in callout for guests.
 */
export function ClientHistoryPage() {
  const { isAuthenticated } = useConvexAuth();
  const { dictionary, locale } = useLocaleDictionary();
  const history = useClientHistory();

  return (
    <div className="min-h-screen bg-[var(--workspace-shell)]">
      <ChatHeader isAuthenticated={isAuthenticated} />
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-6 sm:px-6">
        <Card className="rounded-[30px] border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] shadow-[0_20px_44px_rgba(15,23,42,0.06)]">
          <CardHeader>
            <CardTitle>{dictionary.app.historyTitle}</CardTitle>
            <CardDescription>{dictionary.app.historyDescription}</CardDescription>
          </CardHeader>
        </Card>
        {!isAuthenticated ? (
          <ChatAuthGateNotice returnTo="/app/history" />
        ) : history.length === 0 ? (
          <Card><CardContent className="p-4 text-sm text-slate-600">{dictionary.app.historyEmpty}</CardContent></Card>
        ) : (
          <div className="flex flex-col gap-3">
            {history.map((item) => (
              <Card key={item.id} className="rounded-[28px] border-[color:var(--workspace-border)] bg-[var(--workspace-panel)]">
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <h2 className="text-sm font-semibold text-slate-900">{item.title}</h2>
                    <p className="text-sm leading-6 text-slate-600">{item.preview ?? dictionary.app.historyEmpty}</p>
                    <p className="text-xs text-slate-400">
                      {new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(item.updatedAt)}
                    </p>
                  </div>
                  <Link href={`/app?threadId=${encodeURIComponent(item.id)}`}>
                    <Button variant="outline">{dictionary.app.backToAssistant}</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
