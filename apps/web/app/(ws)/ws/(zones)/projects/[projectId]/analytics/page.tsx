import { notFound } from "next/navigation";
import { requireWorkspaceData } from "../../../../_lib/workspaceData";
import { resolveWorkspaceProjectDetail } from "@/server/domains/workspace/properties/detail";
import { mapPropertyToWorkspaceProjectDetail } from "../../shared/lib/projectViewModel";
import { getWorkspacePropertyZone } from "@/server/ws/zones";
import ProjectAnalyticsPage from "../../pages/ProjectAnalyticsPage";
import { normalizeDomainError } from "@/server/contracts/errors";
import type { ProjectAnalyticsEventType } from "@/server/contracts/properties";

/**
 * WHY:   Project analytics should live on a dedicated route so owners can inspect performance without crowding the detail page.
 * WHAT:  Loads one owner-managed project plus its aggregated analytics projection and renders the analytics workspace page.
 * HOW:   Reuses the shared project detail resolver, blocks shared viewers, then reads analytics from the workspace property zone.
 */
export default async function WorkspaceProjectAnalyticsRoute({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const workspace = await requireWorkspaceData(`/ws/projects/${projectId}/analytics`);
  const resolved = await resolveWorkspaceProjectDetail({
    projectId,
    audience: workspace.audience,
    ownerContext: workspace.ownerContext,
  });

  if (!resolved || resolved.accessMode !== "owner") {
    notFound();
  }

  const project = mapPropertyToWorkspaceProjectDetail(resolved.property, "owner");
  const analytics = await getWorkspacePropertyZone(workspace.audience, workspace.ownerContext)
    .getProjectAnalytics({ id: projectId })
    .catch((error) => {
      const domainError = normalizeDomainError(error);
      if (domainError.code === "NOT_FOUND" || domainError.code === "FORBIDDEN") {
        notFound();
      }
      throw error;
    });

  async function recordProjectAnalyticsEvent(input: {
    eventType: ProjectAnalyticsEventType;
    source: string;
  }) {
    "use server";

    await getWorkspacePropertyZone(workspace.audience, workspace.ownerContext).recordProjectAnalyticsEvent({
      id: projectId,
      eventType: input.eventType,
      source: input.source,
    });
    return { ok: true as const };
  }

  return (
    <ProjectAnalyticsPage
      project={project}
      analytics={analytics}
      ownerAudience={workspace.audience === "developer" ? "developer" : "broker"}
      onTrackProjectEvent={recordProjectAnalyticsEvent}
    />
  );
}
