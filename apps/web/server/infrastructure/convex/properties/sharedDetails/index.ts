import { fetchQuery } from "convex/nextjs";
import { sharedProjectDetailsApi } from "./api";
import type { SharedProjectDetailsRepository } from "./types";

export type { SharedProjectDetailsRepository } from "./types";

/**
 * WHY:   Workspace shared project pages need a repository that follows owner-or-viewer access rules.
 * WHAT:  Loads a property through the shared Convex project detail query.
 * HOW:   Calls the viewer-safe shared logic query and returns the property DTO.
 */
export const convexSharedProjectDetailsRepository: SharedProjectDetailsRepository = {
  async getProperty(token, id) {
    return fetchQuery(sharedProjectDetailsApi.getPropertyForViewer as never, {
      propertyId: id as never,
    } as never, { token }) as ReturnType<SharedProjectDetailsRepository["getProperty"]>;
  },
};
