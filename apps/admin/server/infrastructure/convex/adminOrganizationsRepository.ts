import { fetchQuery } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";

type OrganizationsApiRefs = {
  listBrokerOrganizations: unknown;
  listDeveloperOrganizations: unknown;
  listOrganizationMemberships: unknown;
  listOrganizationInvites: unknown;
  getOrganizationDetail: unknown;
};

const organizationsApi = apiUnsafe["admin_zone/organizations"] as OrganizationsApiRefs;

/**
 * WHY:   The organizations workspace should load through one repository boundary instead of page-level Convex calls.
 * WHAT:  Exposes broker, developer, membership, invite, and organization-detail readers.
 * HOW:   Calls the `admin_zone/organizations` queries using the current admin auth token.
 */
export const convexAdminOrganizationsRepository = {
  async listBrokers(token: string) {
    return fetchQuery(organizationsApi.listBrokerOrganizations as never, {} as never, { token }) as Promise<Array<Record<string, unknown>>>;
  },
  async listDevelopers(token: string) {
    return fetchQuery(organizationsApi.listDeveloperOrganizations as never, {} as never, { token }) as Promise<Array<Record<string, unknown>>>;
  },
  async listMemberships(token: string) {
    return fetchQuery(organizationsApi.listOrganizationMemberships as never, {} as never, { token }) as Promise<Array<Record<string, unknown>>>;
  },
  async listInvites(token: string) {
    return fetchQuery(organizationsApi.listOrganizationInvites as never, {} as never, { token }) as Promise<Array<Record<string, unknown>>>;
  },
  async getDetail(token: string, organizationKey: string) {
    return fetchQuery(organizationsApi.getOrganizationDetail as never, { organizationKey } as never, { token }) as Promise<Record<string, unknown> | null>;
  },
};
