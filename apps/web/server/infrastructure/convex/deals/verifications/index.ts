import { fetchMutation } from "convex/nextjs";
import { verificationsApi } from "./api";
import type { VerificationsRepository } from "./types";

export type { VerificationsRepository } from "./types";

/**
 * WHY:   Convex remains the system of record for verification requests.
 * WHAT:  Convex-backed verification repository implementation.
 * HOW:   Calls the shared verification mutation with the current auth token.
 */
export const convexVerificationsRepository: VerificationsRepository = {
  async createForCurrentOrganization(token, input) {
    return fetchMutation(
      verificationsApi.createVerificationRequestForCurrentOrg as never,
      input as never,
      { token },
    ) as ReturnType<VerificationsRepository["createForCurrentOrganization"]>;
  },
  async createPropertyForCurrentOrganization(token, input) {
    return fetchMutation(
      verificationsApi.createPropertyVerificationRequestForCurrentOrg as never,
      input as never,
      { token },
    ) as ReturnType<VerificationsRepository["createPropertyForCurrentOrganization"]>;
  },
};
