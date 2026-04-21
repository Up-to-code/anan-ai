import { notFound } from "next/navigation";
import ProjectDetailPage from "../pages/ProjectDetailPage";
import { requireWorkspaceData } from "../../../_lib/workspaceData";
import { resolveWorkspaceProjectDetail } from "@/server/domains/workspace/properties/detail";
import { mapPropertyToWorkspaceProjectDetail } from "../shared/lib/projectViewModel";
import { requireSessionContext } from "@/server/auth/session";
import { convexOrganizationAssetsRepository } from "@/server/infrastructure/convex/organizations/assets";
import { convexProjectAccessRepository } from "@/server/infrastructure/convex/properties/access";
import { normalizeDomainError } from "@/server/contracts/errors";
import { getWorkspaceProjectZone, getWorkspacePropertyZone } from "@/server/ws/zones";
import type {
  ProjectAnalyticsEventType,
} from "@/server/contracts/properties";
import type { ProjectMutationActionResult } from "../pages/ProjectsPage/actionTypes";

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
  const dossier = resolved
    ? await getWorkspaceProjectZone(workspace.audience, workspace.ownerContext).getProjectDossier({ propertyId: projectId }).catch(() => null)
    : null;
  const project = resolved
    ? mapPropertyToWorkspaceProjectDetail(resolved.property, resolved.accessMode, { viewers, assets, dossier })
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
