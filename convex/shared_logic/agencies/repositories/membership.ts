import { ConvexError, type GenericId, v } from "convex/values";
import { mutation, query } from "../../../_generated/server";
import type { MutationCtx } from "../../../_generated/server";
import { requireCurrentProfile } from "../../lib/profile";
import {
  buildOwnerContext,
  buildOwnerContextFromProfile,
  findProfileByAuthUserId,
  getOrganizationRecord,
  getOwnerId,
  isMutationCtx,
  type AgenciesRepositoryCtx,
  type OrganizationMembershipRecord,
  type OwnerContext,
  type UserProfileRecord,
} from "./core";
import { appendInboxCollaborationEvent } from "../../inbox";

/**
 * WHY:   Membership lookups are reused by reads, invite flows, and role updates.
 * WHAT:  Loads the membership row for a specific owner/auth-user pair.
 * HOW:   Queries the owner-scoped auth-user index for brokers or developers.
 */
export async function getMembershipByOwnerAndAuthUserId(
  ctx: AgenciesRepositoryCtx,
  owner: OwnerContext,
  authUserId: string,
) {
  return owner.ownerType === "broker"
    ? ctx.db
        .query("organizationMemberships")
        .withIndex("ownerBrokerId_authUserId", (q) => q.eq("ownerBrokerId", owner.ownerBrokerId).eq("authUserId", authUserId))
        .unique()
    : ctx.db
        .query("organizationMemberships")
        .withIndex("ownerREDId_authUserId", (q) => q.eq("ownerREDId", owner.ownerREDId).eq("authUserId", authUserId))
        .unique();
}

/**
 * WHY:   Team and invite operations need the full membership set for the active organization.
 * WHAT:  Lists memberships for one owner context.
 * HOW:   Reads the owner-specific index on `organizationMemberships`.
 */
export async function listMembershipsByOwner(
  ctx: AgenciesRepositoryCtx,
  owner: OwnerContext,
) {
  return owner.ownerType === "broker"
    ? ctx.db
        .query("organizationMemberships")
        .withIndex("ownerBrokerId", (q) => q.eq("ownerBrokerId", owner.ownerBrokerId))
        .collect()
    : ctx.db
        .query("organizationMemberships")
        .withIndex("ownerREDId", (q) => q.eq("ownerREDId", owner.ownerREDId))
        .collect();
}

/**
 * WHY:   Invite acceptance and owner bootstrap both need one canonical way to create or refresh a membership row.
 * WHAT:  Creates or updates the membership record for a profile under an owner.
 * HOW:   Upserts on owner/auth-user, preserving invite linkage and audit timestamps.
 */
export async function ensureMembershipRecord(
  ctx: MutationCtx,
  args: {
    owner: OwnerContext;
    profile: UserProfileRecord;
    role: "manager" | "member" | "viewer";
    status?: "active" | "inactive";
    invitedBy?: string;
    inviteId?: GenericId<"teamInvites">;
  },
) {
  const existing = await getMembershipByOwnerAndAuthUserId(ctx, args.owner, args.profile.authUserId);
  const now = Date.now();

  if (existing) {
    await ctx.db.patch(existing._id, {
      profileId: args.profile._id,
      role: args.role,
      status: args.status ?? "active",
      invitedBy: args.invitedBy ?? existing.invitedBy,
      inviteId: args.inviteId ?? existing.inviteId,
      updatedAt: now,
    });
    return (await ctx.db.get(existing._id))!;
  }

  const membershipId = await ctx.db.insert("organizationMemberships", {
    ownerType: args.owner.ownerType,
    ownerBrokerId: args.owner.ownerType === "broker" ? args.owner.ownerBrokerId : undefined,
    ownerREDId: args.owner.ownerType === "RED" ? args.owner.ownerREDId : undefined,
    authUserId: args.profile.authUserId,
    profileId: args.profile._id,
    role: args.role,
    status: args.status ?? "active",
    createdAt: now,
    updatedAt: now,
    invitedBy: args.invitedBy,
    inviteId: args.inviteId,
  });

  return (await ctx.db.get(membershipId))!;
}

/**
 * WHY:   Owners must always have an active manager membership even when older data predates the membership table.
 * WHAT:  Ensures the owner has an active manager membership row.
 * HOW:   Upgrades any existing row or creates a fresh manager membership linked to the owner profile.
 */
export async function ensureOwnerManagerMembership(
  ctx: MutationCtx,
  profile: UserProfileRecord,
  owner: OwnerContext,
) {
  const existing = await getMembershipByOwnerAndAuthUserId(ctx, owner, profile.authUserId);
  if (existing) {
    if (existing.role !== "manager" || existing.status !== "active") {
      await ctx.db.patch(existing._id, { role: "manager", status: "active", updatedAt: Date.now() });
      return (await ctx.db.get(existing._id))!;
    }
    return existing;
  }

  return ensureMembershipRecord(ctx, {
    owner,
    profile,
    role: "manager",
    status: "active",
    invitedBy: profile.authUserId,
  });
}

/**
 * WHY:   Current-organization reads and writes need one shared access path that tolerates legacy owner records during migration.
 * WHAT:  Resolves the active profile, owner context, and active membership for the current user.
 * HOW:   Loads the persisted profile, backfills an owner manager membership on mutations when needed, and rejects inactive membership.
 */
