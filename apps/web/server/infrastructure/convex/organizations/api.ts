import { apiUnsafe } from "@/lib/convexApi";

export type OrganizationsApiRefs = {
  listCurrentOrganizations: unknown;
  createOrganizationForCurrentUser: unknown;
  getCurrentOrganization: unknown;
  updateCurrentOrganization: unknown;
  listCurrentTeamMembers: unknown;
  listCurrentTeamInvites: unknown;
  createTeamInviteForCurrentUser: unknown;
  cancelTeamInviteForCurrentUser: unknown;
  updateMembershipRoleForCurrentUser: unknown;
  acceptTeamInviteForCurrentUser: unknown;
  searchOrganizationDirectoryExact: unknown;
  listOffersDirectoryProfiles: unknown;
  listOfferOrganizationsDirectory: unknown;
  listIncomingTeamInvitesForCurrentUser: unknown;
  cancelIncomingTeamInviteForCurrentUser: unknown;
  listOrganizationsByAuthUserId: unknown;
  createOrganizationForAuthUser: unknown;
  listTeamMembersByOwner: unknown;
  listTeamInvitesByOwner: unknown;
  createTeamInviteForOwner: unknown;
  cancelTeamInviteForOwner: unknown;
  acceptTeamInviteForAuthUser: unknown;
  getOrganizationPublicProfile: unknown;
};

export const agenciesApi = apiUnsafe["shared_logic/agencies/repositories"] as OrganizationsApiRefs;
