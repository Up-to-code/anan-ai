import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/client_zone/components/ui/card";
import type { BrokerProfileCardProps } from "../types";

/**
 * WHY:   Trust-building in the client assistant depends on showing who will handle the next step, not just listing a CTA.
 * WHAT:  Renders a compact advisor or broker profile summary inside the assistant thread.
 * HOW:   Highlights only the identity and proof points that matter to a client.
 */
export function BrokerProfileCard(props: BrokerProfileCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{props.title}</CardTitle>
        <CardDescription>{props.summary}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        <div>
          <div className="text-xs text-slate-500">Advisor</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">{props.brokerName}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Agency</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">{props.brokerAgency}</div>
        </div>
        <div className="flex gap-6">
          <div>
            <div className="text-xs text-slate-500">Rating</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">{props.rating.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Listings</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">{props.activeListings}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
