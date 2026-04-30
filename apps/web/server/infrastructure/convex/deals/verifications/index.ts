import { mutationRef } from "@anan/convex-adapters/repository";
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
    return mutationRef<Awaited<ReturnType<VerificationsRepository["createForCurrentOrganization"]>>>(
      token,
      verificationsApi.createVerificationRequestForCurrentOrg,
      input,
    );
  },
  async createPropertyForCurrentOrganization(token, input) {
    return mutationRef<Awaited<ReturnType<VerificationsRepository["createPropertyForCurrentOrganization"]>>>(
      token,
      verificationsApi.createPropertyVerificationRequestForCurrentOrg,
      input,
    );
  },
};
