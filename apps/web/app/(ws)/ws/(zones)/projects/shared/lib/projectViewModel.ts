import type { UploadedFileReference } from "@/server/contracts/files";
import { parsePropertyBody, type PropertyDetail } from "@/server/contracts/properties";
import type {
  ProjectAdLicenseInput,
  ProjectBrokerAuthorizationInput,
  ProjectComplianceDocumentInput,
  ProjectDossierDetail,
  ProjectDossierInput,
  ProjectPaymentPlanInput,
  ProjectUnitInput,
} from "@/server/contracts/projects";
import type { UnitReference } from "../../../../_lib/entities";
import { buildLocationValueFromParts } from "@anan/location-map";
import type { WorkspaceProject, WorkspaceProjectUnitDetail } from "../../types/projectTypes";
import type { WorkspaceProjectDetailAccessMode } from "@/server/domains/workspace/properties/detail";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPublicationState(
  state: PropertyDetail["publicationState"],
): WorkspaceProject["publicationState"] {
  if (state === "published" || state === "archived") {
    return state;
  }

  return "draft";
}

function resolvePermitStatusLabel(status: PropertyDetail["adLicenseStatus"]) {
  if (status === "approved") return "موثق";
  if (status === "rejected") return "مرفوض";
  if (status === "pending") return "قيد المراجعة";
  return "غير مكتمل";
}

function resolveReadinessLabel(status: PropertyDetail["projectReadinessStatus"]) {
  if (status === "published_ready") return "جاهز للنشر";
  if (status === "approved") return "معتمد داخلياً";
  if (status === "compliance_pending") return "قيد المراجعة";
  if (status === "blocked") return "محظور للنشر";
  if (status === "data_complete") return "البيانات مكتملة";
  return "غير مكتمل";
}

function resolveInventoryKind(property: PropertyDetail, dossier: ProjectDossierDetail | null | undefined): WorkspaceProject["inventoryKind"] {
  const explicitKind = dossier?.dossier?.inventoryKind;
  if (explicitKind === "project" || explicitKind === "standalone_unit") return explicitKind;
  const units = dossier?.units ?? [];
  const onlyUnit = units.length === 1 ? units[0] : null;
  if (onlyUnit?.unitKind === "unit" && onlyUnit.label.trim() === property.title.trim()) {
    return "standalone_unit";
  }
  return "project";
}

function buildPortfolioMeta(
  inventoryKind: WorkspaceProject["inventoryKind"],
  project: Pick<WorkspaceProject, "readiness" | "permit" | "publicationState">,
  dossier: ProjectDossierDetail | null | undefined,
) {
  const units = dossier?.units ?? [];
  const availableCount = units.filter((unit) => unit.status === "available").length;
  const reservedCount = units.filter((unit) => unit.status === "reserved").length;
  const soldCount = units.filter((unit) => unit.status === "sold").length;
  const approvedDocs = (dossier?.documents ?? []).filter((document) => document.status === "approved").length;
  const requiredOffPlanDocs = dossier?.dossier?.projectType === "off_plan" ? " · WAFI/ضمان مطلوب" : "";
  const brokerAuthorization =
    dossier?.dossier?.salesMode === "developer_direct"
      ? "تفويض الوسيط غير مطلوب"
      : (dossier?.brokerAuthorizations ?? []).some((authorization) => authorization.status === "active")
        ? "تفويض وسيط نشط"
        : "تفويض الوسيط غير مكتمل";

  return {
    typeLabel: inventoryKind === "standalone_unit" ? "وحدة مستقلة" : "مشروع",
    unitSummary:
      units.length > 0
        ? `${units.length} وحدات · ${availableCount} متاحة · ${reservedCount} محجوزة · ${soldCount} مباعة`
        : "لا توجد وحدات بعد",
    complianceSummary: `${project.permit.statusLabel} · ${approvedDocs}/${dossier?.documents?.length ?? 0} ملفات معتمدة · ${brokerAuthorization}${requiredOffPlanDocs}`,
  };
}

