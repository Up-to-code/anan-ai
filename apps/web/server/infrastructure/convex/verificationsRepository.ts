import { fetchMutation } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";
import type { PropertyVerificationRequestInput, VerificationRequestInput } from "@/server/contracts/verifications";

type VerificationsApiRefs = {
  createVerificationRequestForCurrentOrg: unknown;
  createPropertyVerificationRequestForCurrentOrg: unknown;
};

const verificationsApi = apiUnsafe[
  "shared_logic/verifications/index"
] as VerificationsApiRefs;

/**
 * WHY:   Verification submissions must pass through a thin repository boundary.
 * WHAT:  Repository contract for creating verification requests for the current org.
 * HOW:   Accepts a Convex auth token and delegates to the shared Convex mutation.
 */
export type VerificationsRepository = {
  createForCurrentOrganization(
    token: string,
    input: VerificationRequestInput,
  ): Promise<{ requestId: string }>;
  createPropertyForCurrentOrganization(
    token: string,
    input: PropertyVerificationRequestInput,
  ): Promise<{ requestId: string }>;
};

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
    ) as Promise<{ requestId: string }>;
  },
  async createPropertyForCurrentOrganization(token, input) {
    return fetchMutation(
      verificationsApi.createPropertyVerificationRequestForCurrentOrg as never,
      input as never,
      { token },
    ) as Promise<{ requestId: string }>;
  },
};
