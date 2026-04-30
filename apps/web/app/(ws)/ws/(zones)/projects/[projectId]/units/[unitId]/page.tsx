import { notFound } from "next/navigation";
import { getWorkspaceProjectZone } from "@/server/ws/zones";
import UnitDetailPage from "../../../pages/UnitDetailPage";
import { normalizeDomainError } from "@/server/contracts/errors";
import type { ProjectMutationActionResult } from "../../../pages/ProjectsPage/actionTypes";
import { loadProjectWorkspaceUnit } from "../../../loaders/projectWorkspace";

type WorkspaceUnitDetailRouteProps = {
  params: Promise<{ projectId: string; unitId: string }>;
};

export default async function WorkspaceUnitDetailRoute({
  params,
}: WorkspaceUnitDetailRouteProps) {
  const { projectId, unitId } = await params;
  const detail = await loadProjectWorkspaceUnit(projectId, unitId);

  if (!detail) {
    notFound();
  }
  const resolvedDetail = detail;

  async function deleteUnit(): Promise<ProjectMutationActionResult> {
    "use server";

    try {
      await getWorkspaceProjectZone(resolvedDetail.audience, resolvedDetail.ownerContext).applyProjectUnitBulkActions({
        propertyId: resolvedDetail.propertyId,
        actions: [{ type: "delete", unitId }],
      });
      return { ok: true };
    } catch (error) {
      const domainError = normalizeDomainError(error);
      return { ok: false, code: domainError.code, message: domainError.message };
    }
  }

  return <UnitDetailPage unit={resolvedDetail.unit} canEdit={resolvedDetail.project.canEdit} onDeleteUnit={deleteUnit} />;
}
