import { notFound } from "next/navigation";
import { requireWorkspaceData } from "../../../../_lib/workspaceData";
import { requireSessionContext } from "@/server/auth/session";
import { convexProjectAccessRepository } from "@/server/infrastructure/convex/properties/access";
import { getWorkspaceProjectZone, getWorkspacePropertyZone } from "@/server/ws/zones";
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

function buildInitialProjectFormData(project: WorkspaceProject, property: WorkspaceProperty | null, dossierDetail?: any): Partial<ProjectFormData> {
  const presentation = parsePropertyBody(property?.body)?.presentation;
  const dossier = dossierDetail?.dossier;
  const unit = dossierDetail?.units?.find((item: any) => item.status === "available") ?? dossierDetail?.units?.[0];
  const paymentPlan = dossierDetail?.paymentPlans?.find((item: any) => item.status === "active") ?? dossierDetail?.paymentPlans?.[0];
  const adLicense = dossierDetail?.adLicenses?.[0];
  const brokerAuthorization = dossierDetail?.brokerAuthorizations?.[0];
  const location = dossier?.location
    ? [dossier.location.city, dossier.location.district].filter(Boolean).join("، ")
    : project.location;
  return {
    name: dossier?.title ?? project.title,
    price: paymentPlan?.startingPrice ? String(paymentPlan.startingPrice) : project.priceLabel,
    location,
    description: dossier?.summary ?? project.summary,
    shortDescription: presentation?.descriptionShort ?? "",
    amenitiesText: (presentation?.amenities ?? []).join("، "),
    hasParking: presentation?.hasParking ?? project.parking.hasParking,
    parkingSpaces: presentation?.parkingSpaces ? String(presentation.parkingSpaces) : "",
    coverImageKey: presentation?.coverImageKey ?? property?.media?.[0]?.key ?? null,
    galleryDisplayMode: presentation?.galleryDisplayMode ?? "cover",
    galleryAspectRatio: presentation?.galleryAspectRatio ?? "landscape",
    privatePermitSummary: presentation?.privatePermitSummary ?? "",
    privatePermitFiles: presentation?.privatePermitFiles ?? [],
    rooms: unit?.bedrooms !== undefined ? String(unit.bedrooms) : project.specs.rooms.replace(/[^\d]/g, ""),
    baths: unit?.bathrooms !== undefined ? String(unit.bathrooms) : project.specs.baths.replace(/[^\d]/g, ""),
    area: unit?.sizeSqm !== undefined ? String(unit.sizeSqm) : project.specs.area.replace(/[^\d]/g, ""),
    status: toProjectFormStatus(property),
    clientVisibility: dossier?.requestedVisibility ?? (project.publicationState === "published" ? "public" : "private"),
    images: property?.media ?? [],
    brokerId: null,
    adLicenseNumber: adLicense?.licenseNumber ?? property?.adLicenseNumber ?? "",
    adLicenseStatus: property?.adLicenseStatus ?? null,
    dossier: {
      projectType: dossier?.projectType ?? "ready_property",
      lifecycleStage: dossier?.lifecycleStage ?? "draft",
      salesMode: dossier?.salesMode ?? "developer_direct",
      city: dossier?.location?.city ?? "",
      district: dossier?.location?.district ?? "",
      neighborhood: dossier?.location?.neighborhood ?? "",
      street: dossier?.location?.street ?? "",
      nationalAddress: dossier?.location?.nationalAddress ?? "",
      latitude: dossier?.location?.latitude ? String(dossier.location.latitude) : "",
      longitude: dossier?.location?.longitude ? String(dossier.location.longitude) : "",
    },
    units: unit ? [{
      label: unit.label ?? "Primary unit type",
      unitKind: unit.unitKind ?? "unit_type",
      status: unit.status ?? "available",
      bedrooms: unit.bedrooms !== undefined ? String(unit.bedrooms) : "",
      bathrooms: unit.bathrooms !== undefined ? String(unit.bathrooms) : "",
      sizeSqm: unit.sizeSqm !== undefined ? String(unit.sizeSqm) : "",
      floor: unit.floor ?? "",
      view: unit.view ?? "",
      price: unit.price !== undefined ? String(unit.price) : "",
      handoverAt: unit.handoverAt ? new Date(unit.handoverAt).toISOString().slice(0, 10) : "",
      floorPlanMedia: unit.floorPlanMedia ?? [],
    }] : undefined,
    paymentPlans: paymentPlan ? [{
      title: paymentPlan.title ?? "Primary payment plan",
      cashPrice: paymentPlan.cashPrice !== undefined ? String(paymentPlan.cashPrice) : "",
      startingPrice: paymentPlan.startingPrice !== undefined ? String(paymentPlan.startingPrice) : "",
      downPayment: paymentPlan.downPayment !== undefined ? String(paymentPlan.downPayment) : "",
      escrowReference: paymentPlan.escrowReference ?? "",
      feesAndTaxNotes: paymentPlan.feesAndTaxNotes ?? "",
      bankAndSubsidyNotes: paymentPlan.bankAndSubsidyNotes ?? "",
      milestones: [],
    }] : undefined,
    complianceDocuments: (dossierDetail?.documents ?? []).map((document: any) => ({
      documentType: document.documentType,
      title: document.title,
      licenseOrReferenceNumber: document.licenseOrReferenceNumber ?? "",
      expiresAt: document.expiresAt ? new Date(document.expiresAt).toISOString().slice(0, 10) : "",
      files: document.files ?? [],
      notes: document.notes ?? "",
    })),
    brokerAuthorization: {
      contractNumber: brokerAuthorization?.contractNumber ?? "",
      marketingScope: brokerAuthorization?.marketingScope ?? "",
      channelsText: (brokerAuthorization?.channels ?? []).join("، "),
      commissionTerms: brokerAuthorization?.commissionTerms ?? "",
      validFrom: brokerAuthorization?.validFrom ? new Date(brokerAuthorization.validFrom).toISOString().slice(0, 10) : "",
      validUntil: brokerAuthorization?.validUntil ? new Date(brokerAuthorization.validUntil).toISOString().slice(0, 10) : "",
      evidenceFiles: brokerAuthorization?.evidenceFiles ?? [],
    },
  };
}

export async function loadEditProjectPageState(projectId: string) {
  const workspace = await requireWorkspaceData(`/ws/projects/${projectId}/edit`);
  const session = await requireSessionContext();
  const audience = workspace.audience;
  const ownerContext = workspace.ownerContext ?? null;
  const propertiesZone = getWorkspacePropertyZone(audience, ownerContext);
  const projectsZone = getWorkspaceProjectZone(audience, ownerContext);
  const property = await propertiesZone.getProperty({ id: projectId }).catch(() => null);
  const dossierDetail = await projectsZone.getProjectDossier({ propertyId: projectId }).catch(() => null);
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
      ...buildInitialProjectFormData(project, property, dossierDetail),
      visibilityMembers,
    },
    title: "تعديل المشروع",
  };
}
