import { api, internal } from "../../_generated/api";
import type { Id } from "../../_generated/dataModel";
import type { ActionCtx } from "../../_generated/server";
import { buildBuyerComparisonSnapshot } from "../../shared_logic/buyerComparisons";

type SupportedLocale = "ar" | "en" | "fr";

type BuyerQualification = {
  monthlySalary?: number;
  downPayment?: number;
  preferredYears?: number;
  employmentStatus?: string;
  notes?: string;
};

type BuyerOwner = {
  userId: string;
};

type BuyerProperty = {
  id: Id<"properties">;
  title: string;
  address: string;
  bankId?: Id<"banks">;
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

type BuyerCard =
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
      type: "bank_offer";
      title: string;
      bankName: string;
      rateLabel: string;
      downPaymentPercent: number;
      monthlyEstimate: number;
      summary: string;
    };

type PersistedBuyerState = {
  channel: "whatsapp" | "app" | "web";
  userId: string;
  threadId?: string;
  state: "idle" | "search_results" | "property_selected" | "handoff_ready";
  selectedPropertyId?: Id<"properties">;
  lastResultPropertyIds: Array<Id<"properties">>;
  comparisonPropertyIds?: Array<Id<"properties">>;
  lastComparisonArtifactId?: Id<"buyerComparisonArtifacts">;
  lastSearchQuery?: string;
  qualification?: BuyerQualification;
  createdAt: number;
  updatedAt: number;
};

type BuyerContext = {
  state: PersistedBuyerState | null;
  memory: {
    summary: string;
    preferences: unknown[];
    constraints: unknown[];
    recentInteractions: unknown[];
    lastSearchSummary: unknown;
  };
  summaries: {
    buyerProfileSummary?: string;
    activePropertySummary?: string;
    searchJourneySummary?: string;
    financeQualificationSummary?: string;
  };
};

type PromptBudgetMeta = {
  contextTokens: number;
  memoryTokens: number;
  ragTokens: number;
  historyTokens: number;
  totalContextTokens: number;
  budgetCap: number;
  cacheHit: boolean;
  includedBlocks: string[];
  droppedBlocks: string[];
};

type StructuredBuyerResponse = {
  message: string;
  properties: BuyerProperty[];
  cards: BuyerCard[];
  suggestedPrompts: string[];
  activePropertyId?: Id<"properties">;
  requiresAuthForHandoff: boolean;
  comparisonArtifactId?: Id<"buyerComparisonArtifacts">;
  comparisonPropertyIds?: Array<Id<"properties">>;
  selectionSource?: "ui_selected" | "history_resolved" | "text_resolved";
  buyerContext: {
    state: PersistedBuyerState["state"];
    selectedPropertyId?: Id<"properties">;
    lastResultPropertyIds: Array<Id<"properties">>;
    comparisonPropertyIds?: Array<Id<"properties">>;
    lastComparisonArtifactId?: Id<"buyerComparisonArtifacts">;
    lastSearchQuery?: string;
    qualification?: BuyerQualification;
    memorySummary: string;
    activePropertySummary?: string;
    searchSummary?: string;
    financeQualificationSummary?: string;
    promptBudgetMeta?: PromptBudgetMeta;
  };
};

const SEARCH_KEYWORDS = ["search", "find", "apartment", "property", "house", "home", "ابحث", "أبحث", "شقة", "عقار", "وحدة"];
const MORE_RESULTS_KEYWORDS = ["more", "another", "different", "other", "غيرها", "غيره", "مزيد", "أكثر", "خيارات أخرى", "خيارات اخري", "بدائل"];
const FINANCE_KEYWORDS = ["loan", "mortgage", "afford", "finance", "payment", "eligibility", "bank", "تمويل", "قرض", "راتب", "أهلية", "قسط", "بنك"];
const ROI_KEYWORDS = ["roi", "yield", "investment", "return", "عائد", "استثمار"];
const COMPARE_KEYWORDS = ["compare", "comparison", "قارن", "مقارنة"];
const PERMIT_KEYWORDS = ["permit", "legal", "license", "تصريح", "رخصة", "قانون"];
const HANDOFF_KEYWORDS = ["advisor", "handoff", "book", "visit", "call", "contact", "مستشار", "زيارة", "احجز", "تواصل"];
const BROKER_KEYWORDS = ["broker", "advisor", "agent", "وسيط", "مستشار"];
const DEVELOPER_KEYWORDS = ["developer", "company", "develop", "مطور", "شركة", "المطور"];
const EXPLICIT_SEARCH_KEYWORDS = ["search", "find", "show me", "browse", "ابحث", "أبحث", "اعرض", "دور"];
const buyerComparisonsInternal = (internal as Record<string, any>)["shared_logic/buyerComparisons"];

function includesIntent(message: string, keywords: string[]) {
  return keywords.some((keyword) => message.includes(keyword));
}

function isExplicitSearchIntent(message: string) {
  return includesIntent(message, EXPLICIT_SEARCH_KEYWORDS);
}

function buildEmptyBuyerContext(): BuyerContext {
  return {
    state: null,
    memory: {
      summary: "",
      preferences: [],
      constraints: [],
      recentInteractions: [],
      lastSearchSummary: null,
    },
    summaries: {},
  };
}

function isMoreResultsIntent(message: string) {
  return includesIntent(message, MORE_RESULTS_KEYWORDS);
}

function formatCurrency(value: number, locale: SupportedLocale) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(value);
}

function buildSearchPrompts(locale: SupportedLocale, activeProperty?: BuyerProperty | null) {
  if (activeProperty) {
    if (locale === "fr") {
      return [
        `Quel financement convient à ${activeProperty.title} ?`,
        `Compare ${activeProperty.title} avec une autre option`,
        "Montre-moi plus d'options",
        "Mets-moi en relation avec un conseiller",
      ];
    }
    return locale === "en"
      ? [
          `What loan fits ${activeProperty.title}?`,
          `Compare ${activeProperty.title} with another option`,
          "Show me more options",
          "Connect me to an advisor",
        ]
      : [
          `ما التمويل المناسب لـ ${activeProperty.title}؟`,
          `قارن ${activeProperty.title} مع خيار آخر`,
          "اعرض لي خيارات أخرى",
          "وصّلني بمستشار",
        ];
  }

  if (locale === "fr") {
    return [
      "Montre-moi des appartements à Riyad",
      "Trouve-moi un bien avec financement",
      "Montre-moi plus d'options",
      "Mets-moi en relation avec un conseiller",
    ];
  }
  return locale === "en"
    ? [
        "Show me apartments in Riyadh",
        "Find me a property with financing",
        "Show me more options",
        "Connect me to an advisor",
      ]
    : [
        "اعرض شقق في الرياض",
        "ابحث لي عن عقار مع تمويل",
        "اعرض لي خيارات أخرى",
        "وصّلني بمستشار",
      ];
}

