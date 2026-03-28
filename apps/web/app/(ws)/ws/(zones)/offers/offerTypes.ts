import type {
  OfferLiveState,
  OfferQueue,
  OfferQueueKey,
  OfferSummary,
  OffersSnapshot,
} from "@/server/contracts/offers";

export type WorkspaceOfferSummary = OfferSummary;
export type WorkspaceOfferDetail = OfferLiveState;
export type WorkspaceOfferQueue = OfferQueue;
export type WorkspaceOffersSnapshot = OffersSnapshot;
export type WorkspaceOfferQueueKey = OfferQueueKey;

export type OfferPropertyOption = {
  id: string;
  title: string;
  location: string;
  image: string;
  expectedPrice: string;
  shortDescription?: string;
  publicationState?: "published" | "draft" | "archived";
};
