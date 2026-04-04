import type { PropertyVerificationRequestInput, VerificationRequestInput } from "@/server/contracts/verifications";

/**
 * WHY: Verification submissions must pass through a thin repository boundary.
 * WHAT: Defines the organization-scoped verification mutations used by the domain layer.
 * HOW: Accepts a Convex auth token and validated verification payloads.
 */
export type VerificationsRepository = {
  createForCurrentOrganization(token: string, input: VerificationRequestInput): Promise<{ requestId: string }>;
  createPropertyForCurrentOrganization(token: string, input: PropertyVerificationRequestInput): Promise<{ requestId: string }>;
};