function buildPropertySearchMessage(locale: SupportedLocale, count: number, diversified: boolean) {
  if (locale === "fr") {
    if (diversified && count > 0) {
      return `J'ai trouvé ${count} nouvelles options au-delà de celles déjà affichées, afin d'élargir la recherche sans répéter la même shortlist.`;
    }
    return count > 0
      ? `J'ai trouvé ${count} options qui correspondent à cette demande. Ouvrez un bien pour continuer avec le financement, le rendement ou le transfert vers un conseiller.`
      : "Je n'ai pas trouvé de correspondance directe, j'ai donc préparé les options vérifiées les plus proches pour continuer.";
  }
  if (locale === "en") {
    if (diversified && count > 0) {
      return `I found ${count} fresh options beyond the ones already shown, so you can explore different matches without repeating the same shortlist.`;
    }
    return count > 0
      ? `I found ${count} options that fit this request. Open any property to continue with financing, ROI, or advisor handoff.`
      : "I could not find a direct match, so I prepared the closest verified options to continue from.";
  }

  if (diversified && count > 0) {
    return `حضرت لك ${count} خيارات جديدة غير التي ظهرت سابقاً، حتى نوسع البحث بدون تكرار نفس القائمة.`;
  }
  return count > 0
    ? `حضرت لك ${count} خيارات مناسبة لهذا الطلب. افتح أي عقار لنكمل التمويل أو العائد أو طلب المستشار.`
    : "لم أجد تطابقاً مباشراً، لذلك جهزت أقرب الخيارات الموثقة لتبدأ منها.";
}

function buildHandoffCard(locale: SupportedLocale): BuyerCard {
  return locale === "en"
    ? {
        type: "broker_handoff",
        title: "Advisor handoff",
        handoffStatus: "qualified",
        summary: "The request is ready for an advisor handoff once you sign in and confirm your contact details.",
      }
    : locale === "fr"
      ? {
          type: "broker_handoff",
          title: "Transfert vers un conseiller",
          handoffStatus: "qualified",
          summary: "La demande est prête pour un transfert vers un conseiller une fois connecté et vos coordonnées confirmées.",
        }
      : {
        type: "broker_handoff",
        title: "تحويل إلى مستشار",
        handoffStatus: "qualified",
        summary: "الطلب جاهز للتحويل إلى مستشار بمجرد تسجيل الدخول وتأكيد بيانات التواصل.",
      };
}

function buildBrokerProfileCard(locale: SupportedLocale, property: BuyerProperty): BuyerCard | null {
  if (property.owner.type !== "broker") return null;
  return locale === "en"
    ? {
        type: "broker_profile",
        title: "Advisor profile",
        brokerName: property.owner.name,
        brokerAgency: property.owner.agencyLabel ?? property.owner.name,
        rating: property.owner.rating ?? 4.7,
        activeListings: property.owner.activeListings ?? 1,
        summary: property.owner.description ?? "This verified advisor can continue the property discussion and next steps.",
      }
    : locale === "fr"
      ? {
          type: "broker_profile",
          title: "Profil du conseiller",
          brokerName: property.owner.name,
          brokerAgency: property.owner.agencyLabel ?? property.owner.name,
          rating: property.owner.rating ?? 4.7,
          activeListings: property.owner.activeListings ?? 1,
          summary: property.owner.description ?? "Ce conseiller vérifié peut poursuivre la discussion et organiser les prochaines étapes.",
        }
      : {
        type: "broker_profile",
        title: "ملف الوسيط",
        brokerName: property.owner.name,
        brokerAgency: property.owner.agencyLabel ?? property.owner.name,
        rating: property.owner.rating ?? 4.7,
        activeListings: property.owner.activeListings ?? 1,
        summary: property.owner.description ?? "هذا الوسيط الموثق يمكنه متابعة التفاصيل والزيارة والخطوات القادمة.",
      };
}

function buildDeveloperProfileCard(locale: SupportedLocale, property: BuyerProperty): BuyerCard | null {
  if (property.owner.type !== "RED") return null;
  return locale === "en"
    ? {
        type: "developer_profile",
        title: "Developer profile",
        developerName: property.owner.name,
        establishedYear: property.owner.establishedYear ?? 2012,
        completedProjects: property.owner.completedProjects ?? Math.max(property.owner.activeListings ?? 1, 1),
        summary: property.owner.description ?? "This developer is the source of the inventory shown in this result.",
      }
    : locale === "fr"
      ? {
          type: "developer_profile",
          title: "Profil du promoteur",
          developerName: property.owner.name,
          establishedYear: property.owner.establishedYear ?? 2012,
          completedProjects: property.owner.completedProjects ?? Math.max(property.owner.activeListings ?? 1, 1),
          summary: property.owner.description ?? "Ce promoteur est la source du stock affiché dans ce résultat.",
        }
      : {
        type: "developer_profile",
        title: "ملف المطور",
        developerName: property.owner.name,
        establishedYear: property.owner.establishedYear ?? 2012,
        completedProjects: property.owner.completedProjects ?? Math.max(property.owner.activeListings ?? 1, 1),
        summary: property.owner.description ?? "هذا المطور هو الجهة المالكة للمخزون الظاهر في هذه النتيجة.",
      };
}

function buildRoiCard(locale: SupportedLocale, property: BuyerProperty): BuyerCard {
  const estimatedAnnualRent = Math.round(property.price * 0.08);
  const grossYieldPercent = Number(((estimatedAnnualRent / property.price) * 100).toFixed(1));

  return locale === "en"
    ? {
        type: "roi_summary",
        title: "ROI snapshot",
        purchasePrice: property.price,
        estimatedAnnualRent,
        grossYieldPercent,
        summary: `This property could generate about ${grossYieldPercent}% gross yield based on current pricing assumptions.`,
      }
    : locale === "fr"
      ? {
          type: "roi_summary",
          title: "Aperçu du rendement",
          purchasePrice: property.price,
          estimatedAnnualRent,
          grossYieldPercent,
          summary: `Ce bien pourrait générer environ ${grossYieldPercent}% de rendement brut selon les hypothèses actuelles.`,
        }
      : {
        type: "roi_summary",
        title: "ملخص العائد الاستثماري",
        purchasePrice: property.price,
        estimatedAnnualRent,
        grossYieldPercent,
        summary: `العائد الإجمالي التقديري يقارب ${grossYieldPercent}% لهذه الوحدة بناءً على فرضيات التسعير الحالية.`,
      };
}

