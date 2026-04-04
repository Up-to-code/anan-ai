import { apiUnsafe } from "@/lib/convexApi";

export type VerificationsApiRefs = {
  createVerificationRequestForCurrentOrg: unknown;
  createPropertyVerificationRequestForCurrentOrg: unknown;
};

export const verificationsApi = apiUnsafe["shared_logic/verifications/index"] as VerificationsApiRefs;
