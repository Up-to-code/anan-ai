import { notFound } from "next/navigation";
import ProjectDetailPage from "../ProjectDetailPage";
import { requireWorkspaceData } from "../../../_lib/workspaceData";
import { resolveWorkspaceProjectDetail } from "@/server/domains/workspace/properties/detail";
import { mapPropertyToWorkspaceProjectDetail } from "../projectViewModel";
import { requireSessionContext } from "@/server/auth/session";
import { convexOrganizationAssetsRepository } from "@/server/infrastructure/convex/organizationAssetsRepository";
import { convexProjectAccessRepository } from "@/server/infrastructure/convex/projectAccessRepository";
import { normalizeDomainError } from "@/server/contracts/errors";
import type {
  ProjectAnalyticsEventType,
} from "@/server/contracts/properties";
import type { ProjectMutationActionResult } from "../ProjectsPage/actionTypes";

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
  const session = await requireSessionContext();
  const resolved = await resolveWorkspaceProjectDetail({
    projectId,
    audience: workspace.audience,
    ownerContext: workspace.ownerContext,
  });
  const [assets, viewers] = await Promise.all([
    resolved ? convexOrganizationAssetsRepository.listProjectAssetsForViewer(session.token, projectId) : Promise.resolve([]),
    resolved?.accessMode === "owner"
      ? convexProjectAccessRepository.listPropertyViewers(session.token, projectId).catch(() => [])
      : Promise.resolve([]),
  ]);
  const project = resolved
    ? mapPropertyToWorkspaceProjectDetail(resolved.property, resolved.accessMode, { viewers, assets })
    : null;

  if (!project) {
    notFound();
  }

  async function publishProject(): Promise<ProjectMutationActionResult> {
    "use server";

    try {
      await getWorkspacePropertyZone(workspace.audience, workspace.ownerContext).publishProperty({ id: projectId });
      return { ok: true };
    } catch (error) {
      const domainError = normalizeDomainError(error);
      return { ok: false, code: domainError.code, message: domainError.message };
    }
  }

  async function deleteProject(): Promise<ProjectMutationActionResult> {
    "use server";

    try {
      await getWorkspacePropertyZone(workspace.audience, workspace.ownerContext).deleteProperty({ id: projectId });
      return { ok: true };
    } catch (error) {
      const domainError = normalizeDomainError(error);
      return { ok: false, code: domainError.code, message: domainError.message };
    }
  }

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
    <ProjectDetailPage
      project={project}
      onPublishProject={publishProject}
      onDeleteProject={deleteProject}
      onTrackProjectEvent={recordProjectAnalyticsEvent}
    />
  );
}