function buildFallbackImage(): UploadedFileReference {
  return {
    key: "project-fallback",
    url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
    name: "project-fallback.jpg",
  };
}

function orderGalleryImages(images: UploadedFileReference[], coverImageKey?: string | null) {
  if (!coverImageKey) {
    return images;
  }

  const coverImage = images.find((image) => image.key === coverImageKey);
  if (!coverImage) {
    return images;
  }

  return [coverImage, ...images.filter((image) => image.key !== coverImageKey)];
}

function resolveGalleryImages(property: PropertyDetail) {
  const presentation = parsePropertyBody(property.body)?.presentation;
  const fallbackImages = property.media?.length
    ? property.media
    : property.heroImage
      ? [property.heroImage]
      : [buildFallbackImage()];

  const galleryImages = presentation?.slides?.length ? presentation.slides : fallbackImages;
  return orderGalleryImages(galleryImages, presentation?.coverImageKey);
}

/**
 * WHY:   The projects UI still expects a visual-first route prop shape during the backend migration.
 * WHAT:  Maps a property DTO into the existing `WorkspaceProject` view model used by the route components.
 * HOW:   Derives labels and visual fallbacks from the normalized property/file contracts.
 */
export function mapPropertyToWorkspaceProject(property: PropertyDetail): WorkspaceProject {
  const presentation = parsePropertyBody(property.body)?.presentation;
  const expertMetadata = presentation?.expertMetadata;
  const galleryImages = resolveGalleryImages(property);
  const parkingSpaces = presentation?.parkingSpaces ?? null;
  const hasParking = presentation?.hasParking ?? Boolean(parkingSpaces && parkingSpaces > 0);
  const locationDetails = buildLocationValueFromParts({ label: property.location ?? property.address });

  return {
    id: property._id,
    propertyId: property._id,
    inventoryKind: "project",
    title: property.title,
    location: property.location ?? property.address,
    locationDetails,
    priceLabel: `${formatCurrency(property.price)} ر.س`,
    summary: property.description,
    shortDescription: presentation?.descriptionShort ?? property.description,
    image: galleryImages[0]?.url ?? buildFallbackImage().url,
    galleryImages,
    gallery: {
      coverImageKey: presentation?.coverImageKey ?? galleryImages[0]?.key ?? null,
      displayMode: presentation?.galleryDisplayMode ?? "cover",
      aspectRatio: presentation?.galleryAspectRatio ?? "landscape",
    },
    amenities: presentation?.amenities ?? [],
    parking: {
      hasParking,
      spaces: parkingSpaces,
      label: hasParking ? (parkingSpaces ? `${parkingSpaces} مواقف` : "متوفر") : "غير متوفر",
    },
    expert: {
      assetType: expertMetadata?.assetType ?? null,
      listingType: expertMetadata?.listingType ?? null,
      projectScale: expertMetadata?.projectScale ?? null,
      productMix: expertMetadata?.productMix ?? null,
      primaryUnitType: expertMetadata?.primaryUnitType ?? null,
      sizeRange: expertMetadata?.sizeRange ?? null,
      priceComparison: expertMetadata?.priceComparison ?? null,
      comparisonNotes: expertMetadata?.comparisonNotes ?? null,
      expertNotes: expertMetadata?.expertNotes ?? null,
      services: expertMetadata?.services ?? [],
    },
    permit: {
      statusLabel: resolvePermitStatusLabel(property.adLicenseStatus),
      privateSummary: presentation?.privatePermitSummary ?? null,
      privateFiles: presentation?.privatePermitFiles ?? [],
      visibility: presentation?.privatePermitVisibility ?? "hidden",
      canShowPrivatePanel: false,
    },
    specs: {
      rooms: `${property.beds} غرف`,
      baths: `${property.baths} حمامات`,
      area: property.sqft ? `${property.sqft} م²` : "غير محدد",
      status: property.status ?? "available",
    },
    publicationState: formatPublicationState(property.publicationState),
    readiness: {
      status: property.projectReadinessStatus ?? "incomplete",
      label: resolveReadinessLabel(property.projectReadinessStatus),
      canPublish: property.projectReadinessStatus === "published_ready",
    },
    portfolio: {
      typeLabel: "مشروع",
      unitSummary: "لا توجد وحدات بعد",
      complianceSummary: resolvePermitStatusLabel(property.adLicenseStatus),
    },
    accessMode: "owner",
    canEdit: true,
    visibility: {
      clientVisibility: property.publicationState === "published" ? "public" : "private",
      viewers: [],
    },
    assets: [],
    units: [],
    dossier: null,
    brokers: [],
  };
}

