import { fetchQuery } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";
import type { ComplianceRuleset } from "@/server/contracts/compliance";

type ComplianceApiRefs = {
  getComplianceRulesetForCurrentOrg: unknown;
  getComplianceRulesetByCountry: unknown;
};

const complianceApi = apiUnsafe["shared_logic/compliance/index"] as ComplianceApiRefs;

export type ComplianceRepository = {
  getForCurrentOrg(token: string): Promise<ComplianceRuleset | null>;
  getByCountryOrgType(token: string, args: { countryCode: string; orgType: "broker" | "red" }): Promise<ComplianceRuleset | null>;
};

export const convexComplianceRepository: ComplianceRepository = {
  async getForCurrentOrg(token) {
    return fetchQuery(
      complianceApi.getComplianceRulesetForCurrentOrg as never,
      {} as never,
      { token },
    ) as Promise<ComplianceRuleset | null>;
  },
  async getByCountryOrgType(token, args) {
    return fetchQuery(
      complianceApi.getComplianceRulesetByCountry as never,
      args as never,
      { token },
    ) as Promise<ComplianceRuleset | null>;
  },
};
