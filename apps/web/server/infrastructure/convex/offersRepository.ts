import { fetchMutation, fetchQuery } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";
import type {
  ApplyToOfferInput,
  CreateOfferInput,
  OfferActionResult,
  OfferLiveState,
  OfferSummary,
  PublishConversationOfferInput,
  PublishOfferInput,
  RespondToOfferInput,
  UpdateOfferDraftInput,
} from "@/server/contracts/offers";

type OffersApiRefs = {
  listSentOffers: unknown;
  listReceivedOffers: unknown;
  listPublicOffers: unknown;
  createOffer: unknown;
  createOfferDraft: unknown;
  publishOffer: unknown;
  publishConversationOffer: unknown;
  updateOfferDraft: unknown;
  getOfferLiveState: unknown;
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
  sourceConversationId?: string;
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
    sourceConversationId: offer.sourceConversationId,
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
  listSent(token?: string): Promise<OfferSummary[]>;
  listReceived(token?: string): Promise<OfferSummary[]>;
  listMarketplace(token?: string): Promise<OfferSummary[]>;
  create(input: CreateOfferInput, token?: string): Promise<OfferActionResult>;
  createDraft(input: CreateOfferInput, token?: string): Promise<OfferActionResult>;
  publish(input: PublishOfferInput, token?: string): Promise<{ ok: true }>;
  publishConversation(input: PublishConversationOfferInput, token?: string): Promise<OfferActionResult>;
  updateDraft(input: UpdateOfferDraftInput, token?: string): Promise<{ ok: true }>;
  getOfferLiveState(input: { offerId: string }, token?: string): Promise<OfferLiveState | null>;
  respond(input: RespondToOfferInput, token?: string): Promise<void>;
  apply(input: ApplyToOfferInput, token?: string): Promise<OfferActionResult>;
};

/**
 * WHY:   Workspace offer pages should not call Convex handlers directly from the server page layer.
 * WHAT:  Adapts the shared Convex offers capability into stable web-facing offer DTOs.
 * HOW:   Calls the auth-scoped Convex queries and normalizes embedded property projections for the UI.
 */
export const convexOffersRepository: OffersRepository = {
  async listSent(token) {
    const offers = (await fetchQuery(offersApi.listSentOffers as never, {} as never, token ? { token } : undefined)) as RawOfferSummary[];
    return offers.map(mapOffer);
  },

  async listReceived(token) {
    const offers = (await fetchQuery(offersApi.listReceivedOffers as never, {} as never, token ? { token } : undefined)) as RawOfferSummary[];
    return offers.map(mapOffer);
  },

  async listMarketplace(token) {
    const offers = (await fetchQuery(offersApi.listPublicOffers as never, {} as never, token ? { token } : undefined)) as RawOfferSummary[];
    return offers.map(mapOffer);
  },

  async create(input, token) {
    return mapOfferActionResult(
      await (fetchMutation(offersApi.createOffer as never, input as never, token ? { token } : undefined) as Promise<RawOfferActionResult>),
    );
  },

  async createDraft(input, token) {
    return mapOfferActionResult(
      await (fetchMutation(offersApi.createOfferDraft as never, input as never, token ? { token } : undefined) as Promise<RawOfferActionResult>),
    );
  },

  async publish(input, token) {
    return fetchMutation(offersApi.publishOffer as never, input as never, token ? { token } : undefined) as Promise<{ ok: true }>;
  },

  async publishConversation(input, token) {
    return mapOfferActionResult(
      await (fetchMutation(offersApi.publishConversationOffer as never, input as never, token ? { token } : undefined) as Promise<RawOfferActionResult>),
    );
  },

  async updateDraft(input, token) {
    return fetchMutation(offersApi.updateOfferDraft as never, input as never, token ? { token } : undefined) as Promise<{ ok: true }>;
  },

  async getOfferLiveState(input, token) {
    return fetchQuery(offersApi.getOfferLiveState as never, input as never, token ? { token } : undefined) as Promise<OfferLiveState | null>;
  },

  async respond(input, token) {
    await fetchMutation(offersApi.updateOfferStatus as never, input as never, token ? { token } : undefined);
  },

  async apply(input, token) {
    return mapOfferActionResult(
      await (fetchMutation(offersApi.applyToOffer as never, input as never, token ? { token } : undefined) as Promise<RawOfferActionResult>),
    );
  },
};
