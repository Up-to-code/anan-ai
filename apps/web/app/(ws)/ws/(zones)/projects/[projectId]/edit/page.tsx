import { notFound } from "next/navigation";
import ProjectFormScreen from "../../ProjectFormScreen";
import { requireWorkspaceData } from "../../../../_lib/workspaceData";
import { getWorkspacePropertyZone } from "@/server/ws/zones";
import { mapPropertyToWorkspaceProject, mapWorkspaceProjectToPropertyInput } from "../../projectViewModel";

type EditProjectRouteProps = {
  params: Promise<{ projectId: string }>;
};

/**
 * WHY:   Editing a project needs the same rich form as creation, pre-filled with existing property data.
 * WHAT:  Server component that loads a property by ID and renders the edit form client view.
 * HOW:   Reads the real property once and maps it into the shared form payload.
 */
export default async function EditProjectRoute({ params }: EditProjectRouteProps) {
  const { projectId } = await params;
  const workspace = await requireWorkspaceData(`/ws/projects/${projectId}/edit`);
  const audience = workspace.audience;
  const ownerContext = workspace.ownerContext ?? null;
  const propertiesZone = getWorkspacePropertyZone(audience, ownerContext);
  const property = await propertiesZone.getProperty({ id: projectId }).catch(() => null);
  const project = property ? mapPropertyToWorkspaceProject(property) : null;

  if (!project) {
    notFound();
  }

  async function saveProject(data: import("@/components/shared/ag-aui/AgPropertyForm").ProjectFormData) {
    "use server";

    const actionZone = getWorkspacePropertyZone(audience, ownerContext);

    await actionZone.updateProperty({
      id: projectId,
      patch: mapWorkspaceProjectToPropertyInput(data),
    });
    if (data.status === "active") {
      await actionZone.publishProperty({ id: projectId });
    }

    return { redirectTo: `/ws/projects/${projectId}` };
  }

  async function deleteProject() {
    "use server";

    await getWorkspacePropertyZone(audience, ownerContext).deleteProperty({ id: projectId });
    return { redirectTo: "/ws/projects" };
  }

  return (
    <ProjectFormScreen
      projectId={projectId}
      initialData={{
        name: project.title,
        price: project.priceLabel,
        location: project.location,
        description: project.summary,
        rooms: project.specs.rooms.replace(/[^\d]/g, ""),
        baths: project.specs.baths.replace(/[^\d]/g, ""),
        area: project.specs.area.replace(/[^\d]/g, ""),
        status:
          project.publicationState === "published"
            ? "active"
            : project.publicationState === "archived"
              ? "maintenance"
              : "pending",
        images: property?.media ?? [],
        brokerId: null,
      }}
      title="تعديل المشروع"
      description={`${project.title} — تعديل البيانات والصور.`}
      submitLabel="حفظ التعديلات"
      onSave={saveProject}
      onDelete={deleteProject}
    />
  );
}
