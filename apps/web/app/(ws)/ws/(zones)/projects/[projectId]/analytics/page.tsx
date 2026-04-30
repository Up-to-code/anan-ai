import { notFound } from "next/navigation";
import { requireWorkspaceData } from "../../../../_lib/workspaceData";
import { getWorkspacePropertyZone } from "@/server/ws/zones";
import ProjectAnalyticsPage from "../../pages/ProjectAnalyticsPage";
import { normalizeDomainError } from "@/server/contracts/errors";
import { loadProjectWorkspaceDetail } from "../../loaders/projectWorkspace";

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
  const detail = await loadProjectWorkspaceDetail(projectId);
  if (!detail || detail.project.accessMode !== "owner") {
    notFound();
  }

  const analytics = await getWorkspacePropertyZone(workspace.audience, workspace.ownerContext)
    .getProjectAnalytics({ id: detail.propertyId })
    .catch((error) => {
      const domainError = normalizeDomainError(error);
      if (domainError.code === "NOT_FOUND" || domainError.code === "FORBIDDEN") {
        notFound();
      }
      throw error;
    });

  return (
    <ProjectAnalyticsPage
      project={detail.project}
      analytics={analytics}
      ownerAudience={workspace.audience === "developer" ? "developer" : "broker"}
    />
  );
}
