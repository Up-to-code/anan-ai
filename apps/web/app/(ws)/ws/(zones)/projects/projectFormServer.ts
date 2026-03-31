import type { ProjectFormData } from "@/app/(ws)/ws/public";
import { requireSessionContext } from "@/server/auth/session";
import { convexOrganizationAssetsRepository } from "@/server/infrastructure/convex/organizationAssetsRepository";

/**
 * WHY:   Project create/edit flows attach the same uploaded assets after the property write succeeds.
 * WHAT:  Persists uploaded media and private permit files against the saved project id.
 * HOW:   Resolves the current session token once, then applies the correct visibility scope for each asset set.
 */
export async function attachProjectFormAssets(projectId: string, data: ProjectFormData) {
  const session = await requireSessionContext();
  const imageKeys = data.images.map((image) => image.key);
  const permitKeys = data.privatePermitFiles.map((file) => file.key);

  if (imageKeys.length > 0) {
    await convexOrganizationAssetsRepository.attachOrganizationAssets(session.token, {
      keys: imageKeys,
      attachedEntityType: "project",
      attachedEntityId: projectId,
      visibilityScope: data.clientVisibility === "public" ? "public_project" : "organization",
    });
  }

  if (permitKeys.length > 0) {
    await convexOrganizationAssetsRepository.attachOrganizationAssets(session.token, {
      keys: permitKeys,
      attachedEntityType: "project",
      attachedEntityId: projectId,
      visibilityScope: "project_private_share",
    });
  }
}
