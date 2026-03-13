import { ConvexError, v } from "convex/values";
import { mutation, query } from "../../../_generated/server";
import type { MutationCtx } from "../../../_generated/server";
import { requireCurrentProfile } from "../../lib/profile";
import {
  buildOwnerContext,
  findProfileByAuthUserId,
  normalizeDirectPair,
  normalizeEmail,
  type AgenciesRepositoryCtx,
  type OwnerContext,
  type TeamInviteRecord,
  type UserProfileRecord,
} from "./core";
import {
  ensureMembershipRecord,
  getMembershipByOwnerAndAuthUserId,
  listMembershipsByOwner,
  requireManagerAccess,
} from "./membership";
import { appendInboxCollaborationEvent } from "../../inbox";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

async function getOwnerDisplay(ctx: MutationCtx, owner: OwnerContext) {
  const organization = owner.ownerType === "broker"
    ? await ctx.db.get(owner.ownerBrokerId)
    : await ctx.db.get(owner.ownerREDId);

  return {
    organizationId: owner.ownerType === "broker" ? String(owner.ownerBrokerId) : String(owner.ownerREDId),
    organizationName: organization?.name ?? "منظمة أنان",
    organizationType: owner.ownerType === "broker" ? "broker" as const : "developer" as const,
  };
}

/**
 * WHY:   Invite acceptance must enforce expiry consistently across current-user and auth-user flows.
 * WHAT:  Throws a normalized error when a pending invite is expired.
 * HOW:   Checks status and compares `expiresAt` against the current time.
 */
export function ensureInviteNotExpired(invite: { expiresAt: number; status: string }) {
  if (invite.status !== "pending") return;
  if (invite.expiresAt < Date.now()) {
    throw new ConvexError({ code: "INVITE_EXPIRED", message: "Invite has expired" });
  }
}

/**
 * WHY:   Team management and directory flows both need the current invite list for one owner.
 * WHAT:  Lists pending and accepted invites for an owner context.
 * HOW:   Reads the owner-specific invite index and projects the normalized invite DTO.
 */
export async function listTeamInvitesForOwner(ctx: AgenciesRepositoryCtx, owner: OwnerContext) {
  const records =
    owner.ownerType === "broker"
      ? await ctx.db
          .query("teamInvites")
          .withIndex("ownerBrokerId", (q) => q.eq("ownerBrokerId", owner.ownerBrokerId))
          .collect()
      : await ctx.db
          .query("teamInvites")
          .withIndex("ownerREDId", (q) => q.eq("ownerREDId", owner.ownerREDId))
          .collect();

  return records
    .filter((invite: TeamInviteRecord) => invite.status === "pending" || invite.status === "accepted")
    .map((invite: TeamInviteRecord) => ({
      id: invite._id,
      email: invite.email,
      role: invite.role,
      status: invite.status,
      token: invite.token,
      expiresAt: invite.expiresAt,
      acceptedAt: invite.acceptedAt,
    }));
}

/**
 * WHY:   Invite creation needs one shared implementation regardless of whether the owner is passed explicitly or inferred from the current user.
 * WHAT:  Creates a pending invite for an organization owner.
 * HOW:   Prevents duplicate active membership or pending invite rows, then inserts the invite with a generated token.
 */
