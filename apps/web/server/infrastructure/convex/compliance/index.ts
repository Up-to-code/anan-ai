import { fetchQuery } from "convex/nextjs";
import { complianceApi } from "./api";
import type { ComplianceRepository } from "./types";

export type { ComplianceRepository } from "./types";

export const convexComplianceRepository: ComplianceRepository = {
  async getForCurrentOrg(token) {
    return fetchQuery(
      complianceApi.getComplianceRulesetForCurrentOrg as never,
      {} as never,
      { token },
    ) as ReturnType<ComplianceRepository["getForCurrentOrg"]>;
  },
  async getByCountryOrgType(token, args) {
    return fetchQuery(
      complianceApi.getComplianceRulesetByCountry as never,
      args as never,
      { token },
    ) as ReturnType<ComplianceRepository["getByCountryOrgType"]>;
  },
};
