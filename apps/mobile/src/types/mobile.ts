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
export type MobileAgUiCard = BuyerAgUiCard;
export type MobileAgUiTurn = BuyerAgUiTurn;
export type MobileThreadKind = BuyerThreadKind;
export type MobileThreadSummary = BuyerThreadSummary;
export type MobileStoredThreadKind = Exclude<MobileThreadKind, "demo">;

export type MobileGuestSnapshot = {
  draft: string;
  activeThreadId: string | null;
  activeThreadKind: MobileStoredThreadKind;
  activeProperty: MobileProperty | null;
  messages: MobileConversationMessage[];
  updatedAt: number;
};

export type MobileStoredThread = {
  id: string;
  draft: string;
  activeThreadKind: MobileStoredThreadKind;
  activeProperty: MobileProperty | null;
  messages: MobileConversationMessage[];
  createdAt: number;
  updatedAt: number;
};

export type MobileGuestThreadStore = {
  version: 2;
  activeThreadId: string | null;
  threads: MobileStoredThread[];
};

export type MobileSearchOwnerType = "وسيط" | "مطور";

export type MobileSearchContext = {
  threadId?: string;
  sourcePropertyId?: string;
  searchSummary: string;
  query?: string;
  area?: string;
  ownerType?: MobileSearchOwnerType;
};

export type MobileConversationMessage = BuyerAssistantMessage & {
  searchContext?: MobileSearchContext;
  searchResults?: MobileProperty[];
};
