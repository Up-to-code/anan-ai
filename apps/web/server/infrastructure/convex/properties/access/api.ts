import { apiUnsafe } from "@/lib/convexApi";

export type ProjectAccessApiRefs = {
  listPropertyViewers: unknown;
  hasExplicitProjectViewerAccess: unknown;
  promoteCurrentUserToProjectViewer: unknown;
  revokePropertyViewer: unknown;
};

export const projectAccessApi = apiUnsafe["shared_logic/projectAccess"] as ProjectAccessApiRefs;
