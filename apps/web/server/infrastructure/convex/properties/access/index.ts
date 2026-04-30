import { mutationRef, queryRef } from "@anan/convex-adapters/repository";
import { projectAccessApi } from "./api";
import type { ProjectAccessRepository } from "./types";

export type { ProjectAccessRepository } from "./types";

export const convexProjectAccessRepository: ProjectAccessRepository = {
  async listPropertyViewers(token, propertyId) {
    return queryRef<Awaited<ReturnType<ProjectAccessRepository["listPropertyViewers"]>>>(
      token,
      projectAccessApi.listPropertyViewers,
      { propertyId },
    );
  },
  async hasExplicitProjectViewerAccess(token, propertyId) {
    return queryRef<Awaited<ReturnType<ProjectAccessRepository["hasExplicitProjectViewerAccess"]>>>(
      token,
      projectAccessApi.hasExplicitProjectViewerAccess,
      { propertyId },
    );
  },
  async promoteCurrentUserToProjectViewer(token, input) {
    return mutationRef<Awaited<ReturnType<ProjectAccessRepository["promoteCurrentUserToProjectViewer"]>>>(
      token,
      projectAccessApi.promoteCurrentUserToProjectViewer,
      input,
    );
  },
  async revokePropertyViewer(token, input) {
    return mutationRef<Awaited<ReturnType<ProjectAccessRepository["revokePropertyViewer"]>>>(
      token,
      projectAccessApi.revokePropertyViewer,
      input,
    );
  },
};
