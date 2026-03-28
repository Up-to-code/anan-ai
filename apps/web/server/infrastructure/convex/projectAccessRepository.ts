import { fetchMutation, fetchQuery } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";
import type { PropertyViewerSummary } from "@/server/contracts/properties";

type ProjectAccessApiRefs = {
  listPropertyViewers: unknown;
  hasExplicitProjectViewerAccess: unknown;
  promoteCurrentUserToProjectViewer: unknown;
  revokePropertyViewer: unknown;
};

const projectAccessApi = apiUnsafe["shared_logic/projectAccess"] as ProjectAccessApiRefs;

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

export const convexProjectAccessRepository: ProjectAccessRepository = {
  async listPropertyViewers(token, propertyId) {
    return fetchQuery(projectAccessApi.listPropertyViewers as never, { propertyId } as never, {
      token,
    }) as Promise<PropertyViewerSummary[]>;
  },
  async hasExplicitProjectViewerAccess(token, propertyId) {
    return fetchQuery(projectAccessApi.hasExplicitProjectViewerAccess as never, { propertyId } as never, {
      token,
    }) as Promise<boolean>;
  },
  async promoteCurrentUserToProjectViewer(token, input) {
    return fetchMutation(projectAccessApi.promoteCurrentUserToProjectViewer as never, input as never, {
      token,
    }) as Promise<{ alreadyOwner: boolean; promoted: boolean }>;
  },
  async revokePropertyViewer(token, input) {
    return fetchMutation(projectAccessApi.revokePropertyViewer as never, input as never, {
      token,
    }) as Promise<{ ok: true }>;
  },
};
