import { ConvexError } from "convex/values";
import type { Id } from "../../../_generated/dataModel";
import type { MutationCtx } from "../../../_generated/server";
import { isOfferOwner, requireVerifiedSender } from "../access";

/**
 * WHY:   Publishing should stay isolated from other offer transitions so ownership and verification rules remain easy to audit.
 * WHAT:  Publishes one owned draft offer.
 * HOW:   Requires a verified sender, loads the offer, validates ownership, then patches the publication state.
 */
export async function publishOfferService(
  ctx: MutationCtx,
  args: { id: Id<"offers"> },
) {
  const access = await requireVerifiedSender(ctx);
  const offer = await ctx.db.get(args.id);
  if (!offer) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: "Offer not found",
    });
  }

  if (!isOfferOwner(offer, access)) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "Only offer owner can publish draft",
    });
  }

  await ctx.db.patch(args.id, { publicationState: "published" });
  return { ok: true } as const;
}
