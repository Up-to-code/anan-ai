import { fetchMutation, fetchQuery } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";

type ComplianceApiRefs = {
  listComplianceRulesets: unknown;
  getComplianceRuleset: unknown;
  saveComplianceRuleset: unknown;
  seedDefaultComplianceRulesets: unknown;
};

const complianceApi = apiUnsafe["admin_zone/compliance"] as ComplianceApiRefs;

export const convexAdminComplianceRepository = {
  async list(token: string) {
    return fetchQuery(complianceApi.listComplianceRulesets as never, {} as never, { token }) as Promise<Array<Record<string, unknown>>>;
  },
  async get(token: string, id: string) {
    return fetchQuery(complianceApi.getComplianceRuleset as never, { id } as never, { token }) as Promise<Record<string, unknown> | null>;
  },
  async save(token: string, input: Record<string, unknown>) {
    return fetchMutation(complianceApi.saveComplianceRuleset as never, input as never, { token }) as Promise<{ ok: true; id: string; version: number }>;
  },
  async seedDefaults(token: string) {
    return fetchMutation(complianceApi.seedDefaultComplianceRulesets as never, {} as never, { token }) as Promise<{ ok: true; inserted: number }>;
  },
};
