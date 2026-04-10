import type {
  BuyerAgUiCard,
  BuyerAgUiTurn,
  BuyerAssistantCard,
  BuyerAssistantMessage,
  BuyerProperty,
  BuyerThreadKind,
  BuyerThreadSummary,
} from "@/lib/buyerAssistantShared";
import type { MobileLocale } from "@/lib/locale";

export type MobileProperty = BuyerProperty;
export type MobileAssistantCard = BuyerAssistantCard;
export type MobileAgUiCard = BuyerAgUiCard;
export type MobileAgUiTurn = BuyerAgUiTurn;
export type MobileThreadKind = BuyerThreadKind;
export type MobileThreadSummary = BuyerThreadSummary;
export type MobileStoredThreadKind = Exclude<MobileThreadKind, "demo">;
export type MobileFinanceDefaults = {
  downPaymentPercent: number;
  preferredYears: number;
  annualRate: number;
};

export type MobileBuyerProfile = {
  displayName: string;
  phone?: string;
  email?: string;
};

export type MobileBuyerConsents = {
  privacyAcceptedAt?: number;
  termsAcceptedAt?: number;
  microphoneAcceptedAt?: number;
  supportAcceptedAt?: number;
};

export type MobileBuyerPreferences = {
  locale: MobileLocale;
  onboardingCompletedAt?: number;
  authEntryDismissedAt?: number;
  financeDefaults: MobileFinanceDefaults;
};

export type MobileBuyerLocalState = {
  version: 2;
  profile: MobileBuyerProfile;
  savedPropertyIds: string[];
  consents: MobileBuyerConsents;
  preferences: MobileBuyerPreferences;
};

export type MobileBuyerViewerIdentity = {
  id?: string;
  authUserId?: string;
  displayName: string;
  email?: string;
  phone?: string;
  imageUrl?: string;
  role: "guest" | "user" | "broker" | "developer" | "RED" | "admin";
  isAuthenticated: boolean;
  qualifiedOrdersCount: number;
};

export type MobileBuyerViewerState = MobileBuyerViewerIdentity & {
  savedPropertyIds: string[];
  consents: MobileBuyerConsents;
  preferences: MobileBuyerPreferences;
};

export type MobileBuyerViewer = MobileBuyerViewerState & {
  sessionMode: "guest" | "identified";
  activeThreadId: string | null;
  threadCount: number;
};

export type MobileFinanceBankOffer = {
  bankName: string;
  rateLabel: string;
  downPaymentPercent: number;
  monthlyEstimate: number;
  summary: string;
};

export type MobileFinanceEstimate = {
  propertyId?: string;
  propertyTitle?: string;
  propertyPrice: number;
  downPayment: number;
  downPaymentPercent: number;
  loanAmount: number;
  annualRate: number;
  years: number;
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  affordabilityStatus: "comfortable" | "review" | "stretch";
  recommendedBudget?: number;
  bankOffers: MobileFinanceBankOffer[];
  summary: string;
};

export type MobileAnalyticsTrendPoint = {
  label: string;
  visits: number;
  qualified: number;
  conversion: number;
};

export type MobileAnalyticsAreaSignal = {
  name: string;
  story: string;
  growth: string;
  signalScore: number;
  budget: string;
  response: string;
};

export type MobileAnalyticsJourneyStage = {
  label: string;
  count: string;
  helper: string;
  progress: number;
};

export type MobileBuyerAnalyticsSummary = {
  headline: string;
  headlineBody: string;
  updatedAtLabel: string;
  topSignalLabel: string;
  qualifiedLeadLabel: string;
  averageResponseLabel: string;
  metrics: {
    visits: string;
    seriousJourneys: string;
    conversion: string;
    followUps: string;
  };
  trendPoints: MobileAnalyticsTrendPoint[];
  areaSignals: MobileAnalyticsAreaSignal[];
  journeyStages: MobileAnalyticsJourneyStage[];
  nextSteps: string[];
};

export type MobileGuestSnapshot = {
  draft: string;
  activeThreadId: string | null;
  assistantThreadId?: string | null;
  activeThreadKind: MobileStoredThreadKind;
  activeProperty: MobileProperty | null;
  selectedProperties?: MobileProperty[];
  messages: MobileConversationMessage[];
  updatedAt: number;
};

export type MobileStoredThread = {
  id: string;
  assistantThreadId?: string | null;
  draft: string;
  activeThreadKind: MobileStoredThreadKind;
  activeProperty: MobileProperty | null;
  selectedProperties: MobileProperty[];
  messages: MobileConversationMessage[];
  createdAt: number;
  updatedAt: number;
};

export type MobileGuestThreadStore = {
  version: 3;
  activeThreadId: string | null;
  threads: MobileStoredThread[];
};

export type MobileSearchOwnerType = "broker" | "developer";

export type MobileBrokerBadgeTone = "plum" | "sky" | "ink";

export type MobileBrokerBadge = {
  id: string;
  label: string;
  tone: MobileBrokerBadgeTone;
};

export type MobileBroker = {
  id: string;
  slug: string;
  name: string;
  avatar: string;
  company: string;
  badges: MobileBrokerBadge[];
  languages: Array<"ar" | "en">;
  phone: string;
  whatsapp: string;
  isVerified: boolean;
  location: string;
  bio: string;
  listingCount: number;
  rating: number;
  relatedPropertyIds: string[];
};

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

export type MobileAuthReturnTarget = string;

export type MobileAuthLaunchRoute = "/auth" | "/";

export type MobileAuthEmailStep = "idle" | "verify" | "complete_profile";
