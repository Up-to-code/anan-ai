import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import {
  appendConversationEvent,
  findExistingOfferStarterMessage,
  getConversationParticipant,
  resolveConversationInternal,
} from "./conversations";
import { getOfferAuthorProjection, getProfileByAuthUserId, getProfileByOrganizationTarget } from "./profiles";
import type { EnsureOfferConversationStarterResult, OfferCardMetadata } from "./types";

async function resolveOfferStarterRecipientProfile(
  ctx: MutationCtx,
  args: { targetUserId?: string; recipientBrokerId?: Id<"brokers">; recipientREDId?: Id<"RED"> }
) {
  if (args.targetUserId) {
    return getProfileByAuthUserId(ctx, args.targetUserId);
  }

  return getProfileByOrganizationTarget(ctx, {
    brokerId: args.recipientBrokerId,
    REDId: args.recipientREDId,
  });
}

function starterResult(
  conversationId: Id<"inboxConversations">,
  recipientUserId: string,
  starterMessageCreated: boolean
): EnsureOfferConversationStarterResult {
  return { conversationId, recipientUserId, starterMessageCreated };
}

async function resolveOfferConversationContext(
  ctx: MutationCtx,
  args: {
    senderUserId: string;
    targetUserId?: string;
    recipientBrokerId?: Id<"brokers">;
    recipientREDId?: Id<"RED">;
  }
) {
  const recipientProfile = await resolveOfferStarterRecipientProfile(ctx, args);
  if (!recipientProfile?.authUserId) return null;
  const conversation = await resolveConversationInternal(ctx, args.senderUserId, recipientProfile.authUserId);
  return { conversation, recipientUserId: recipientProfile.authUserId };
}

async function hasOfferStarterMessage(
  ctx: MutationCtx,
  conversationId: Id<"inboxConversations">,
  offerId: string
) {
  return Boolean(await findExistingOfferStarterMessage(ctx, conversationId, offerId));
}

async function hasConversationParticipants(
  ctx: MutationCtx,
  conversationId: Id<"inboxConversations">,
  senderUserId: string,
  recipientUserId: string
) {
  const [senderMembership, recipientMembership] = await Promise.all([
    getConversationParticipant(ctx, conversationId, senderUserId),
    getConversationParticipant(ctx, conversationId, recipientUserId),
  ]);
  return Boolean(senderMembership && recipientMembership);
}

/**
 * WHY:   Offer-linked collaboration should always land inside one deterministic direct conversation with a reusable starter card.
 * WHAT:  Resolves the direct conversation for two users and inserts one structured offer-event card when it does not already exist.
 * HOW:   Finds the target profile from either an auth user id or organization ids, reuses the stable direct key, and de-duplicates by `offerId`.
 */
export async function ensureOfferConversationStarter(
  ctx: MutationCtx,
  args: {
    senderUserId: string;
    targetUserId?: string;
    recipientBrokerId?: Id<"brokers">;
    recipientREDId?: Id<"RED">;
    body: string;
    metadata: OfferCardMetadata;
  }
): Promise<EnsureOfferConversationStarterResult | null> {
  const context = await resolveOfferConversationContext(ctx, {
    senderUserId: args.senderUserId,
    targetUserId: args.targetUserId,
    recipientBrokerId: args.recipientBrokerId,
    recipientREDId: args.recipientREDId,
  });
  if (!context) return null;
  if (await hasOfferStarterMessage(ctx, context.conversation._id, args.metadata.offerId)) {
    return starterResult(context.conversation._id, context.recipientUserId, false);
  }
  if (!(await hasConversationParticipants(ctx, context.conversation._id, args.senderUserId, context.recipientUserId))) {
    return null;
  }

  await appendConversationEvent(ctx, {
    senderUserId: args.senderUserId,
    recipientUserId: context.recipientUserId,
    type: "offer_event",
    body: args.body,
    metadata: args.metadata,
  });
  return starterResult(context.conversation._id, context.recipientUserId, true);
}

type AppendInboxOfferEventArgs = {
  senderUserId: string;
  targetUserId?: string;
  recipientBrokerId?: Id<"brokers">;
  recipientREDId?: Id<"RED">;
  offerId: string;
  propertyId: string;
  title: string;
  body: string;
  href: string;
  price: number;
  visibility: "public" | "private";
  bootstrapSource: "offer_send" | "offer_apply" | "offer_detail";
  metadata?: Record<string, unknown>;
};

export async function appendInboxOfferEvent(
  ctx: MutationCtx,
  args: AppendInboxOfferEventArgs
) {
  const author = await getOfferAuthorProjection(ctx, args.senderUserId);
  return ensureOfferConversationStarter(ctx, {
    senderUserId: args.senderUserId,
    targetUserId: args.targetUserId,
    recipientBrokerId: args.recipientBrokerId,
    recipientREDId: args.recipientREDId,
    body: args.body,
    metadata: {
      contextType: "offer_card",
      bootstrapSource: args.bootstrapSource,
      offerId: args.offerId,
      propertyId: args.propertyId,
      offerTitle: args.title,
      authorName: author.authorName,
      organizationName: author.organizationName,
      price: args.price,
      visibility: args.visibility,
      href: args.href,
      recipientAuthUserId: args.targetUserId,
      ...args.metadata,
    },
  });
}