/**
 * WHY:   Shared inbox project links need the same visual project model while preserving read-only access semantics.
 * WHAT:  Maps a property DTO into the workspace project view model with explicit access metadata.
 * HOW:   Reuses the base property mapper, then overrides route-facing access flags for owner or shared detail flows.
 */
export function mapPropertyToWorkspaceProjectDetail(
  property: PropertyDetail,
  accessMode: WorkspaceProjectDetailAccessMode,
  options?: {
    viewers?: WorkspaceProject["visibility"]["viewers"];
    assets?: WorkspaceProject["assets"];
    dossier?: ProjectDossierDetail | null;
  },
): WorkspaceProject {
  const project = mapPropertyToWorkspaceProject(property);
  const dossier = options?.dossier ?? null;
  const inventoryKind = resolveInventoryKind(property, dossier);
  const dossierLocation = buildLocationValueFromParts({
    label: [dossier?.dossier?.location?.city, dossier?.dossier?.location?.district].filter(Boolean).join("، ") || project.location,
    city: dossier?.dossier?.location?.city,
    district: dossier?.dossier?.location?.district,
    latitude: dossier?.dossier?.location?.latitude,
    longitude: dossier?.dossier?.location?.longitude,
  }) ?? project.locationDetails;
  const units = mapProjectDossierUnitsToUnitReferences(dossier);
  const unitStats = buildUnitDerivedStats(units, dossier, project);
  const nextProject = {
    ...project,
    inventoryKind,
    id: dossier?.dossier?._id ?? project.id,
    propertyId: project.propertyId,
    location: dossierLocation?.label ?? project.location,
    locationDetails: dossierLocation,
    priceLabel: unitStats.priceLabel,
    specs: unitStats.specs,
    expert: {
      ...project.expert,
      projectScale: dossier?.dossier?.expectedUnitCountLabel ?? project.expert.projectScale,
      productMix: dossier?.dossier?.unitTypeMix?.join("، ") ?? project.expert.productMix,
      primaryUnitType: dossier?.dossier?.primaryUnitType ?? project.expert.primaryUnitType,
      expertNotes: dossier?.dossier?.targetAudience ?? project.expert.expertNotes,
      services: dossier?.dossier?.services?.length ? dossier.dossier.services : project.expert.services,
    },
    accessMode,
    canEdit: accessMode === "owner",
    visibility: {
      ...project.visibility,
      viewers: options?.viewers ?? [],
    },
    assets: options?.assets ?? [],
    units,
    dossier,
    permit: {
      ...project.permit,
      canShowPrivatePanel:
        accessMode === "shared" &&
        project.permit.visibility === "conversation_only" &&
        (Boolean(project.permit.privateSummary) || project.permit.privateFiles.length > 0),
    },
  };
  return {
    ...nextProject,
    portfolio: buildPortfolioMeta(inventoryKind, nextProject, dossier),
  };
}

/**
 * WHY:   Project detail needs dossier-backed inventory cards without exposing raw project unit records.
 * WHAT:  Converts saved project dossier units into the shared `UnitReference` UI model.
 * HOW:   Keeps canonical numeric fields while adding display labels for area and price.
 */
