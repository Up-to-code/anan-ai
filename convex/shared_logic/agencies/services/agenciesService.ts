import { ConvexError, type GenericId } from "convex/values";
import { generateRandomString } from "better-auth/crypto";
import type { MutationCtx, QueryCtx } from "../../../_generated/server";
import { requireCurrentProfile, requireOwnerProfile } from "../../lib/profile";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type OwnerProfile =
  | {
      ownerType: "broker";
      ownerBrokerId: GenericId<"brokers">;
      authUserId: string;
    }
  | {
      ownerType: "RED";
      ownerREDId: GenericId<"RED">;
      authUserId: string;
    };

function ensureInviteNotExpired(invite: { expiresAt: number; status: string }) {
  if (invite.status !== "pending") return;
  if (invite.expiresAt < Date.now()) {
    throw new ConvexError({ code: "INVITE_EXPIRED", message: "Invite has expired" });
  }
}

export async function getMyAgencyService(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("authUserId", (q) => q.eq("authUserId", identity.subject))
    .first();
  if (!profile || profile.isActive === false) return null;
  if (profile.brokerId) {
    const broker = await ctx.db.get(profile.brokerId);
    return broker ? { ownerType: "broker" as const, agency: broker } : null;
  }
  if (profile.REDId) {
    const red = await ctx.db.get(profile.REDId);
    return red ? { ownerType: "RED" as const, agency: red } : null;
  }
  return null;
}

export async function getOwnerProfileService(ctx: QueryCtx | MutationCtx): Promise<OwnerProfile> {
  const profile = await requireOwnerProfile(ctx);
  if (profile.ownerType === "broker") {
    return {
      ownerType: "broker",
      ownerBrokerId: profile.ownerBrokerId,
      authUserId: profile.authUserId,
    };
  }
  return {
    ownerType: "RED",
    ownerREDId: profile.ownerREDId,
    authUserId: profile.authUserId,
  };
}

export async function listTeamMembersService(ctx: QueryCtx) {
  const owner = await getOwnerProfileService(ctx);
  if (owner.ownerType === "broker") {
    return ctx.db
      .query("userProfiles")
      .filter((q) => q.eq(q.field("brokerId"), owner.ownerBrokerId))
      .collect();
  }
  return ctx.db
    .query("userProfiles")
    .filter((q) => q.eq(q.field("REDId"), owner.ownerREDId))
    .collect();
}

export async function listTeamInvitesService(ctx: QueryCtx | MutationCtx) {
  const owner = await getOwnerProfileService(ctx);
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

  return records.filter((invite) => invite.status === "pending" || invite.status === "accepted");
}

export async function createTeamInviteService(
  ctx: MutationCtx,
  args: { email: string; role: "manager" | "member" | "viewer" },
) {
  const owner = await getOwnerProfileService(ctx);
  const normalizedEmail = args.email.trim().toLowerCase();
  if (!normalizedEmail) {
    throw new ConvexError({ code: "INVALID_ARGUMENT", message: "Email is required" });
  }

  const existing = await listTeamInvitesService(ctx);
  const duplicate = existing.find((invite) => invite.email.toLowerCase() === normalizedEmail && invite.status === "pending");
  if (duplicate) {
    throw new ConvexError({ code: "INVITE_EXISTS", message: "Pending invite already exists for this email" });
  }

  const now = Date.now();
  const token = `invite_${generateRandomString(36)}`;
  return ctx.db.insert("teamInvites", {
    ownerType: owner.ownerType,
    ownerBrokerId: owner.ownerType === "broker" ? owner.ownerBrokerId : undefined,
    ownerREDId: owner.ownerType === "RED" ? owner.ownerREDId : undefined,
    email: normalizedEmail,
    role: args.role,
    token,
    status: "pending",
    invitedBy: owner.authUserId,
    expiresAt: now + INVITE_TTL_MS,
  });
}

export async function cancelTeamInviteService(
  ctx: MutationCtx,
  args: { inviteId: GenericId<"teamInvites"> },
) {
  const owner = await getOwnerProfileService(ctx);
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
}

export async function acceptTeamInviteService(ctx: MutationCtx, args: { token: string }) {
  const profile = await requireCurrentProfile(ctx);
  const invite = await ctx.db
    .query("teamInvites")
    .withIndex("token", (q) => q.eq("token", args.token))
    .first();

  if (!invite) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Invite not found" });
  }

  ensureInviteNotExpired(invite);

  const existingProfile = await ctx.db
    .query("userProfiles")
    .withIndex("authUserId", (q) => q.eq("authUserId", profile.authUserId))
    .first();

  if (!existingProfile) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Profile not found" });
  }

  if (invite.ownerType === "broker") {
    await ctx.db.patch(existingProfile._id, {
      brokerId: invite.ownerBrokerId,
      REDId: undefined,
      role: "broker",
      isActive: true,
    });
  } else {
    await ctx.db.patch(existingProfile._id, {
      REDId: invite.ownerREDId,
      brokerId: undefined,
      role: "RED",
      isActive: true,
    });
  }

  await ctx.db.patch(invite._id, {
    status: "accepted",
    acceptedBy: profile.authUserId,
    acceptedAt: Date.now(),
  });

  return { ok: true } as const;
}
