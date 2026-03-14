import ProjectFormScreen from "../ProjectFormScreen";
import { requireWorkspaceData } from "../../../_lib/workspaceData";
import { getWorkspacePropertyZone } from "@/server/ws/zones";
import { mapWorkspaceProjectToPropertyInput } from "../projectViewModel";

/**
 * WHY:   Projects need a direct-mode creation route to complement AI-driven draft creation.
 * WHAT:  Renders the server-backed create-project flow.
 * HOW:   Resolves workspace behavior once, then saves through the audience-specific property server functions.
 */
export default async function CreateProjectPage() {
  const workspace = await requireWorkspaceData("/ws/projects/create");
  const audience = workspace.audience;
  const ownerContext = workspace.ownerContext ?? null;

  async function createProject(data: import("@/components/shared/ag-aui/AgPropertyForm").ProjectFormData) {
    "use server";

    const propertiesZone = getWorkspacePropertyZone(audience, ownerContext);
    const id = await propertiesZone.createProperty(mapWorkspaceProjectToPropertyInput(data));
    if (data.status === "active") {
      await propertiesZone.publishProperty({ id });
    }

    return { redirectTo: `/ws/projects/${id}` };
  }

  return (
    <ProjectFormScreen
      title="إنشاء مشروع"
      description="أضف مشروعاً جديداً وارفع صوره ثم احفظه داخل مساحة العمل."
      submitLabel="حفظ المشروع"
      onSave={createProject}
    />
  );
}