function buildPaymentPlanCard(
  locale: SupportedLocale,
  property: BuyerProperty,
  downPayment?: number,
): BuyerCard {
  const resolvedDownPayment = downPayment ?? Math.round(property.price * 0.1);
  const durationMonths = 60;
  const monthlyInstallment = Math.round((property.price - resolvedDownPayment) / durationMonths);

  return locale === "en"
    ? {
        type: "payment_plan",
        title: "Starter payment plan",
        downPayment: resolvedDownPayment,
        monthlyInstallment,
        durationMonths,
        summary: `With a ${formatCurrency(resolvedDownPayment, locale)} down payment, the remaining balance can be spread over ${durationMonths} months at about ${formatCurrency(monthlyInstallment, locale)} per month.`,
      }
    : {
        type: "payment_plan",
        title: "خطة السداد المبدئية",
        downPayment: resolvedDownPayment,
        monthlyInstallment,
        durationMonths,
        summary: `بدفعة أولى ${formatCurrency(resolvedDownPayment, locale)} يمكن توزيع الباقي على ${durationMonths} شهر بقسط تقريبي ${formatCurrency(monthlyInstallment, locale)}.`,
      };
}

function buildMortgageCard(
  locale: SupportedLocale,
  salary?: number,
  priceHint?: number,
): BuyerCard {
  const estimatedEligibility =
    salary === undefined ? "insufficient_data" : salary >= 12000 ? "eligible" : salary >= 8000 ? "review" : "insufficient_data";
  const recommendedBudget = salary ? salary * 55 : priceHint;
  const monthlyInstallmentEstimate = recommendedBudget ? Math.round(recommendedBudget / (20 * 12)) : undefined;

  if (locale === "fr") {
    return {
      type: "mortgage_check",
      title: "Éligibilité au financement",
      estimatedEligibility,
      recommendedBudget,
      monthlyInstallmentEstimate,
      summary:
        estimatedEligibility === "eligible"
          ? "Votre profil initial semble favorable pour un suivi de financement."
          : estimatedEligibility === "review"
            ? "Vous pouvez être éligible, mais il nous faut encore vos engagements et le détail de l'apport."
            : "Partagez votre salaire, votre apport ou la durée visée pour obtenir une estimation plus fiable.",
    };
  }
  if (locale === "en") {
    return {
      type: "mortgage_check",
      title: "Mortgage eligibility",
      estimatedEligibility,
      recommendedBudget,
      monthlyInstallmentEstimate,
      summary:
        estimatedEligibility === "eligible"
          ? "Your initial affordability profile looks healthy for a mortgage follow-up."
          : estimatedEligibility === "review"
            ? "You may qualify, but we still need commitments and down-payment details."
            : "Share salary, down payment, or target term to get a more reliable eligibility estimate.",
    };
  }

  return {
    type: "mortgage_check",
    title: "فحص أهلية التمويل",
    estimatedEligibility,
    recommendedBudget,
    monthlyInstallmentEstimate,
    summary:
      estimatedEligibility === "eligible"
        ? "المؤشرات الأولية جيدة ويمكن متابعة فحص البنك والتزاماتك الحالية."
        : estimatedEligibility === "review"
          ? "هناك فرصة للتمويل لكننا نحتاج التزاماتك الحالية والدفعة الأولى للتأكيد."
          : "شارك الراتب أو الدفعة الأولى أو مدة التمويل لنقدم تقديراً أدق.",
  };
}

function buildLoanCalculatorCard(
  locale: SupportedLocale,
  property: BuyerProperty,
  params: { downPayment?: number; interestRate?: number; years?: number },
): BuyerCard {
  const downPayment = params.downPayment ?? Math.round(property.price * 0.1);
  const years = params.years ?? 20;
  const interestRate = params.interestRate ?? 4.75;
  const loanAmount = Math.max(0, property.price - downPayment);
  const monthlyRate = interestRate / 100 / 12;
  const installments = years * 12;
  const factor = Math.pow(1 + monthlyRate, installments);
  const monthlyPayment =
    monthlyRate > 0
      ? Math.round((loanAmount * monthlyRate * factor) / (factor - 1))
      : Math.round(loanAmount / Math.max(installments, 1));

  return locale === "en"
    ? {
        type: "loan_calculator",
        title: "Loan scenario",
        propertyPrice: property.price,
        downPayment,
        loanAmount,
        interestRate,
        years,
        monthlyPayment,
        summary: `This estimate assumes ${interestRate}% over ${years} years for ${property.title}.`,
      }
    : locale === "fr"
      ? {
          type: "loan_calculator",
          title: "Simulation de prêt",
          propertyPrice: property.price,
          downPayment,
          loanAmount,
          interestRate,
          years,
          monthlyPayment,
          summary: `Cette estimation suppose ${interestRate}% sur ${years} ans pour ${property.title}.`,
        }
      : {
        type: "loan_calculator",
        title: "حساب التمويل",
        propertyPrice: property.price,
        downPayment,
        loanAmount,
        interestRate,
        years,
        monthlyPayment,
        summary: `هذا السيناريو يفترض فائدة ${interestRate}% لمدة ${years} سنة على ${property.title}.`,
      };
}

function buildPermitCard(locale: SupportedLocale, property: BuyerProperty): BuyerCard {
  return locale === "en"
    ? {
        type: "permit_status",
        title: "Verification status",
        permitStatus: property.owner.isVerified ? "verified" : "pending_review",
        summary: property.owner.isVerified
          ? `${property.owner.name} is verified in Anan. Final permit validation still depends on project documents.`
          : "The listing is visible, but permit validation still needs a formal document review.",
      }
    : locale === "fr"
      ? {
          type: "permit_status",
          title: "Statut de vérification",
          permitStatus: property.owner.isVerified ? "verified" : "pending_review",
          summary: property.owner.isVerified
            ? `${property.owner.name} est vérifié sur Anan. La validation finale dépend encore des documents du projet.`
            : "L'annonce est visible, mais la validation des autorisations nécessite encore une revue documentaire.",
        }
      : {
        type: "permit_status",
        title: "حالة التحقق",
        permitStatus: property.owner.isVerified ? "verified" : "pending_review",
        summary: property.owner.isVerified
          ? `${property.owner.name} موثق داخل عنان، لكن التحقق النهائي من التصاريح يحتاج مستندات المشروع الرسمية.`
          : "العقار ظاهر في التجربة الحالية، لكن التحقق من التصاريح يحتاج مراجعة المستندات النظامية.",
      };
}

function extractSalary(message: string) {
  const match = message.match(/\d[\d,.]*/);
  if (!match) return undefined;
  return Number(match[0].replace(/[^\d]/g, ""));
}

function extractBudgetHint(message: string) {
  const match = message.match(/\d[\d,.]*/);
  return match?.[0]?.replace(/[^\d]/g, "");
}

