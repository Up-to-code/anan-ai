import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";

type ResolvedOfferRecipient = {
  toBrokerId?: Id<"brokers">;
  toREDId?: Id<"RED">;
};

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
    recipientEmail?: string;
    recipientPhone?: string;
  },
): Promise<ResolvedOfferRecipient> {
  let toBrokerId = args.toBrokerId;
  let toREDId = args.toREDId;

  if ((args.visibility ?? "private") !== "private" || toBrokerId || toREDId) {
    return { toBrokerId, toREDId };
  }

  if (args.recipientEmail) {
    const broker = await findBrokerByField(ctx, "contactEmail", args.recipientEmail);
    if (broker) {
      toBrokerId = broker._id;
    } else {
      const red = await findRedByField(ctx, "contactEmail", args.recipientEmail);
      if (red) toREDId = red._id;
    }
  }

  if (!toBrokerId && !toREDId && args.recipientPhone) {
    const broker = await findBrokerByField(ctx, "phone", args.recipientPhone);
    if (broker) {
      toBrokerId = broker._id;
    } else {
      const red = await findRedByField(ctx, "phone", args.recipientPhone);
      if (red) toREDId = red._id;
    }
  }

  return { toBrokerId, toREDId };
}