export async function createTeamInviteForOwnerRecord(
  ctx: MutationCtx,
  args: {
    owner: OwnerContext;
    email: string;
    role: "manager" | "member" | "viewer";
  },
) {
  const normalizedEmail = normalizeEmail(args.email);
  if (!normalizedEmail) {
    throw new ConvexError({ code: "INVALID_ARGUMENT", message: "Email is required" });
  }

  const memberships = await listMembershipsByOwner(ctx, args.owner);
  const existingMembers = await Promise.all(
    memberships.map(async (membership) => {
      const profile = await findProfileByAuthUserId(ctx, membership.authUserId);
      return {
        membership,
        email: profile?.email ? normalizeEmail(profile.email) : null,
      };
    }),
  );

  if (existingMembers.some((entry) => entry.membership.status === "active" && entry.email === normalizedEmail)) {
    throw new ConvexError({ code: "MEMBER_EXISTS", message: "User is already a member of this organization" });
  }

  let existingInvites: TeamInviteRecord[];
  if (args.owner.ownerType === "broker") {
    const ownerBrokerId = args.owner.ownerBrokerId;
    existingInvites = await ctx.db
      .query("teamInvites")
      .withIndex("ownerBrokerId", (q) => q.eq("ownerBrokerId", ownerBrokerId))
      .collect();
  } else {
    const ownerREDId = args.owner.ownerREDId;
    existingInvites = await ctx.db
      .query("teamInvites")
      .withIndex("ownerREDId", (q) => q.eq("ownerREDId", ownerREDId))
      .collect();
  }

  const duplicate = existingInvites.find(
    (invite: TeamInviteRecord) => normalizeEmail(invite.email) === normalizedEmail && invite.status === "pending",
  );
  if (duplicate) {
    throw new ConvexError({ code: "INVITE_EXISTS", message: "Pending invite already exists for this email" });
  }

  const now = Date.now();
  const inviteId = await ctx.db.insert("teamInvites", {
    ownerType: args.owner.ownerType,
    ownerBrokerId: args.owner.ownerType === "broker" ? args.owner.ownerBrokerId : undefined,
    ownerREDId: args.owner.ownerType === "RED" ? args.owner.ownerREDId : undefined,
    email: normalizedEmail,
    role: args.role,
    token: `invite_${crypto.randomUUID().replace(/-/g, "")}`,
    status: "pending",
    invitedBy: args.owner.authUserId,
    expiresAt: now + INVITE_TTL_MS,
  });

  const invitedProfile = (await ctx.db.query("userProfiles").collect()).find(
    (profile) => normalizeEmail(profile.email ?? "") === normalizedEmail,
  );
  const inviterProfile = await findProfileByAuthUserId(ctx, args.owner.authUserId);
  const ownerDisplay = await getOwnerDisplay(ctx, args.owner);

  if (invitedProfile?.authUserId && inviterProfile?.authUserId && invitedProfile.authUserId !== inviterProfile.authUserId) {
    await appendInboxCollaborationEvent(ctx, {
      senderUserId: inviterProfile.authUserId,
      recipientUserId: invitedProfile.authUserId,
      type: "invite_event",
      body: `تم إرسال دعوة للانضمام إلى ${ownerDisplay.organizationName}`,
      metadata: {
        contextType: "invite_event",
        actor: {
          authUserId: inviterProfile.authUserId,
          name: inviterProfile.name ?? inviterProfile.email ?? "عضو الفريق",
          role: inviterProfile.role === "RED" ? "developer" : inviterProfile.role ?? "user",
          organizationId: ownerDisplay.organizationId,
          organizationType: ownerDisplay.organizationType,
          organizationName: ownerDisplay.organizationName,
        },
        recipient: {
          recipientAuthUserId: invitedProfile.authUserId,
          organizationId: invitedProfile.brokerId ? String(invitedProfile.brokerId) : invitedProfile.REDId ? String(invitedProfile.REDId) : null,
          organizationType: invitedProfile.brokerId ? "broker" : invitedProfile.REDId ? "developer" : null,
          organizationName: ownerDisplay.organizationName,
        },
        title: ownerDisplay.organizationName,
        summary: `دعوة جديدة بدور ${args.role}`,
        href: "/ws/inbox",
        action: {
          type: "open_invite",
          label: "افتح الدعوة",
          href: "/ws/inbox",
        },
        inviteId: String(inviteId),
        inviteRole: args.role,
        inviteStatus: "pending",
        organizationName: ownerDisplay.organizationName,
        organizationType: ownerDisplay.organizationType,
      },
    });
  }

  return inviteId;
}

/**
 * WHY:   Invite acceptance powers both the current-user flow and explicit auth-user gateway fallback.
 * WHAT:  Accepts a team invite for the given auth user id.
 * HOW:   Loads the invite, validates expiry, patches the profile owner link, upserts membership, and marks the invite accepted.
 */
