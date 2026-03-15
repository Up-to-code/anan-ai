import { ConvexError, v } from "convex/values";
import { mutation, query } from "../../../_generated/server";
import { requireCurrentProfile } from "../../lib/profile";
import {
  buildOwnerContext,
  findProfileByAuthUserId,
  getOrganizationRecord,
  getOwnerId,
  resolveOwnerContextFromProfile,
  resolveTenantOrgIdForOwner,
  type AgenciesRepositoryCtx,
  type OrganizationMembershipRecord,
  type OwnerContext,
  type UserProfileRecord,
} from "./core";
import { appendInboxCollaborationEvent } from "../../inbox";
import { tenants } from "../../../tenants";
import { auditLog } from "../../../auditLog";

function normalizeTenantRole(role?: string): "manager" | "member" | "viewer" {
  if (role === "owner" || role === "admin" || role === "manager") return "manager";
  if (role === "viewer") return "viewer";
  return "member";
}

async function mapMembershipRecord(
  ctx: AgenciesRepositoryCtx,
  owner: OwnerContext,
  profile: UserProfileRecord,
): Promise<OrganizationMembershipRecord> {
  if (!owner.tenantOrgId) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Tenant organization required" });
  }
  const member = await tenants.getMember(ctx as never, owner.tenantOrgId, profile.authUserId);
  if (!member) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Organization membership required" });
  }

  return {
    id: member.userId,
    ownerType: owner.ownerType,
    ownerId: String(getOwnerId(owner)),
    authUserId: member.userId,
    profileId: profile._id,
    role: normalizeTenantRole(member.role),
    status: (member.status ?? "active") === "active" ? "active" : "inactive",
    createdAt: member.joinedAt ?? member._creationTime ?? Date.now(),
    updatedAt: member.joinedAt ?? member._creationTime ?? Date.now(),
  };
}

/**
 * WHY:   Current-organization reads and writes need one shared access path that tolerates legacy owner records during migration.
 * WHAT:  Resolves the active profile, owner context, and active membership for the current user.
 * HOW:   Loads the persisted profile, resolves tenant membership, and rejects inactive membership.
 */
export async function requireOrganizationMembership(
  ctx: AgenciesRepositoryCtx,
): Promise<{ profile: UserProfileRecord; owner: OwnerContext; membership: OrganizationMembershipRecord }> {
  const profile = await requireCurrentProfile(ctx);
  const persistedProfile = await findProfileByAuthUserId(ctx, profile.authUserId);
  if (!persistedProfile) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Profile not found" });
  }

  const owner = await resolveOwnerContextFromProfile(ctx, persistedProfile);
  const membership = await mapMembershipRecord(ctx, owner, persistedProfile);
  if (membership.status !== "active") {
    throw new ConvexError({ code: "FORBIDDEN", message: "Organization membership required" });
  }

  return { profile: persistedProfile, owner, membership };
}

/**
 * WHY:   Manager-only organization actions should share one authorization guard.
 * WHAT:  Resolves the current organization context and enforces a manager membership role.
 * HOW:   Reuses `requireOrganizationMembership` and rejects non-manager members.
 */
export async function requireManagerAccess(
  ctx: AgenciesRepositoryCtx,
): Promise<{ profile: UserProfileRecord; owner: OwnerContext; membership: OrganizationMembershipRecord }> {
  const current = await requireOrganizationMembership(ctx);
  if (current.membership.role !== "manager") {
    throw new ConvexError({ code: "FORBIDDEN", message: "Manager role required" });
  }
  return current;
}

/**
 * WHY:   Workspace team pages need stable profile-backed member summaries rather than raw membership documents.
 * WHAT:  Lists active team members for an organization owner.
 * HOW:   Uses the tenants component members list and joins to user profiles for display fields.
 */
export async function listTeamMembersForOwner(ctx: AgenciesRepositoryCtx, owner: OwnerContext) {
  const tenantOrgId = await resolveTenantOrgIdForOwner(ctx, owner);
  const memberships = (await tenants.listMembers(ctx as never, tenantOrgId, { status: "active" }))
    .filter((membership) => (membership.status ?? "active") === "active");

  const members = await Promise.all(
    memberships.map(async (membership) => {
      const profile = await findProfileByAuthUserId(ctx, membership.userId);
      if (!profile) {
        return null;
      }

      return {
        id: profile._id,
        membershipId: membership.userId,
        authUserId: membership.userId,
        name: profile.name ?? profile.email ?? "مستخدم عنان",
        email: profile.email ?? "",
        username: profile.username ?? undefined,
        role: normalizeTenantRole(membership.role),
        roleStatus: profile.roleStatus,
        isActive: profile.isActive,
      };
    }),
  );

  return members.filter((member): member is NonNullable<typeof member> => Boolean(member));
}

