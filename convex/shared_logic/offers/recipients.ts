import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";

type ResolvedOfferRecipient = {
  toBrokerId?: Id<"brokers">;
  toREDId?: Id<"RED">;
};

async function findProfileByAuthUserId(ctx: MutationCtx, authUserId: string) {
  return ctx.db
    .query("userProfiles")
    .withIndex("authUserId", (q: any) => q.eq("authUserId", authUserId))
    .first();
}

async function findBrokerByField(
  ctx: MutationCtx,
  field: "contactEmail" | "phone",
  value: string,
) {
  return ctx.db
    .query("brokers")
    .filter((q: any) => q.eq(q.field(field), value))
    .first();
}

async function findRedByField(
  ctx: MutationCtx,
  field: "contactEmail" | "phone",
  value: string,
) {
  return ctx.db
    .query("RED")
    .filter((q: any) => q.eq(q.field(field), value))
    .first();
}

function toResolvedRecipient(args: { toBrokerId?: Id<"brokers">; toREDId?: Id<"RED"> }): ResolvedOfferRecipient {
  return { toBrokerId: args.toBrokerId, toREDId: args.toREDId };
}

async function findRecipientByContact(
  ctx: MutationCtx,
  field: "contactEmail" | "phone",
  value: string,
): Promise<ResolvedOfferRecipient> {
  const broker = await findBrokerByField(ctx, field, value);
  if (broker) {
    return toResolvedRecipient({ toBrokerId: broker._id });
  }
  const red = await findRedByField(ctx, field, value);
  if (red) {
    return toResolvedRecipient({ toREDId: red._id });
  }
  return toResolvedRecipient({});
}

async function findRecipientByAuthUser(ctx: MutationCtx, recipientAuthUserId: string) {
  const profile = await findProfileByAuthUserId(ctx, recipientAuthUserId);
  if (profile?.brokerId) {
    return toResolvedRecipient({ toBrokerId: profile.brokerId });
  }
  if ((profile as any)?.developerId) {
    return toResolvedRecipient({ toREDId: (profile as any).developerId });
  }
  return toResolvedRecipient({});
}

/**
 * WHY:   Private offers support recipient lookup by explicit ids, email, or phone.
 * WHAT:  Resolves the target broker/RED recipient ids for offer creation.
 * HOW:   Preserves explicit ids first, then falls back to email and phone lookup.
 */
export async function resolveOfferRecipient(
  ctx: MutationCtx,
  args: {
    visibility?: "public" | "private";
    toBrokerId?: Id<"brokers">;
    toREDId?: Id<"RED">;
    recipientAuthUserId?: string;
    recipientEmail?: string;
    recipientPhone?: string;
  },
): Promise<ResolvedOfferRecipient> {
  if ((args.visibility ?? "private") !== "private" || args.toBrokerId || args.toREDId) {
    return toResolvedRecipient({ toBrokerId: args.toBrokerId, toREDId: args.toREDId });
  }

  if (args.recipientAuthUserId) {
    const recipientFromProfile = await findRecipientByAuthUser(ctx, args.recipientAuthUserId);
    if (recipientFromProfile.toBrokerId || recipientFromProfile.toREDId) {
      return recipientFromProfile;
    }
  }

  if (args.recipientEmail) {
    const recipientFromEmail = await findRecipientByContact(ctx, "contactEmail", args.recipientEmail);
    if (recipientFromEmail.toBrokerId || recipientFromEmail.toREDId) {
      return recipientFromEmail;
    }
  }

  if (args.recipientPhone) {
    return findRecipientByContact(ctx, "phone", args.recipientPhone);
  }

  return toResolvedRecipient({});
}
