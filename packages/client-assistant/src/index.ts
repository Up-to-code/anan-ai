export type BuyerAssistantLocale = "ar" | "en" | "fr";

export type BuyerProperty = {
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

export type BuyerAssistantCard =
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
      priceTrend: "up" | "flat" | "down" | "stable";
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

export type BuyerAgUiComponentId =
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

export type BuyerAgUiCard = {
  id: string;
  componentId: BuyerAgUiComponentId;
  props: Record<string, unknown>;
};

export type BuyerAgUiTurn = {
  objective: "client_assistant";
  targetZone: "client_web" | "mobile_app";
  assistantText?: string;
  cards: BuyerAgUiCard[];
};

export type BuyerAssistantMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  createdAt?: number;
  properties?: BuyerProperty[];
  cards?: BuyerAssistantCard[];
  uiTurn?: BuyerAgUiTurn;
  suggestedPrompts?: string[];
  activePropertyId?: string;
  requiresAuthForHandoff?: boolean;
};

export type BuyerThreadKind = "welcome" | "demo" | "live";

export type BuyerThreadSummary = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  preview?: string;
};

export type BuyerChatSuggestion = {
  id: string;
  label: string;
  prompt: string;
};

function toShortlistCard(properties: BuyerProperty[]): BuyerAgUiCard | null {
  if (properties.length === 0) return null;
  return {
    id: "property-shortlist",
    componentId: "property_shortlist",
    props: { properties },
  };
}

function mapCardToUiCard(
  card: BuyerAssistantCard,
  index: number,
  locale: BuyerAssistantLocale,
): BuyerAgUiCard | null {
  switch (card.type) {
    case "comparison_table":
      return { id: `comparison-table-${index}`, componentId: "comparison_table", props: card };
    case "mortgage_check":
      return { id: `mortgage-check-${index}`, componentId: "mortgage_check", props: card };
    case "payment_plan":
    case "loan_calculator":
      return {
        id: `loan-calculator-${index}`,
        componentId: "loan_calculator",
        props:
          card.type === "payment_plan"
            ? {
                title: card.title,
                propertyPrice: card.downPayment + card.monthlyInstallment * card.durationMonths,
                downPayment: card.downPayment,
                loanAmount: card.monthlyInstallment * card.durationMonths,
                interestRate: 4.5,
                years: Math.max(1, Math.round(card.durationMonths / 12)),
                monthlyPayment: card.monthlyInstallment,
                summary: card.summary,
              }
            : card,
      };
    case "roi_summary":
    case "roi_projection":
      return {
        id: `roi-projection-${index}`,
        componentId: "roi_projection",
        props:
          card.type === "roi_summary"
            ? {
                title: card.title,
                purchasePrice: card.purchasePrice,
                annualRent: card.estimatedAnnualRent,
                projectedValue5Years: Math.round(card.purchasePrice * 1.14),
                yieldPercent: card.grossYieldPercent,
                summary: card.summary,
              }
            : card,
      };
    case "bank_offer":
      return { id: `bank-offer-${index}`, componentId: "bank_offer", props: card };
    case "insight_brief":
      return { id: `insight-brief-${index}`, componentId: "insight_brief", props: card };
    case "accent_note":
      return { id: `accent-note-${index}`, componentId: "accent_note", props: card };
    case "broker_profile":
      return { id: `broker-profile-${index}`, componentId: "broker_profile", props: card };
    case "developer_profile":
      return { id: `developer-profile-${index}`, componentId: "developer_profile", props: card };
    case "permit_status":
      return { id: `permit-status-${index}`, componentId: "permit_status", props: card };
    case "broker_handoff":
      return {
        id: `followup-prompt-${index}`,
        componentId: "followup_prompt",
        props: {
          title: card.title,
          summary: card.summary,
          actionLabel:
            card.handoffStatus === "qualified"
              ? locale === "ar"
                ? "اطلب مستشاراً"
                : locale === "fr"
                  ? "Demander un conseiller"
                  : "Request advisor"
              : locale === "ar"
                ? "أكمل التأهيل"
                : locale === "fr"
                  ? "Compléter la qualification"
                  : "Complete qualification",
        },
      };
    case "market_analysis":
      return { id: `market-analysis-${index}`, componentId: "market_analysis", props: card };
    default:
      return null;
  }
}

