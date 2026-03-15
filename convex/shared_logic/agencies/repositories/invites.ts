import { ConvexError, v } from "convex/values";
import { mutation, query } from "../../../_generated/server";
import { requireCurrentProfile } from "../../lib/profile";
import {
  buildOwnerContext,
  findProfileByAuthUserId,
  findTenantOrgLinkByTenantOrgId,
  getOrganizationRecord,
  normalizeEmail,
  resolveTenantOrgIdForOwner,
  type AgenciesRepositoryCtx,
  type OwnerContext,
  type UserProfileRecord,
} from "./core";
import { appendInboxCollaborationEvent } from "../../inbox";
import { requireManagerAccess } from "./membership";
import { tenants } from "../../../tenants";
import { auditLog } from "../../../auditLog";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function normalizeTenantRole(role?: string): "manager" | "member" | "viewer" {
  if (role === "owner" || role === "admin" || role === "manager") return "manager";
  if (role === "viewer") return "viewer";
  return "member";
}

async function getOwnerDisplay(ctx: AgenciesRepositoryCtx, owner: OwnerContext) {
  const organization = await getOrganizationRecord(ctx, owner);
  return {
    organizationId: owner.ownerType === "broker" ? String(owner.ownerBrokerId) : String(owner.ownerREDId),
    organizationName: organization?.name ?? "منظمة أنان",
    organizationType: owner.ownerType === "broker" ? "broker" as const : "developer" as const,
  };
}

async function listTeamInvitesForOwnerInternal(ctx: AgenciesRepositoryCtx, owner: OwnerContext) {
  const tenantOrgId = await resolveTenantOrgIdForOwner(ctx, owner);
  const invitations = await tenants.listInvitations(ctx as never, tenantOrgId);

  return invitations
    .filter((invite) => invite.status === "pending" || invite.status === "accepted" || invite.status === "cancelled")
    .map((invite) => ({
      id: invite._id,
      email: invite.inviteeIdentifier,
      role: normalizeTenantRole(invite.role),
      status: invite.status === "cancelled" ? "canceled" : (invite.status as "pending" | "accepted" | "canceled"),
      token: invite._id,
      expiresAt: invite.expiresAt,
      acceptedAt: invite.acceptedAt ?? undefined,
    }));
}

/**
 * WHY:   Team management and directory flows both need the current invite list for one owner.
 * WHAT:  Lists pending and accepted invites for an owner context.
 * HOW:   Reads tenant invitations and projects the normalized invite DTO.
 */
export async function listTeamInvitesForOwner(ctx: AgenciesRepositoryCtx, owner: OwnerContext) {
  return listTeamInvitesForOwnerInternal(ctx, owner);
}

/**
 * WHY:   Admin and gateway flows need owner-scoped invite lists without relying on the current session.
 * WHAT:  Lists team invites for an explicit owner context.
 * HOW:   Builds the owner context from the args then delegates to the shared invite list helper.
 */
export const listTeamInvitesByOwner = query({
  args: {
    ownerType: v.union(v.literal("broker"), v.literal("RED")),
    ownerBrokerId: v.optional(v.id("brokers")),
    ownerREDId: v.optional(v.id("RED")),
  },
  handler: async (ctx, args) => {
    const owner = buildOwnerContext(args);
    return listTeamInvitesForOwnerInternal(ctx, owner);
  },
});

async function createTeamInviteForOwnerRecord(
  ctx: AgenciesRepositoryCtx,
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

  const tenantOrgId = await resolveTenantOrgIdForOwner(ctx, args.owner);
  const existingInvites = await tenants.listInvitations(ctx as never, tenantOrgId);
  const duplicate = existingInvites.find(
    (invite) => invite.status === "pending" && normalizeEmail(invite.inviteeIdentifier) === normalizedEmail,
  );
  if (duplicate) {
    throw new ConvexError({ code: "INVITE_EXISTS", message: "Pending invite already exists for this email" });
  }

  const invitedProfile = (await ctx.db.query("userProfiles").collect()).find(
    (profile) => normalizeEmail(profile.email ?? "") === normalizedEmail,
  );
  if (invitedProfile?.authUserId) {
    const existingMember = await tenants.getMember(ctx as never, tenantOrgId, invitedProfile.authUserId);
    if (existingMember && (existingMember.status ?? "active") === "active") {
      throw new ConvexError({ code: "MEMBER_EXISTS", message: "User is already a member of this organization" });
    }
  }

  const inviteResult = await tenants.inviteMember(ctx as never, args.owner.authUserId, tenantOrgId, normalizedEmail, args.role, {
    expiresAt: Date.now() + INVITE_TTL_MS,
  });

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
          organizationId: ownerDisplay.organizationId,
          organizationType: ownerDisplay.organizationType,
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
        inviteId: inviteResult.invitationId,
        inviteRole: args.role,
        inviteStatus: "pending",
        organizationName: ownerDisplay.organizationName,
        organizationType: ownerDisplay.organizationType,
      },
    });
  }

  await auditLog.log(ctx, {
    action: "invitation.created",
    actorId: args.owner.authUserId,
    resourceType: "tenantInvitations",
    resourceId: inviteResult.invitationId,
    severity: "info",
    metadata: {
      tenantOrgId,
      inviteeEmail: normalizedEmail,
      role: args.role,
      ownerType: args.owner.ownerType,
    },
    tags: ["organizations", "invites"],
  });

  return inviteResult.invitationId;
}

