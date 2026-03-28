export type Locale = "ar" | "en";

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

export type ClientProperty = {
  id: string;
  title: string;
  address: string;
  bankId?: string;
  location?: string;
  area?: string;
  price: number;
  beds: number;
  baths: number;
  sqft?: number;
  status?: string;
  media: string[];
  owner: {
    id: string;
    type: "broker" | "RED";
    name: string;
    slug: string;
    isVerified: boolean;
    description?: string;
    phone?: string;
    contactEmail?: string;
    agencyLabel?: string;
    rating?: number;
    activeListings?: number;
    establishedYear?: number;
    completedProjects?: number;
  };
  aiSummary?: string;
};

export type AssistantCard =
  | {
      type: "roi_summary";
      title: string;
      purchasePrice: number;
      estimatedAnnualRent: number;
      grossYieldPercent: number;
      summary: string;
    }
  | {
      type: "payment_plan";
      title: string;
      downPayment: number;
      monthlyInstallment: number;
      durationMonths: number;
      summary: string;
    }
  | {
      type: "mortgage_check";
      title: string;
      estimatedEligibility: "eligible" | "review" | "insufficient_data";
      recommendedBudget?: number;
      monthlyInstallmentEstimate?: number;
      summary: string;
    }
  | {
      type: "permit_status";
      title: string;
      permitStatus: "verified" | "pending_review" | "not_available";
      summary: string;
    }
  | {
      type: "comparison_table";
      title: string;
      columns: string[];
      rows: string[][];
      summary: string;
    }
  | {
      type: "broker_handoff";
      title: string;
      handoffStatus: "qualified" | "needs_more_info";
      summary: string;
    }
  | {
      type: "broker_profile";
      title: string;
      brokerName: string;
      brokerAgency: string;
      rating: number;
      activeListings: number;
      summary: string;
    }
  | {
      type: "developer_profile";
      title: string;
      developerName: string;
      establishedYear: number;
      completedProjects: number;
      summary: string;
    }
  | {
      type: "loan_calculator";
      title: string;
      propertyPrice: number;
      downPayment: number;
      loanAmount: number;
      interestRate: number;
      years: number;
      monthlyPayment: number;
      summary: string;
    }
  | {
      type: "roi_projection";
      title: string;
      purchasePrice: number;
      annualRent: number;
      projectedValue5Years: number;
      yieldPercent: number;
      summary: string;
    }
  | {
      type: "market_analysis";
      title: string;
      location: string;
      averagePrice: number;
      priceTrend: "up" | "flat" | "down";
      trendPercentage: number;
      summary: string;
    }
  | {
      type: "bank_offer";
      title: string;
      bankName: string;
      rateLabel: string;
      downPaymentPercent: number;
      monthlyEstimate: number;
      summary: string;
    }
  | {
      type: "insight_brief";
      title: string;
      body: string;
      summary: string;
    }
  | {
      type: "accent_note";
      title: string;
      tone: "info" | "success" | "warning";
      summary: string;
    };

export type ClientAgUiComponentId =
  | "property_shortlist"
  | "comparison_table"
  | "mortgage_check"
  | "loan_calculator"
  | "roi_projection"
  | "market_analysis"
  | "bank_offer"
  | "insight_brief"
  | "accent_note"
  | "broker_profile"
  | "developer_profile"
  | "permit_status"
  | "execution_result"
  | "followup_prompt";

export type ClientAgUiCard = {
  id: string;
  componentId: ClientAgUiComponentId;
  props: Record<string, unknown>;
};

export type ClientAgUiTurn = {
  objective: "client_assistant";
  targetZone: "client_web";
  assistantText?: string;
  cards: ClientAgUiCard[];
};

export type AssistantMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  properties?: ClientProperty[];
  cards?: AssistantCard[];
  uiTurn?: ClientAgUiTurn;
};

export type ChatSuggestion = {
  id: string;
  label: string;
  prompt: string;
};

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

export type ClientThreadKind = "welcome" | "demo" | "live";

export type ThreadSummary = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  preview?: string;
};

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
