import type { OrganizationAsset } from "@/server/contracts/properties";

export type ListOrganizationAssetsInput = {
  attachedEntityType?: "project" | "conversation" | "offer";
  attachedEntityId?: string;
  lifecycleState?: "active" | "archived" | "pending_delete" | "deleted";
  limit?: number;
};

export type AttachOrganizationAssetsInput = {
  keys: string[];
  attachedEntityType: "project" | "conversation" | "offer";
  attachedEntityId: string;
  visibilityScope: "organization" | "project_private_share" | "public_project";
};

export type MarkEntityAssetsPendingDeleteInput = {
  attachedEntityType: "project" | "conversation" | "offer";
  attachedEntityId: string;
  deletionReason?: string;
  scheduledDeletionAt?: number;
};

export type OrganizationAssetsRepository = {
  listOrganizationAssets(token: string, input: ListOrganizationAssetsInput): Promise<OrganizationAsset[]>;
  attachOrganizationAssets(token: string, input: AttachOrganizationAssetsInput): Promise<void>;
  markEntityAssetsPendingDelete(token: string, input: MarkEntityAssetsPendingDeleteInput): Promise<void>;
  listProjectAssetsForViewer(token: string, propertyId: string): Promise<OrganizationAsset[]>;
};
