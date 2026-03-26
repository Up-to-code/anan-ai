import { notFound } from "next/navigation";
import ProjectDetailPage from "../ProjectDetailPage";
import { requireWorkspaceData } from "../../../_lib/workspaceData";
import { resolveWorkspaceProjectDetail } from "@/server/domains/workspace/properties/detail";
import { mapPropertyToWorkspaceProjectDetail } from "../projectViewModel";

type WorkspaceProjectDetailRouteProps = {
  params: Promise<{ projectId: string }>;
};

/**
 * WHY:   Project cards and assignment rows should drill into a dedicated property workspace page.
 * WHAT:  Resolves one real property record and renders its detail screen.
 * HOW:   Uses the audience-aware property zone and returns a 404 when the id is unknown.
 */
export default async function WorkspaceProjectDetailRoute({
  params,
}: WorkspaceProjectDetailRouteProps) {
  const { projectId } = await params;
  const workspace = await requireWorkspaceData(`/ws/projects/${projectId}`);
  const resolved = await resolveWorkspaceProjectDetail({
    projectId,
    audience: workspace.audience,
    ownerContext: workspace.ownerContext,
  });
  const project = resolved
    ? mapPropertyToWorkspaceProjectDetail(resolved.property, resolved.accessMode)
    : null;

  if (!project) {
    notFound();
  }

  return <ProjectDetailPage project={project} />;
}
