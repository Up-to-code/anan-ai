import { fetchMutation, fetchQuery } from "convex/nextjs";
import { projectAccessApi } from "./api";
import type { ProjectAccessRepository } from "./types";

export type { ProjectAccessRepository } from "./types";

export const convexProjectAccessRepository: ProjectAccessRepository = {
  async listPropertyViewers(token, propertyId) {
    return fetchQuery(projectAccessApi.listPropertyViewers as never, { propertyId } as never, {
      token,
    }) as ReturnType<ProjectAccessRepository["listPropertyViewers"]>;
  },
  async hasExplicitProjectViewerAccess(token, propertyId) {
    return fetchQuery(projectAccessApi.hasExplicitProjectViewerAccess as never, { propertyId } as never, {
      token,
    }) as ReturnType<ProjectAccessRepository["hasExplicitProjectViewerAccess"]>;
  },
  async promoteCurrentUserToProjectViewer(token, input) {
    return fetchMutation(projectAccessApi.promoteCurrentUserToProjectViewer as never, input as never, {
      token,
    }) as ReturnType<ProjectAccessRepository["promoteCurrentUserToProjectViewer"]>;
  },
  async revokePropertyViewer(token, input) {
    return fetchMutation(projectAccessApi.revokePropertyViewer as never, input as never, {
      token,
    }) as ReturnType<ProjectAccessRepository["revokePropertyViewer"]>;
  },
};
