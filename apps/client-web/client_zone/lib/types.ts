import type {
  BuyerAgUiCard,
  BuyerAgUiTurn,
  BuyerAssistantCard,
  BuyerAssistantLocale,
  BuyerAssistantMessage,
  BuyerChatSuggestion,
  BuyerProperty,
  BuyerThreadKind,
  BuyerThreadSummary,
} from "./buyerAssistantShared";

export type Locale = BuyerAssistantLocale;

export type LocaleDictionary = {
  locale: Locale;
  direction: "rtl" | "ltr";
  nav: {
    brand: string;
    search: string;
    loans: string;
    howItWorks: string;
    about: string;
    signIn: string;
    openApp: string;
    history: string;
  };
  landing: {
    eyebrow: string;
    title: string;
    description: string;
    primaryAction: string;
    secondaryAction: string;
    journeyTitle: string;
    journeyItems: Array<{ title: string; description: string }>;
    discoveryTitle: string;
    financeTitle: string;
    trustTitle: string;
    trustDescription: string;
    footerTitle: string;
    footerDescription: string;
  };
  app: {
    shellTitle: string;
    shellSubtitle: string;
    composerPlaceholder: string;
    composerHint: string;
    composerContextLabel: string;
    assistantName: string;
    welcomeTitle: string;
    welcomeDescription: string;
    openDemoConversation: string;
    demoSectionTitle: string;
    recentSectionTitle: string;
    demoApartmentSearch: string;
    demoInvestmentComparison: string;
    demoAdvisorHandoff: string;
    send: string;
    signInPrompt: string;
    requestAdvisor: string;
    continueGuest: string;
    signedInStatus: string;
    handoffReady: string;
    featuredProperties: string;
    livePropertyFeed: string;
    suggestedPrompts: string;
    openProperty: string;
    askAboutThis: string;
    saveHistory: string;
    historyEmpty: string;
    historyTitle: string;
    historyDescription: string;
    handoffTitle: string;
    handoffDescription: string;
    signInTitle: string;
    signInDescription: string;
    signInButton: string;
    propertyNotFound: string;
    backToAssistant: string;
    financeCta: string;
    emptyStateTitle: string;
    emptyStateDescription: string;
    loading: string;
    continueInChat: string;
    clearChat: string;
    openMenu: string;
    closeHistory: string;
    liveNow: string;
  };
};

export type ClientProperty = BuyerProperty;
export type AssistantCard = BuyerAssistantCard;
export type ClientAgUiCard = BuyerAgUiCard;
export type ClientAgUiTurn = BuyerAgUiTurn;
export type AssistantMessage = BuyerAssistantMessage;
export type ChatSuggestion = BuyerChatSuggestion;

export type ChatRenderItem =
  | {
      id: string;
      type: "text";
      role: "assistant" | "user";
      text: string;
    }
  | {
      id: string;
      type: "property_result";
      role: "assistant";
      property: ClientProperty;
    }
  | {
      id: string;
      type: "finance_result";
      role: "assistant";
      card: AssistantCard;
    }
  | {
      id: string;
      type: "auth_notice";
      role: "assistant";
    }
  | {
      id: string;
      type: "handoff_notice";
      role: "assistant";
      text: string;
    };

export type HistorySnapshot = {
  id: string;
  createdAt: number;
  locale: Locale;
  title: string;
  summary: string;
  messages: AssistantMessage[];
};

export type ClientThreadKind = BuyerThreadKind;
export type ThreadSummary = BuyerThreadSummary;

export type MockConversationThread = {
  id: string;
  title: string;
  createdAt: number;
  locale: Locale;
  messages: AssistantMessage[];
};

export type PersistedThreadMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  createdAt: number;
  properties?: ClientProperty[];
  cards?: AssistantCard[];
  activePropertyId?: string;
  requiresAuthForHandoff?: boolean;
  suggestedPrompts?: string[];
};

export type TranscriptSeedMessage = {
  role: "assistant" | "user";
  text: string;
  properties?: ClientProperty[];
  cards?: AssistantCard[];
  activePropertyId?: string;
  requiresAuthForHandoff?: boolean;
  suggestedPrompts?: string[];
};

export type ClientOrderDetail = {
  orderId: string;
  status:
    | "new_lead"
    | "contacted"
    | "qualified"
    | "offer_made"
    | "under_contract"
    | "closed_won"
    | "closed_lost";
  type: "property" | "loan";
  intent?: string;
  notes?: string;
  assignedTo?: string;
  threadId?: string;
  sourceChannel?: "whatsapp" | "app" | "web";
  property: ClientProperty | null;
};
