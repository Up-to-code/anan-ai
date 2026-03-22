import { notFound } from "next/navigation";
import { requireWorkspaceData } from "../../../../_lib/workspaceData";
import { getWorkspacePropertyZone } from "@/server/ws/zones";
import { mapPropertyToWorkspaceProject } from "../../projectViewModel";
import type { ProjectFormData } from "@/app/(ws)/ws/public";

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

export async function loadEditProjectPageState(projectId: string) {
  const workspace = await requireWorkspaceData(`/ws/projects/${projectId}/edit`);
  const audience = workspace.audience;
  const ownerContext = workspace.ownerContext ?? null;
  const propertiesZone = getWorkspacePropertyZone(audience, ownerContext);
  const property = await propertiesZone.getProperty({ id: projectId }).catch(() => null);
  const project = property ? mapPropertyToWorkspaceProject(property) : null;

  if (!project) {
    notFound();
  }

  return {
    actionArgs: { audience, ownerContext, projectId },
    description: `${project.title} — تعديل البيانات والصور.`,
    initialData: buildInitialProjectFormData(project, property),
    title: "تعديل المشروع",
  };
}
