import { notFound } from "next/navigation";
import { requireWorkspaceData } from "../../../../_lib/workspaceData";
import { requireSessionContext } from "@/server/auth/session";
import { convexProjectAccessRepository } from "@/server/infrastructure/convex/projectAccessRepository";
import { getWorkspacePropertyZone } from "@/server/ws/zones";
import { mapPropertyToWorkspaceProject } from "../../shared/lib/projectViewModel";
import type { ProjectFormData } from "@/app/(ws)/ws/public";
import { parsePropertyBody } from "@/server/contracts/properties";

type WorkspacePropertyZone = ReturnType<typeof getWorkspacePropertyZone>;
type WorkspaceProperty = Awaited<ReturnType<WorkspacePropertyZone["getProperty"]>>;
type WorkspaceProject = ReturnType<typeof mapPropertyToWorkspaceProject>;

function toProjectFormStatus(property: WorkspaceProperty | null): ProjectFormData["status"] {
  if (property?.status === "sold") return "maintenance";
  if (property?.status === "reserved") return "pending";
  return "active";
}

function buildInitialProjectFormData(project: WorkspaceProject, property: WorkspaceProperty | null): Partial<ProjectFormData> {
  const presentation = parsePropertyBody(property?.body)?.presentation;
  return {
    name: project.title,
    price: project.priceLabel,
    location: project.location,
    description: project.summary,
    shortDescription: presentation?.descriptionShort ?? "",
    amenitiesText: (presentation?.amenities ?? []).join("، "),
    hasParking: presentation?.hasParking ?? project.parking.hasParking,
    parkingSpaces: presentation?.parkingSpaces ? String(presentation.parkingSpaces) : "",
    coverImageKey: presentation?.coverImageKey ?? property?.media?.[0]?.key ?? null,
    galleryDisplayMode: presentation?.galleryDisplayMode ?? "cover",
    galleryAspectRatio: presentation?.galleryAspectRatio ?? "landscape",
    privatePermitSummary: presentation?.privatePermitSummary ?? "",
    privatePermitFiles: presentation?.privatePermitFiles ?? [],
    rooms: project.specs.rooms.replace(/[^\d]/g, ""),
    baths: project.specs.baths.replace(/[^\d]/g, ""),
    area: project.specs.area.replace(/[^\d]/g, ""),
    status: toProjectFormStatus(property),
    clientVisibility: project.publicationState === "published" ? "public" : "private",
    images: property?.media ?? [],
    brokerId: null,
    adLicenseNumber: property?.adLicenseNumber ?? "",
    adLicenseStatus: property?.adLicenseStatus ?? null,
  };
}

export async function loadEditProjectPageState(projectId: string) {
  const workspace = await requireWorkspaceData(`/ws/projects/${projectId}/edit`);
  const session = await requireSessionContext();
  const audience = workspace.audience;
  const ownerContext = workspace.ownerContext ?? null;
  const propertiesZone = getWorkspacePropertyZone(audience, ownerContext);
  const property = await propertiesZone.getProperty({ id: projectId }).catch(() => null);
  const project = property ? mapPropertyToWorkspaceProject(property) : null;
  const visibilityMembers = await convexProjectAccessRepository
    .listPropertyViewers(session.token, projectId)
    .catch(() => []);

  if (!project) {
    notFound();
  }

  return {
    actionArgs: { audience, ownerContext, projectId },
    description: `${project.title} — تعديل البيانات والصور.`,
    initialData: {
      ...buildInitialProjectFormData(project, property),
      visibilityMembers,
    },
    title: "تعديل المشروع",
  };
}
