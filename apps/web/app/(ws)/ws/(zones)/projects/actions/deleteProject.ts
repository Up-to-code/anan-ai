"use server";

import { requireSessionContext } from "@/server/auth/session";
import { convexOrganizationAssetsRepository } from "@/server/infrastructure/convex/organizations/assets";
import { getWorkspaceProjectZone } from "@/server/ws/zones";
import { redirect } from "next/navigation";
import { requireWorkspaceData } from "../../../_lib/workspaceData";
import type { ProjectMutationActionResult } from "../pages/ProjectsPage/actionTypes";
import { toProjectActionResult } from "../shared/lib/projectActions";

export async function deleteProjectAction(propertyId: string): Promise<ProjectMutationActionResult> {
  try {
    const workspace = await requireWorkspaceData(`/ws/projects/${propertyId}`);
    const session = await requireSessionContext();
    await convexOrganizationAssetsRepository.markEntityAssetsPendingDelete(session.token, {
      attachedEntityType: "project",
      attachedEntityId: propertyId,
      deletionReason: "project_archived",
    });
    await getWorkspaceProjectZone(workspace.audience, workspace.ownerContext).archiveProject({ propertyId });
  } catch (error) {
    return toProjectActionResult(error);
  }
  redirect("/ws/projects");
}
