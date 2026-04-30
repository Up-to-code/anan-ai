import { createRepositoryRefs } from "@anan/convex-adapters/repository";
import { apiUnsafe } from "@/lib/convexApi";

export type VerificationsApiRefs = {
  createVerificationRequestForCurrentOrg: unknown;
  createPropertyVerificationRequestForCurrentOrg: unknown;
};

export const verificationsApi = createRepositoryRefs<VerificationsApiRefs>(apiUnsafe, "shared_logic/verifications/index");