export function mapProjectDossierUnitsToUnitReferences(
  dossier: ProjectDossierDetail | null | undefined,
): UnitReference[] {
  const projectLocation = buildLocationValueFromParts({
    label: [dossier?.dossier?.location?.city, dossier?.dossier?.location?.district].filter(Boolean).join("، "),
    city: dossier?.dossier?.location?.city,
    district: dossier?.dossier?.location?.district,
    latitude: dossier?.dossier?.location?.latitude,
    longitude: dossier?.dossier?.location?.longitude,
  });

  return (dossier?.units ?? []).map((unit) => ({
    id: unit._id,
    label: unit.label,
    unitKind: unit.unitKind,
    status: unit.status,
    bedrooms: unit.bedrooms,
    bathrooms: unit.bathrooms,
    area: formatUnitArea(unit.sizeSqm),
    sizeSqm: unit.sizeSqm,
    floor: unit.floor,
    view: unit.view,
    price: unit.price,
    priceLabel: formatUnitPrice(unit.price),
    handoverAt: unit.handoverAt,
    location: buildLocationValueFromParts({
      label: [unit.location?.city, unit.location?.district].filter(Boolean).join("، "),
      city: unit.location?.city,
      district: unit.location?.district,
      latitude: unit.location?.latitude,
      longitude: unit.location?.longitude,
    }) ?? projectLocation,
    floorPlanMedia: unit.floorPlanMedia,
  }));
}

function formatRange(values: number[], suffix: string) {
  const unique = [...new Set(values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b))];
  if (unique.length === 0) return "غير محدد";
  if (unique.length === 1) return `${formatCurrency(unique[0])} ${suffix}`;
  return `${formatCurrency(unique[0])}-${formatCurrency(unique[unique.length - 1])} ${suffix}`;
}

function buildUnitDerivedStats(
  units: UnitReference[],
  dossier: ProjectDossierDetail | null,
  fallback: WorkspaceProject,
) {
  const sellableUnits = units.filter((unit) => unit.status === "available" || unit.status === "draft");
  const statsUnits = sellableUnits.length > 0 ? sellableUnits : units;
  const unitPrices = statsUnits
    .map((unit) => unit.price)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value) && value > 0);
  const planPrices = (dossier?.paymentPlans ?? [])
    .flatMap((plan) => [plan.startingPrice, plan.cashPrice])
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value) && value > 0);
  const dossierAveragePrices = typeof dossier?.dossier?.averagePrice === "number" ? [dossier.dossier.averagePrice] : [];
  const startingPrice = Math.min(...[...unitPrices, ...planPrices, ...dossierAveragePrices]);
  const priceLabel = Number.isFinite(startingPrice)
    ? `يبدأ من ${formatCurrency(startingPrice)} ر.س`
    : fallback.priceLabel;

  return {
    priceLabel,
    specs: {
      rooms: formatRange(statsUnits.map((unit) => unit.bedrooms ?? Number.NaN), "غرف"),
      baths: formatRange(statsUnits.map((unit) => unit.bathrooms ?? Number.NaN), "حمامات"),
      area: formatRange(statsUnits.map((unit) => unit.sizeSqm ?? Number.NaN), "م²"),
      status: fallback.specs.status,
    },
  };
}

/**
 * WHY:   Unit detail routes need one focused, serializable view model without leaking dossier records into the component.
 * WHAT:  Finds a unit in a mapped workspace project and enriches it with parent project, media, payment, and compliance context.
 * HOW:   Prefers unit floor-plan media, then falls back to the parent project gallery so the detail page always has a visual anchor.
 */
export function mapWorkspaceProjectUnitDetail(
  project: WorkspaceProject,
  unitId: string,
): WorkspaceProjectUnitDetail | null {
  const unit = project.units.find((candidate) => candidate.id === unitId);
  if (!unit) return null;

  return {
    ...unit,
    projectId: project.id,
    projectTitle: project.title,
    projectLocation: project.location,
    projectLocationDetails: project.locationDetails,
    locationDetails: unit.location ?? project.locationDetails,
    projectImage: project.image,
    summary: project.shortDescription || project.summary,
    paymentPlanLabel: formatPaymentPlanLabel(project.dossier),
    complianceLabel: formatComplianceLabel(project.dossier),
    adLicenseLabel: formatAdLicenseLabel(project.dossier),
    readinessLabel: project.readiness.label,
    galleryImages: unit.floorPlanMedia?.length ? unit.floorPlanMedia : project.galleryImages,
  };
}

