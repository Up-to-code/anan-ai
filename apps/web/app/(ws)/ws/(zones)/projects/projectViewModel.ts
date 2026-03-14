import type { PropertyDetail } from "@/server/contracts/properties";
import type { WorkspaceProject } from "./projectTypes";

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

/**
 * WHY:   The projects UI still expects a visual-first route prop shape during the backend migration.
 * WHAT:  Maps a property DTO into the existing `WorkspaceProject` view model used by the route components.
 * HOW:   Derives labels and visual fallbacks from the normalized property/file contracts.
 */
export function mapPropertyToWorkspaceProject(property: PropertyDetail): WorkspaceProject {
  return {
    id: property._id,
    title: property.title,
    location: property.location ?? property.address,
    priceLabel: `${formatCurrency(property.price)} ر.س`,
    summary: property.description,
    image:
      property.heroImage?.url ??
      property.media?.[0]?.url ??
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
    specs: {
      rooms: `${property.beds} غرف`,
      baths: `${property.baths} حمامات`,
      area: property.sqft ? `${property.sqft} م²` : "غير محدد",
      status: property.status ?? "available",
    },
    publicationState: formatPublicationState(property.publicationState),
    units: [],
    brokers: [],
  };
}

export function mapWorkspaceProjectToPropertyInput(project: {
  name: string;
  price: string;
  location: string;
  description: string;
  rooms: string;
  baths: string;
  area: string;
  images: PropertyDetail["media"];
}) {
  const numericPrice = Number(project.price.replace(/[^\d.]/g, "")) || 0;
  const numericArea = Number(project.area.replace(/[^\d.]/g, "")) || undefined;

  return {
    title: project.name.trim(),
    address: project.location.trim(),
    location: project.location.trim(),
    description: project.description.trim(),
    price: numericPrice,
    beds: Number(project.rooms) || 0,
    baths: Number(project.baths) || 0,
    sqft: numericArea,
    media: project.images ?? [],
  };
}
