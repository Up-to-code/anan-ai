import { getAuthUserId } from "./_core/security/authIdentity";
import { makeTenantsAPI, Tenants } from "@djpanda/convex-tenants";
import { authz } from "./authz";
import { components } from "./_generated/api";

/**
 * WHY:   Admin/migration flows need direct access to tenant org operations.
 * WHAT:  Provides the low-level tenants client instance for privileged calls.
 * HOW:   Instantiates the tenants component with the shared authz map.
 */
export const tenants = new Tenants(components.tenants, {
  authz,
  creatorRole: "owner",
  permissionMap: {
    createOrganization: false,
  },
});

const tenantsApi = makeTenantsAPI(components.tenants, {
  authz,
  creatorRole: "owner",
  permissionMap: {
    createOrganization: false,
  },
  auth: async (ctx) => {
    return await getAuthUserId(ctx);
  },
  getUser: async (ctx, userId) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("authUserId", (q: { eq: (field: string, value: string) => unknown }) =>
        q.eq("authUserId", userId),
      )
      .first();
    if (!profile) return null;
    return { name: profile.name ?? undefined, email: profile.email ?? undefined };
  },
});

/**
 * WHY:   Workspace orgs rely on tenants for creation.
 * WHAT:  Creates a tenant organization using the configured API.
 * HOW:   Delegates to the tenants API instance.
 */
export const createOrganization = tenantsApi.createOrganization;

/**
 * WHY:   Org profile updates must be routed through tenants.
 * WHAT:  Updates a tenant organization.
 * HOW:   Delegates to the tenants API instance.
 */
export const updateOrganization = tenantsApi.updateOrganization;

/**
 * WHY:   Admin workflows may remove tenant organizations.
 * WHAT:  Deletes a tenant organization.
 * HOW:   Delegates to the tenants API instance.
 */
export const deleteOrganization = tenantsApi.deleteOrganization;

/**
 * WHY:   Ownership transfers are part of org administration.
 * WHAT:  Transfers tenant organization ownership.
 * HOW:   Delegates to the tenants API instance.
 */
export const transferOwnership = tenantsApi.transferOwnership;

/**
 * WHY:   Workspace pages need tenant organization details.
 * WHAT:  Loads a tenant organization by id.
 * HOW:   Delegates to the tenants API instance.
 */
export const getOrganization = tenantsApi.getOrganization;

/**
 * WHY:   Slug-based routing needs tenant lookups.
 * WHAT:  Loads a tenant organization by slug.
 * HOW:   Delegates to the tenants API instance.
 */
export const getOrganizationBySlug = tenantsApi.getOrganizationBySlug;

/**
 * WHY:   Admin listings need tenant org collections.
 * WHAT:  Lists tenant organizations.
 * HOW:   Delegates to the tenants API instance.
 */
export const listOrganizations = tenantsApi.listOrganizations;

/**
 * WHY:   Team pages rely on membership rosters.
 * WHAT:  Lists members for a tenant organization.
 * HOW:   Delegates to the tenants API instance.
 */
export const listMembers = tenantsApi.listMembers;

/**
 * WHY:   Admin tables need paginated membership lists.
 * WHAT:  Lists members with pagination for a tenant organization.
 * HOW:   Delegates to the tenants API instance.
 */
export const listMembersPaginated = tenantsApi.listMembersPaginated;

/**
 * WHY:   Membership checks need point lookups.
 * WHAT:  Fetches a tenant member record.
 * HOW:   Delegates to the tenants API instance.
 */
export const getMember = tenantsApi.getMember;

/**
 * WHY:   Invites and admin flows add members to orgs.
 * WHAT:  Adds a member to a tenant organization.
 * HOW:   Delegates to the tenants API instance.
 */
export const addMember = tenantsApi.addMember;

/**
 * WHY:   Offboarding requires removing members.
 * WHAT:  Removes a member from a tenant organization.
 * HOW:   Delegates to the tenants API instance.
 */
export const removeMember = tenantsApi.removeMember;

/**
 * WHY:   Role management needs controlled updates.
 * WHAT:  Updates a tenant member role.
 * HOW:   Delegates to the tenants API instance.
 */
export const updateMemberRole = tenantsApi.updateMemberRole;

/**
 * WHY:   Compliance workflows may suspend access.
 * WHAT:  Suspends a tenant member.
 * HOW:   Delegates to the tenants API instance.
 */
export const suspendMember = tenantsApi.suspendMember;

