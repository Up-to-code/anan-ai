import { createRepositoryRefs } from "@anan/convex-adapters/repository";
import { apiUnsafe } from "@/lib/convexApi";

export type ProjectAccessApiRefs = {
  listPropertyViewers: unknown;
  hasExplicitProjectViewerAccess: unknown;
  promoteCurrentUserToProjectViewer: unknown;
  revokePropertyViewer: unknown;
};

export const projectAccessApi = createRepositoryRefs<ProjectAccessApiRefs>(apiUnsafe, "shared_logic/projectAccess");
