import { createRepositoryRefs } from "@anan/convex-adapters/repository";
import { apiUnsafe } from "@/lib/convexApi";

export type SharedProjectDetailsApiRefs = {
  getPropertyForViewer: unknown;
};

export const sharedProjectDetailsApi = createRepositoryRefs<SharedProjectDetailsApiRefs>(apiUnsafe, "shared_logic/projectDetails");
