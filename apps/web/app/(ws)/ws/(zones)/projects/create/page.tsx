import ProjectFormScreen from "../ProjectFormScreen";
import { requireWorkspaceData } from "../../../_lib/workspaceData";
import { getWorkspacePropertyZone } from "@/server/ws/zones";
import { mapWorkspaceProjectToPropertyInput } from "../projectViewModel";
import { requireSessionContext } from "@/server/auth/session";
import { convexOrganizationAssetsRepository } from "@/server/infrastructure/convex/organizationAssetsRepository";

/**
 * WHY:   Projects need a direct-mode creation route to complement AI-driven draft creation.
 * WHAT:  Renders the server-backed create-project flow.
 * HOW:   Resolves workspace behavior once, then saves through the audience-specific property server functions.
 */
export default async function CreateProjectPage() {
  const workspace = await requireWorkspaceData("/ws/projects/create");
  const audience = workspace.audience;
  const ownerContext = workspace.ownerContext ?? null;

  async function createProject(data: import("@/app/(ws)/ws/public").ProjectFormData) {
    "use server";

    const propertiesZone = getWorkspacePropertyZone(audience, ownerContext);
    const id = await propertiesZone.createProperty(mapWorkspaceProjectToPropertyInput(data));
    const session = await requireSessionContext();
    const imageKeys = data.images.map((image) => image.key);
    const permitKeys = data.privatePermitFiles.map((file) => file.key);

    if (imageKeys.length > 0) {
      await convexOrganizationAssetsRepository.attachOrganizationAssets(session.token, {
        keys: imageKeys,
        attachedEntityType: "project",
        attachedEntityId: id,
        visibilityScope: data.clientVisibility === "public" ? "public_project" : "organization",
      });
    }

    if (permitKeys.length > 0) {
      await convexOrganizationAssetsRepository.attachOrganizationAssets(session.token, {
        keys: permitKeys,
        attachedEntityType: "project",
        attachedEntityId: id,
        visibilityScope: "project_private_share",
      });
    }

    return { redirectTo: `/ws/projects/${id}` };
  }

  return (
    <ProjectFormScreen
      title="إعداد مشروع جديد"
      description="اتبع الخطوات لإدخال بيانات المشروع، ترتيب المعرض، ضبط الوصول، ثم مراجعة النسخة النهائية قبل الحفظ."
      submitLabel="حفظ المشروع"
      onSave={createProject}
    />
  );
}
