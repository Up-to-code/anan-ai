import { apiUnsafe } from "@/lib/convexApi";

export type ComplianceApiRefs = {
  getComplianceRulesetForCurrentOrg: unknown;
  getComplianceRulesetByCountry: unknown;
};

export const complianceApi = apiUnsafe["shared_logic/compliance/index"] as ComplianceApiRefs;
