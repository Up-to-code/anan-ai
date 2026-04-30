import { ConvexError, v } from "convex/values";
import { internalQuery, mutation, query } from "../../../_generated/server";
import { requireCurrentProfile } from "../../lib/profile";
import { requireAdminAccess } from "../../../_core/security/accessPolicy";
import {
  buildOwnerContext,
  findProfileByAuthUserId,
  getOwnerId,
  resolveOwnerContextFromProfile,
  resolveTenantOrgIdForOwner,
  type AgenciesRepositoryCtx,
  type OrganizationMembershipRecord,
  type OwnerContext,
  type UserProfileRecord,
} from "./core";
import { tenants } from "../../../tenants";
import { auditLog } from "../../../auditLog";
import { maybeNotifyMembershipRoleUpdated } from "./membershipRoleEvents";

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
    tenantRole: member.role,
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
 * WHY:   API key governance differentiates tenant owners from managers and cannot rely on normalized roles alone.
 * WHAT:  Resolves current organization access with the raw tenant membership role preserved.
 * HOW:   Reuses current membership resolution, then loads the tenant member directly for owner-sensitive decisions.
 */
export async function requireApiKeyAccess(
  ctx: AgenciesRepositoryCtx,
): Promise<{
  profile: UserProfileRecord;
  owner: OwnerContext;
  membership: OrganizationMembershipRecord;
  tenantRole: string;
}> {
  const current = await requireOrganizationMembership(ctx);
  if (!current.owner.tenantOrgId) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Tenant organization required" });
  }

  const tenantMember = await tenants.getMember(ctx as never, current.owner.tenantOrgId, current.profile.authUserId);
  if (!tenantMember) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Organization membership required" });
  }

  const tenantRole = tenantMember.role ?? "";
  if (!tenantRole || !["owner", "admin", "manager"].includes(tenantRole)) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Manager role required" });
  }

  return {
    ...current,
    tenantRole,
  };
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
 * WHY:   Internal action entrypoints still need the fully resolved current manager context without reimplementing org access rules.
 * WHAT:  Returns the current profile, owner, and membership for a manager caller.
 * HOW:   Reuses `requireManagerAccess` and exposes the resolved values through an internal-only query.
 */
export const requireManagerAccessForCurrentUser = internalQuery({
  args: {},
  handler: async (ctx) => requireManagerAccess(ctx),
});

async function requireSameTenantOrAdmin(args: {
  ctx: AgenciesRepositoryCtx;
  owner: OwnerContext;
  managerOnly?: boolean;
}) {
  try {
    await requireAdminAccess(args.ctx as any);
    return;
  } catch (error) {
    if (
      !(error instanceof ConvexError) ||
      !error.data ||
      typeof error.data !== "object" ||
      !("code" in error.data) ||
      error.data.code !== "FORBIDDEN"
    ) {
      throw error;
    }
  }

  const current = args.managerOnly
    ? await requireManagerAccess(args.ctx)
    : await requireOrganizationMembership(args.ctx);
  const [currentTenantOrgId, targetTenantOrgId] = await Promise.all([
    resolveTenantOrgIdForOwner(args.ctx, current.owner),
    resolveTenantOrgIdForOwner(args.ctx, args.owner),
  ]);

  if (currentTenantOrgId !== targetTenantOrgId) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Cross-organization access is not allowed" });
  }
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
        roleApprovalStatus: profile.roleApprovalStatus,
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
    await requireSameTenantOrAdmin({ ctx, owner });
    return listTeamMembersForOwner(ctx, owner);
  },
});

/**
 * WHY:   Gateway/admin flows may still need explicit-owner team reads without exposing them to public clients.
 * WHAT:  Lists active team members for an explicit owner context as an internal-only function.
 * HOW:   Builds the owner context from args, then delegates to the shared member projection.
 */
export const listTeamMembersByOwnerInternal = internalQuery({
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

function requireTenantOrganizationId(owner: OwnerContext) {
  if (!owner.tenantOrgId) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Tenant organization required" });
  }
  return owner.tenantOrgId;
}

async function getTenantMemberOrThrow(ctx: AgenciesRepositoryCtx, tenantOrgId: string, authUserId: string) {
  const member = await tenants.getMember(ctx as never, tenantOrgId, authUserId);
  if (!member) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Member not found" });
  }
  return member;
}

async function assertCanDemoteCurrentManager(args: {
  ctx: AgenciesRepositoryCtx;
  tenantOrgId: string;
  targetAuthUserId: string;
  actorAuthUserId: string;
  memberRole?: string;
  requestedRole: "manager" | "member" | "viewer";
}) {
  if (
    args.targetAuthUserId !== args.actorAuthUserId ||
    normalizeTenantRole(args.memberRole) !== "manager" ||
    args.requestedRole === "manager"
  ) {
    return;
  }
  const members = await tenants.listMembers(args.ctx as never, args.tenantOrgId, { status: "active" });
  const activeManagerCount = members.filter((item) => normalizeTenantRole(item.role) === "manager").length;
  if (activeManagerCount <= 1) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Cannot remove the last manager" });
  }
}

async function auditMembershipRoleUpdate(args: {
  ctx: any;
  actorId: string;
  resourceId: string;
  tenantOrgId: string;
  previousRole?: string;
  nextRole: "manager" | "member" | "viewer";
}) {
  await auditLog.logChange(args.ctx, {
    action: "membership.role.updated",
    actorId: args.actorId,
    resourceType: "tenantMemberships",
    resourceId: args.resourceId,
    before: { role: normalizeTenantRole(args.previousRole), tenantOrgId: args.tenantOrgId },
    after: { role: args.nextRole, tenantOrgId: args.tenantOrgId },
    generateDiff: true,
    severity: "info",
    tags: ["organizations", "memberships"],
  });
}

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
    const tenantOrgId = requireTenantOrganizationId(current.owner);
    const targetAuthUserId = args.membershipId;
    const member = await getTenantMemberOrThrow(ctx, tenantOrgId, targetAuthUserId);
    await assertCanDemoteCurrentManager({
      ctx,
      tenantOrgId,
      targetAuthUserId,
      actorAuthUserId: current.profile.authUserId,
      memberRole: member.role,
      requestedRole: args.role,
    });

    await tenants.updateMemberRole(
      ctx as never,
      current.profile.authUserId,
      tenantOrgId,
      targetAuthUserId,
      args.role,
    );
    await auditMembershipRoleUpdate({
      ctx,
      actorId: current.profile.authUserId,
      resourceId: targetAuthUserId,
      tenantOrgId,
      previousRole: member.role,
      nextRole: args.role,
    });
    await maybeNotifyMembershipRoleUpdated({
      ctx,
      current,
      targetAuthUserId,
      role: args.role,
    });
    return { previousRole: normalizeTenantRole(member.role) };
  },
});
