import {
  AgUiCardHeading,
  AgUiCardShell,
  AgUiMetricTile,
  CardContent,
} from "../AgUiCardPrimitives";
import type { DeveloperProfileCardProps } from "../types";

/**
 * WHY:   Buyers often need one confidence block about the developer before taking the next step.
 * WHAT:  Renders the surfaced developer summary inside the assistant thread.
 * HOW:   Uses a flat info layout that reads as due-diligence context, not dashboard analytics.
 */
export function DeveloperProfileCard(props: DeveloperProfileCardProps) {
  return (
    <AgUiCardShell>
      <AgUiCardHeading title={props.title} summary={props.summary} />
      <CardContent className="grid gap-3 pt-0 sm:grid-cols-3">
        <AgUiMetricTile label="Developer" value={props.developerName} />
        <AgUiMetricTile label="Established" value={props.establishedYear} />
        <AgUiMetricTile label="Completed projects" value={props.completedProjects} />
      </CardContent>
    </AgUiCardShell>
  );
}