function extractPropertyType(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("شقة") || normalized.includes("apartment")) return "apartment";
  if (normalized.includes("villa") || normalized.includes("فيلا")) return "villa";
  if (normalized.includes("duplex") || normalized.includes("دوبلكس")) return "duplex";
  if (normalized.includes("office") || normalized.includes("مكتب")) return "office";
  return null;
}

function mergeQualification(
  current: BuyerQualification | undefined,
  incoming: BuyerQualification | undefined,
  message: string,
) {
  const monthlySalary = incoming?.monthlySalary ?? current?.monthlySalary ?? extractSalary(message);
  return {
    monthlySalary,
    downPayment: incoming?.downPayment ?? current?.downPayment,
    preferredYears: incoming?.preferredYears ?? current?.preferredYears,
    employmentStatus: incoming?.employmentStatus ?? current?.employmentStatus,
    notes: incoming?.notes ?? current?.notes,
  };
}

function getNumericRule(rule: unknown, keys: string[]) {
  if (!rule || typeof rule !== "object") return undefined;
  const record = rule as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return undefined;
}

async function buildBankOfferCards(
  ctx: ActionCtx,
  locale: SupportedLocale,
  property: BuyerProperty,
  qualification?: BuyerQualification,
): Promise<BuyerCard[]> {
  const bundles = (await ctx.runQuery((api as any)["shared_logic/banks/queries"].getBundles, {
    bankId: property.bankId as any,
  })) as Array<{
    bankName: string;
    rules?: Record<string, unknown>;
  }>;

  const shortlisted = bundles.slice(0, 2);
  return shortlisted.map((bundle, index) => {
    const downPaymentPercent = getNumericRule(bundle.rules, ["minDownPaymentPercent", "downPaymentPercent"]) ?? (index === 0 ? 10 : 15);
    const interestRate = getNumericRule(bundle.rules, ["interestRate", "annualRate"]) ?? (index === 0 ? 4.35 : 4.85);
    const downPayment =
      qualification?.downPayment ?? Math.round(property.price * (downPaymentPercent / 100));
    const loanCard = buildLoanCalculatorCard(locale, property, {
      downPayment,
      interestRate,
      years: qualification?.preferredYears ?? 20,
    }) as Extract<BuyerCard, { type: "loan_calculator" }>;

    return locale === "en"
      ? {
          type: "bank_offer",
          title: index === 0 ? "Best matching bank option" : "Alternative bank option",
          bankName: bundle.bankName,
          rateLabel: `${interestRate}%`,
          downPaymentPercent,
          monthlyEstimate: loanCard.monthlyPayment,
          summary: `Estimated against ${property.title} with an initial ${downPaymentPercent}% down payment.`,
        }
      : locale === "fr"
        ? {
            type: "bank_offer",
            title: index === 0 ? "Meilleure option bancaire" : "Option bancaire alternative",
            bankName: bundle.bankName,
            rateLabel: `${interestRate}%`,
            downPaymentPercent,
            monthlyEstimate: loanCard.monthlyPayment,
            summary: `Estimation pour ${property.title} avec un apport initial de ${downPaymentPercent}%.`,
          }
        : {
          type: "bank_offer",
          title: index === 0 ? "أفضل عرض بنكي مبدئي" : "عرض بنكي بديل",
          bankName: bundle.bankName,
          rateLabel: `${interestRate}%`,
          downPaymentPercent,
          monthlyEstimate: loanCard.monthlyPayment,
          summary: `تقدير مبدئي على ${property.title} مع دفعة أولى ${downPaymentPercent}%.`,
        };
  });
}

async function buildCardsForProperty(params: {
  ctx: ActionCtx;
  locale: SupportedLocale;
  message: string;
  property: BuyerProperty;
  qualification?: BuyerQualification;
}): Promise<BuyerCard[]> {
  const { ctx, locale, message, property, qualification } = params;
  const normalizedMessage = message.toLowerCase();
  const salary = qualification?.monthlySalary ?? extractSalary(normalizedMessage);
  const cards: BuyerCard[] = [];

  if (includesIntent(normalizedMessage, ROI_KEYWORDS)) cards.push(buildRoiCard(locale, property));
  if (includesIntent(normalizedMessage, FINANCE_KEYWORDS)) {
    cards.push(buildMortgageCard(locale, salary, property.price));
    cards.push(buildPaymentPlanCard(locale, property, qualification?.downPayment));
    cards.push(buildLoanCalculatorCard(locale, property, {
      downPayment: qualification?.downPayment,
      years: qualification?.preferredYears ?? 20,
    }));
    cards.push(...(await buildBankOfferCards(ctx, locale, property, qualification)));
  }
  if (includesIntent(normalizedMessage, PERMIT_KEYWORDS)) cards.push(buildPermitCard(locale, property));
  if (includesIntent(normalizedMessage, HANDOFF_KEYWORDS)) cards.push(buildHandoffCard(locale));
  if (includesIntent(normalizedMessage, BROKER_KEYWORDS)) {
    const brokerCard = buildBrokerProfileCard(locale, property);
    if (brokerCard) cards.push(brokerCard);
  }
  if (includesIntent(normalizedMessage, DEVELOPER_KEYWORDS)) {
    const developerCard = buildDeveloperProfileCard(locale, property);
    if (developerCard) cards.push(developerCard);
  }

  if (cards.length === 0) {
    cards.push(buildPaymentPlanCard(locale, property, qualification?.downPayment));
    const ownerCard =
      property.owner.type === "broker"
        ? buildBrokerProfileCard(locale, property)
        : buildDeveloperProfileCard(locale, property);
    if (ownerCard) cards.push(ownerCard);
  }

  return cards;
}

function normalizeComparisonText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildComparisonFollowupMessage(locale: SupportedLocale) {
  if (locale === "fr") {
    return "Dis-moi quels deux biens tu veux comparer depuis les résultats actuels, ou sélectionne-les dans l'interface puis redemande la comparaison.";
  }
  if (locale === "en") {
    return "Tell me which two properties you want to compare from the current results, or select them in the UI and ask again.";
  }
  return "حدّد لي أي عقارين تريد مقارنتهما من النتائج الحالية، أو اخترهما من الواجهة ثم أعد طلب المقارنة.";
}

async function loadProperties(
  ctx: ActionCtx,
  propertyIds: Array<Id<"properties">>,
): Promise<BuyerProperty[]> {
  const properties = await Promise.all(propertyIds.map((propertyId) => loadProperty(ctx, propertyId)));
  return properties.filter(Boolean) as BuyerProperty[];
}