/**
 * WHY:   Project forms still submit a legacy view-model payload that must reach Convex safely.
 * WHAT:  Converts the project form payload into the property input contract.
 * HOW:   Normalizes numeric fields, trims strings, and forwards media plus ad-license data.
 */
export function mapWorkspaceProjectToPropertyInput(project: {
  name: string;
  price: string;
  location: string;
  description: string;
  shortDescription?: string;
  amenitiesText?: string;
  hasParking?: boolean;
  parkingSpaces?: string;
  privatePermitSummary?: string;
  privatePermitFiles?: UploadedFileReference[];
  expertProjectType?: import("@/app/(ws)/ws/public").ProjectFormData["expertProjectType"];
  projectScale?: string;
  productMix?: string;
  primaryUnitType?: string;
  sizeRange?: string;
  priceComparison?: import("@/app/(ws)/ws/public").ProjectFormData["priceComparison"];
  comparisonNotes?: string;
  expertNotes?: string;
  services?: string[];
  coverImageKey?: string | null;
  galleryDisplayMode?: "cover" | "fit";
  galleryAspectRatio?: "auto" | "landscape" | "square" | "portrait";
  rooms?: string;
  baths?: string;
  area?: string;
  status: string;
  clientVisibility: "private" | "public";
  images: PropertyDetail["media"];
  adLicenseNumber?: string;
  dossier?: import("@/app/(ws)/ws/public").ProjectFormData["dossier"];
  units?: import("@/app/(ws)/ws/public").ProjectFormData["units"];
  paymentPlans?: import("@/app/(ws)/ws/public").ProjectFormData["paymentPlans"];
  complianceDocuments?: import("@/app/(ws)/ws/public").ProjectFormData["complianceDocuments"];
  brokerAuthorization?: import("@/app/(ws)/ws/public").ProjectFormData["brokerAuthorization"];
}) {
  const primaryUnit = project.units?.find((unit) => unit.status === "available") ?? project.units?.[0];
  const primaryPlan = project.paymentPlans?.[0];
  const numericPrice =
    parseProjectNumber(primaryUnit?.price) ??
    parseProjectNumber(primaryPlan?.startingPrice) ??
    parseProjectNumber(primaryPlan?.cashPrice) ??
    parseProjectNumber(project.price) ??
    0;
  const numericArea = parseProjectNumber(primaryUnit?.sizeSqm) ?? parseProjectNumber(project.area);
  const numericParkingSpaces = Number(project.parkingSpaces?.replace(/[^\d]/g, "")) || undefined;
  const amenities = (project.amenitiesText ?? "")
    .split(/[\n,،]/)
    .map((item) => item.trim())
    .filter(Boolean);
  const hasPrivatePermitMaterial = Boolean(project.privatePermitSummary?.trim()) || Boolean(project.privatePermitFiles?.length);
  const orderedImages = orderGalleryImages(project.images ?? [], project.coverImageKey);
  const expertMetadata = {
    assetType: project.expertProjectType || project.dossier?.projectType,
    projectScale: project.projectScale?.trim() || undefined,
    productMix: project.productMix?.trim() || undefined,
    primaryUnitType: project.primaryUnitType?.trim() || undefined,
    sizeRange: project.sizeRange?.trim() || undefined,
    priceComparison: project.priceComparison,
    comparisonNotes: project.comparisonNotes?.trim() || undefined,
    expertNotes: project.expertNotes?.trim() || undefined,
    services: project.services?.length ? project.services : undefined,
  };
  const hasExpertMetadata = Object.values(expertMetadata).some((value) =>
    Array.isArray(value) ? value.length > 0 : Boolean(value),
  );

  return {
    title: project.name.trim(),
    address: project.location.trim(),
    location: project.location.trim(),
    description: project.description.trim(),
    price: numericPrice,
    beds: parseProjectNumber(primaryUnit?.bedrooms) ?? parseProjectNumber(project.rooms) ?? 0,
    baths: parseProjectNumber(primaryUnit?.bathrooms) ?? parseProjectNumber(project.baths) ?? 0,
    sqft: numericArea,
    status:
      project.status === "maintenance"
        ? ("reserved" as const)
        : project.status === "pending"
          ? ("reserved" as const)
          : ("available" as const),
    publicationState: project.clientVisibility === "public" ? ("published" as const) : ("draft" as const),
    media: orderedImages,
    body: {
      presentation: {
        descriptionShort: project.shortDescription?.trim() || undefined,
        amenities: amenities.length > 0 ? amenities : undefined,
        parkingSpaces: numericParkingSpaces,
        hasParking: project.hasParking ?? Boolean(numericParkingSpaces && numericParkingSpaces > 0),
        slides: orderedImages,
        coverImageKey: project.coverImageKey ?? orderedImages[0]?.key ?? undefined,
        galleryDisplayMode: project.galleryDisplayMode ?? ("cover" as const),
        galleryAspectRatio: project.galleryAspectRatio ?? ("landscape" as const),
        expertMetadata: hasExpertMetadata ? expertMetadata : undefined,
        privatePermitSummary: project.privatePermitSummary?.trim() || undefined,
        privatePermitFiles: project.privatePermitFiles?.length ? project.privatePermitFiles : undefined,
        privatePermitVisibility: hasPrivatePermitMaterial ? ("conversation_only" as const) : undefined,
      },
    },
    adLicenseNumber: project.adLicenseNumber?.trim() || undefined,
  };
}