export function buildBuyerUiTurn(args: {
  assistantText?: string;
  properties?: BuyerProperty[];
  cards?: BuyerAssistantCard[];
  targetZone?: BuyerAgUiTurn["targetZone"];
  locale?: BuyerAssistantLocale;
}): BuyerAgUiTurn | undefined {
  const uiCards: BuyerAgUiCard[] = [];
  const locale = args.locale ?? "ar";
  const shortlistCard = toShortlistCard(args.properties ?? []);

  if (shortlistCard) {
    uiCards.push(shortlistCard);
  }

  (args.cards ?? []).forEach((card, index) => {
    const uiCard = mapCardToUiCard(card, index, locale);
    if (uiCard) {
      uiCards.push(uiCard);
    }
  });

  if (uiCards.length === 0) return undefined;

  return {
    objective: "client_assistant",
    targetZone: args.targetZone ?? "client_web",
    assistantText: args.assistantText,
    cards: uiCards,
  };
}

export function buildBuyerChatSuggestions(
  locale: BuyerAssistantLocale,
  mode: "default" | "search" | "loans",
): BuyerChatSuggestion[] {
  if (mode === "search") {
    if (locale === "ar") {
      return [
        { id: "s1", label: "شقة في الرياض", prompt: "أبحث عن شقة في الرياض" },
        { id: "s2", label: "قارن الخيارات", prompt: "قارن أفضل الخيارات" },
        { id: "s3", label: "استثمار", prompt: "أريد خيارات مناسبة للاستثمار" },
      ];
    }
    if (locale === "fr") {
      return [
        { id: "s1", label: "Appartement à Riyad", prompt: "Trouve-moi un appartement à Riyad" },
        { id: "s2", label: "Comparer", prompt: "Compare les meilleures options" },
        { id: "s3", label: "Investissement", prompt: "Montre-moi des options adaptées à l'investissement" },
      ];
    }
    return [
      { id: "s1", label: "Riyadh apartment", prompt: "Find an apartment in Riyadh" },
      { id: "s2", label: "Compare options", prompt: "Compare the best options" },
      { id: "s3", label: "Investment", prompt: "Show investment-friendly options" },
    ];
  }

  if (mode === "loans") {
    if (locale === "ar") {
      return [
        { id: "l1", label: "فحص الأهلية", prompt: "هل راتبي 15000 مناسب للتمويل؟" },
        { id: "l2", label: "خطة سداد", prompt: "اعرض خطة سداد مبدئية" },
        { id: "l3", label: "قرض لشقة", prompt: "أريد تمويل لشقة في الرياض" },
      ];
    }
    if (locale === "fr") {
      return [
        { id: "l1", label: "Vérifier l'éligibilité", prompt: "Un salaire de 15 000 SAR me permet-il d'obtenir un financement ?" },
        { id: "l2", label: "Plan de paiement", prompt: "Montre-moi un plan de paiement initial" },
        { id: "l3", label: "Financer un appartement", prompt: "J'ai besoin d'un financement pour un appartement à Riyad" },
      ];
    }
    return [
      { id: "l1", label: "Check eligibility", prompt: "Does a SAR 15,000 salary qualify me?" },
      { id: "l2", label: "Payment plan", prompt: "Show me a starter payment plan" },
      { id: "l3", label: "Loan for apartment", prompt: "I need financing for an apartment in Riyadh" },
    ];
  }

  if (locale === "ar") {
    return [
      { id: "d1", label: "أبحث عن شقة", prompt: "أبحث عن شقة في الرياض" },
      { id: "d2", label: "فحص التمويل", prompt: "هل راتبي 15000 مناسب للتمويل؟" },
      { id: "d3", label: "قارن الخيارات", prompt: "قارن أفضل الخيارات" },
    ];
  }
  if (locale === "fr") {
    return [
      { id: "d1", label: "Trouver un appartement", prompt: "Trouve-moi un appartement à Riyad" },
      { id: "d2", label: "Vérifier le financement", prompt: "Un salaire de 15 000 SAR me permet-il d'obtenir un financement ?" },
      { id: "d3", label: "Comparer", prompt: "Compare les meilleures options" },
    ];
  }
  return [
    { id: "d1", label: "Find apartment", prompt: "Find an apartment in Riyadh" },
    { id: "d2", label: "Check financing", prompt: "Does a SAR 15,000 salary qualify me?" },
    { id: "d3", label: "Compare options", prompt: "Compare the best options" },
  ];
}

export function buildBuyerThreadTitle(messages: BuyerAssistantMessage[]) {
  return (
    messages.find((message) => message.role === "user")?.text.slice(0, 80) ||
    messages.find((message) => message.role === "assistant")?.text.slice(0, 80) ||
    "Buyer conversation"
  );
}
