import { buildOrganizationProjection, extractOfferIdFromMetadata } from "../helpers";

function buildMarketplaceRecipient() {
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

function incrementCount(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

type BuildOrganizationOfferEntryArgs = {
  offer: any;
  isBroker: boolean;
  parsedId: string;
  brokers: any[];
  developers: any[];
  offerConversationIds: Map<string, Set<string>>;
  orderCountByConversationId: Map<string, number>;
  dealCountByOfferId: Map<string, number>;
  propertyTitleById: Map<string, string>;
};

function buildOrganizationOfferEntry(args: BuildOrganizationOfferEntryArgs) {
  const sender = buildOrganizationProjection(
    { brokerId: args.offer.fromBrokerId ? String(args.offer.fromBrokerId) : null, redId: args.offer.fromREDId ? String(args.offer.fromREDId) : null },
    args.brokers,
    args.developers,
  );
  const recipient = buildOrganizationProjection(
    { brokerId: args.offer.toBrokerId ? String(args.offer.toBrokerId) : null, redId: args.offer.toREDId ? String(args.offer.toREDId) : null },
    args.brokers,
    args.developers,
  );
  const isSender = args.isBroker
    ? String(args.offer.fromBrokerId ?? "") === args.parsedId
    : String(args.offer.fromREDId ?? "") === args.parsedId;
  const offerId = String(args.offer._id);
  const conversationIds = Array.from(args.offerConversationIds.get(offerId) ?? []);
  const orderCount = conversationIds.reduce((sum, id) => sum + (args.orderCountByConversationId.get(id) ?? 0), 0);
  return {
    id: offerId,
    role: isSender ? "sender" : "recipient",
    propertyTitle: args.propertyTitleById.get(String(args.offer.propertyId)) ?? "عقار",
    price: args.offer.price,
    status: args.offer.status,
    visibility: args.offer.visibility ?? "private",
    publicationState: args.offer.publicationState ?? "published",
    createdAt: args.offer._creationTime ?? 0,
    sender,
    recipient: recipient ?? buildMarketplaceRecipient(),
    counterpart: isSender ? recipient : sender,
    conversationCount: conversationIds.length,
    dealCount: args.dealCountByOfferId.get(offerId) ?? 0,
    orderCount,
  };
}

export function buildOrganizationOffers(args: {
  isBroker: boolean;
  parsedId: string;
  offers: any[];
  brokers: any[];
  developers: any[];
  properties: any[];
  organizationInboxMessages: any[];
  organizationDeals: any[];
  organizationOrders: any[];
}) {
  const offerConversationIds = new Map<string, Set<string>>();
  for (const message of args.organizationInboxMessages) {
    const offerId = extractOfferIdFromMetadata(message.metadata);
    if (!offerId) {
      continue;
    }

    const current = offerConversationIds.get(offerId) ?? new Set<string>();
    current.add(String(message.conversationId));
    offerConversationIds.set(offerId, current);
  }

  const propertyTitleById = new Map(args.properties.map((item) => [String(item._id), item.title ?? "عقار"]));
  const dealCountByOfferId = new Map<string, number>();
  for (const deal of args.organizationDeals) {
    const key = String(deal.offerId ?? "");
    if (key) {
      incrementCount(dealCountByOfferId, key);
    }
  }
  const orderCountByConversationId = new Map<string, number>();
  for (const order of args.organizationOrders) {
    const threadKey = order.threadId ? String(order.threadId) : "";
    if (threadKey) {
      incrementCount(orderCountByConversationId, threadKey);
    }
  }

  const organizationOffers = args.offers
    .filter((offer) =>
      args.isBroker
        ? String(offer.fromBrokerId ?? "") === args.parsedId || String(offer.toBrokerId ?? "") === args.parsedId
        : String(offer.fromREDId ?? "") === args.parsedId || String(offer.toREDId ?? "") === args.parsedId
    )
    .map((offer) =>
      buildOrganizationOfferEntry({
        offer,
        isBroker: args.isBroker,
        parsedId: args.parsedId,
        brokers: args.brokers,
        developers: args.developers,
        offerConversationIds,
        orderCountByConversationId,
        dealCountByOfferId,
        propertyTitleById,
      }),
    )
    .sort((left, right) => right.createdAt - left.createdAt);

  const counterpartStats = new Map<
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
  >();

  for (const offer of organizationOffers) {
    if (!offer.counterpart) {
      continue;
    }

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
    if (offer.status === "accepted") {
      current.acceptedOffersCount += 1;
    }
    current.conversationsCount += offer.conversationCount;
    current.dealsCount += offer.dealCount;
    current.ordersCount += offer.orderCount;
    counterpartStats.set(key, current);
  }

  return { counterpartStats, organizationOffers };
}