export async function acceptInviteForAuthUserRecord(
  ctx: MutationCtx,
  args: { authUserId: string; token: string },
) {
  const profile = await findProfileByAuthUserId(ctx, args.authUserId);
  if (!profile) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Profile not found" });
  }

  const invite = await ctx.db
    .query("teamInvites")
    .withIndex("token", (q) => q.eq("token", args.token))
    .first();

  if (!invite) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Invite not found" });
  }

  ensureInviteNotExpired(invite);

  const now = Date.now();
  const owner = buildOwnerContext({
    ownerType: invite.ownerType,
    ownerBrokerId: invite.ownerBrokerId,
    ownerREDId: invite.ownerREDId,
    authUserId: invite.invitedBy,
  });

  if (invite.ownerType === "broker") {
    await ctx.db.patch(profile._id, {
      brokerId: invite.ownerBrokerId,
      REDId: undefined,
      role: "broker",
      isActive: true,
      updatedAt: now,
    });
  } else {
    await ctx.db.patch(profile._id, {
      REDId: invite.ownerREDId,
      brokerId: undefined,
      role: "developer",
      isActive: true,
      updatedAt: now,
    });
  }

  await ensureMembershipRecord(ctx, {
    owner,
    profile: invite.ownerType === "broker"
      ? { ...profile, brokerId: invite.ownerBrokerId, REDId: undefined }
      : { ...profile, REDId: invite.ownerREDId, brokerId: undefined },
    role: invite.role,
    status: "active",
    invitedBy: invite.invitedBy,
    inviteId: invite._id,
  });

  await ctx.db.patch(invite._id, {
    status: "accepted",
    acceptedBy: args.authUserId,
    acceptedAt: now,
  });

  const inviterProfile = await findProfileByAuthUserId(ctx, invite.invitedBy);
  const ownerDisplay = await getOwnerDisplay(ctx, owner);
  if (inviterProfile?.authUserId) {
    await appendInboxCollaborationEvent(ctx, {
      senderUserId: args.authUserId,
      recipientUserId: inviterProfile.authUserId,
      type: "invite_event",
      body: `تم قبول دعوة ${ownerDisplay.organizationName}`,
      metadata: {
        contextType: "invite_event",
        actor: {
          authUserId: args.authUserId,
          name: profile.name ?? profile.email ?? "عضو الفريق",
          role: invite.ownerType === "broker" ? "broker" : "developer",
          organizationId: ownerDisplay.organizationId,
          organizationType: ownerDisplay.organizationType,
          organizationName: ownerDisplay.organizationName,
        },
        recipient: {
          recipientAuthUserId: inviterProfile.authUserId,
          organizationId: ownerDisplay.organizationId,
          organizationType: ownerDisplay.organizationType,
          organizationName: ownerDisplay.organizationName,
        },
        title: ownerDisplay.organizationName,
        summary: `تم قبول الدعوة بدور ${invite.role}`,
        href: "/ws/inbox",
        action: {
          type: "open_invite",
          label: "افتح الدعوة",
          href: "/ws/inbox",
        },
        inviteId: String(invite._id),
        inviteRole: invite.role,
        inviteStatus: "accepted",
        organizationName: ownerDisplay.organizationName,
        organizationType: ownerDisplay.organizationType,
      },
    });
  }

  return { ok: true } as const;
}

/**
 * WHY:   Workspace notifications/settings need the current user's pending incoming organization invites.
 * WHAT:  Lists incoming invites for a profile email together with inviter and conversation metadata.
 * HOW:   Matches pending invites by normalized email, joins owner + inviter records, and projects the invite card payload.
 */
