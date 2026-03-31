import ProjectFormScreen from "../ProjectFormScreen";
import { requireWorkspaceData } from "../../../_lib/workspaceData";
import { getWorkspacePropertyZone } from "@/server/ws/zones";
import { mapWorkspaceProjectToPropertyInput } from "../projectViewModel";
import { attachProjectFormAssets } from "../projectFormServer";
import { toProjectFormActionFailure, validateProjectFormSubmission } from "../projectFormSubmission";

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

    const validationFeedback = validateProjectFormSubmission(data);
    if (validationFeedback) {
      return { ok: false, feedback: validationFeedback } as const;
    }

    try {
      const propertiesZone = getWorkspacePropertyZone(audience, ownerContext);
      const id = await propertiesZone.createProperty(mapWorkspaceProjectToPropertyInput(data));
      await attachProjectFormAssets(id, data);
      return { ok: true, redirectTo: `/ws/projects/${id}` } as const;
    } catch (error) {
      return toProjectFormActionFailure(error);
    }
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
