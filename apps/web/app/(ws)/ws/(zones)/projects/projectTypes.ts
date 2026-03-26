import type { BrokerPresence } from "../../_components/Visuals/BrokerPresenceChip";
import type { UnitReference } from "../../_lib/entities";
import type { UploadedFileReference } from "@/server/contracts/files";

export type WorkspaceProject = {
  id: string;
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
  accessMode: "owner" | "shared";
  canEdit: boolean;
  units: UnitReference[];
  brokers: BrokerPresence[];
};
