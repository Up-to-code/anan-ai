import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireAdminAccess } from "../_core/security/accessPolicy";
import {
  buildOrganizationProjection,
  extractOfferIdFromMetadata,
} from "./analytics.helpers";

/**
 * WHY:   Admin operators need to inspect the strongest broker-developer collaboration links behind offer traffic.
 * WHAT:  Returns connection totals and the top organization pairs by offers, conversations, deals, and threaded orders.
 * HOW:   Joins offers with inbox offer-card messages, deals, and thread-linked orders, then groups by sender/recipient organization pair.
 */
export const connectionAnalytics = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 10 }) => {
    await requireAdminAccess(ctx);

    const [offers, inboxMessages, deals, orders, brokers, developers] = await Promise.all([
      ctx.db.query("offers").order("desc").take(500),
      ctx.db.query("inboxMessages").order("desc").take(500),
      ctx.db.query("deals").order("desc").take(500),
      ctx.db.query("orders").order("desc").take(500),
      ctx.db.query("brokers").order("desc").take(500),
      ctx.db.query("RED").order("desc").take(500),
    ]);

    const conversationIdsByOfferId = new Map<string, Set<string>>();
    for (const message of inboxMessages) {
      const offerId = extractOfferIdFromMetadata(message.metadata);
      if (!offerId) {
        continue;
      }

      const current = conversationIdsByOfferId.get(offerId) ?? new Set<string>();
      current.add(String(message.conversationId));
      conversationIdsByOfferId.set(offerId, current);
    }

    const pairStats = new Map<
      string,
      {
        id: string;
        senderOrganizationKey: string;
        senderName: string;
        senderType: "broker" | "red";
        recipientOrganizationKey: string;
        recipientName: string;
        recipientType: "broker" | "red";
        offersCount: number;
        acceptedOffersCount: number;
        conversationCount: number;
        dealsCount: number;
        ordersCount: number;
      }
    >();

    let offersWithConversation = 0;
    let conversationsLeadingToDeals = 0;
    let conversationsLeadingToOrders = 0;

    for (const offer of offers) {
      const sender = buildOrganizationProjection(
        {
          brokerId: offer.fromBrokerId ? String(offer.fromBrokerId) : null,
          redId: offer.fromREDId ? String(offer.fromREDId) : null,
        },
        brokers,
        developers,
      );
      const recipient = buildOrganizationProjection(
        {
          brokerId: offer.toBrokerId ? String(offer.toBrokerId) : null,
          redId: offer.toREDId ? String(offer.toREDId) : null,
        },
        brokers,
        developers,
      );

      if (!sender || !recipient || sender.ownerType === recipient.ownerType) {
        continue;
      }

      const offerId = String(offer._id);
      const pairId = `${sender.organizationKey}__${recipient.organizationKey}`;
      const conversationIds = Array.from(conversationIdsByOfferId.get(offerId) ?? []);
      const relatedDeals = deals.filter((deal) => String(deal.offerId ?? "") === offerId);
      const relatedOrders = orders.filter((order) => order.threadId && conversationIds.includes(String(order.threadId)));

      if (conversationIds.length > 0) {
        offersWithConversation += 1;
      }
      if (conversationIds.length > 0 && relatedDeals.length > 0) {
        conversationsLeadingToDeals += 1;
      }
      if (conversationIds.length > 0 && relatedOrders.length > 0) {
        conversationsLeadingToOrders += 1;
      }

      const current = pairStats.get(pairId) ?? {
        id: pairId,
        senderOrganizationKey: sender.organizationKey,
        senderName: sender.name,
        senderType: sender.ownerType,
        recipientOrganizationKey: recipient.organizationKey,
        recipientName: recipient.name,
        recipientType: recipient.ownerType,
        offersCount: 0,
        acceptedOffersCount: 0,
        conversationCount: 0,
        dealsCount: 0,
        ordersCount: 0,
      };

      current.offersCount += 1;
      if (offer.status === "accepted") {
        current.acceptedOffersCount += 1;
      }
      current.conversationCount += conversationIds.length;
      current.dealsCount += relatedDeals.length;
      current.ordersCount += relatedOrders.length;
      pairStats.set(pairId, current);
    }

    return {
      summary: {
        totalPairs: pairStats.size,
        offersWithConversation,
        conversationsLeadingToDeals,
        conversationsLeadingToOrders,
      },
      topPairs: Array.from(pairStats.values())
        .sort((left, right) => {
          if (right.offersCount !== left.offersCount) {
            return right.offersCount - left.offersCount;
          }

          return right.conversationCount - left.conversationCount;
        })
        .slice(0, limit),
    };
  },
});
