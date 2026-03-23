import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/client_zone/components/ui/card";
import type { DeveloperProfileCardProps } from "../types";

/**
 * WHY:   Buyers often need one confidence block about the developer before taking the next step.
 * WHAT:  Renders the surfaced developer summary inside the assistant thread.
 * HOW:   Uses a flat info layout that reads as due-diligence context, not dashboard analytics.
 */
export function DeveloperProfileCard(props: DeveloperProfileCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{props.title}</CardTitle>
        <CardDescription>{props.summary}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        <div>
          <div className="text-xs text-slate-500">Developer</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">{props.developerName}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Established</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">{props.establishedYear}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Completed projects</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">{props.completedProjects}</div>
        </div>
      </CardContent>
    </Card>
  );
}
