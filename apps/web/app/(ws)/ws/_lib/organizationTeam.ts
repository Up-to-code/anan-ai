import { getWorkspaceBehaviorForCurrentUser } from "@/server/domains/auth/workspaces/service";
import {
  getCurrentOrganizationForCurrentUser,
  listCurrentOrganizationTeamInvites,
  listCurrentOrganizationTeamMembers,
} from "@/server/domains/auth/organizations/service";
import { normalizeDomainError } from "@/server/contracts/errors";
import type { OrganizationInviteDisplay, OrganizationMemberDisplay } from "./entities";

function emptyOrganizationTeam(args: { authUserId: string }) {
  return {
    organization: null,
    members: [] as OrganizationMemberDisplay[],
    invites: [] as OrganizationInviteDisplay[],
    authUserId: args.authUserId,
    currentMembershipRole: null as "manager" | "member" | "viewer" | null,
  };
}

function mapOrganizationMembers(rawMembers: Awaited<ReturnType<typeof listCurrentOrganizationTeamMembers>>) {
  return rawMembers.map((member) => ({
    id: member.id,
    authUserId: member.authUserId,
    name: member.name,
    email: member.email,
    membershipId: member.membershipId ?? member.id,
    username: member.username,
    role: member.role,
    statusLabel: member.isActive ? "نشط" : member.roleStatus ?? "قيد التفعيل",
  }));
}

function mapOrganizationInvites(rawInvites: Awaited<ReturnType<typeof listCurrentOrganizationTeamInvites>>) {
  return rawInvites.map((invite) => ({
    id: invite.id,
    email: invite.email,
    role: invite.role,
    status: invite.status,
    expiresLabel: new Date(invite.expiresAt).toLocaleDateString("ar-EG"),
  }));
}

function isTenantOrganizationForbidden(error: unknown) {
  const domainError = normalizeDomainError(error);
  return domainError.code === "FORBIDDEN" && domainError.message.includes("Tenant organization");
}

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
    return emptyOrganizationTeam({ authUserId: workspace.session.userId });
  }
  let members: OrganizationMemberDisplay[] = [];
  let invites: OrganizationInviteDisplay[] = [];
  let currentMembershipRole = currentOrganization?.membership?.role ?? null;
  try {
    const [rawMembers, rawInvites] = await Promise.all([
      listCurrentOrganizationTeamMembers(),
      listCurrentOrganizationTeamInvites(),
    ]);
    members = mapOrganizationMembers(rawMembers);
    invites = mapOrganizationInvites(rawInvites);
  } catch (error) {
    if (!isTenantOrganizationForbidden(error)) {
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