export async function listIncomingTeamInvitesForProfile(
  ctx: AgenciesRepositoryCtx,
  profile: UserProfileRecord,
) {
  const normalizedEmail = normalizeEmail(profile.email ?? "");
  if (!normalizedEmail) {
    return [];
  }

  const invites = (await ctx.db.query("teamInvites").collect())
    .filter((invite) => invite.status === "pending" && normalizeEmail(invite.email) === normalizedEmail);

  const incoming = await Promise.all(
    invites.map(async (invite) => {
      const owner = invite.ownerBrokerId
        ? await ctx.db.get(invite.ownerBrokerId)
        : invite.ownerREDId
          ? await ctx.db.get(invite.ownerREDId)
          : null;
      const inviterProfile = await findProfileByAuthUserId(ctx, invite.invitedBy);
      if (!owner || !inviterProfile) {
        return null;
      }

      const directKey = normalizeDirectPair(profile.authUserId, inviterProfile.authUserId);
      const conversation = await ctx.db
        .query("inboxConversations")
        .withIndex("directKey", (q) => q.eq("directKey", directKey))
        .unique();

      return {
        id: String(invite._id),
        token: invite.token,
        email: invite.email,
        role: invite.role,
        organizationName: owner.name,
        organizationType: invite.ownerBrokerId ? "broker" : "developer",
        inviterName: inviterProfile.name ?? inviterProfile.email ?? "عضو الفريق",
        inviterAuthUserId: inviterProfile.authUserId,
        canMessage: true,
        conversationId: conversation?._id ?? null,
        expiresAt: invite.expiresAt,
      } as const;
    }),
  );

  return incoming.filter((invite): invite is NonNullable<typeof invite> => Boolean(invite));
}

/**
 * WHY:   Some gateway flows still need team invite creation with explicit owner data during migration.
 * WHAT:  Creates a team invite for the provided owner context.
 * HOW:   Normalizes the explicit owner payload and delegates to the shared invite-create helper.
 */
export const createTeamInviteForOwner = mutation({
  args: {
    ownerType: v.union(v.literal("broker"), v.literal("RED")),
    ownerBrokerId: v.optional(v.id("brokers")),
    ownerREDId: v.optional(v.id("RED")),
    authUserId: v.string(),
    email: v.string(),
    role: v.union(v.literal("manager"), v.literal("member"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    const owner = buildOwnerContext(args);
    owner.authUserId = args.authUserId;
    return createTeamInviteForOwnerRecord(ctx, {
      owner,
      email: args.email,
      role: args.role,
    });
  },
});

/**
 * WHY:   Workspace managers need a current-user invite creation path that keeps owner ids off the client.
 * WHAT:  Creates a team invite for the current manager's organization.
 * HOW:   Requires manager access and delegates to the shared invite-create helper.
 */
export const createTeamInviteForCurrentUser = mutation({
  args: {
    email: v.string(),
    role: v.union(v.literal("manager"), v.literal("member"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    const { owner } = await requireManagerAccess(ctx);
    return createTeamInviteForOwnerRecord(ctx, {
      owner,
      email: args.email,
      role: args.role,
    });
  },
});

/**
 * WHY:   Legacy explicit-owner flows still need to cancel invites while verifying owner ownership.
 * WHAT:  Cancels an invite for the provided owner context.
 * HOW:   Loads the invite, verifies it belongs to the owner, then marks it canceled.
 */
export const cancelTeamInviteForOwner = mutation({
  args: {
    ownerType: v.union(v.literal("broker"), v.literal("RED")),
    ownerBrokerId: v.optional(v.id("brokers")),
    ownerREDId: v.optional(v.id("RED")),
    inviteId: v.id("teamInvites"),
  },
  handler: async (ctx, args) => {
    const owner = buildOwnerContext(args);
    const invite = await ctx.db.get(args.inviteId);
    if (!invite) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Invite not found" });
    }
    const ownsInvite =
      (owner.ownerType === "broker" && invite.ownerBrokerId === owner.ownerBrokerId) ||
      (owner.ownerType === "RED" && invite.ownerREDId === owner.ownerREDId);
    if (!ownsInvite) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Cannot cancel this invite" });
    }
    await ctx.db.patch(args.inviteId, { status: "canceled" });
    return { ok: true } as const;
  },
});

/**
 * WHY:   Workspace managers need an invite cancel action scoped to the current organization.
 * WHAT:  Cancels one current-organization invite.
 * HOW:   Requires manager access, verifies owner ownership of the invite, then marks it canceled.
 */
export const cancelTeamInviteForCurrentUser = mutation({
  args: {
    inviteId: v.id("teamInvites"),
  },
  handler: async (ctx, args) => {
    const { owner } = await requireManagerAccess(ctx);
    const invite = await ctx.db.get(args.inviteId);
    if (!invite) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Invite not found" });
    }

    const ownsInvite =
      (owner.ownerType === "broker" && invite.ownerBrokerId === owner.ownerBrokerId) ||
      (owner.ownerType === "RED" && invite.ownerREDId === owner.ownerREDId);
    if (!ownsInvite) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Cannot cancel this invite" });
    }

    await ctx.db.patch(args.inviteId, { status: "canceled" });
    return { ok: true } as const;
  },
});