function findNamedPropertyMatches(args: {
  message: string;
  properties: BuyerProperty[];
}) {
  const normalizedMessage = normalizeComparisonText(args.message);
  return args.properties.filter((property) => {
    const title = normalizeComparisonText(property.title);
    const address = normalizeComparisonText(property.address);
    const area = normalizeComparisonText(property.area ?? property.location ?? "");
    return (
      title.length > 0 && normalizedMessage.includes(title)
    ) || (
      address.length > 0 && normalizedMessage.includes(address)
    ) || (
      area.length > 0 && normalizedMessage.includes(area)
    );
  });
}

function uniquePropertyIds(propertyIds: Array<Id<"properties">>) {
  const seen = new Set<string>();
  const ordered: Array<Id<"properties">> = [];
  for (const propertyId of propertyIds) {
    const key = String(propertyId);
    if (seen.has(key)) continue;
    seen.add(key);
    ordered.push(propertyId);
  }
  return ordered;
}

async function loadProperty(
  ctx: ActionCtx,
  propertyId: Id<"properties"> | undefined,
): Promise<BuyerProperty | null> {
  if (!propertyId) return null;
  return ((await ctx.runQuery(
    (api as any)["user_zone/web/properties"].getPropertyDetail,
    { propertyId },
  )) as BuyerProperty | null) ?? null;
}

async function listFallbackProperties(ctx: ActionCtx, limit: number) {
  return ((await ctx.runQuery(
    (api as any)["user_zone/mobile/feed"].listFeed,
    {
      paginationOpts: { numItems: limit, cursor: null },
    },
  )) as { page: BuyerProperty[] }).page;
}

async function runDiversifiedSearch(args: {
  ctx: ActionCtx;
  query: string;
  excludePropertyIds: Array<Id<"properties">>;
  limit: number;
}) {
  const searchResults = (await args.ctx.runQuery(
    (api as any)["shared_logic/properties/search"].search,
    {
      query: args.query,
      limit: Math.max(args.limit * 3, 10),
      onlyAvailable: true,
    },
  )) as Array<{ _id: Id<"properties"> }>;

  const mappedProperties = (
    await Promise.all(
      searchResults.map((result) =>
        loadProperty(args.ctx, result._id),
      ),
    )
  ).filter(Boolean) as BuyerProperty[];

  const excludeIds = new Set(args.excludePropertyIds.map((id) => String(id)));
  const diversified = mappedProperties.filter(
    (property) => !excludeIds.has(String(property.id)),
  );

  if (diversified.length >= args.limit) {
    return {
      properties: diversified.slice(0, args.limit),
      diversified: true,
    };
  }

  return {
    properties: mappedProperties.slice(0, args.limit),
    diversified: diversified.length > 0 && mappedProperties.length > diversified.length,
  };
}

async function persistBuyerPropertyRefs(args: {
  ctx: ActionCtx;
  owner: BuyerOwner;
  threadId?: string;
  channel: "web";
  properties?: BuyerProperty[];
  activePropertyId?: Id<"properties">;
  selectedPropertyIds?: Array<Id<"properties">>;
  comparisonPropertyIds?: Array<Id<"properties">>;
}) {
  if (!args.threadId) return;

  const refs: Array<{
    resourceId: Id<"properties">;
    source: "shortlist_displayed" | "ui_selected" | "active_property" | "comparison_request";
    rank?: number;
  }> = [];

  for (const [index, propertyId] of (args.selectedPropertyIds ?? []).entries()) {
    refs.push({
      resourceId: propertyId,
      source: "ui_selected",
      rank: index,
    });
  }

  for (const [index, property] of (args.properties ?? []).entries()) {
    refs.push({
      resourceId: property.id,
      source: "shortlist_displayed",
      rank: index,
    });
  }

  if (args.activePropertyId) {
    refs.push({
      resourceId: args.activePropertyId,
      source: "active_property",
    });
  }

  for (const [index, propertyId] of (args.comparisonPropertyIds ?? []).entries()) {
    refs.push({
      resourceId: propertyId,
      source: "comparison_request",
      rank: index,
    });
  }

  if (refs.length === 0) return;

  await args.ctx.runMutation(
    buyerComparisonsInternal.trackBuyerPropertyRefsInternal,
    {
      threadId: args.threadId,
      userId: args.owner.userId,
      channel: args.channel,
      refs,
    },
  );
}

async function resolveBuyerComparisonRequest(args: {
  ctx: ActionCtx;
  threadId?: string;
  message: string;
  currentState: PersistedBuyerState | null;
  selectedPropertyIds?: Array<Id<"properties">>;
}) {
  const explicitPropertyIds = uniquePropertyIds(args.selectedPropertyIds ?? []);
  if (explicitPropertyIds.length >= 2) {
    return {
      propertyIds: explicitPropertyIds.slice(0, 4),
      selectionSource: "ui_selected" as const,
    };
  }

  const recentRefs = args.threadId
    ? ((await args.ctx.runQuery(
        buyerComparisonsInternal.listRecentThreadPropertyRefsInternal,
        {
          threadId: args.threadId,
          limit: 8,
        },
      )) as Array<{
        resourceId: Id<"properties">;
        source: "shortlist_displayed" | "ui_selected" | "active_property" | "comparison_request";
      }>)
    : [];

  const uiSelectedIds = uniquePropertyIds(
    recentRefs
      .filter((ref) => ref.source === "ui_selected")
      .map((ref) => ref.resourceId),
  );
  if (uiSelectedIds.length >= 2) {
    return {
      propertyIds: uiSelectedIds.slice(0, 4),
      selectionSource: "history_resolved" as const,
    };
  }

  const shortlistIds = uniquePropertyIds(
    recentRefs
      .filter((ref) => ref.source !== "ui_selected")
      .map((ref) => ref.resourceId),
  ).slice(0, 6);
  const shortlistProperties = shortlistIds.length > 0
    ? await loadProperties(args.ctx, shortlistIds)
    : [];
  const namedMatches = findNamedPropertyMatches({
    message: args.message,
    properties: shortlistProperties,
  });
  if (namedMatches.length >= 2) {
    return {
      propertyIds: uniquePropertyIds(namedMatches.map((property) => property.id)).slice(0, 4),
      selectionSource: "text_resolved" as const,
    };
  }

  const primaryPropertyId = explicitPropertyIds[0] ?? args.currentState?.selectedPropertyId;
  if (
    primaryPropertyId &&
    namedMatches[0] &&
    String(namedMatches[0].id) !== String(primaryPropertyId)
  ) {
    return {
      propertyIds: [primaryPropertyId, namedMatches[0].id],
      selectionSource: explicitPropertyIds[0] ? ("ui_selected" as const) : ("text_resolved" as const),
    };
  }

  if ((args.currentState?.comparisonPropertyIds?.length ?? 0) >= 2) {
    return {
      propertyIds: uniquePropertyIds(args.currentState?.comparisonPropertyIds ?? []).slice(0, 4),
      selectionSource: "history_resolved" as const,
    };
  }

  return null;
}

