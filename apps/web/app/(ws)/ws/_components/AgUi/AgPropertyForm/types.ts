import type { UploadedFileReference } from "@/server/contracts/files";
import type { PropertyViewerSummary } from "@/server/contracts/properties";
import type { BrokerPresence } from "../../Visuals/BrokerPresenceChip";
import type { ProjectFormClientResult } from "../../../(zones)/projects/projectFormSubmission";

export type GalleryDisplayMode = "cover" | "fit";
export type GalleryAspectRatio = "auto" | "landscape" | "square" | "portrait";

export type ProjectFormData = {
  name: string;
  price: string;
  location: string;
  description: string;
  shortDescription: string;
  amenitiesText: string;
  hasParking: boolean;
  parkingSpaces: string;
  coverImageKey: string | null;
  galleryDisplayMode: GalleryDisplayMode;
  galleryAspectRatio: GalleryAspectRatio;
  privatePermitSummary: string;
  privatePermitFiles: UploadedFileReference[];
  rooms: string;
  baths: string;
  area: string;
  status: string;
  clientVisibility: "private" | "public";
  images: UploadedFileReference[];
  video: string | null;
  brokerId: string | null;
  adLicenseNumber?: string;
  adLicenseStatus?: "pending" | "approved" | "rejected" | null;
  visibilityMembers?: PropertyViewerSummary[];
};

export type AgPropertyFormProps = {
  propertyId?: string;
  initialData?: Partial<ProjectFormData>;
  brokers?: BrokerPresence[];
  title?: string;
  description?: string;
  submitLabel?: string;
  onSave?: (data: ProjectFormData) => Promise<ProjectFormClientResult> | ProjectFormClientResult;
  onCancel?: () => void;
  onDelete?: () => void;
  onRevokeViewer?: (viewerAuthUserId: string) => Promise<void> | void;
};

export type StepDefinition = {
  key: string;
  title: string;
  summary: string;
};
