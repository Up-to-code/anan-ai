import { queryRef } from "@anan/convex-adapters/repository";
import { complianceApi } from "./api";
import type { ComplianceRepository } from "./types";

export type { ComplianceRepository } from "./types";

export const convexComplianceRepository: ComplianceRepository = {
  async getForCurrentOrg(token) {
    return queryRef<Awaited<ReturnType<ComplianceRepository["getForCurrentOrg"]>>>(
      token,
      complianceApi.getComplianceRulesetForCurrentOrg,
    );
  },
  async getByCountryOrgType(token, args) {
    return queryRef<Awaited<ReturnType<ComplianceRepository["getByCountryOrgType"]>>>(
      token,
      complianceApi.getComplianceRulesetByCountry,
      args,
    );
  },
};