/**
 * WHY:   Admin and workspace readers both need the current team's active member list.
 * WHAT:  Lists team members for an explicit owner context.
 * HOW:   Builds the owner context from the incoming args, then delegates to the shared member projection.
 */
export const listTeamMembersByOwner = query({
  args: {
    ownerType: v.union(v.literal("broker"), v.literal("RED")),
    ownerBrokerId: v.optional(v.id("brokers")),
    ownerREDId: v.optional(v.id("RED")),
  },
  handler: async (ctx, args) => {
    const owner = buildOwnerContext(args);
    return listTeamMembersForOwner(ctx, owner);
  },
});

/**
 * WHY:   Workspace settings pages need the current organization's team list without exposing owner ids to the client.
 * WHAT:  Lists active team members for the current organization.
 * HOW:   Resolves the current membership context and delegates to the shared member projection.
 */
export const listCurrentTeamMembers = query({
  args: {},
  handler: async (ctx) => {
    const { owner } = await requireOrganizationMembership(ctx);
    return listTeamMembersForOwner(ctx, owner);
  },
});

/**
 * WHY:   Manager role changes are one of the highest-risk organization mutations and need isolated authorization logic.
 * WHAT:  Updates the role for one membership inside the current manager's organization.
 * HOW:   Validates same-owner membership, prevents removing the last manager, and updates tenant membership role.
 */
export const updateMembershipRoleForCurrentUser = mutation({
  args: {
    membershipId: v.string(),
    role: v.union(v.literal("manager"), v.literal("member"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    const current = await requireManagerAccess(ctx);
    if (!current.owner.tenantOrgId) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Tenant organization required" });
    }

    const targetAuthUserId = args.membershipId;
    const member = await tenants.getMember(ctx as never, current.owner.tenantOrgId, targetAuthUserId);
    if (!member) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Member not found" });
    }

    if (targetAuthUserId === current.profile.authUserId && normalizeTenantRole(member.role) === "manager" && args.role !== "manager") {
      const members = await tenants.listMembers(ctx as never, current.owner.tenantOrgId, { status: "active" });
      const activeManagerCount = members.filter((item) => normalizeTenantRole(item.role) === "manager").length;
      if (activeManagerCount <= 1) {
        throw new ConvexError({ code: "FORBIDDEN", message: "Cannot remove the last manager" });
      }
    }

    await tenants.updateMemberRole(
      ctx as never,
      current.profile.authUserId,
      current.owner.tenantOrgId,
      targetAuthUserId,
      args.role,
    );

    await auditLog.logChange(ctx, {
      action: "membership.role.updated",
      actorId: current.profile.authUserId,
      resourceType: "tenantMemberships",
      resourceId: targetAuthUserId,
      before: { role: normalizeTenantRole(member.role), tenantOrgId: current.owner.tenantOrgId },
      after: { role: args.role, tenantOrgId: current.owner.tenantOrgId },
      generateDiff: true,
      severity: "info",
      tags: ["organizations", "memberships"],
    });

    if (targetAuthUserId !== current.profile.authUserId) {
      const [targetProfile, organization] = await Promise.all([
        findProfileByAuthUserId(ctx, targetAuthUserId),
        getOrganizationRecord(ctx, current.owner),
      ]);

      if (targetProfile?.authUserId && organization?.name) {
        const organizationType = current.owner.ownerType === "broker" ? "broker" as const : "developer" as const;
        await appendInboxCollaborationEvent(ctx, {
          senderUserId: current.profile.authUserId,
          recipientUserId: targetProfile.authUserId,
          type: "role_event",
          body: `تم تحديث دورك في ${organization.name}`,
          metadata: {
            contextType: "role_event",
            actor: {
              authUserId: current.profile.authUserId,
              name: current.profile.name ?? current.profile.email ?? "عضو الفريق",
              role: current.profile.role === "RED" ? "developer" : current.profile.role ?? "user",
              organizationId: current.owner.ownerType === "broker"
                ? String(current.owner.ownerBrokerId)
                : String(current.owner.ownerREDId),
              organizationType,
              organizationName: organization.name,
            },
            recipient: {
              recipientAuthUserId: targetProfile.authUserId,
              organizationId: current.owner.ownerType === "broker"
                ? String(current.owner.ownerBrokerId)
                : String(current.owner.ownerREDId),
              organizationType,
              organizationName: organization.name,
            },
            title: organization.name,
            summary: `تم تغيير الدور إلى ${args.role}`,
            href: "/ws/inbox",
            action: {
              type: "open_membership",
              label: "افتح العضوية",
              href: "/ws/inbox",
            },
            membershipId: targetAuthUserId,
            organizationRole: args.role,
            organizationName: organization.name,
            organizationType,
          },
        });
      }
    }

    return { previousRole: normalizeTenantRole(member.role) };
  },
});
