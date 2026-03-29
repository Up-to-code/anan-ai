import type {
  BuyerAgUiCard,
  BuyerAgUiTurn,
  BuyerAssistantCard,
  BuyerAssistantMessage,
  BuyerProperty,
  BuyerThreadKind,
  BuyerThreadSummary,
} from "@/lib/buyerAssistantShared";

export type MobileProperty = BuyerProperty;
export type MobileAssistantCard = BuyerAssistantCard;
export type MobileConversationMessage = BuyerAssistantMessage;
export type MobileAgUiCard = BuyerAgUiCard;
export type MobileAgUiTurn = BuyerAgUiTurn;
export type MobileThreadKind = BuyerThreadKind;
export type MobileThreadSummary = BuyerThreadSummary;

export type MobileTranscriptSeedMessage = Omit<MobileConversationMessage, "id" | "createdAt" | "uiTurn">;

export type MobileGuestSnapshot = {
  draft: string;
  activeThreadId: string | null;
  activeThreadKind: Exclude<MobileThreadKind, "demo">;
  activeProperty: MobileProperty | null;
  messages: MobileConversationMessage[];
  updatedAt: number;
};

export type MobileAuthBridgePayload = {
  title?: string;
  messages: MobileTranscriptSeedMessage[];
  activeProperty: MobileProperty | null;
  handoff?: {
    propertyId: string;
    message: string;
  };
};
