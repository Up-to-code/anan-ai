export type BuyerAssistantLocale = "ar" | "en" | "fr";

export type BuyerThreadKind = "welcome" | "live" | "demo";

export type BuyerPropertyOwner = {
  id: string;
  type: "broker" | "developer" | "RED";
  name: string;
  slug: string;
  isVerified: boolean;
  activeListings?: number;
};

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
  owner: BuyerPropertyOwner;
  aiSummary?: string;
};

export type BuyerChatSuggestion = {
  id: string;
  prompt: string;
  label?: string;
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
      type: "market_analysis";
      title: string;
      location: string;
      averagePrice: number;
      priceTrend: "up" | "down" | "flat" | "stable";
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
      tone: "success" | "warning" | "info";
      summary: string;
    };

export type BuyerAgUiComponentId =
  | "property_shortlist"
  | "bank_offer"
  | "followup_prompt"
  | "comparison_table"
  | "mortgage_check"
  | "loan_calculator"
  | "roi_projection"
  | "roi_summary"
  | "payment_plan"
  | "market_analysis"
  | "insight_brief"
  | "accent_note"
  | "broker_profile"
  | "developer_profile"
  | "permit_status";

export type BuyerAgUiCard = {
  id: string;
  componentId: BuyerAgUiComponentId;
  props: Record<string, unknown>;
};

export type BuyerAgUiTurn = {
  id: string;
  assistantText?: string;
  targetZone?: "mobile_app" | "web" | "unknown";
  cards: BuyerAgUiCard[];
};

export type BuyerAssistantMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  createdAt?: number;
  properties?: BuyerProperty[];
  cards?: BuyerAssistantCard[];
  suggestedPrompts?: string[];
  activePropertyId?: string;
  requiresAuthForHandoff?: boolean;
  uiTurn?: BuyerAgUiTurn;
};

export type BuyerThreadSummary = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  preview?: string;
};

function uniqueId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function buildBuyerChatSuggestions(locale: BuyerAssistantLocale, variant: "default" | "discovery" = "default") {
  const suggestions: BuyerChatSuggestion[] = [];

  if (locale === "ar") {
    const prompts =
      variant === "discovery"
        ? [
            { prompt: "اعرض خيارات في شمال الرياض", label: "بحسب الحي والسعر ونوع الوحدة" },
            { prompt: "أريد شقة 3 غرف قريبة من الخدمات", label: "مع مدارس وخدمات يومية قريبة" },
            { prompt: "اعرض مشاريع مطورين موثوقين", label: "بناء على السمعة وسجل التسليم" },
            { prompt: "قارن بين وحدتين قريبتين في السعر", label: "من حيث المساحة والعائد وخطة الدفع" },
            { prompt: "ما أفضل خيار استثماري حالياً؟", label: "للتأجير أو إعادة البيع في السوق الحالي" },
          ]
        : [
            { prompt: "اعرض لي أفضل الخيارات المتاحة", label: "حسب ميزانيتي والمنطقة المناسبة" },
            { prompt: "احسب تمويل عقار بسعر 1.2 مليون", label: "مع دفعة أولى وقسط شهري تقديري" },
            { prompt: "ما العائد المتوقع للوحدات الجديدة؟", label: "للاستثمار والتأجير في المشاريع الحديثة" },
            { prompt: "تحقق من مطور هذا العقار", label: "من حيث السمعة والتسليم والمشاريع السابقة" },
            { prompt: "أريد مستشاراً الآن", label: "للمتابعة والحجز وخطوات الشراء" },
          ];

    prompts.forEach((item, index) => {
      suggestions.push({ id: `ar-${variant}-${index + 1}`, prompt: item.prompt, label: item.label });
    });

    return suggestions;
  }

  if (locale === "fr") {
    const prompts =
      variant === "discovery"
        ? [
            { prompt: "Montre-moi des options à Riyad", label: "Selon le quartier, le budget et le type de bien" },
            { prompt: "Je cherche un appartement 3 chambres", label: "Avec services et commodités à proximité" },
            { prompt: "Compare deux biens similaires", label: "Prix, surface, rendement et plan de paiement" },
            { prompt: "Quels sont les meilleurs investissements ?", label: "Pour louer ou revendre dans ce marché" },
            { prompt: "Présente-moi des promoteurs fiables", label: "Basé sur leur réputation et leurs livraisons" },
          ]
        : [
            { prompt: "Montre-moi les meilleures options", label: "Selon mon budget et la bonne zone" },
            { prompt: "Calcule un financement pour 1,2M", label: "Avec acompte et mensualité estimée" },
            { prompt: "Quel est le rendement attendu ?", label: "Pour les unités neuves et l'investissement" },
            { prompt: "Vérifie ce promoteur", label: "Réputation, livraisons et projets passés" },
            { prompt: "Je veux parler à un conseiller", label: "Pour la suite, la réservation et l'achat" },
          ];

    prompts.forEach((item, index) => {
      suggestions.push({ id: `fr-${variant}-${index + 1}`, prompt: item.prompt, label: item.label });
    });

    return suggestions;
  }

  const prompts =
    variant === "discovery"
      ? [
          { prompt: "Show me options in Riyadh", label: "By neighborhood, budget, and property type" },
          { prompt: "I need a 3-bedroom apartment", label: "Close to schools, services, and daily needs" },
          { prompt: "Compare two similar listings", label: "Price, size, yield, and payment plan" },
          { prompt: "What are the best investments?", label: "For rental income or resale right now" },
          { prompt: "Share trusted developers", label: "Based on reputation and delivery history" },
        ]
      : [
          { prompt: "Show me the best options", label: "Based on my budget and preferred area" },
          { prompt: "Calculate financing for 1.2M", label: "With down payment and monthly estimate" },
          { prompt: "What is the expected ROI?", label: "For new units and investment demand" },
          { prompt: "Verify this developer", label: "Reputation, delivery track record, and past work" },
          { prompt: "I want a consultant", label: "For follow-up, booking, and buying steps" },
        ];

  prompts.forEach((item, index) => {
    suggestions.push({ id: `en-${variant}-${index + 1}`, prompt: item.prompt, label: item.label });
  });

  return suggestions;
}