type WorkspaceProjectFormPayload = Parameters<typeof mapWorkspaceProjectToPropertyInput>[0];

function parseProjectNumber(value?: string) {
  return Number((value ?? "").replace(/[^\d.]/g, "")) || undefined;
}

function parseOptionalDate(value?: string) {
  if (!value?.trim()) return undefined;
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : undefined;
}

function splitSaudiLocation(value: string) {
  const [city, district] = value
    .split(/[,،]/)
    .map((item) => item.trim())
    .filter(Boolean);
  return {
    city: city || value.trim() || undefined,
    district: district || city || value.trim() || undefined,
  };
}

function splitProjectChoices(value?: string) {
  return (value ?? "")
    .split(/[\n,،]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatUnitArea(value?: number) {
  return typeof value === "number" && Number.isFinite(value) ? `${formatCurrency(value)} م²` : undefined;
}

function formatUnitPrice(value?: number) {
  return typeof value === "number" && Number.isFinite(value) ? `${formatCurrency(value)} ر.س` : undefined;
}

function formatPaymentPlanLabel(dossier: ProjectDossierDetail | null) {
  const plan = dossier?.paymentPlans?.[0];
  if (!plan) return null;
  if (typeof plan.downPayment === "number") return `${plan.title} · دفعة أولى ${formatCurrency(plan.downPayment)} ر.س`;
  if (typeof plan.startingPrice === "number") return `${plan.title} · يبدأ من ${formatCurrency(plan.startingPrice)} ر.س`;
  return plan.title;
}

function formatComplianceLabel(dossier: ProjectDossierDetail | null) {
  const documents = dossier?.documents ?? [];
  if (!documents.length) return null;
  const approvedCount = documents.filter((document) => document.status === "approved").length;
  return approvedCount > 0 ? `${approvedCount} ملفات معتمدة من ${documents.length}` : `${documents.length} ملفات قيد التجهيز`;
}

function formatAdLicenseLabel(dossier: ProjectDossierDetail | null) {
  const license = dossier?.adLicenses?.[0];
  if (!license) return null;
  if (license.status === "approved") return "رخصة الإعلان معتمدة";
  if (license.status === "rejected") return "رخصة الإعلان مرفوضة";
  if (license.status === "expired") return "رخصة الإعلان منتهية";
  return "رخصة الإعلان قيد المراجعة";
}

/**
 * WHY:   Workspace project saves now need a Saudi dossier write beside the legacy property projection.
 * WHAT:  Converts form identity fields into the project dossier draft contract.
 * HOW:   Preserves public visibility as a request and derives city/district from the current location string.
 */
export function mapWorkspaceProjectToDossierInput(
  propertyId: string,
  project: WorkspaceProjectFormPayload,
): ProjectDossierInput {
  return {
    propertyId,
    inventoryKind: "project",
    projectType: project.dossier?.projectType ?? "ready_property",
    salesMode: project.dossier?.salesMode ?? "developer_direct",
    requestedVisibility: project.clientVisibility,
    title: project.name.trim(),
    summary: project.description.trim(),
    targetAudience: project.expertNotes?.trim() || undefined,
    expectedUnitCountLabel: project.projectScale?.trim() || undefined,
    unitTypeMix: splitProjectChoices(project.productMix),
    primaryUnitType: project.primaryUnitType?.trim() || undefined,
    averagePrice: parseProjectNumber(project.paymentPlans?.[0]?.startingPrice) ?? parseProjectNumber(project.price),
    options: project.services?.length ? project.services : splitProjectChoices(project.amenitiesText),
    services: project.services?.length ? project.services : splitProjectChoices(project.amenitiesText),
    location: {
      countryCode: "SA",
      ...splitSaudiLocation(project.location),
      city: project.dossier?.city || splitSaudiLocation(project.location).city,
      district: project.dossier?.district || splitSaudiLocation(project.location).district,
      neighborhood: project.dossier?.neighborhood || undefined,
      street: project.dossier?.street || undefined,
      nationalAddress: project.dossier?.nationalAddress || undefined,
      latitude: parseProjectNumber(project.dossier?.latitude),
      longitude: parseProjectNumber(project.dossier?.longitude),
    },
  };
}

export function mapWorkspaceProjectToUnitInputs(project: WorkspaceProjectFormPayload): ProjectUnitInput[] {
  const units = project.units?.filter((unit) => {
    const changedDefaultLabel = unit.label.trim() && unit.label.trim() !== "Primary unit type";
    return Boolean(
      changedDefaultLabel ||
      unit.bedrooms.trim() ||
      unit.bathrooms.trim() ||
      unit.sizeSqm.trim() ||
      unit.floor.trim() ||
      unit.view.trim() ||
      unit.price.trim() ||
      unit.handoverAt.trim() ||
      unit.floorPlanMedia.length,
    );
  }) ?? [];
  return units.map((unit) => ({
    dossierId: "server-owned",
    label: unit.label || "Primary unit type",
    unitKind: unit.unitKind,
    status: unit.status,
    bedrooms: parseProjectNumber(unit.bedrooms) ?? parseProjectNumber(project.rooms) ?? 0,
    bathrooms: parseProjectNumber(unit.bathrooms) ?? parseProjectNumber(project.baths) ?? 0,
    sizeSqm: parseProjectNumber(unit.sizeSqm) ?? parseProjectNumber(project.area),
    floor: unit.floor || undefined,
    view: unit.view || undefined,
    price: parseProjectNumber(unit.price) ?? parseProjectNumber(project.price),
    handoverAt: parseOptionalDate(unit.handoverAt),
    location: unit.locationDetails
      ? {
          countryCode: "SA",
          city: unit.locationDetails.city,
          district: unit.locationDetails.district,
          latitude: unit.locationDetails.latitude,
          longitude: unit.locationDetails.longitude,
        }
      : undefined,
    floorPlanMedia: unit.floorPlanMedia?.length ? unit.floorPlanMedia : undefined,
  }));
}

export function mapWorkspaceProjectToPaymentPlanInputs(project: WorkspaceProjectFormPayload): ProjectPaymentPlanInput[] {
  const price = parseProjectNumber(project.paymentPlans?.[0]?.startingPrice) ?? parseProjectNumber(project.price);
  const plans = project.paymentPlans?.filter((plan) =>
    Boolean(
      plan.cashPrice.trim() ||
      plan.startingPrice.trim() ||
      plan.downPayment.trim() ||
      plan.escrowReference.trim() ||
      plan.feesAndTaxNotes.trim() ||
      plan.bankAndSubsidyNotes.trim() ||
      plan.milestones.length,
    ),
  ) ?? [];
  return plans.map((plan) => ({
    dossierId: "server-owned",
    title: plan.title || "Primary payment plan",
    cashPrice: parseProjectNumber(plan.cashPrice) ?? price,
    startingPrice: parseProjectNumber(plan.startingPrice) ?? price,
    downPayment: parseProjectNumber(plan.downPayment),
    escrowReference: plan.escrowReference || undefined,
    feesAndTaxNotes: plan.feesAndTaxNotes || undefined,
    bankAndSubsidyNotes: plan.bankAndSubsidyNotes || undefined,
    milestones: plan.milestones?.map((milestone) => ({
      label: milestone.label,
      amount: parseProjectNumber(milestone.amount),
      percentage: parseProjectNumber(milestone.percentage),
      dueType: ["booking", "contract", "construction", "handover", "custom"].includes(milestone.dueType)
        ? milestone.dueType as "booking" | "contract" | "construction" | "handover" | "custom"
        : undefined,
      dueDate: parseOptionalDate(milestone.dueDate),
    })) ?? [],
    status: "active",
  }));
}

export function mapWorkspaceProjectToComplianceDocumentInputs(project: WorkspaceProjectFormPayload): ProjectComplianceDocumentInput[] {
  const documents: ProjectComplianceDocumentInput[] = project.complianceDocuments?.map((document) => ({
    dossierId: "server-owned",
    documentType: document.documentType,
    title: document.title || "Compliance evidence",
    licenseOrReferenceNumber: document.licenseOrReferenceNumber || undefined,
    files: document.files ?? [],
    notes: document.notes || undefined,
  })) ?? [];
  if ((project.adLicenseNumber?.trim() || project.privatePermitFiles?.length) && !documents.some((document) => document.documentType === "ad_license")) {
    documents.push({
      dossierId: "server-owned",
      documentType: "ad_license",
      title: "Advertisement license evidence",
      licenseOrReferenceNumber: project.adLicenseNumber?.trim() || undefined,
      files: project.privatePermitFiles ?? [],
      notes: project.privatePermitSummary?.trim() || undefined,
    });
  }
  return documents;
}

export function mapWorkspaceProjectToAdLicenseInput(project: WorkspaceProjectFormPayload): ProjectAdLicenseInput | undefined {
  const licenseNumber = project.adLicenseNumber?.trim();
  if (!licenseNumber) return undefined;
  return {
    dossierId: "server-owned",
    licenseNumber,
    channels: ["anan_workspace", "ai_distribution"],
    evidenceFiles: project.privatePermitFiles,
  };
}

export function mapWorkspaceProjectToBrokerAuthorizationInput(
  project: WorkspaceProjectFormPayload,
): ProjectBrokerAuthorizationInput | undefined {
  if (project.clientVisibility !== "public") return undefined;
  return {
    dossierId: "server-owned",
    contractNumber: project.brokerAuthorization?.contractNumber || undefined,
    marketingScope: project.brokerAuthorization?.marketingScope || "Public Anan distribution requested from workspace.",
    channels: project.brokerAuthorization?.channelsText
      ? project.brokerAuthorization.channelsText.split(/[\n,،]/).map((item) => item.trim()).filter(Boolean)
      : ["anan_workspace", "broker_marketplace", "ai_distribution"],
    commissionTerms: project.brokerAuthorization?.commissionTerms || undefined,
    validFrom: parseOptionalDate(project.brokerAuthorization?.validFrom),
    validUntil: parseOptionalDate(project.brokerAuthorization?.validUntil),
    evidenceFiles: project.brokerAuthorization?.evidenceFiles,
  };
}