async function rememberBuyerSignal(args: {
  ctx: ActionCtx;
  owner: BuyerOwner;
  threadId?: string;
  message: string;
  property?: BuyerProperty | null;
  qualification?: BuyerQualification;
  searchQuery?: string;
  findingsCount?: number;
}) {
  const propertyType = extractPropertyType(args.message);
  const budgetHint = extractBudgetHint(args.message);

  if (propertyType) {
    await args.ctx.runMutation(
      internal.shared_logic.memory.repository.storeInternal,
      {
        userId: args.owner.userId,
        threadId: args.threadId ? String(args.threadId) : undefined,
        memoryType: "preference",
        entityType: "property",
        key: "preferred_property_type",
        value: propertyType,
        source: "public_buyer_response",
      },
    );
  }

  if (budgetHint) {
    await args.ctx.runMutation(
      internal.shared_logic.memory.repository.storeInternal,
      {
        userId: args.owner.userId,
        threadId: args.threadId ? String(args.threadId) : undefined,
        memoryType: "constraint",
        key: "budget_hint",
        value: budgetHint,
        source: "public_buyer_response",
      },
    );
  }

  if (args.property?.area || args.property?.location) {
    await args.ctx.runMutation(
      internal.shared_logic.memory.repository.storeInternal,
      {
        userId: args.owner.userId,
        threadId: args.threadId ? String(args.threadId) : undefined,
        memoryType: "preference",
        entityType: "location",
        key: "preferred_location",
        value: args.property.area ?? args.property.location ?? "",
        source: "public_buyer_response",
      },
    );
  }

  if (args.searchQuery && typeof args.findingsCount === "number") {
    await args.ctx.runMutation(
      internal.shared_logic.memory.repository.storeSearchSummaryInternal,
      {
        userId: args.owner.userId,
        threadId: args.threadId ? String(args.threadId) : undefined,
        query: args.searchQuery,
        locationHint: args.property?.area ?? args.property?.location,
        budgetHint: budgetHint,
        findingsCount: args.findingsCount,
      },
    );
  }

  if (args.property) {
    await args.ctx.runMutation(
      internal.shared_logic.memory.repository.storeInteractionInternal,
      {
        userId: args.owner.userId,
        threadId: args.threadId ? String(args.threadId) : undefined,
        entityType: "property",
        entityId: String(args.property.id),
        action: includesIntent(args.message.toLowerCase(), FINANCE_KEYWORDS)
          ? "finance_review"
          : "property_followup",
        details: args.property.title,
        metadata: {
          area: args.property.area,
          price: args.property.price,
          qualification: args.qualification,
        },
      },
    );
  }
}

/**
 * WHY:   The public web app needs structured buyer payloads even though the orchestrator produces the narrative text.
 * WHAT:  Resolves property shortlist, finance cards, prompts, and buyer state for one public assistant turn.
 * HOW:   Reuses persisted buyer state + memory, diversifies repeated searches, then upserts the next state after composing the reply.
 */
