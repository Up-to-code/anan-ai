import { createRepositoryRefs, queryRef } from "@anan/convex-adapters/repository";
import { apiUnsafe } from "@/lib/convexApi";

type OrganizationsApiRefs = {
  listBrokerOrganizations: unknown;
  listDeveloperOrganizations: unknown;
  listOrganizationMemberships: unknown;
  listOrganizationInvites: unknown;
  getOrganizationDetail: unknown;
};

const organizationsApi = createRepositoryRefs<OrganizationsApiRefs>(apiUnsafe, "admin_zone/organizations");

/**
 * WHY:   The organizations workspace should load through one repository boundary instead of page-level Convex calls.
 * WHAT:  Exposes broker, developer, membership, invite, and organization-detail readers.
 * HOW:   Calls the `admin_zone/organizations` queries using the current admin auth token.
 */
export const convexAdminOrganizationsRepository = {
  async listBrokers(token: string) {
    return queryRef<Array<Record<string, unknown>>>(token, organizationsApi.listBrokerOrganizations);
  },
  async listDevelopers(token: string) {
    return queryRef<Array<Record<string, unknown>>>(token, organizationsApi.listDeveloperOrganizations);
  },
  async listMemberships(token: string) {
    return queryRef<Array<Record<string, unknown>>>(token, organizationsApi.listOrganizationMemberships);
  },
  async listInvites(token: string) {
    return queryRef<Array<Record<string, unknown>>>(token, organizationsApi.listOrganizationInvites);
  },
  async getDetail(token: string, organizationKey: string) {
    return queryRef<Record<string, unknown> | null>(token, organizationsApi.getOrganizationDetail, { organizationKey });
  },
};
