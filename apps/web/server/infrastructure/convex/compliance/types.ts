import type { ComplianceRuleset } from "@/server/contracts/compliance";

export type ComplianceRepository = {
  getForCurrentOrg(token: string): Promise<ComplianceRuleset | null>;
  getByCountryOrgType(token: string, args: { countryCode: string; orgType: "broker" | "red" }): Promise<ComplianceRuleset | null>;
};
