import type { UploadedFileReference } from "@/server/contracts/files";
import type { PropertyViewerSummary } from "@/server/contracts/properties";
import type { BrokerPresence } from "../../Visuals/BrokerPresenceChip";
import type { ProjectFormSaveResult } from "../../../(zones)/projects/shared/forms/projectFormSubmission";

export type GalleryDisplayMode = "cover" | "fit";
export type GalleryAspectRatio = "auto" | "landscape" | "square" | "portrait";
export type ExpertPriceComparison = "below_market" | "fair_market" | "above_market" | "unknown";

export type ProjectDossierFormData = {
  projectType: "ready_property" | "off_plan" | "land" | "mixed_use";
  lifecycleStage: "rough_draft" | "draft" | "review" | "active" | "suspended" | "archived";
  salesMode: "developer_direct" | "broker_mediated" | "broker_owned";
  city: string;
  district: string;
  neighborhood: string;
  street: string;
  nationalAddress: string;
  latitude: string;
  longitude: string;
};

export type ProjectUnitFormData = {
  label: string;
  unitKind: "unit_type" | "unit";
  status: "available" | "reserved" | "sold" | "draft";
  bedrooms: string;
  bathrooms: string;
  sizeSqm: string;
  floor: string;
  view: string;
  price: string;
  handoverAt: string;
  floorPlanMedia: UploadedFileReference[];
};

export type ProjectPaymentPlanFormData = {
  title: string;
  cashPrice: string;
  startingPrice: string;
  downPayment: string;
  escrowReference: string;
  feesAndTaxNotes: string;
  bankAndSubsidyNotes: string;
  milestones: Array<{ label: string; amount: string; percentage: string; dueType: string; dueDate: string }>;
};

export type ProjectComplianceDocumentFormData = {
  documentType: "ad_license" | "wafi_license" | "commercial_registration" | "chamber_certificate" | "land_title" | "brokerage_contract" | "architectural_plan" | "consultant_contract" | "escrow_or_cpa" | "other";
  title: string;
  licenseOrReferenceNumber: string;
  expiresAt: string;
  files: UploadedFileReference[];
  notes: string;
};

export type ProjectBrokerAuthorizationFormData = {
  contractNumber: string;
  marketingScope: string;
  channelsText: string;
  commissionTerms: string;
  validFrom: string;
  validUntil: string;
  evidenceFiles: UploadedFileReference[];
};

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
  expertProjectType: "residential" | "commercial" | "mixed_use" | "land" | "hospitality";
  projectScale: string;
  productMix: string;
  primaryUnitType: string;
  sizeRange: string;
  priceComparison: ExpertPriceComparison;
  comparisonNotes: string;
  expertNotes: string;
  services: string[];
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
  dossier: ProjectDossierFormData;
  units: ProjectUnitFormData[];
  paymentPlans: ProjectPaymentPlanFormData[];
  complianceDocuments: ProjectComplianceDocumentFormData[];
  brokerAuthorization: ProjectBrokerAuthorizationFormData;
};

export type AgPropertyFormProps = {
  propertyId?: string;
  initialData?: Partial<ProjectFormData>;
  brokers?: BrokerPresence[];
  title?: string;
  description?: string;
  submitLabel?: string;
  onSave?: (data: ProjectFormData) => Promise<ProjectFormSaveResult> | ProjectFormSaveResult;
  onCancel?: () => void;
  cancelHref?: string;
  onDelete?: () => void;
  onRevokeViewer?: (viewerAuthUserId: string) => Promise<void> | void;
};

export type StepDefinition = {
  key: string;
  title: string;
  summary: string;
};
