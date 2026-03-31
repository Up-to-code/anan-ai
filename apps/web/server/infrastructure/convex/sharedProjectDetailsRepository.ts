import { fetchQuery } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";
import type { PropertyDetail } from "@/server/contracts/properties";

type SharedProjectDetailsApiRefs = {
  getPropertyForViewer: unknown;
};

const sharedProjectDetailsApi = apiUnsafe["shared_logic/projectDetails"] as SharedProjectDetailsApiRefs;

export type SharedProjectDetailsRepository = {
  getProperty(token: string, id: string): Promise<PropertyDetail | null>;
};

/**
 * WHY:   Workspace shared project pages need a repository that follows owner-or-viewer access rules.
 * WHAT:  Loads a property through the shared Convex project detail query.
 * HOW:   Calls the viewer-safe shared logic query and returns the property DTO.
 */
export const convexSharedProjectDetailsRepository: SharedProjectDetailsRepository = {
  async getProperty(token, id) {
    return fetchQuery(sharedProjectDetailsApi.getPropertyForViewer as never, {
      propertyId: id as never,
    } as never, { token }) as Promise<PropertyDetail | null>;
  },
};
