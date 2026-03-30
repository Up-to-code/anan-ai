import type { Doc, Id } from "../../../_generated/dataModel";

export type OfferCaseType = "open_offer" | "private_offer" | "collaboration_case";
export type OfferCaseStage =
  | "draft"
  | "open"
  | "targeted"
  | "engaged"
  | "agreed"
  | "closed_won"
  | "closed_lost"
  | "archived";
export type OfferPackageVisibility = "open" | "private";
export type OfferAllowedAudience = "brokers" | "developers" | "both";

export type OfferClientContext = {
  crmClientId?: Id<"crmClients">;
  clientName: string;
  clientPhone?: string;
  clientBudget?: string;
  clientNeed: string;
};

export type CreateOfferCaseArgs = {
  propertyId: Id<"properties">;
  price: number;
  message?: string;
  description?: string;
  visibility?: "public" | "private";
  caseType?: OfferCaseType;
  allowedAudience?: OfferAllowedAudience;
  commissionText?: string;
  permitStatus?: string;
  productStatus?: string;
  recipientAuthUserId?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  toBrokerId?: Id<"brokers">;
  toREDId?: Id<"RED">;
  sourceConversationId?: Id<"inboxConversations">;
  attachments?: Doc<"offerPackages">["attachments"];
  clientContext?: OfferClientContext;
};

export type UpdateOfferCaseDraftArgs = {
  id: Id<"offerCases">;
  conversationId?: Id<"inboxConversations">;
  propertyId: Id<"properties">;
  price: number;
  message?: string;
  description?: string;
  attachments?: Doc<"offerPackages">["attachments"];
  commissionText?: string;
  permitStatus?: string;
  productStatus?: string;
  allowedAudience?: OfferAllowedAudience;
  clientContext?: OfferClientContext;
};

export type LegacyOfferStatus = "pending" | "accepted" | "rejected";
export type LegacyPublicationState = "draft" | "published" | "archived";
export type LegacyOfferVisibility = "public" | "private";
