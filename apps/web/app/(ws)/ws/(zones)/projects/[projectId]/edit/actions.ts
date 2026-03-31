"use server";

import { requireSessionContext } from "@/server/auth/session";
import { convexOrganizationAssetsRepository } from "@/server/infrastructure/convex/organizationAssetsRepository";
import { convexProjectAccessRepository } from "@/server/infrastructure/convex/projectAccessRepository";
import { getWorkspacePropertyZone } from "@/server/ws/zones";
import { mapWorkspaceProjectToPropertyInput } from "../../projectViewModel";
import type { ProjectFormData } from "@/app/(ws)/ws/public";
import { attachProjectFormAssets } from "../../projectFormServer";
import { toProjectFormActionFailure, validateProjectFormSubmission } from "../../projectFormSubmission";

type WorkspaceActionArgs = {
  audience: Parameters<typeof getWorkspacePropertyZone>[0];
  ownerContext: Parameters<typeof getWorkspacePropertyZone>[1];
  projectId: string;
};

export async function saveProjectAction(args: WorkspaceActionArgs, data: ProjectFormData) {
  const validationFeedback = validateProjectFormSubmission(data);
  if (validationFeedback) {
    return { ok: false, feedback: validationFeedback } as const;
  }

  try {
    const actionZone = getWorkspacePropertyZone(args.audience, args.ownerContext);
    await actionZone.updateProperty({
      id: args.projectId,
      patch: mapWorkspaceProjectToPropertyInput(data),
    });
    await attachProjectFormAssets(args.projectId, data);
    return { ok: true, redirectTo: `/ws/projects/${args.projectId}` } as const;
  } catch (error) {
    return toProjectFormActionFailure(error);
  }
}

export async function deleteProjectAction(args: WorkspaceActionArgs) {
  const session = await requireSessionContext();
  await convexOrganizationAssetsRepository.markEntityAssetsPendingDelete(session.token, {
    attachedEntityType: "project",
    attachedEntityId: args.projectId,
    deletionReason: "project_deleted",
  });
  await getWorkspacePropertyZone(args.audience, args.ownerContext).deleteProperty({ id: args.projectId });
  return { redirectTo: "/ws/projects" };
}

export async function revokeProjectViewerAction(args: WorkspaceActionArgs, viewerAuthUserId: string) {
  const session = await requireSessionContext();
  await convexProjectAccessRepository.revokePropertyViewer(session.token, {
    propertyId: args.projectId,
    viewerAuthUserId,
  });
}
