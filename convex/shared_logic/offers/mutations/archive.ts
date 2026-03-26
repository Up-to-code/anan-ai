import { ConvexError } from "convex/values";
import type { Id } from "../../../_generated/dataModel";
import type { MutationCtx } from "../../../_generated/server";
import { isOfferOwner, requireSender } from "../access";

function assertOfferIsArchivable(offer: {
  publicationState?: "draft" | "published" | "archived";
  status: "pending" | "accepted" | "rejected";
}) {
  if ((offer.publicationState ?? "draft") === "archived") {
    throw new ConvexError({
      code: "INVALID_STATE",
      message: "Offer is already archived",
    });
  }

  if (offer.status !== "pending") {
    throw new ConvexError({
      code: "INVALID_STATE",
      message: "Only pending offers can be archived",
    });
  }
}

/**
 * WHY:   Offer cleanup should hide inactive owner-controlled rows without destructive deletion.
 * WHAT:  Archives one owned pending offer by moving it to the `archived` publication state.
 * HOW:   Requires a broker/RED sender, validates ownership + pending status, then patches the publication lifecycle in place.
 */
export async function archiveOfferService(
  ctx: MutationCtx,
  args: { id: Id<"offers"> },
) {
  const access = await requireSender(ctx);
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
      message: "Only offer owner can archive an offer",
    });
  }

  assertOfferIsArchivable(offer);

  await ctx.db.patch(args.id, { publicationState: "archived" });
  return { ok: true } as const;
}