/**
 * WHY:   Suspended members may be reinstated.
 * WHAT:  Unsuspends a tenant member.
 * HOW:   Delegates to the tenants API instance.
 */
export const unsuspendMember = tenantsApi.unsuspendMember;

/**
 * WHY:   Org growth flows need invites.
 * WHAT:  Invites a member to a tenant organization.
 * HOW:   Delegates to the tenants API instance.
 */
export const inviteMember = tenantsApi.inviteMember;

/**
 * WHY:   Pending invites must be cancelable.
 * WHAT:  Cancels a tenant invitation.
 * HOW:   Delegates to the tenants API instance.
 */
export const cancelInvitation = tenantsApi.cancelInvitation;

/**
 * WHY:   Invite reminders are part of onboarding.
 * WHAT:  Resends a tenant invitation.
 * HOW:   Delegates to the tenants API instance.
 */
export const resendInvitation = tenantsApi.resendInvitation;

/**
 * WHY:   Admin views need org invitation lists.
 * WHAT:  Lists tenant invitations.
 * HOW:   Delegates to the tenants API instance.
 */
export const listInvitations = tenantsApi.listInvitations;

/**
 * WHY:   Pending-only views need filtering.
 * WHAT:  Lists pending tenant invitations.
 * HOW:   Delegates to the tenants API instance.
 */
/**
 * WHY:   Invite inbox views need pending invitations for an identifier.
 * WHAT:  Lists pending invitations for a given identifier (email/user).
 * HOW:   Delegates to the tenants API pending invitations query.
 */
export const listPendingInvitations = tenantsApi.getPendingInvitations;

/**
 * WHY:   Invite acceptance must write membership.
 * WHAT:  Accepts a tenant invitation.
 * HOW:   Delegates to the tenants API instance.
 */
export const acceptInvitation = tenantsApi.acceptInvitation;

/**
 * WHY:   Org teams need their own listing.
 * WHAT:  Lists teams for a tenant organization.
 * HOW:   Delegates to the tenants API instance.
 */
export const listTeams = tenantsApi.listTeams;

/**
 * WHY:   Teams are created by org admins.
 * WHAT:  Creates a tenant team.
 * HOW:   Delegates to the tenants API instance.
 */
export const createTeam = tenantsApi.createTeam;

/**
 * WHY:   Team metadata may change over time.
 * WHAT:  Updates a tenant team.
 * HOW:   Delegates to the tenants API instance.
 */
export const updateTeam = tenantsApi.updateTeam;

/**
 * WHY:   Teams may be removed.
 * WHAT:  Deletes a tenant team.
 * HOW:   Delegates to the tenants API instance.
 */
export const deleteTeam = tenantsApi.deleteTeam;

/**
 * WHY:   Team rosters are shown in org UI.
 * WHAT:  Lists members for a tenant team.
 * HOW:   Delegates to the tenants API instance.
 */
export const listTeamMembers = tenantsApi.listTeamMembers;

/**
 * WHY:   Team onboarding adds members.
 * WHAT:  Adds a member to a tenant team.
 * HOW:   Delegates to the tenants API instance.
 */
export const addTeamMember = tenantsApi.addTeamMember;

/**
 * WHY:   Team management includes removal.
 * WHAT:  Removes a member from a tenant team.
 * HOW:   Delegates to the tenants API instance.
 */
export const removeTeamMember = tenantsApi.removeTeamMember;

/**
 * WHY:   Access checks need team membership lookups.
 * WHAT:  Checks whether a user is a team member.
 * HOW:   Delegates to the tenants API instance.
 */
export const isTeamMember = tenantsApi.isTeamMember;

/**
 * WHY:   Permission checks need per-member verification.
 * WHAT:  Checks a member permission inside an organization.
 * HOW:   Delegates to the tenants API instance.
 */
export const checkMemberPermission = tenantsApi.checkMemberPermission;

/**
 * WHY:   Permission gating needs org-level checks.
 * WHAT:  Checks a permission for a user in a tenant org.
 * HOW:   Delegates to the tenants API instance.
 */
export const checkPermission = tenantsApi.checkPermission;

/**
 * WHY:   Admin dashboards need a list of permissions.
 * WHAT:  Returns the permissions for a user in an org.
 * HOW:   Delegates to the tenants API instance.
 */
export const getUserPermissions = tenantsApi.getUserPermissions;

/**
 * WHY:   Role-based UI needs current roles.
 * WHAT:  Returns the roles for a user in an org.
 * HOW:   Delegates to the tenants API instance.
 */
export const getUserRoles = tenantsApi.getUserRoles;
