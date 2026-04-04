import type {
  CreateOrganizationInput,
  CreateOrganizationInviteInput,
  DirectorySearchResult,
  IncomingOrganizationInvite,
  OfferOrganizationSummary,
  OffersDirectoryProfile,
  OrganizationInviteSummary,
  OrganizationMembershipSummary,
  OrganizationPublicProfile,
  OrganizationSummary,
  OrganizationTeamMember,
  UpdateOrganizationInput,
  UpdateOrganizationMemberRoleInput,
} from "@/server/contracts/organizations";

export type CurrentOrganizationResult = {
  organization: OrganizationSummary | null;
  membership: OrganizationMembershipSummary | null;
  accessError?: true;
} | null;

/**
 * WHY: Organization reads and writes are core shared operations for the web gateway.
 * WHAT: Defines the organization management and directory operations exposed to domain services.
 * HOW: Each method accepts the current auth token and returns stable organization DTOs.
 */
export type OrganizationsRepository = {
  listForCurrentUser(token: string): Promise<OrganizationSummary[]>;
  createForCurrentUser(token: string, input: CreateOrganizationInput): Promise<OrganizationSummary>;
  getCurrentOrganization(token: string): Promise<CurrentOrganizationResult>;
  updateCurrentOrganization(token: string, input: UpdateOrganizationInput): Promise<OrganizationSummary>;
  listCurrentTeamMembers(token: string): Promise<OrganizationTeamMember[]>;
  listCurrentTeamInvites(token: string): Promise<OrganizationInviteSummary[]>;
  createCurrentTeamInvite(token: string, input: CreateOrganizationInviteInput): Promise<string>;
  cancelCurrentTeamInvite(token: string, inviteId: string): Promise<void>;
  updateCurrentTeamMemberRole(token: string, args: { membershipId: string; input: UpdateOrganizationMemberRoleInput }): Promise<void>;
  acceptCurrentTeamInvite(authToken: string, inviteToken: string): Promise<void>;
  searchDirectoryExact(token: string, query: string): Promise<DirectorySearchResult[]>;
  listOffersDirectoryProfiles(token: string, role: "broker" | "developer"): Promise<OffersDirectoryProfile[]>;
  listOfferOrganizationsDirectory(token: string, role: "broker" | "developer"): Promise<OfferOrganizationSummary[]>;
  getOrganizationPublicProfile(token: string, type: "broker" | "developer", slug: string): Promise<OrganizationPublicProfile | null>;
  listIncomingTeamInvites(token: string): Promise<IncomingOrganizationInvite[]>;
  cancelIncomingTeamInvite(token: string, inviteId: string): Promise<void>;
};
