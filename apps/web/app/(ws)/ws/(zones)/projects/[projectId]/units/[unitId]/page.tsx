import { notFound } from "next/navigation";
import { requireWorkspaceData } from "../../../../../_lib/workspaceData";
import { resolveWorkspaceProjectDetail } from "@/server/domains/workspace/properties/detail";
import { getWorkspaceProjectZone } from "@/server/ws/zones";
import {
  mapPropertyToWorkspaceProjectDetail,
  mapWorkspaceProjectUnitDetail,
} from "../../../shared/lib/projectViewModel";
import UnitDetailPage from "../../../pages/UnitDetailPage";

type WorkspaceUnitDetailRouteProps = {
  params: Promise<{ projectId: string; unitId: string }>;
};

/**
 * WHY:   Inventory units need their own workspace URL so teams can inspect and share unit-level context.
 * WHAT:  Loads the parent project and dossier unit records, then renders the selected unit detail page.
 * HOW:   Uses Anan workspace zones only and returns 404 for inaccessible projects or unknown units.
 */
export default async function WorkspaceUnitDetailRoute({
  params,
}: WorkspaceUnitDetailRouteProps) {
  const { projectId, unitId } = await params;
  const workspace = await requireWorkspaceData(`/ws/projects/${projectId}/units/${unitId}`);
  const projectsZone = getWorkspaceProjectZone(workspace.audience, workspace.ownerContext);
  const canonicalDossier = await projectsZone.getProjectDossierByProjectId({ projectId }).catch(() => null);
  const propertyId = canonicalDossier?.property?._id ?? projectId;
  const resolved = await resolveWorkspaceProjectDetail({
    projectId: propertyId,
    audience: workspace.audience,
    ownerContext: workspace.ownerContext,
  });

  if (!resolved) {
    notFound();
  }

  const dossier = canonicalDossier ?? await projectsZone.getProjectDossier({ propertyId }).catch(() => null);
  const project = mapPropertyToWorkspaceProjectDetail(resolved.property, resolved.accessMode, { dossier });
  const unit = mapWorkspaceProjectUnitDetail(project, unitId);

  if (!unit) {
    notFound();
  }

  return <UnitDetailPage unit={unit} />;
}
