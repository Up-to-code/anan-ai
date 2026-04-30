import { cache } from "react";
import { requireWorkspaceData } from "../../../_lib/workspaceData";
import { resolveWorkspaceProjectDetail } from "@/server/domains/workspace/properties/detail";
import { requireSessionContext } from "@/server/auth/session";
import { convexOrganizationAssetsRepository } from "@/server/infrastructure/convex/organizations/assets";
import { convexProjectAccessRepository } from "@/server/infrastructure/convex/properties/access";
import { getWorkspaceProjectZone } from "@/server/ws/zones";
import {
  mapPropertyToWorkspaceProjectDetail,
  mapWorkspaceProjectUnitDetail,
} from "../shared/lib/projectViewModel";

export const loadProjectsWorkspace = cache(async () => {
  const workspace = await requireWorkspaceData("/ws/projects");
  const projectsZone = getWorkspaceProjectZone(workspace.audience, workspace.ownerContext);
  const payload = await projectsZone.getProjectsWorkspace();

  return {
    audience: workspace.audience,
    projects: payload.page.map((detail) =>
      mapPropertyToWorkspaceProjectDetail(detail.property, "owner", { dossier: detail }),
    ),
  };
});

export const loadProjectWorkspaceDetail = cache(async (projectId: string) => {
  const workspace = await requireWorkspaceData(`/ws/projects/${projectId}`);
  const session = await requireSessionContext();
  const projectsZone = getWorkspaceProjectZone(workspace.audience, workspace.ownerContext);
  const ownerDetail = await projectsZone.getProjectWorkspaceDetail({ projectId }).catch(() => null);
  const propertyId = ownerDetail?.property?._id ?? projectId;
  const resolved = await resolveWorkspaceProjectDetail({
    projectId: propertyId,
    audience: workspace.audience,
    ownerContext: workspace.ownerContext,
  });

  if (!resolved) {
    return null;
  }

  const dossier = ownerDetail ?? await projectsZone.getProjectDossier({ propertyId }).catch(() => null);
  const [assets, viewers] = await Promise.all([
    convexOrganizationAssetsRepository.listProjectAssetsForViewer(session.token, propertyId),
    resolved.accessMode === "owner"
      ? convexProjectAccessRepository.listPropertyViewers(session.token, propertyId).catch(() => [])
      : Promise.resolve([]),
  ]);
  const project = mapPropertyToWorkspaceProjectDetail(resolved.property, resolved.accessMode, {
    viewers,
    assets,
    dossier,
  });

  return {
    audience: workspace.audience,
    ownerContext: workspace.ownerContext,
    propertyId,
    project,
  };
});

export const loadProjectWorkspaceUnit = cache(async (projectId: string, unitId: string) => {
  const detail = await loadProjectWorkspaceDetail(projectId);
  if (!detail) return null;
  const unit = mapWorkspaceProjectUnitDetail(detail.project, unitId);
  return unit ? { ...detail, unit } : null;
});
