import { notFound, redirect } from "next/navigation";
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
  const projectsZone = getWorkspaceProjectZone(workspace.audience, workspace.ownerContext);
  const canonicalDossier = await projectsZone.getProjectDossierByProjectId({ projectId }).catch(() => null);
  const propertyId = canonicalDossier?.property?._id ?? projectId;
  const resolved = await resolveWorkspaceProjectDetail({
    projectId: propertyId,
    audience: workspace.audience,
    ownerContext: workspace.ownerContext,
  });
  const legacyDossier = canonicalDossier
    ? null
    : resolved
      ? await projectsZone.getProjectDossier({ propertyId }).catch(() => null)
      : null;
  if (!canonicalDossier && legacyDossier?.dossier?._id) {
    redirect(`/ws/projects/${legacyDossier.dossier._id}`);
  }
  const [assets, viewers] = await Promise.all([
    resolved ? convexOrganizationAssetsRepository.listProjectAssetsForViewer(session.token, propertyId) : Promise.resolve([]),
    resolved?.accessMode === "owner"
      ? convexProjectAccessRepository.listPropertyViewers(session.token, propertyId).catch(() => [])
      : Promise.resolve([]),
  ]);
  const dossier = canonicalDossier ?? legacyDossier;
  const project = resolved
    ? mapPropertyToWorkspaceProjectDetail(resolved.property, resolved.accessMode, { viewers, assets, dossier })
    : null;

  if (!project) {
    notFound();
  }

  async function publishProject(): Promise<ProjectMutationActionResult> {
    "use server";

    try {
      await getWorkspacePropertyZone(workspace.audience, workspace.ownerContext).publishProperty({ id: propertyId });
      return { ok: true };
    } catch (error) {
      const domainError = normalizeDomainError(error);
      return { ok: false, code: domainError.code, message: domainError.message };
    }
  }

  async function deleteProject(): Promise<ProjectMutationActionResult> {
    "use server";

    try {
      await getWorkspacePropertyZone(workspace.audience, workspace.ownerContext).deleteProperty({ id: propertyId });
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
      id: propertyId,
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
