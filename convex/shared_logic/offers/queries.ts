import type { Doc, Id } from "../../_generated/dataModel";
import type { QueryCtx } from "../../_generated/server";
import { getOptionalProfile, requireSender } from "./access";

async function attachProperty(ctx: QueryCtx, offer: Doc<"offers">) {
  const property = await ctx.db.get(offer.propertyId);
  return { ...offer, property };
}

async function resolveSenderName(ctx: QueryCtx, offer: Doc<"offers">) {
  if (offer.fromBrokerId) {
    return (await ctx.db.get(offer.fromBrokerId))?.name ?? "غير معروف";
  }
  if (offer.fromREDId) {
    return (await ctx.db.get(offer.fromREDId))?.name ?? "غير معروف";
  }
  return "غير معروف";
}

async function attachSenderProjection(ctx: QueryCtx, offer: Doc<"offers">) {
  const property = await ctx.db.get(offer.propertyId);
  const senderName = await resolveSenderName(ctx, offer);

  return { ...offer, property, senderName };
}

function isOfferRecipient(args: {
  offer: Doc<"offers">;
  authUserId: string;
  brokerId?: Id<"brokers"> | null;
  redId?: Id<"RED"> | null;
}) {
  return (
    args.offer.recipientAuthUserId === args.authUserId ||
    (args.brokerId ? args.offer.toBrokerId === args.brokerId : false) ||
    (args.redId ? args.offer.toREDId === args.redId : false)
  );
}

async function buildOfferLiveState(
  ctx: QueryCtx,
  offer: Doc<"offers">,
  access: Awaited<ReturnType<typeof requireSender>>,
) {
  const property = await ctx.db.get(offer.propertyId);
  const isOwner =
    (access.brokerId ? offer.fromBrokerId === access.brokerId : false) ||
    (access.REDId ? offer.fromREDId === access.REDId : false);
  const isRecipient = isOfferRecipient({
    offer,
    authUserId: access.authUserId,
    brokerId: access.brokerId ?? null,
    redId: access.REDId ?? null,
  });

  return {
    id: offer._id,
    propertyId: offer.propertyId,
    price: offer.price,
    status: offer.status,
    publicationState: offer.publicationState ?? "draft",
    visibility: offer.visibility ?? "private",
    recipientAuthUserId: offer.recipientAuthUserId,
    sourceConversationId: offer.sourceConversationId,
    message: offer.message,
    description: offer.description,
    senderName: await resolveSenderName(ctx, offer),
    attachments: offer.attachments,
    property: property
      ? {
          id: property._id,
          title: property.title,
          address: property.address ?? property.location ?? "غير محدد",
          price: property.price,
          imageUrl: property.heroImage?.url ?? property.media?.[0]?.url,
        }
      : null,
    href: `/ws/offers/${offer._id}`,
    propertyTitle: property?.title ?? offer.message ?? offer.description ?? "عرض خاص",
    propertyAddress: property?.address ?? property?.location ?? "غير محدد",
    propertyImageUrl: property?.heroImage?.url ?? property?.media?.[0]?.url ?? null,
    isOwner,
    isRecipient,
    canEditDraft: isOwner && (offer.publicationState ?? "draft") === "draft" && offer.status === "pending",
    canPublish: isOwner && (offer.publicationState ?? "draft") === "draft" && offer.status === "pending",
    canArchive: isOwner && (offer.publicationState ?? "draft") !== "archived" && offer.status === "pending",
    canRespond: isRecipient && (offer.publicationState ?? "draft") === "published" && offer.status === "pending",
  };
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

  return Promise.all(results.filter((offer) => offer.publicationState !== "archived").map((offer) => attachProperty(ctx, offer)));
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

/**
 * WHY:   Inbox draft authoring needs a live owner-only list of unsent conversation offers.
 * WHAT:  Returns the current sender's private draft offers linked to one inbox conversation.
 * HOW:   Requires a broker/RED sender, loads offers by conversation link, and filters to pending drafts owned by the caller.
 */
export async function listConversationPrivateOfferDraftsService(
  ctx: QueryCtx,
  args: { conversationId: Id<"inboxConversations"> },
) {
  const access = await requireSender(ctx);
  const offers = await ctx.db
    .query("offers")
    .withIndex("sourceConversationId", (q) => q.eq("sourceConversationId", args.conversationId))
    .collect();

  const ownedDrafts = offers.filter((offer) => {
    const isOwner =
      (access.brokerId ? offer.fromBrokerId === access.brokerId : false) ||
      (access.REDId ? offer.fromREDId === access.REDId : false);
    return (
      isOwner &&
      (offer.visibility ?? "private") === "private" &&
      (offer.publicationState ?? "draft") === "draft" &&
      offer.status === "pending"
    );
  });

  return Promise.all(ownedDrafts.map((offer) => buildOfferLiveState(ctx, offer, access)));
}

/**
 * WHY:   Inbox offer cards should reflect the current lifecycle state instead of the original event payload.
 * WHAT:  Returns one live offer projection with ownership/recipient action flags for the current caller.
 * HOW:   Requires a broker/RED caller, authorizes sender or recipient visibility, and derives the actionable state from the latest offer record.
 */
export async function getOfferLiveStateService(
  ctx: QueryCtx,
  args: { offerId: Id<"offers"> },
) {
  const access = await requireSender(ctx);
  const offer = await ctx.db.get(args.offerId);
  if (!offer) {
    return null;
  }

  const isOwner =
    (access.brokerId ? offer.fromBrokerId === access.brokerId : false) ||
    (access.REDId ? offer.fromREDId === access.REDId : false);
  const isRecipient = isOfferRecipient({
    offer,
    authUserId: access.authUserId,
    brokerId: access.brokerId ?? null,
    redId: access.REDId ?? null,
  });

  const isDraft = (offer.publicationState ?? "draft") === "draft";
  if (!isOwner && (!isRecipient || isDraft)) {
    return null;
  }

  return buildOfferLiveState(ctx, offer, access);
}
