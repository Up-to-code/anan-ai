"use server";

import { requireSessionContext } from "@/server/auth/session";
import { convexOrganizationAssetsRepository } from "@/server/infrastructure/convex/organizations/assets";
import { convexProjectAccessRepository } from "@/server/infrastructure/convex/properties/access";
import { getWorkspaceProjectZone, getWorkspacePropertyZone } from "@/server/ws/zones";
import {
  mapWorkspaceProjectToAdLicenseInput,
  mapWorkspaceProjectToBrokerAuthorizationInput,
  mapWorkspaceProjectToComplianceDocumentInputs,
  mapWorkspaceProjectToDossierInput,
  mapWorkspaceProjectToPaymentPlanInputs,
  mapWorkspaceProjectToPropertyInput,
  mapWorkspaceProjectToUnitInputs,
} from "../../shared/lib/projectViewModel";
import type { ProjectFormData } from "@/app/(ws)/ws/public";
import { toProjectFormActionFailure, validateProjectFormSubmission } from "../../shared/forms/projectFormSubmission";

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
    const projectZone = getWorkspaceProjectZone(args.audience, args.ownerContext);
    const session = await requireSessionContext();
    await actionZone.updateProperty({
      id: args.projectId,
      patch: mapWorkspaceProjectToPropertyInput(data),
    });
    const dossierResult = await projectZone.saveProjectDossierDraft(mapWorkspaceProjectToDossierInput(args.projectId, data));
    await projectZone.saveProjectUnits({ propertyId: args.projectId, units: mapWorkspaceProjectToUnitInputs(data) });
    await projectZone.saveProjectPaymentPlans({ propertyId: args.projectId, paymentPlans: mapWorkspaceProjectToPaymentPlanInputs(data) });
    await projectZone.saveProjectComplianceDocuments({ propertyId: args.projectId, documents: mapWorkspaceProjectToComplianceDocumentInputs(data) });
    await projectZone.saveProjectAdLicense({ propertyId: args.projectId, adLicense: mapWorkspaceProjectToAdLicenseInput(data) });
    await projectZone.saveProjectBrokerAuthorization({ propertyId: args.projectId, authorization: mapWorkspaceProjectToBrokerAuthorizationInput(data) });

    const imageKeys = data.images.map((image) => image.key);
    const permitKeys = data.privatePermitFiles.map((file) => file.key);

    if (imageKeys.length > 0) {
      await convexOrganizationAssetsRepository.attachOrganizationAssets(session.token, {
        keys: imageKeys,
        attachedEntityType: "project",
        attachedEntityId: args.projectId,
        visibilityScope: data.clientVisibility === "public" ? "public_project" : "organization",
      });
    }

    if (permitKeys.length > 0) {
      await convexOrganizationAssetsRepository.attachOrganizationAssets(session.token, {
        keys: permitKeys,
        attachedEntityType: "project",
        attachedEntityId: args.projectId,
        visibilityScope: "project_private_share",
      });
    }

    return { ok: true, redirectTo: `/ws/projects/${dossierResult.dossierId ?? args.projectId}` } as const;
  } catch (error) {
    return toProjectFormActionFailure(error);
  }
}

export async function deleteProjectAction(args: WorkspaceActionArgs) {
  const session = await requireSessionContext();
  await convexOrganizationAssetsRepository.markEntityAssetsPendingDelete(session.token, {
    attachedEntityType: "project",
    attachedEntityId: args.projectId,
    deletionReason: "project_archived",
  });
  await getWorkspaceProjectZone(args.audience, args.ownerContext).archiveProject({ propertyId: args.projectId });
  return { redirectTo: "/ws/projects" };
}

export async function revokeProjectViewerAction(args: WorkspaceActionArgs, viewerAuthUserId: string) {
  const session = await requireSessionContext();
  await convexProjectAccessRepository.revokePropertyViewer(session.token, {
    propertyId: args.projectId,
    viewerAuthUserId,
  });
}
