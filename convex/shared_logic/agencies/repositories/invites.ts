import { ConvexError, v } from "convex/values";
import { mutation, query } from "../../../_generated/server";
import { requireCurrentProfile } from "../../lib/profile";
import {
  buildOwnerContext,
  resolveTenantOrgIdForOwner,
  type AgenciesRepositoryCtx,
  type OwnerContext,
} from "./core";
import { requireManagerAccess } from "./membership";
import {
  acceptInviteForAuthUserRecord,
  createTeamInviteForOwnerRecord,
  listIncomingTeamInvitesForProfile,
  listTeamInvitesForOwnerInternal,
} from "./invites.helpers";
import { tenants } from "../../../tenants";
import { auditLog } from "../../../auditLog";

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
    if (!invitation) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Invitation not found" });
    }
    await tenants.cancelInvitation(ctx as never, invitation.inviterId, args.inviteId);

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
    return listIncomingTeamInvitesForProfile(ctx, profile);
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

export { acceptInviteForAuthUserRecord } from "./invites.helpers";
