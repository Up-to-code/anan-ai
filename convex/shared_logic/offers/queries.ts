import type { Doc, Id } from "../../_generated/dataModel";
import type { QueryCtx } from "../../_generated/server";
import { getOptionalProfile } from "./access";

async function attachProperty(ctx: QueryCtx, offer: Doc<"offers">) {
  const property = await ctx.db.get(offer.propertyId);
  return { ...offer, property };
}

async function attachSenderProjection(ctx: QueryCtx, offer: Doc<"offers">) {
  const property = await ctx.db.get(offer.propertyId);
  let senderName = "غير معروف";

  if (offer.fromBrokerId) {
    const broker = await ctx.db.get(offer.fromBrokerId);
    if (broker) senderName = broker.name;
  } else if (offer.fromREDId) {
    const red = await ctx.db.get(offer.fromREDId);
    if (red) senderName = red.name;
  }

  return { ...offer, property, senderName };
}

function isVisibleOffer(offer: Doc<"offers">) {
  return (
    offer.publicationState !== "draft" &&
    offer.publicationState !== "archived"
  );
}

/**
 * WHY:   Offer senders need a simple “my sent offers” listing.
 * WHAT:  Returns offers sent by the current broker or RED, with property projections attached.
 * HOW:   Resolves the optional current profile, then queries the sender owner index.
 */
export async function listSentOffersService(ctx: QueryCtx) {
  const current = await getOptionalProfile(ctx);
  if (!current) return [];

  let results: Doc<"offers">[] = [];
  if (current.profile.brokerId) {
    results = await ctx.db
      .query("offers")
      .withIndex("fromBrokerId", (q) =>
        q.eq("fromBrokerId", current.profile.brokerId as Id<"brokers">),
      )
      .collect();
  } else if (current.profile.REDId) {
    results = await ctx.db
      .query("offers")
      .withIndex("fromREDId", (q) =>
        q.eq("fromREDId", current.profile.REDId as Id<"RED">),
      )
      .collect();
  }

  return Promise.all(results.map((offer) => attachProperty(ctx, offer)));
}

/**
 * WHY:   Offer recipients need a filtered inbox that excludes non-visible drafts and archived rows.
 * WHAT:  Returns received offers for the current broker or RED with sender name + property projection.
 * HOW:   Resolves the optional current profile, loads offers by recipient owner id, then filters visible items.
 */
export async function listReceivedOffersService(ctx: QueryCtx) {
  const current = await getOptionalProfile(ctx);
  if (!current) return [];

  let results: Doc<"offers">[] = [];
  if (current.profile.brokerId) {
    results = await ctx.db
      .query("offers")
      .withIndex("toBrokerId", (q) =>
        q.eq("toBrokerId", current.profile.brokerId as Id<"brokers">),
      )
      .collect();
  } else if (current.profile.REDId) {
    results = await ctx.db
      .query("offers")
      .withIndex("toREDId", (q) =>
        q.eq("toREDId", current.profile.REDId as Id<"RED">),
      )
      .collect();
  }

  return Promise.all(
    results.filter(isVisibleOffer).map((offer) => attachSenderProjection(ctx, offer)),
  );
}

/**
 * WHY:   The public marketplace needs visible public offers with sender metadata.
 * WHAT:  Returns all pending public offers for authenticated viewers.
 * HOW:   Requires only an authenticated identity, then filters public offers by publication state.
 */
export async function listPublicOffersService(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return [];

  const results = await ctx.db
    .query("offers")
    .withIndex("visibility", (q) => q.eq("visibility", "public"))
    .filter((q) => q.eq(q.field("status"), "pending"))
    .collect();

  return Promise.all(
    results.filter(isVisibleOffer).map((offer) => attachSenderProjection(ctx, offer)),
  );
}
