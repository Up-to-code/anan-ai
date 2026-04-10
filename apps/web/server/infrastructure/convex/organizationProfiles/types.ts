import type { OrganizationSummary, UpdateOrganizationInput } from "@/server/contracts/organizations";

export type BootstrapOrganizationProfileInput = {
  organizationId: string;
  name: string;
  slug?: string;
  type: "broker" | "red";
};

/**
 * WHY:   Clerk-backed organization flows still need app-owned metadata and a legacy owner bridge in Convex.
 * WHAT:  Defines the org-profile bridge reads and writes used by the web gateway.
 * HOW:   Implementations hide Convex transport details and return normalized organization summaries.
 */
export type OrganizationProfilesRepository = {
  listByOrganizationIds(token: string, organizationIds: string[]): Promise<OrganizationSummary[]>;
  getCurrent(token: string): Promise<OrganizationSummary | null>;
  bootstrapCurrent(token: string, input: BootstrapOrganizationProfileInput): Promise<OrganizationSummary>;
  syncCurrent(token: string): Promise<OrganizationSummary | null>;
  updateCurrent(token: string, input: UpdateOrganizationInput): Promise<OrganizationSummary>;
};