/**
 * WHY:   Invite recipients need a decline path that does not require organization membership.
 * WHAT:  Cancels an incoming pending invite for the current user's email.
 * HOW:   Validates invite ownership by normalized email and marks the invite canceled.
 */
export const cancelIncomingTeamInviteForCurrentUser = mutation({
  args: {
    inviteId: v.id("teamInvites"),
  },
  handler: async (ctx, args) => {
    const profile = await requireCurrentProfile(ctx);
    const invite = await ctx.db.get(args.inviteId);
    if (!invite) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Invite not found" });
    }
    if (invite.status !== "pending" || normalizeEmail(invite.email) !== normalizeEmail(profile.email ?? "")) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Cannot cancel this invite" });
    }

    await ctx.db.patch(args.inviteId, { status: "canceled" });
    return { ok: true } as const;
  },
});

/**
 * WHY:   Admin and gateway readers still need explicit-owner invite listing during the migration boundary.
 * WHAT:  Lists invites for the provided owner context.
 * HOW:   Builds the owner context and delegates to the shared invite listing helper.
 */
export const listTeamInvitesByOwner = query({
  args: {
    ownerType: v.union(v.literal("broker"), v.literal("RED")),
    ownerBrokerId: v.optional(v.id("brokers")),
    ownerREDId: v.optional(v.id("RED")),
  },
  handler: async (ctx, args) => {
    const owner = buildOwnerContext(args);
    return listTeamInvitesForOwner(ctx, owner);
  },
});

/**
 * WHY:   Workspace settings need the current organization's invite list with no exposed owner ids.
 * WHAT:  Lists invites for the current organization.
 * HOW:   Resolves the current organization owner and delegates to the shared invite listing helper.
 */
export const listCurrentTeamInvites = query({
  args: {},
  handler: async (ctx) => {
    const { owner } = await requireManagerAccess(ctx);
    return listTeamInvitesForOwner(ctx, owner);
  },
});

/**
 * WHY:   Gateway migration flows still need explicit auth-user invite acceptance in addition to the current-user mutation.
 * WHAT:  Accepts a team invite for the provided auth user id.
 * HOW:   Delegates to the shared invite-accept helper.
 */
export const acceptTeamInviteForAuthUser = mutation({
  args: {
    authUserId: v.string(),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    return acceptInviteForAuthUserRecord(ctx, args);
  },
});

/**
 * WHY:   Invite recipients in the workspace need a current-user accept action.
 * WHAT:  Accepts a team invite for the current authenticated profile.
 * HOW:   Resolves the current profile auth id and delegates to the shared invite-accept helper.
 */
export const acceptTeamInviteForCurrentUser = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await requireCurrentProfile(ctx);
    return acceptInviteForAuthUserRecord(ctx, {
      authUserId: profile.authUserId,
      token: args.token,
    });
  },
});

/**
 * WHY:   Workspace onboarding and settings need the current user's incoming invite cards.
 * WHAT:  Lists incoming team invites for the current profile.
 * HOW:   Resolves the current profile and delegates to the shared incoming-invite projection helper.
 */
export const listIncomingTeamInvitesForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const profile = await requireCurrentProfile(ctx);
    return listIncomingTeamInvitesForProfile(ctx, profile as UserProfileRecord);
  },
});
