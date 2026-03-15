import { getWorkspaceBehaviorForCurrentUser } from "@/server/domains/workspaces/service";
import {
  getCurrentOrganizationForCurrentUser,
  listCurrentOrganizationTeamInvites,
  listCurrentOrganizationTeamMembers,
} from "@/server/domains/organizations/service";
import { normalizeDomainError } from "@/server/contracts/errors";
import type { OrganizationInviteDisplay, OrganizationMemberDisplay } from "./entities";

/**
 * WHY:   Workspace settings pages need one gateway-safe loader for organization members and invites.
 * WHAT:  Returns the current user's primary organization plus its members and pending invites.
 * HOW:   Uses the existing workspace snapshot and organization repository instead of calling Convex directly from pages.
 */
export async function getWorkspaceOrganizationTeam() {
  const workspace = await getWorkspaceBehaviorForCurrentUser();
  const currentOrganization = await getCurrentOrganizationForCurrentUser();
  const organization = currentOrganization?.organization ?? workspace.primaryOrganization;

  if (!organization) {
    return {
      organization: null,
      members: [] as OrganizationMemberDisplay[],
      invites: [] as OrganizationInviteDisplay[],
      authUserId: workspace.session.userId,
      currentMembershipRole: null as "manager" | "member" | "viewer" | null,
    };
  }

  let members: OrganizationMemberDisplay[] = [];
  let invites: OrganizationInviteDisplay[] = [];
  let currentMembershipRole = currentOrganization?.membership.role ?? null;

  try {
    const [rawMembers, rawInvites] = await Promise.all([
      listCurrentOrganizationTeamMembers(),
      listCurrentOrganizationTeamInvites(),
    ]);
    members = rawMembers.map((member) => ({
      id: member.id,
      authUserId: member.authUserId,
      name: member.name,
      email: member.email,
      membershipId: member.membershipId ?? member.id,
      username: member.username,
      role: member.role,
      statusLabel: member.isActive ? "نشط" : member.roleStatus ?? "قيد التفعيل",
    }));
    invites = rawInvites.map((invite) => ({
      id: invite.id,
      email: invite.email,
      role: invite.role,
      status: invite.status,
      expiresLabel: new Date(invite.expiresAt).toLocaleDateString("ar-EG"),
    }));
  } catch (error) {
    const domainError = normalizeDomainError(error);
    if (domainError.code !== "FORBIDDEN" || !domainError.message.includes("Tenant organization")) {
      throw error;
    }
    currentMembershipRole = null;
  }

  return {
    organization,
    authUserId: workspace.session.userId,
    currentMembershipRole,
    members,
    invites,
  };
}
