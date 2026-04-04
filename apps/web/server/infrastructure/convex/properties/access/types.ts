import type { PropertyViewerSummary } from "@/server/contracts/properties";

export type ProjectAccessRepository = {
  listPropertyViewers(token: string, propertyId: string): Promise<PropertyViewerSummary[]>;
  hasExplicitProjectViewerAccess(token: string, propertyId: string): Promise<boolean>;
  promoteCurrentUserToProjectViewer(
    token: string,
    input: { propertyId: string; sharedByAuthUserId?: string },
  ): Promise<{ alreadyOwner: boolean; promoted: boolean }>;
  revokePropertyViewer(
    token: string,
    input: { propertyId: string; viewerAuthUserId: string },
  ): Promise<{ ok: true }>;
};
