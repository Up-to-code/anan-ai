import { notFound } from "next/navigation";
import ProjectFormScreen from "../../ProjectFormScreen";
import { requireWorkspaceData } from "../../../../_lib/workspaceData";
import { getWorkspacePropertyZone } from "@/server/ws/zones";
import { mapPropertyToWorkspaceProject, mapWorkspaceProjectToPropertyInput } from "../../projectViewModel";
import type { ProjectFormData } from "@/components/shared/ag-aui/AgPropertyForm";

type EditProjectRouteProps = {
  params: Promise<{ projectId: string }>;
};

type WorkspaceAudience = Parameters<typeof getWorkspacePropertyZone>[0];
type WorkspaceOwnerContext = Parameters<typeof getWorkspacePropertyZone>[1];
type WorkspacePropertyZone = ReturnType<typeof getWorkspacePropertyZone>;
type WorkspaceProperty = Awaited<ReturnType<WorkspacePropertyZone["getProperty"]>>;
type WorkspaceProject = ReturnType<typeof mapPropertyToWorkspaceProject>;

function toProjectFormStatus(publicationState: WorkspaceProject["publicationState"]): ProjectFormData["status"] {
  if (publicationState === "published") return "active";
  if (publicationState === "archived") return "maintenance";
  return "pending";
}

function buildInitialProjectFormData(project: WorkspaceProject, property: WorkspaceProperty | null): Partial<ProjectFormData> {
  return {
    name: project.title,
    price: project.priceLabel,
    location: project.location,
    description: project.summary,
    rooms: project.specs.rooms.replace(/[^\d]/g, ""),
    baths: project.specs.baths.replace(/[^\d]/g, ""),
    area: project.specs.area.replace(/[^\d]/g, ""),
    status: toProjectFormStatus(project.publicationState),
    images: property?.media ?? [],
    brokerId: null,
    adLicenseNumber: property?.adLicenseNumber ?? "",
    adLicenseStatus: property?.adLicenseStatus ?? null,
  };
}

function createSaveProjectAction(args: { audience: WorkspaceAudience; ownerContext: WorkspaceOwnerContext; projectId: string }) {
  return async function saveProject(data: ProjectFormData) {
    "use server";

    const actionZone = getWorkspacePropertyZone(args.audience, args.ownerContext);

    await actionZone.updateProperty({
      id: args.projectId,
      patch: mapWorkspaceProjectToPropertyInput(data),
    });
    if (data.status === "active") {
      await actionZone.publishProperty({ id: args.projectId });
    }

    return { redirectTo: `/ws/projects/${args.projectId}` };
  };
}

function createDeleteProjectAction(args: { audience: WorkspaceAudience; ownerContext: WorkspaceOwnerContext; projectId: string }) {
  return async function deleteProject() {
    "use server";

    await getWorkspacePropertyZone(args.audience, args.ownerContext).deleteProperty({ id: args.projectId });
    return { redirectTo: "/ws/projects" };
  };
}

export default async function EditProjectRoute({ params }: EditProjectRouteProps) {
  const { projectId } = await params;
  const workspace = await requireWorkspaceData(`/ws/projects/${projectId}/edit`);
  const audience = workspace.audience;
  const ownerContext = workspace.ownerContext ?? null;
  const propertiesZone = getWorkspacePropertyZone(audience, ownerContext);
  const property = await propertiesZone.getProperty({ id: projectId }).catch(() => null);
  const project = property ? mapPropertyToWorkspaceProject(property) : null;
  if (!project) notFound();
  const saveProject = createSaveProjectAction({ audience, ownerContext, projectId });
  const deleteProject = createDeleteProjectAction({ audience, ownerContext, projectId });

  return (
    <ProjectFormScreen
      projectId={projectId}
      initialData={buildInitialProjectFormData(project, property)}
      title="تعديل المشروع"
      description={`${project.title} — تعديل البيانات والصور.`}
      submitLabel="حفظ التعديلات"
      onSave={saveProject}
      onDelete={deleteProject}
    />
  );
}
