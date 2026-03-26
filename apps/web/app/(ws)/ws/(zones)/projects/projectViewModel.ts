import type { UploadedFileReference } from "@/server/contracts/files";
import { parsePropertyBody, type PropertyDetail } from "@/server/contracts/properties";
import type { WorkspaceProject } from "./projectTypes";
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
  const galleryImages = resolveGalleryImages(property);
  const parkingSpaces = presentation?.parkingSpaces ?? null;
  const hasParking = presentation?.hasParking ?? Boolean(parkingSpaces && parkingSpaces > 0);

  return {
    id: property._id,
    title: property.title,
    location: property.location ?? property.address,
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
    accessMode: "owner",
    canEdit: true,
    units: [],
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
): WorkspaceProject {
  const project = mapPropertyToWorkspaceProject(property);
  return {
    ...project,
    accessMode,
    canEdit: accessMode === "owner",
    permit: {
      ...project.permit,
      canShowPrivatePanel:
        accessMode === "shared" &&
        project.permit.visibility === "conversation_only" &&
        (Boolean(project.permit.privateSummary) || project.permit.privateFiles.length > 0),
    },
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
  coverImageKey?: string | null;
  galleryDisplayMode?: "cover" | "fit";
  galleryAspectRatio?: "auto" | "landscape" | "square" | "portrait";
  rooms: string;
  baths: string;
  area: string;
  images: PropertyDetail["media"];
  adLicenseNumber?: string;
}) {
  const numericPrice = Number(project.price.replace(/[^\d.]/g, "")) || 0;
  const numericArea = Number(project.area.replace(/[^\d.]/g, "")) || undefined;
  const numericParkingSpaces = Number(project.parkingSpaces?.replace(/[^\d]/g, "")) || undefined;
  const amenities = (project.amenitiesText ?? "")
    .split(/[\n,،]/)
    .map((item) => item.trim())
    .filter(Boolean);
  const hasPrivatePermitMaterial = Boolean(project.privatePermitSummary?.trim()) || Boolean(project.privatePermitFiles?.length);
  const orderedImages = orderGalleryImages(project.images ?? [], project.coverImageKey);

  return {
    title: project.name.trim(),
    address: project.location.trim(),
    location: project.location.trim(),
    description: project.description.trim(),
    price: numericPrice,
    beds: Number(project.rooms) || 0,
    baths: Number(project.baths) || 0,
    sqft: numericArea,
    media: orderedImages,
    body: {
      presentation: {
        descriptionShort: project.shortDescription?.trim() || undefined,
        amenities: amenities.length > 0 ? amenities : undefined,
        parkingSpaces: numericParkingSpaces,
        hasParking: project.hasParking ?? Boolean(numericParkingSpaces && numericParkingSpaces > 0),
        slides: orderedImages,
        coverImageKey: project.coverImageKey ?? orderedImages[0]?.key ?? undefined,
        galleryDisplayMode: project.galleryDisplayMode ?? "cover",
        galleryAspectRatio: project.galleryAspectRatio ?? "landscape",
        privatePermitSummary: project.privatePermitSummary?.trim() || undefined,
        privatePermitFiles: project.privatePermitFiles?.length ? project.privatePermitFiles : undefined,
        privatePermitVisibility: hasPrivatePermitMaterial ? "conversation_only" : undefined,
      },
    },
    adLicenseNumber: project.adLicenseNumber?.trim() || undefined,
  };
}
