import { buildOrganizationProjection, extractOfferIdFromMetadata } from "../helpers";

function buildPropertyTitleById(properties: any[]) {
  return new Map(properties.map((item) => [String(item._id), item.title ?? "عقار"]));
}

function buildConversationIdsByOfferId(inboxMessages: any[]) {
  const conversationIdsByOfferId = new Map<string, Set<string>>();
  for (const message of inboxMessages) {
    const offerId = extractOfferIdFromMetadata(message.metadata);
    if (!offerId) continue;
    const current = conversationIdsByOfferId.get(offerId) ?? new Set<string>();
    current.add(String(message.conversationId));
    conversationIdsByOfferId.set(offerId, current);
  }
  return conversationIdsByOfferId;
}

function isOfferRelevant(args: { offer: any; currentBrokerId: string | null; currentRedId: string | null }) {
  const { offer, currentBrokerId, currentRedId } = args;
  if (currentBrokerId) {
    return (
      String(offer.fromBrokerId ?? "") === currentBrokerId ||
      String(offer.toBrokerId ?? "") === currentBrokerId
    );
  }
  if (currentRedId) {
    return (
      String(offer.fromREDId ?? "") === currentRedId ||
      String(offer.toREDId ?? "") === currentRedId
    );
  }
  return false;
}

type CounterpartStats = Map<
  string,
  {
    organizationKey: string;
    organizationName: string;
    ownerType: string;
    offersCount: number;
    acceptedOffersCount: number;
    conversationsCount: number;
    dealsCount: number;
    ordersCount: number;
  }
>;

function marketplaceRecipient() {
  return {
    id: "marketplace",
    organizationKey: "marketplace__public",
    ownerType: "marketplace",
    name: "السوق العامة",
    isVerified: true,
    status: "active",
    slug: null,
  };
}

function resolveOfferSenderRecipient(args: {
  offer: any;
  brokers: any[];
  developers: any[];
}) {
  const sender = buildOrganizationProjection(
    {
      brokerId: args.offer.fromBrokerId ? String(args.offer.fromBrokerId) : null,
      redId: args.offer.fromREDId ? String(args.offer.fromREDId) : null,
    },
    args.brokers,
    args.developers
  );
  const recipient = buildOrganizationProjection(
    {
      brokerId: args.offer.toBrokerId ? String(args.offer.toBrokerId) : null,
      redId: args.offer.toREDId ? String(args.offer.toREDId) : null,
    },
    args.brokers,
    args.developers
  );
  return { sender, recipient };
}

function resolveOfferRowRelations(args: {
  offerId: string;
  conversationIdsByOfferId: Map<string, Set<string>>;
  relevantDeals: any[];
  relevantOrders: any[];
}) {
  const conversationIds = Array.from(args.conversationIdsByOfferId.get(args.offerId) ?? []);
  const relatedDeals = args.relevantDeals.filter((deal) => String(deal.offerId ?? "") === args.offerId);
  const relatedOrders = args.relevantOrders.filter(
    (order) => order.threadId && conversationIds.includes(String(order.threadId))
  );
  return { conversationIds, relatedDeals, relatedOrders };
}

function resolveOfferCounterpart(args: {
  sender: any;
  recipient: any;
  currentBrokerId: string | null;
  currentRedId: string | null;
}) {
  const isSender =
    (args.currentBrokerId && args.sender?.ownerType === "broker" && args.sender.id === args.currentBrokerId) ||
    (args.currentRedId && args.sender?.ownerType === "red" && args.sender.id === args.currentRedId);
  return {
    role: isSender ? "sender" as const : "recipient" as const,
    counterpart: isSender ? args.recipient : args.sender,
  };
}

