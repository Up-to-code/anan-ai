import type { Id } from "../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import type { CollaborationActor, CollaborationRecipient } from "./types";

type ReadCtx = QueryCtx | MutationCtx;

export async function getProfileByAuthUserId(ctx: ReadCtx, authUserId: string) {
  return ctx.db
    .query("userProfiles")
    .withIndex("authUserId", (q) => q.eq("authUserId", authUserId))
    .unique();
}

export async function getUserImageByEmail(
  ctx: ReadCtx,
  email: string | null | undefined
): Promise<string | null> {
  if (!email) return null;
  const user = await ctx.db
    .query("users")
    .withIndex("email", (q) => q.eq("email", email))
    .first();
  return user?.image ?? null;
}

export async function getProfileByOrganizationTarget(
  ctx: ReadCtx,
  args: { brokerId?: Id<"brokers">; REDId?: Id<"RED"> }
) {
  if (args.brokerId) {
    return ctx.db
      .query("userProfiles")
      .withIndex("brokerId", (q) => q.eq("brokerId", args.brokerId!))
      .first();
  }

  if (args.REDId) {
    return ctx.db
      .query("userProfiles")
      .withIndex("REDId", (q) => q.eq("REDId", args.REDId!))
      .first();
  }

  return null;
}

export async function getOrganizationNameByOwner(
  ctx: ReadCtx,
  args: { brokerId?: Id<"brokers">; REDId?: Id<"RED"> }
) {
  if (args.brokerId) {
    return (await ctx.db.get(args.brokerId))?.name ?? null;
  }

  if (args.REDId) {
    return (await ctx.db.get(args.REDId))?.name ?? null;
  }

  return null;
}

export async function getOfferAuthorProjection(ctx: MutationCtx, senderUserId: string) {
  const senderProfile = await getProfileByAuthUserId(ctx, senderUserId);
  const authorName = senderProfile?.name ?? senderProfile?.email ?? "مستخدم عنان";
  const organizationName =
    (await getOrganizationNameByOwner(ctx, {
      brokerId: senderProfile?.brokerId ?? undefined,
      REDId: senderProfile?.REDId ?? undefined,
    })) ?? authorName;

  return { authorName, organizationName };
}

export async function getCollaborationActorProjection(
  ctx: ReadCtx,
  authUserId: string
): Promise<CollaborationActor> {
  const profile = await getProfileByAuthUserId(ctx, authUserId);
  const role = profile?.role === "RED" ? "developer" : profile?.role ?? "user";
  const organizationName = await getOrganizationNameByOwner(ctx, {
    brokerId: profile?.brokerId ?? undefined,
    REDId: profile?.REDId ?? undefined,
  });

  return {
    authUserId,
    name: profile?.name ?? profile?.email ?? "مستخدم عنان",
    role,
    organizationId: profile?.brokerId
      ? String(profile.brokerId)
      : profile?.REDId
        ? String(profile.REDId)
        : null,
    organizationType: profile?.brokerId
      ? "broker"
      : profile?.REDId
        ? "developer"
        : null,
    organizationName,
  };
}

export async function getCollaborationRecipientProjection(
  ctx: ReadCtx,
  authUserId: string
): Promise<CollaborationRecipient> {
  const profile = await getProfileByAuthUserId(ctx, authUserId);
  const organizationName = await getOrganizationNameByOwner(ctx, {
    brokerId: profile?.brokerId ?? undefined,
    REDId: profile?.REDId ?? undefined,
  });

  return {
    recipientAuthUserId: authUserId,
    organizationId: profile?.brokerId
      ? String(profile.brokerId)
      : profile?.REDId
        ? String(profile.REDId)
        : null,
    organizationType: profile?.brokerId
      ? "broker"
      : profile?.REDId
        ? "developer"
        : null,
    organizationName,
  };
}
