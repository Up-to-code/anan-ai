import { apiUnsafe } from "@/lib/convexApi";

export type SharedProjectDetailsApiRefs = {
  getPropertyForViewer: unknown;
};

export const sharedProjectDetailsApi = apiUnsafe["shared_logic/projectDetails"] as SharedProjectDetailsApiRefs;
