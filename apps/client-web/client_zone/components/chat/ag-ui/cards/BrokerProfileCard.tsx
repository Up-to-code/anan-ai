import {
  AgUiCardHeading,
  AgUiCardShell,
  AgUiMetricTile,
  CardContent,
} from "../AgUiCardPrimitives";
import type { BrokerProfileCardProps } from "../types";

/**
 * WHY:   Trust-building in the client assistant depends on showing who will handle the next step, not just listing a CTA.
 * WHAT:  Renders a compact advisor or broker profile summary inside the assistant thread.
 * HOW:   Highlights only the identity and proof points that matter to a client.
 */
export function BrokerProfileCard(props: BrokerProfileCardProps) {
  return (
    <AgUiCardShell>
      <AgUiCardHeading title={props.title} summary={props.summary} />
      <CardContent className="grid gap-3 pt-0 sm:grid-cols-2 xl:grid-cols-4">
        <AgUiMetricTile label="Advisor" value={props.brokerName} />
        <AgUiMetricTile label="Agency" value={props.brokerAgency} />
        <AgUiMetricTile label="Rating" value={props.rating.toFixed(1)} />
        <AgUiMetricTile label="Listings" value={props.activeListings} />
      </CardContent>
    </AgUiCardShell>
  );
}