export async function buildStructuredBuyerResponse(args: {
  ctx: ActionCtx;
  owner: BuyerOwner;
  channel: "web";
  locale: SupportedLocale;
  message: string;
  assistantText: string;
  threadId?: string;
  startFresh?: boolean;
  selectedPropertyId?: Id<"properties">;
  selectedPropertyIds?: Array<Id<"properties">>;
  triggerMessageId?: string;
  qualification?: BuyerQualification;
  promptBudgetMeta?: PromptBudgetMeta;
}): Promise<StructuredBuyerResponse> {
  const normalizedMessage = args.message.trim().toLowerCase();
  const persistedBuyerContext = (await args.ctx.runQuery(
    internal.shared_logic.buyerContext.getBuyerContextInternal,
    {
      channel: args.channel,
      userId: args.owner.userId,
    },
  )) as BuyerContext;
  const buyerContext = args.startFresh ? buildEmptyBuyerContext() : persistedBuyerContext;
  const currentState = buyerContext.state;
  const resolvedQualification = mergeQualification(
    currentState?.qualification,
    args.qualification,
    normalizedMessage,
  );
  const compareIntent = includesIntent(normalizedMessage, COMPARE_KEYWORDS);
  const searchIntent =
    isExplicitSearchIntent(normalizedMessage) ||
    includesIntent(normalizedMessage, SEARCH_KEYWORDS);

  if ((args.selectedPropertyIds?.length ?? 0) > 0) {
    await persistBuyerPropertyRefs({
      ctx: args.ctx,
      owner: args.owner,
      threadId: args.threadId,
      channel: args.channel,
      selectedPropertyIds: args.selectedPropertyIds,
    });
  }

  if (compareIntent) {
    const resolvedComparison = await resolveBuyerComparisonRequest({
      ctx: args.ctx,
      threadId: args.threadId,
      message: args.message,
      currentState,
      selectedPropertyIds: args.selectedPropertyIds,
    });

    if (!resolvedComparison) {
      return {
        message: buildComparisonFollowupMessage(args.locale),
        properties: [],
        cards: [],
        suggestedPrompts: [],
        requiresAuthForHandoff: false,
        buyerContext: {
          state: currentState?.state ?? "idle",
          selectedPropertyId: currentState?.selectedPropertyId,
          lastResultPropertyIds: currentState?.lastResultPropertyIds ?? [],
          comparisonPropertyIds: currentState?.comparisonPropertyIds,
          lastComparisonArtifactId: currentState?.lastComparisonArtifactId,
          lastSearchQuery: currentState?.lastSearchQuery,
          qualification: resolvedQualification,
          memorySummary: buyerContext.memory.summary,
          activePropertySummary: buyerContext.summaries.activePropertySummary,
          searchSummary: buyerContext.summaries.searchJourneySummary,
          financeQualificationSummary:
            buyerContext.summaries.financeQualificationSummary,
          promptBudgetMeta: args.promptBudgetMeta,
        },
      };
    }

    const comparisonProperties = await loadProperties(
      args.ctx,
      resolvedComparison.propertyIds,
    );
    if (comparisonProperties.length < 2) {
      return {
        message: buildComparisonFollowupMessage(args.locale),
        properties: [],
        cards: [],
        suggestedPrompts: [],
        requiresAuthForHandoff: false,
        buyerContext: {
          state: currentState?.state ?? "idle",
          selectedPropertyId: currentState?.selectedPropertyId,
          lastResultPropertyIds: currentState?.lastResultPropertyIds ?? [],
          comparisonPropertyIds: currentState?.comparisonPropertyIds,
          lastComparisonArtifactId: currentState?.lastComparisonArtifactId,
          lastSearchQuery: currentState?.lastSearchQuery,
          qualification: resolvedQualification,
          memorySummary: buyerContext.memory.summary,
          activePropertySummary: buyerContext.summaries.activePropertySummary,
          searchSummary: buyerContext.summaries.searchJourneySummary,
          financeQualificationSummary:
            buyerContext.summaries.financeQualificationSummary,
          promptBudgetMeta: args.promptBudgetMeta,
        },
      };
    }

    const comparisonPayload = buildBuyerComparisonSnapshot({
      locale: args.locale,
      properties: comparisonProperties,
      selectionSource: resolvedComparison.selectionSource,
    });

    const comparisonArtifactId = await args.ctx.runMutation(
      buyerComparisonsInternal.storeBuyerComparisonArtifactInternal,
      {
        threadId: args.threadId,
        userId: args.owner.userId,
        channel: args.channel,
        locale: args.locale,
        propertyIds: resolvedComparison.propertyIds,
        triggerMessageId: args.triggerMessageId,
        selectionSource: resolvedComparison.selectionSource,
        digestTitle: comparisonPayload.digestTitle,
        digestSummary: comparisonPayload.digestSummary,
        digestHash: comparisonPayload.digestHash,
        version: "v1",
        snapshot: comparisonPayload.snapshot,
      },
    );

    await rememberBuyerSignal({
      ctx: args.ctx,
      owner: args.owner,
      threadId: args.threadId,
      message: normalizedMessage,
      property: comparisonProperties[0],
      qualification: resolvedQualification,
    });

    await persistBuyerPropertyRefs({
      ctx: args.ctx,
      owner: args.owner,
      threadId: args.threadId,
      channel: args.channel,
      properties: comparisonPayload.snapshot.properties as unknown as BuyerProperty[],
      activePropertyId: comparisonPayload.snapshot.activePropertyId,
      comparisonPropertyIds: resolvedComparison.propertyIds,
    });

    await args.ctx.runMutation(
      internal.shared_logic.buyerContext.upsertBuyerChannelStateInternal,
      {
        channel: args.channel,
        userId: args.owner.userId,
        threadId: args.threadId,
        state: "property_selected",
        selectedPropertyId: comparisonPayload.snapshot.activePropertyId,
        lastResultPropertyIds:
          currentState?.lastResultPropertyIds?.length
            ? currentState.lastResultPropertyIds
            : comparisonProperties.map((property) => property.id),
        comparisonPropertyIds: resolvedComparison.propertyIds,
        lastComparisonArtifactId: comparisonArtifactId,
        lastSearchQuery: currentState?.lastSearchQuery,
        qualification: resolvedQualification,
      },
    );

    const refreshedBuyerContext = (await args.ctx.runQuery(
      internal.shared_logic.buyerContext.getBuyerContextInternal,
      {
        channel: args.channel,
        userId: args.owner.userId,
      },
    )) as BuyerContext;

    return {
      message: comparisonPayload.snapshot.message,
      properties: comparisonPayload.snapshot.properties as unknown as BuyerProperty[],
      cards: comparisonPayload.snapshot.cards as BuyerCard[],
      suggestedPrompts: comparisonPayload.snapshot.suggestedPrompts,
      activePropertyId: comparisonPayload.snapshot.activePropertyId,
      requiresAuthForHandoff: false,
      comparisonArtifactId,
      comparisonPropertyIds: resolvedComparison.propertyIds,
      selectionSource: resolvedComparison.selectionSource,
      buyerContext: {
        state: "property_selected",
        selectedPropertyId: comparisonPayload.snapshot.activePropertyId,
        lastResultPropertyIds:
          refreshedBuyerContext.state?.lastResultPropertyIds ??
          (currentState?.lastResultPropertyIds?.length
            ? currentState.lastResultPropertyIds
            : comparisonProperties.map((property) => property.id)),
        comparisonPropertyIds:
          refreshedBuyerContext.state?.comparisonPropertyIds ??
          resolvedComparison.propertyIds,
        lastComparisonArtifactId:
          refreshedBuyerContext.state?.lastComparisonArtifactId ??
          comparisonArtifactId,
        lastSearchQuery: refreshedBuyerContext.state?.lastSearchQuery ?? currentState?.lastSearchQuery,
        qualification: resolvedQualification,
        memorySummary: refreshedBuyerContext.memory.summary,
        activePropertySummary: refreshedBuyerContext.summaries.activePropertySummary,
        searchSummary: refreshedBuyerContext.summaries.searchJourneySummary,
        financeQualificationSummary:
          refreshedBuyerContext.summaries.financeQualificationSummary,
        promptBudgetMeta: args.promptBudgetMeta,
      },
    };
  }

  const explicitSearch = isExplicitSearchIntent(normalizedMessage);
  const moreResults = isMoreResultsIntent(normalizedMessage);
  const propertyFocusId =
    !explicitSearch && !moreResults
      ? (args.selectedPropertyId ?? currentState?.selectedPropertyId)
      : undefined;

  if (!compareIntent && !moreResults && !searchIntent && !propertyFocusId) {
    if (args.startFresh) {
      await args.ctx.runMutation(
        internal.shared_logic.buyerContext.upsertBuyerChannelStateInternal,
        {
          channel: args.channel,
          userId: args.owner.userId,
          threadId: args.threadId,
          state: "idle",
          selectedPropertyId: undefined,
          lastResultPropertyIds: [],
          comparisonPropertyIds: undefined,
          lastComparisonArtifactId: undefined,
          lastSearchQuery: undefined,
          qualification: resolvedQualification,
        },
      );
    }

    return {
      message: args.assistantText.trim() || args.message,
      properties: [],
      cards: [],
      suggestedPrompts: [],
      requiresAuthForHandoff: false,
      buyerContext: {
        state: args.startFresh ? "idle" : currentState?.state ?? "idle",
        selectedPropertyId: args.startFresh ? undefined : currentState?.selectedPropertyId,
        lastResultPropertyIds: args.startFresh ? [] : currentState?.lastResultPropertyIds ?? [],
        comparisonPropertyIds: undefined,
        lastComparisonArtifactId: undefined,
        lastSearchQuery: args.startFresh ? undefined : currentState?.lastSearchQuery,
        qualification: resolvedQualification,
        memorySummary: buyerContext.memory.summary,
        activePropertySummary: buyerContext.summaries.activePropertySummary,
        searchSummary: buyerContext.summaries.searchJourneySummary,
        financeQualificationSummary:
          buyerContext.summaries.financeQualificationSummary,
        promptBudgetMeta: args.promptBudgetMeta,
      },
    };
  }

  const focusedProperty = await loadProperty(args.ctx, propertyFocusId);

  if (focusedProperty) {
    const cards = await buildCardsForProperty({
      ctx: args.ctx,
      locale: args.locale,
      message: normalizedMessage,
      property: focusedProperty,
      qualification: resolvedQualification,
    });

    const nextState =
      cards.some((card) => card.type === "broker_handoff")
        ? "handoff_ready"
        : "property_selected";

    await rememberBuyerSignal({
      ctx: args.ctx,
      owner: args.owner,
      threadId: args.threadId,
      message: normalizedMessage,
      property: focusedProperty,
      qualification: resolvedQualification,
    });

    await args.ctx.runMutation(
      internal.shared_logic.buyerContext.upsertBuyerChannelStateInternal,
      {
        channel: args.channel,
        userId: args.owner.userId,
        threadId: args.threadId,
        state: nextState,
        selectedPropertyId: focusedProperty.id,
        lastResultPropertyIds:
          currentState?.lastResultPropertyIds?.length
            ? currentState.lastResultPropertyIds
            : [focusedProperty.id],
        comparisonPropertyIds: undefined,
        lastComparisonArtifactId: undefined,
        lastSearchQuery: currentState?.lastSearchQuery,
        qualification: resolvedQualification,
      },
    );

    await persistBuyerPropertyRefs({
      ctx: args.ctx,
      owner: args.owner,
      threadId: args.threadId,
      channel: args.channel,
      properties: [focusedProperty],
      activePropertyId: focusedProperty.id,
    });

    const refreshedBuyerContext = (await args.ctx.runQuery(
      internal.shared_logic.buyerContext.getBuyerContextInternal,
      {
        channel: args.channel,
        userId: args.owner.userId,
      },
    )) as BuyerContext;

    return {
      message: args.assistantText,
      properties: [focusedProperty],
      cards,
      suggestedPrompts: buildSearchPrompts(args.locale, focusedProperty),
      activePropertyId: focusedProperty.id,
      requiresAuthForHandoff: cards.some((card) => card.type === "broker_handoff"),
      buyerContext: {
        state: nextState,
        selectedPropertyId: focusedProperty.id,
        lastResultPropertyIds:
          refreshedBuyerContext.state?.lastResultPropertyIds ??
          (currentState?.lastResultPropertyIds?.length
            ? currentState.lastResultPropertyIds
            : [focusedProperty.id]),
        comparisonPropertyIds: refreshedBuyerContext.state?.comparisonPropertyIds,
        lastComparisonArtifactId: refreshedBuyerContext.state?.lastComparisonArtifactId,
        lastSearchQuery: refreshedBuyerContext.state?.lastSearchQuery ?? currentState?.lastSearchQuery,
        qualification: resolvedQualification,
        memorySummary: refreshedBuyerContext.memory.summary,
        activePropertySummary: refreshedBuyerContext.summaries.activePropertySummary,
        searchSummary: refreshedBuyerContext.summaries.searchJourneySummary,
        financeQualificationSummary:
          refreshedBuyerContext.summaries.financeQualificationSummary,
        promptBudgetMeta: args.promptBudgetMeta,
      },
    };
  }

  const effectiveQuery =
    moreResults && currentState?.lastSearchQuery
      ? currentState.lastSearchQuery
      : args.message;
  const diversifiedResults = await runDiversifiedSearch({
    ctx: args.ctx,
    query: effectiveQuery,
    excludePropertyIds: moreResults ? (currentState?.lastResultPropertyIds ?? []) : [],
    limit: 4,
  });

  const properties =
    diversifiedResults.properties.length > 0
      ? diversifiedResults.properties
      : await listFallbackProperties(args.ctx, 4);

  const activeProperty = properties[0] ?? null;
  const cards = activeProperty
    ? (await buildCardsForProperty({
        ctx: args.ctx,
        locale: args.locale,
        message: normalizedMessage,
        property: activeProperty,
        qualification: resolvedQualification,
      })).filter((card) =>
        explicitSearch || moreResults
          ? card.type === "broker_handoff"
          : true,
      )
    : [];

  await rememberBuyerSignal({
    ctx: args.ctx,
    owner: args.owner,
    threadId: args.threadId,
    message: normalizedMessage,
    property: activeProperty,
    qualification: resolvedQualification,
    searchQuery: effectiveQuery,
    findingsCount: properties.length,
  });

  await args.ctx.runMutation(
    internal.shared_logic.buyerContext.upsertBuyerChannelStateInternal,
    {
      channel: args.channel,
      userId: args.owner.userId,
      threadId: args.threadId,
      state: cards.some((card) => card.type === "broker_handoff")
        ? "handoff_ready"
        : activeProperty
          ? "search_results"
          : "idle",
      selectedPropertyId: activeProperty?.id,
      lastResultPropertyIds: properties.map((property) => property.id),
      comparisonPropertyIds: undefined,
      lastComparisonArtifactId: undefined,
      lastSearchQuery: effectiveQuery,
      qualification: resolvedQualification,
    },
  );

  await persistBuyerPropertyRefs({
    ctx: args.ctx,
    owner: args.owner,
    threadId: args.threadId,
    channel: args.channel,
    properties,
    activePropertyId: activeProperty?.id,
  });

  const refreshedBuyerContext = (await args.ctx.runQuery(
    internal.shared_logic.buyerContext.getBuyerContextInternal,
    {
      channel: args.channel,
      userId: args.owner.userId,
    },
  )) as BuyerContext;

  return {
    message:
      args.assistantText.trim() ||
      buildPropertySearchMessage(
        args.locale,
        properties.length,
        diversifiedResults.diversified,
      ),
    properties,
    cards,
    suggestedPrompts: buildSearchPrompts(args.locale, activeProperty),
    activePropertyId: activeProperty?.id,
    requiresAuthForHandoff: cards.some((card) => card.type === "broker_handoff"),
    buyerContext: {
      state: cards.some((card) => card.type === "broker_handoff")
        ? "handoff_ready"
        : activeProperty
          ? "search_results"
          : "idle",
      selectedPropertyId: activeProperty?.id,
      lastResultPropertyIds:
        refreshedBuyerContext.state?.lastResultPropertyIds ?? properties.map((property) => property.id),
      comparisonPropertyIds: refreshedBuyerContext.state?.comparisonPropertyIds,
      lastComparisonArtifactId: refreshedBuyerContext.state?.lastComparisonArtifactId,
      lastSearchQuery: refreshedBuyerContext.state?.lastSearchQuery ?? effectiveQuery,
      qualification: resolvedQualification,
      memorySummary: refreshedBuyerContext.memory.summary,
      activePropertySummary: refreshedBuyerContext.summaries.activePropertySummary,
      searchSummary: refreshedBuyerContext.summaries.searchJourneySummary,
      financeQualificationSummary:
        refreshedBuyerContext.summaries.financeQualificationSummary,
      promptBudgetMeta: args.promptBudgetMeta,
    },
  };
}
