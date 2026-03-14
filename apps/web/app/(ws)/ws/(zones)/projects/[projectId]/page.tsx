import { notFound } from "next/navigation";
import ProjectDetailPage from "../ProjectDetailPage";
import { requireWorkspaceData } from "../../../_lib/workspaceData";
import { getWorkspacePropertyZone } from "@/server/ws/zones";
import { mapPropertyToWorkspaceProject } from "../projectViewModel";

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
  const property = await getWorkspacePropertyZone(workspace.audience, workspace.ownerContext).getProperty({ id: projectId }).catch(() => null);
  const project = property ? mapPropertyToWorkspaceProject(property) : null;

  if (!project) {
    notFound();
  }

  return <ProjectDetailPage project={project} />;
}
