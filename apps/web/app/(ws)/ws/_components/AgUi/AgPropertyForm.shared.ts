import type { UploadedFileReference } from "@/server/contracts/files";
import type { PropertyViewerSummary } from "@/server/contracts/properties";

export type AgPropertyFormState = {
  name: string;
  price: string;
  location: string;
  description: string;
  shortDescription: string;
  amenitiesText: string;
  hasParking: boolean;
  parkingSpaces: string;
  coverImageKey: string | null;
  galleryDisplayMode: "cover" | "fit";
  galleryAspectRatio: "auto" | "landscape" | "square" | "portrait";
  privatePermitSummary: string;
  privatePermitFiles: UploadedFileReference[];
  rooms: string;
  baths: string;
  area: string;
  status: string;
  clientVisibility: "private" | "public";
  images: UploadedFileReference[];
  video: string | null;
  adLicenseNumber: string;
  visibilityMembers: PropertyViewerSummary[];
};
