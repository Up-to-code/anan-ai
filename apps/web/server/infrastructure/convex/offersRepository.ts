import { fetchMutation, fetchQuery } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";
import type {
  ApplyToOfferInput,
  CreateOfferInput,
  OfferActionResult,
  OfferSummary,
  PublishOfferInput,
  RespondToOfferInput,
} from "@/server/contracts/offers";

type OffersApiRefs = {
  listSentOffers: unknown;
  listReceivedOffers: unknown;
  listPublicOffers: unknown;
  createOffer: unknown;
  publishOffer: unknown;
  updateOfferStatus: unknown;
  applyToOffer: unknown;
};

type RawOfferSummary = {
  _id: string;
  propertyId: string;
  price: number;
  status: OfferSummary["status"];
  publicationState?: OfferSummary["publicationState"];
  visibility?: OfferSummary["visibility"];
  recipientAuthUserId?: string;
  message?: string;
  description?: string;
  senderName?: string;
  attachments?: OfferSummary["attachments"];
  property?: {
    _id?: string;
    title?: string;
    address?: string;
    price?: number;
    heroImage?: { url?: string } | null;
    media?: { url?: string }[] | null;
  } | null;
};

type RawOfferActionResult = {
  offerId: string;
  conversationId: string | null;
  starterMessageCreated: boolean;
  notification: {
    notificationId: string;
    targetUserId: string;
    targetName: string;
    organizationName: string;
    href: string;
    pushStatus: "pending" | "sent" | "failed" | "skipped";
  } | null;
};

const offersApi = (apiUnsafe["shared_logic/offers"]) as OffersApiRefs;

function mapOffer(offer: RawOfferSummary): OfferSummary {
  return {
    id: offer._id,
    propertyId: offer.propertyId,
    price: offer.price,
    status: offer.status,
    publicationState: offer.publicationState,
    visibility: offer.visibility,
    recipientAuthUserId: offer.recipientAuthUserId,
    message: offer.message,
    description: offer.description,
    senderName: offer.senderName,
    attachments: offer.attachments,
    property: offer.property
      ? {
          id: offer.property._id ?? offer.propertyId,
          title: offer.property.title ?? "Untitled property",
          address: offer.property.address ?? "Unknown address",
          price: offer.property.price,
          imageUrl: offer.property.heroImage?.url ?? offer.property.media?.[0]?.url,
        }
      : null,
  };
}

function mapOfferActionResult(result: RawOfferActionResult): OfferActionResult {
  return result;
}

export type OffersRepository = {
  listSent(): Promise<OfferSummary[]>;
  listReceived(): Promise<OfferSummary[]>;
  listMarketplace(): Promise<OfferSummary[]>;
  create(input: CreateOfferInput): Promise<OfferActionResult>;
  publish(input: PublishOfferInput): Promise<{ ok: true }>;
  respond(input: RespondToOfferInput): Promise<void>;
  apply(input: ApplyToOfferInput): Promise<OfferActionResult>;
};

/**
 * WHY:   Workspace offer pages should not call Convex handlers directly from the server page layer.
 * WHAT:  Adapts the shared Convex offers capability into stable web-facing offer DTOs.
 * HOW:   Calls the auth-scoped Convex queries and normalizes embedded property projections for the UI.
 */
export const convexOffersRepository: OffersRepository = {
  async listSent() {
    const offers = (await fetchQuery(offersApi.listSentOffers as never, {} as never)) as RawOfferSummary[];
    return offers.map(mapOffer);
  },

  async listReceived() {
    const offers = (await fetchQuery(offersApi.listReceivedOffers as never, {} as never)) as RawOfferSummary[];
    return offers.map(mapOffer);
  },

  async listMarketplace() {
    const offers = (await fetchQuery(offersApi.listPublicOffers as never, {} as never)) as RawOfferSummary[];
    return offers.map(mapOffer);
  },

  async create(input) {
    return mapOfferActionResult(
      await (fetchMutation(offersApi.createOffer as never, input as never) as Promise<RawOfferActionResult>),
    );
  },

  async publish(input) {
    return fetchMutation(offersApi.publishOffer as never, input as never) as Promise<{ ok: true }>;
  },

  async respond(input) {
    await fetchMutation(offersApi.updateOfferStatus as never, input as never);
  },

  async apply(input) {
    return mapOfferActionResult(
      await (fetchMutation(offersApi.applyToOffer as never, input as never) as Promise<RawOfferActionResult>),
    );
  },
};
