import type { BrokerPresence } from "../../../_components/Visuals/BrokerPresenceChip";
import type { UnitReference } from "../../../_lib/entities";
import type { UploadedFileReference } from "@/server/contracts/files";
import type { OrganizationAsset, PropertyViewerSummary } from "@/server/contracts/properties";
import type { ProjectDossierDetail } from "@/server/contracts/projects";

export type WorkspaceProjectUnitDetail = UnitReference & {
  projectId: string;
  projectTitle: string;
  projectLocation: string;
  projectImage: string;
  summary: string;
  paymentPlanLabel: string | null;
  complianceLabel: string | null;
  adLicenseLabel: string | null;
  readinessLabel: string;
  galleryImages: UploadedFileReference[];
};

export type WorkspaceProject = {
  id: string;
  propertyId: string;
  title: string;
  location: string;
  priceLabel: string;
  summary: string;
  shortDescription: string;
  image: string;
  galleryImages: UploadedFileReference[];
  gallery: {
    coverImageKey: string | null;
    displayMode: "cover" | "fit";
    aspectRatio: "auto" | "landscape" | "square" | "portrait";
  };
  amenities: string[];
  parking: {
    hasParking: boolean;
    spaces: number | null;
    label: string;
  };
  expert: {
    assetType: string | null;
    listingType: string | null;
    projectScale: string | null;
    productMix: string | null;
    primaryUnitType: string | null;
    sizeRange: string | null;
    priceComparison: string | null;
    comparisonNotes: string | null;
    expertNotes: string | null;
    services: string[];
  };
  permit: {
    statusLabel: string;
    privateSummary: string | null;
    privateFiles: UploadedFileReference[];
    visibility: "conversation_only" | "hidden";
    canShowPrivatePanel: boolean;
  };
  specs: {
    rooms: string;
    baths: string;
    area: string;
    status: string;
  };
  publicationState: "published" | "draft" | "archived";
  readiness: {
    status: string;
    label: string;
    canPublish: boolean;
  };
  accessMode: "owner" | "shared";
  canEdit: boolean;
  visibility: {
    clientVisibility: "private" | "public";
    viewers: PropertyViewerSummary[];
  };
  assets: OrganizationAsset[];
  units: UnitReference[];
  dossier: ProjectDossierDetail | null;
  brokers: BrokerPresence[];
};
