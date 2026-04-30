import { createRepositoryRefs } from "@anan/convex-adapters/repository";
import { apiUnsafe } from "@/lib/convexApi";

export type ComplianceApiRefs = {
  getComplianceRulesetForCurrentOrg: unknown;
  getComplianceRulesetByCountry: unknown;
};

export const complianceApi = createRepositoryRefs<ComplianceApiRefs>(apiUnsafe, "shared_logic/compliance/index");