export function buildBuyerThreadTitle(messages: BuyerAssistantMessage[]) {
  const candidate =
    messages.find((message) => message.role === "user" && message.text.trim()) ??
    messages.find((message) => message.text.trim());

  const rawTitle = candidate?.text?.trim() ?? "New conversation";
  const trimmed = rawTitle.replace(/\s+/g, " ").trim();

  if (trimmed.length <= 42) return trimmed;
  return `${trimmed.slice(0, 42).trim()}...`;
}

function toFollowupActionLabel(status: "qualified" | "needs_more_info") {
  return status === "qualified" ? "اطلب مستشاراً" : "أكمل البيانات";
}

export function buildBuyerUiTurn(args: {
  assistantText?: string;
  properties?: BuyerProperty[];
  cards?: BuyerAssistantCard[];
  targetZone?: "mobile_app" | "web" | "unknown";
}): BuyerAgUiTurn | undefined {
  const cards: BuyerAgUiCard[] = [];

  if (args.properties && args.properties.length > 0) {
    cards.push({
      id: uniqueId("property-shortlist"),
      componentId: "property_shortlist",
      props: { properties: args.properties },
    });
  }

  (args.cards ?? []).forEach((card) => {
    if (card.type === "bank_offer") {
      cards.push({
        id: uniqueId("bank-offer"),
        componentId: "bank_offer",
        props: { ...card },
      });
      return;
    }

    if (card.type === "broker_handoff") {
      cards.push({
        id: uniqueId("followup"),
        componentId: "followup_prompt",
        props: {
          title: card.title,
          summary: card.summary,
          actionLabel: toFollowupActionLabel(card.handoffStatus),
        },
      });
      return;
    }

    cards.push({
      id: uniqueId(card.type),
      componentId: card.type,
      props: { ...card },
    });
  });

  if (cards.length === 0) return undefined;

  return {
    id: uniqueId("turn"),
    assistantText: args.assistantText,
    targetZone: args.targetZone ?? "mobile_app",
    cards,
  };
}