export async function requireOrganizationMembership(
  ctx: AgenciesRepositoryCtx,
): Promise<{ profile: UserProfileRecord; owner: OwnerContext; membership: OrganizationMembershipRecord }> {
  const profile = await requireCurrentProfile(ctx);
  const persistedProfile = await findProfileByAuthUserId(ctx, profile.authUserId);
  if (!persistedProfile) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Profile not found" });
  }

  const owner = buildOwnerContextFromProfile(persistedProfile);
  let membership = await getMembershipByOwnerAndAuthUserId(ctx, owner, persistedProfile.authUserId);

  if (!membership && isMutationCtx(ctx)) {
    membership = await ensureOwnerManagerMembership(ctx, persistedProfile, owner);
  }

  if (!membership && owner.authUserId === persistedProfile.authUserId) {
    membership = {
      _id: `legacy-${persistedProfile._id}` as GenericId<"organizationMemberships">,
      ownerType: owner.ownerType,
      ownerBrokerId: owner.ownerType === "broker" ? owner.ownerBrokerId : undefined,
      ownerREDId: owner.ownerType === "RED" ? owner.ownerREDId : undefined,
      authUserId: persistedProfile.authUserId,
      profileId: persistedProfile._id,
      role: "manager",
      status: "active",
      createdAt: persistedProfile.createdAt ?? Date.now(),
      updatedAt: persistedProfile.updatedAt ?? persistedProfile.createdAt ?? Date.now(),
      invitedBy: persistedProfile.authUserId,
      inviteId: undefined,
    } as OrganizationMembershipRecord;
  }

  if (!membership || membership.status !== "active") {
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
 * HOW:   Joins active memberships against profiles and falls back to auth-user lookups when needed.
 */
export async function listTeamMembersForOwner(ctx: AgenciesRepositoryCtx, owner: OwnerContext) {
  const memberships = (await listMembershipsByOwner(ctx, owner))
    .filter((membership) => membership.status === "active");

  const members = await Promise.all(
    memberships.map(async (membership) => {
      const profile = (await ctx.db.get(membership.profileId)) ?? await findProfileByAuthUserId(ctx, membership.authUserId);
      if (!profile) {
        return null;
      }

      return {
        id: profile._id,
        membershipId: membership._id,
        authUserId: membership.authUserId,
        name: profile.name ?? profile.email ?? "مستخدم أنان",
        email: profile.email ?? "",
        username: profile.username ?? undefined,
        role: membership.role,
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
 * HOW:   Validates same-owner membership, prevents removing the last manager, and patches the role.
 */
export const updateMembershipRoleForCurrentUser = mutation({
  args: {
    membershipId: v.id("organizationMemberships"),
    role: v.union(v.literal("manager"), v.literal("member"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    const current = await requireManagerAccess(ctx);
    const membership = await ctx.db.get(args.membershipId);
    if (!membership) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Member not found" });
    }

    const sameOwner =
      (current.owner.ownerType === "broker" &&
        membership.ownerType === "broker" &&
        membership.ownerBrokerId === current.owner.ownerBrokerId) ||
      (current.owner.ownerType === "RED" &&
        membership.ownerType === "RED" &&
        membership.ownerREDId === current.owner.ownerREDId);

    if (!sameOwner) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Cannot update this member" });
    }

    if (membership.authUserId === current.profile.authUserId && membership.role === "manager" && args.role !== "manager") {
      const memberships = await listMembershipsByOwner(ctx, current.owner);
      const activeManagerCount = memberships.filter((item) => item.status === "active" && item.role === "manager").length;
      if (activeManagerCount <= 1) {
        throw new ConvexError({ code: "FORBIDDEN", message: "At least one manager must remain" });
      }
    }

    const previousRole = membership.role;
    await ctx.db.patch(membership._id, {
      role: args.role,
      updatedAt: Date.now(),
    });

    if (membership.authUserId !== current.profile.authUserId) {
      const [targetProfile, organization] = await Promise.all([
        findProfileByAuthUserId(ctx, membership.authUserId),
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
              name: current.profile.name ?? current.profile.email ?? "مدير الفريق",
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
            summary: `تم تغيير الصلاحية من ${previousRole} إلى ${args.role}`,
            href: "/ws/settings",
            action: {
              type: "open_membership",
              label: "افتح العضوية",
              href: "/ws/settings",
            },
            membershipId: String(membership._id),
            organizationRole: args.role,
            previousRole,
            organizationName: organization.name,
            organizationType,
          },
        });
      }
    }

    return { ok: true } as const;
  },
});

/**
 * WHY:   Current-organization detail reads need both the organization summary and the caller's membership.
 * WHAT:  Returns the active organization summary together with the current membership projection.
 * HOW:   Resolves the current membership context, loads the organization record, and normalizes the response shape.
 */
export const getCurrentOrganization = query({
  args: {},
  handler: async (ctx) => {
    const { owner, membership } = await requireOrganizationMembership(ctx);
    const organization = await getOrganizationRecord(ctx, owner);
    if (!organization) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Organization not found" });
    }

    return {
      organization: {
        id: getOwnerId(owner),
        type: owner.ownerType === "broker" ? "broker" : "red",
        name: organization.name,
        slug: organization.slug,
        status: organization.status ?? null,
        isVerified: organization.isVerified === true,
        description: organization.description,
        website: organization.website,
        contactEmail: organization.contactEmail,
      },
      membership: {
        id: membership._id,
        ownerType: membership.ownerType,
        ownerId: owner.ownerType === "broker" ? membership.ownerBrokerId : membership.ownerREDId,
        authUserId: membership.authUserId,
        profileId: membership.profileId,
        role: membership.role,
        status: membership.status,
        createdAt: membership.createdAt,
        updatedAt: membership.updatedAt,
      },
    } as const;
  },
});