/**
 * WHY:   Team invite creation must be manager-gated and owner-aware.
 * WHAT:  Creates a pending invite for the given owner context.
 * HOW:   Validates duplicates, then delegates to tenants invitation creation.
 */
export const createTeamInviteForOwner = mutation({
  args: {
    ownerType: v.union(v.literal("broker"), v.literal("RED")),
    ownerBrokerId: v.optional(v.id("brokers")),
    ownerREDId: v.optional(v.id("RED")),
    email: v.string(),
    role: v.union(v.literal("manager"), v.literal("member"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    const owner = buildOwnerContext(args);
    return createTeamInviteForOwnerRecord(ctx, { owner, email: args.email, role: args.role });
  },
});

/**
 * WHY:   Workspace flows need a current-user invite mutation without exposing owner ids.
 * WHAT:  Creates a pending invite for the current organization.
 * HOW:   Requires manager access, then delegates to the shared invite creation helper.
 */
export const createTeamInviteForCurrentUser = mutation({
  args: {
    email: v.string(),
    role: v.union(v.literal("manager"), v.literal("member"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    const { owner } = await requireManagerAccess(ctx);
    return createTeamInviteForOwnerRecord(ctx, { owner, email: args.email, role: args.role });
  },
});

/**
 * WHY:   Invites can be canceled by managers and must stay scoped to their organization.
 * WHAT:  Cancels an invite for an explicit owner context.
 * HOW:   Resolves tenant org id and cancels via tenants API.
 */
export const cancelTeamInviteForOwner = mutation({
  args: {
    ownerType: v.union(v.literal("broker"), v.literal("RED")),
    ownerBrokerId: v.optional(v.id("brokers")),
    ownerREDId: v.optional(v.id("RED")),
    inviteId: v.string(),
  },
  handler: async (ctx, args) => {
    const owner = buildOwnerContext(args);
    const tenantOrgId = await resolveTenantOrgIdForOwner(ctx, owner);
    const invitation = await tenants.getInvitation(ctx as never, args.inviteId);
    await tenants.cancelInvitation(ctx as never, owner.authUserId, args.inviteId);

    await auditLog.log(ctx, {
      action: "invitation.canceled",
      actorId: owner.authUserId,
      resourceType: "tenantInvitations",
      resourceId: args.inviteId,
      severity: "info",
      metadata: {
        tenantOrgId,
        inviteeEmail: invitation?.inviteeIdentifier,
        role: invitation?.role,
        ownerType: owner.ownerType,
      },
      tags: ["organizations", "invites"],
    });

    return tenantOrgId;
  },
});

/**
 * WHY:   Workspace flows need a current-user invite cancel mutation without exposing owner ids.
 * WHAT:  Cancels a pending invite for the current organization.
 * HOW:   Requires manager access, then cancels via tenants API.
 */
export const cancelTeamInviteForCurrentUser = mutation({
  args: { inviteId: v.string() },
  handler: async (ctx, args) => {
    const { owner, profile } = await requireManagerAccess(ctx);
    const tenantOrgId = await resolveTenantOrgIdForOwner(ctx, owner);
    const invitation = await tenants.getInvitation(ctx as never, args.inviteId);
    await tenants.cancelInvitation(ctx as never, profile.authUserId, args.inviteId);

    await auditLog.log(ctx, {
      action: "invitation.canceled",
      actorId: profile.authUserId,
      resourceType: "tenantInvitations",
      resourceId: args.inviteId,
      severity: "info",
      metadata: {
        tenantOrgId,
        inviteeEmail: invitation?.inviteeIdentifier,
        role: invitation?.role,
        ownerType: owner.ownerType,
      },
      tags: ["organizations", "invites"],
    });
  },
});

/**
 * WHY:   Incoming invites need a cancel operation for the invitee.
 * WHAT:  Cancels an invite for the current user.
 * HOW:   Uses the tenants API to cancel the invitation.
 */
export const cancelIncomingTeamInviteForCurrentUser = mutation({
  args: { inviteId: v.string() },
  handler: async (ctx, args) => {
    const profile = await requireCurrentProfile(ctx);
    const invitation = await tenants.getInvitation(ctx as never, args.inviteId);
    await tenants.declineInvitation(ctx as never, args.inviteId, profile.authUserId);

    await auditLog.log(ctx, {
      action: "invitation.declined",
      actorId: profile.authUserId,
      resourceType: "tenantInvitations",
      resourceId: args.inviteId,
      severity: "info",
      metadata: {
        inviteeEmail: invitation?.inviteeIdentifier,
        role: invitation?.role,
        tenantOrgId: invitation?.organizationId,
      },
      tags: ["organizations", "invites"],
    });
  },
});

/**
 * WHY:   Invite acceptance powers both the current-user flow and explicit auth-user gateway fallback.
 * WHAT:  Accepts a team invite for the given auth user id.
 * HOW:   Delegates to tenants invitation acceptance using the invitation id.
 */
export async function acceptInviteForAuthUserRecord(
  ctx: AgenciesRepositoryCtx,
  args: { authUserId: string; token: string },
) {
  const invitation = await tenants.getInvitation(ctx as never, args.token);
  await tenants.acceptInvitation(ctx as never, args.token, args.authUserId, {
    acceptingUserIdentifier: args.authUserId,
  });

  await auditLog.log(ctx, {
    action: "invitation.accepted",
    actorId: args.authUserId,
    resourceType: "tenantInvitations",
    resourceId: args.token,
    severity: "info",
    metadata: {
      tenantOrgId: invitation?.organizationId,
      inviteeEmail: invitation?.inviteeIdentifier,
      role: invitation?.role,
    },
    tags: ["organizations", "invites"],
  });
}

export const acceptTeamInviteForAuthUser = mutation({
  args: {
    authUserId: v.string(),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    await acceptInviteForAuthUserRecord(ctx, args);
  },
});

export const acceptTeamInviteForCurrentUser = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const profile = await requireCurrentProfile(ctx);
    await acceptInviteForAuthUserRecord(ctx, { authUserId: profile.authUserId, token: args.token });
  },
});

/**
 * WHY:   Incoming invite lists must be scoped to the current user's identifier.
 * WHAT:  Lists pending invitations for the current user.
 * HOW:   Uses tenants pending invites and enriches with organization context.
 */
export const listIncomingTeamInvitesForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const profile = await requireCurrentProfile(ctx);
    const email = profile.email ? normalizeEmail(profile.email) : null;
    if (!email) return [];

    const invitations = await tenants.getPendingInvitations(ctx as never, email);
    const organizations = await Promise.all(
      invitations.map(async (invite) => {
        const link = await findTenantOrgLinkByTenantOrgId(ctx, invite.organizationId);
        const ownerType = link?.ownerType === "broker" ? "broker" : "developer";
        const tenantOrg = await tenants.getOrganization(ctx as never, invite.organizationId);
        const organization = link
          ? await getOrganizationRecord(ctx, {
              ownerType: link.ownerType,
              ownerBrokerId: link.ownerBrokerId!,
              ownerREDId: link.ownerREDId!,
              authUserId: profile.authUserId,
              tenantOrgId: link.tenantOrgId,
            })
          : null;
        return {
          invite,
          organizationName: organization?.name ?? tenantOrg?.name ?? "منظمة أنان",
          organizationType: ownerType,
          inviterName: invite.inviterName ?? "عضو الفريق",
          inviterAuthUserId: invite.inviterId ?? "",
        };
      }),
    );

    return organizations.map((item) => ({
      id: item.invite._id,
      token: item.invite._id,
      email: item.invite.inviteeIdentifier,
      role: normalizeTenantRole(item.invite.role),
      organizationName: item.organizationName,
      organizationType: item.organizationType,
      inviterName: item.inviterName,
      inviterAuthUserId: item.inviterAuthUserId,
      canMessage: true,
      conversationId: null,
      expiresAt: item.invite.expiresAt,
    }));
  },
});

/**
 * WHY:   Team management views need invites for the current organization.
 * WHAT:  Lists invites for the current organization.
 * HOW:   Resolves the current organization context and delegates to the shared invite list.
 */
export const listCurrentTeamInvites = query({
  args: {},
  handler: async (ctx) => {
    const { owner } = await requireManagerAccess(ctx);
    return listTeamInvitesForOwnerInternal(ctx, owner);
  },
});