function composeOfferRow(args: {
  offer: any;
  offerId: string;
  role: "sender" | "recipient";
  sender: any;
  recipient: any;
  counterpart: any;
  propertyTitleById: Map<string, string>;
  conversationIds: string[];
  dealCount: number;
  orderCount: number;
}) {
  return {
    id: args.offerId,
    role: args.role,
    propertyTitle: args.propertyTitleById.get(String(args.offer.propertyId)) ?? "عقار",
    price: args.offer.price,
    status: args.offer.status,
    visibility: args.offer.visibility ?? "private",
    publicationState: args.offer.publicationState ?? "published",
    message: args.offer.message ?? args.offer.description ?? null,
    createdAt: args.offer._creationTime ?? 0,
    sender: args.sender,
    recipient: args.recipient ?? marketplaceRecipient(),
    counterpart: args.counterpart,
    conversationIds: args.conversationIds,
    conversationCount: args.conversationIds.length,
    dealCount: args.dealCount,
    orderCount: args.orderCount,
  };
}

function bumpCounterpartStats(counterpartStats: CounterpartStats, offer: any) {
  if (!offer.counterpart) return;
  const key = offer.counterpart.organizationKey;
  const current = counterpartStats.get(key) ?? {
    organizationKey: key,
    organizationName: offer.counterpart.name,
    ownerType: offer.counterpart.ownerType,
    offersCount: 0,
    acceptedOffersCount: 0,
    conversationsCount: 0,
    dealsCount: 0,
    ordersCount: 0,
  };
  current.offersCount += 1;
  if (offer.status === "accepted") current.acceptedOffersCount += 1;
  current.conversationsCount += offer.conversationCount;
  current.dealsCount += offer.dealCount;
  current.ordersCount += offer.orderCount;
  counterpartStats.set(key, current);
}

type BuildOfferRowArgs = {
  offer: any;
  brokers: any[];
  developers: any[];
  currentBrokerId: string | null;
  currentRedId: string | null;
  conversationIdsByOfferId: Map<string, Set<string>>;
  propertyTitleById: Map<string, string>;
  relevantDeals: any[];
  relevantOrders: any[];
};

function buildOfferRow(args: BuildOfferRowArgs) {
  const { sender, recipient } = resolveOfferSenderRecipient({
    offer: args.offer,
    brokers: args.brokers,
    developers: args.developers,
  });
  const { role, counterpart } = resolveOfferCounterpart({
    sender,
    recipient,
    currentBrokerId: args.currentBrokerId,
    currentRedId: args.currentRedId,
  });

  const offerId = String(args.offer._id);
  const { conversationIds, relatedDeals, relatedOrders } = resolveOfferRowRelations({
    offerId,
    conversationIdsByOfferId: args.conversationIdsByOfferId,
    relevantDeals: args.relevantDeals,
    relevantOrders: args.relevantOrders,
  });
  return composeOfferRow({
    offer: args.offer,
    offerId,
    role,
    sender,
    recipient,
    counterpart,
    propertyTitleById: args.propertyTitleById,
    conversationIds,
    dealCount: relatedDeals.length,
    orderCount: relatedOrders.length,
  });
}

export function buildAdminUserOfferInsights(args: {
  offers: any[];
  inboxMessages: any[];
  properties: any[];
  brokers: any[];
  developers: any[];
  currentBrokerId: string | null;
  currentRedId: string | null;
  relevantDeals: any[];
  relevantOrders: any[];
}) {
  const propertyTitleById = buildPropertyTitleById(args.properties);
  const conversationIdsByOfferId = buildConversationIdsByOfferId(args.inboxMessages);
  const relevantOffers = args.offers.filter((offer) =>
    isOfferRelevant({ currentBrokerId: args.currentBrokerId, currentRedId: args.currentRedId, offer })
  );
  const offerRows = relevantOffers
    .map((offer) =>
      buildOfferRow({
        brokers: args.brokers,
        conversationIdsByOfferId,
        currentBrokerId: args.currentBrokerId,
        currentRedId: args.currentRedId,
        developers: args.developers,
        offer,
        propertyTitleById,
        relevantDeals: args.relevantDeals,
        relevantOrders: args.relevantOrders,
      })
    )
    .sort((left, right) => right.createdAt - left.createdAt);
  const counterpartStats: CounterpartStats = new Map();
  for (const row of offerRows) {
    bumpCounterpartStats(counterpartStats, row);
  }
  return { counterpartStats, offerRows };
}
