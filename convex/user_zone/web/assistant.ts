import { getAuthUserId } from "../../_core/security/authIdentity";
import { type Infer, v } from "convex/values";
import { action } from "../../_generated/server";
import { api, internal } from "../../_generated/api";
import {
  clientWebAssistantResponseValidator,
  clientWebLocaleValidator,
  mobileQualificationContextValidator,
  mobilePropertyFeedItemValidator,
} from "./contracts";

type PropertyFeedItem = Infer<typeof mobilePropertyFeedItemValidator>;
type AssistantCard = Infer<typeof clientWebAssistantResponseValidator>["cards"][number];
type SupportedLocale = Infer<typeof clientWebLocaleValidator>;

const SEARCH_KEYWORDS = ["search", "find", "apartment", "property", "house", "home", "ابحث", "أبحث", "شقة", "عقار", "وحدة"];
const FINANCE_KEYWORDS = ["loan", "mortgage", "afford", "finance", "payment", "eligibility", "تمويل", "قرض", "راتب", "أهلية", "قسط"];
const ROI_KEYWORDS = ["roi", "yield", "investment", "return", "عائد", "استثمار"];
const COMPARE_KEYWORDS = ["compare", "comparison", "قارن", "مقارنة"];
const PERMIT_KEYWORDS = ["permit", "legal", "license", "تصريح", "رخصة", "قانون"];
const HANDOFF_KEYWORDS = ["advisor", "handoff", "book", "visit", "call", "contact", "مستشار", "زيارة", "احجز", "تواصل"];
const BROKER_KEYWORDS = ["broker", "advisor", "agent", "وسيط", "مستشار"];
const DEVELOPER_KEYWORDS = ["developer", "company", "develop", "مطور", "شركة", "المطور"];
const EXPLICIT_SEARCH_KEYWORDS = ["search", "find", "show me", "browse", "ابحث", "أبحث", "اعرض", "دور"];

function includesIntent(message: string, keywords: string[]) {
  return keywords.some((keyword) => message.includes(keyword));
}

function isExplicitSearchIntent(message: string) {
  return includesIntent(message, EXPLICIT_SEARCH_KEYWORDS);
}

function formatCurrency(value: number, locale: SupportedLocale) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(value);
}

function buildPropertySearchMessage(locale: SupportedLocale, count: number) {
  if (locale === "fr") {
    return count > 0
      ? `J'ai trouvé ${count} options qui correspondent à cette demande. Ouvrez un bien pour continuer avec le financement, le rendement ou le transfert vers un conseiller.`
      : "Je n'ai pas trouvé de correspondance directe, j'ai donc préparé les options vérifiées les plus proches pour continuer.";
  }
  if (locale === "en") {
    return count > 0
      ? `I found ${count} options that fit this request. Open any property to continue with financing, ROI, or advisor handoff.`
      : "I could not find a direct match, so I prepared the closest verified options to continue from.";
  }
  return count > 0
    ? `حضرت لك ${count} خيارات مناسبة لهذا الطلب. افتح أي عقار لنكمل التمويل أو العائد أو طلب المستشار.`
    : "لم أجد تطابقاً مباشراً، لذلك جهزت أقرب الخيارات الموثقة لتبدأ منها.";
}

function buildSearchPrompts(locale: SupportedLocale) {
  if (locale === "fr") {
    return [
      "Montre-moi des appartements à Riyad",
      "Vérifie mon éligibilité au financement",
      "Compare les deux meilleures options",
      "Mets-moi en relation avec un conseiller",
    ];
  }
  return locale === "en"
    ? [
        "Show me apartments in Riyadh",
        "Check mortgage eligibility",
        "Compare the best two options",
        "Connect me to an advisor",
      ]
    : [
        "اعرض شقق في الرياض",
        "افحص أهلية التمويل",
        "قارن أفضل خيارين",
        "وصّلني بمستشار",
    ];
}

function describeFailure(error: unknown) {
  if (error instanceof Error && error.message.trim()) return error.message;
  return "unknown_failure";
}

async function captureAssistantAnalytics(
  ctx: Parameters<typeof action>[0] extends never ? never : any,
  args: {
    event: string;
    authUserId?: string | null;
    threadId?: string;
    properties: Record<string, unknown>;
  },
) {
  try {
    await ctx.runAction((internal as any)["shared_logic/analytics/posthog"].captureEvent, {
      event: args.event,
      distinctId: args.authUserId?.trim() || (args.threadId?.trim() ? `thread:${args.threadId.trim()}` : undefined),
      properties: args.properties,
    });
  } catch (error) {
    console.warn("[client assistant analytics] capture failed (non-critical):", error);
  }
}

function buildMortgageCard(locale: SupportedLocale, salary?: number, priceHint?: number): AssistantCard {
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

function buildPaymentPlanCard(locale: SupportedLocale, property: PropertyFeedItem, downPayment?: number): AssistantCard {
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
    : locale === "fr"
      ? {
          type: "payment_plan",
          title: "Plan de paiement initial",
          downPayment: resolvedDownPayment,
          monthlyInstallment,
          durationMonths,
          summary: `Avec un apport de ${formatCurrency(resolvedDownPayment, locale)}, le reste peut être réparti sur ${durationMonths} mois pour environ ${formatCurrency(monthlyInstallment, locale)} par mois.`,
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

function buildLoanCalculatorCard(
  locale: SupportedLocale,
  property: PropertyFeedItem,
  params: { downPayment?: number; interestRate?: number; years?: number },
): AssistantCard {
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

function buildRoiCard(locale: SupportedLocale, property: PropertyFeedItem): AssistantCard {
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

function buildComparisonCard(locale: SupportedLocale, property: PropertyFeedItem): AssistantCard {
  return locale === "en"
    ? {
        type: "comparison_table",
        title: "Quick comparison baseline",
        columns: ["Metric", "Value"],
        rows: [
          ["Price", formatCurrency(property.price, locale)],
          ["Area", property.area ?? property.location ?? "Not specified"],
          ["Bedrooms", String(property.beds)],
          ["Bathrooms", String(property.baths)],
        ],
        summary: "This gives you the core decision inputs before comparing it with another option.",
      }
    : locale === "fr"
      ? {
          type: "comparison_table",
          title: "Base de comparaison rapide",
          columns: ["Indicateur", "Valeur"],
          rows: [
            ["Prix", formatCurrency(property.price, locale)],
            ["Zone", property.area ?? property.location ?? "Non précisée"],
            ["Chambres", String(property.beds)],
            ["Salles de bain", String(property.baths)],
          ],
          summary: "Cela vous donne les éléments clés avant une comparaison avec une autre option.",
        }
      : {
        type: "comparison_table",
        title: "مقارنة سريعة",
        columns: ["البند", "القيمة"],
        rows: [
          ["السعر", formatCurrency(property.price, locale)],
          ["المنطقة", property.area ?? property.location ?? "غير محدد"],
          ["غرف النوم", String(property.beds)],
          ["الحمامات", String(property.baths)],
        ],
        summary: "هذا الجدول يلخص أهم عناصر القرار قبل فتح مقارنة أوسع مع خيار آخر.",
      };
}

function buildPermitCard(locale: SupportedLocale, property: PropertyFeedItem): AssistantCard {
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

function buildHandoffCard(locale: SupportedLocale): AssistantCard {
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
          summary: "La demande est prête pour un transfert vers un conseiller dès que vous vous connectez et confirmez vos coordonnées.",
        }
      : {
        type: "broker_handoff",
        title: "تحويل إلى مستشار",
        handoffStatus: "qualified",
        summary: "الطلب جاهز للتحويل إلى مستشار بمجرد تسجيل الدخول وتأكيد بيانات التواصل.",
      };
}

function buildBrokerProfileCard(locale: SupportedLocale, property: PropertyFeedItem): AssistantCard | null {
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
          summary: property.owner.description ?? "Ce conseiller vérifié peut poursuivre la discussion et les prochaines étapes.",
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

function buildDeveloperProfileCard(locale: SupportedLocale, property: PropertyFeedItem): AssistantCard | null {
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
  ctx: any,
  locale: SupportedLocale,
  property: PropertyFeedItem,
  qualification?: Infer<typeof mobileQualificationContextValidator>,
): Promise<AssistantCard[]> {
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
    }) as Extract<AssistantCard, { type: "loan_calculator" }>;

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

function extractSalary(message: string) {
  const match = message.match(/\d[\d,.]*/);
  if (!match) return undefined;
  return Number(match[0].replace(/[^\d]/g, ""));
}

function buildAssistantMessage(locale: SupportedLocale, propertyTitle: string, cardsCount: number) {
  if (locale === "fr") {
    return `J'ai analysé ${propertyTitle} et préparé ${cardsCount} carte${cardsCount === 1 ? "" : "s"} d'aide à la décision pour vous.`;
  }
  if (locale === "en") {
    return `I reviewed ${propertyTitle} and prepared ${cardsCount} decision card${cardsCount === 1 ? "" : "s"} for you.`;
  }
  return `حللت ${propertyTitle} وأعددت لك ${cardsCount === 1 ? "بطاقة" : `${cardsCount} بطاقات`} تساعدك على القرار.`;
}

async function buildCardsForProperty(params: {
  ctx: any;
  locale: SupportedLocale;
  message: string;
  property: PropertyFeedItem;
  qualification?: Infer<typeof mobileQualificationContextValidator>;
}): Promise<AssistantCard[]> {
  const { ctx, locale, message, property, qualification } = params;
  const normalizedMessage = message.toLowerCase();
  const salary = qualification?.monthlySalary ?? extractSalary(normalizedMessage);
  const cards: AssistantCard[] = [];

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
  if (includesIntent(normalizedMessage, COMPARE_KEYWORDS)) cards.push(buildComparisonCard(locale, property));
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

/**
 * WHY:   The client web app needs a deterministic assistant that works over public property data before full LLM chat lands.
 * WHAT:  Returns structured assistant text, property results, and typed cards for buyer discovery and financing flows.
 * HOW:   Combines live property search with property-aware deterministic card generation and bilingual summaries.
 */
export const askClientAssistant = action({
  args: {
    message: v.string(),
    threadId: v.optional(v.id("assistantThreads")),
    selectedPropertyId: v.optional(v.id("properties")),
    inputMode: v.optional(v.union(v.literal("text"), v.literal("voice"))),
    locale: v.optional(clientWebLocaleValidator),
    qualification: v.optional(mobileQualificationContextValidator),
  },
  returns: clientWebAssistantResponseValidator,
  handler: async (ctx, args): Promise<Infer<typeof clientWebAssistantResponseValidator>> => {
    const authUserId = await getAuthUserId(ctx);
    const locale = args.locale ?? "ar";
    const trimmedMessage = args.message.trim();
    const normalizedMessage = trimmedMessage.toLowerCase();
    const startedAt = Date.now();

    await captureAssistantAnalytics(ctx, {
      event: "assistant_action_started",
      authUserId,
      threadId: args.threadId ? String(args.threadId) : undefined,
      properties: {
        channel: "web",
        locale,
        messageLength: trimmedMessage.length,
        selectedPropertyId: args.selectedPropertyId ? String(args.selectedPropertyId) : undefined,
        source: "user_zone.web.assistant",
        status: "started",
        threadId: args.threadId ? String(args.threadId) : undefined,
        userId: authUserId ?? undefined,
      },
    });

    try {
      const selectedProperty = args.selectedPropertyId
        ? await ctx.runQuery((api as any)["user_zone/web/properties"].getPropertyDetail, { propertyId: args.selectedPropertyId })
        : null;

      if (selectedProperty && !isExplicitSearchIntent(normalizedMessage)) {
        const cards = await buildCardsForProperty({
          ctx,
          locale,
          message: normalizedMessage,
          property: selectedProperty,
          qualification: args.qualification,
        });
        const response = {
          message: buildAssistantMessage(locale, selectedProperty.title, cards.length),
          properties: [selectedProperty],
          cards,
          suggestedPrompts: buildSearchPrompts(locale),
          activePropertyId: selectedProperty.id,
          requiresAuthForHandoff: cards.some((card) => card.type === "broker_handoff"),
          threadId: undefined,
        };
        if (authUserId) {
          const saved = await ctx.runMutation((internal as any)["user_zone/web/threads"].persistClientConversationTurn, {
            threadId: args.threadId,
            userId: authUserId,
            userMessage: trimmedMessage,
            userMessageMetadata: {
              inputMode: args.inputMode,
              locale,
              selectedPropertyId: args.selectedPropertyId,
            },
            assistantMessage: response.message,
            assistantMetadata: {
              properties: response.properties,
              cards: response.cards,
              suggestedPrompts: response.suggestedPrompts,
              activePropertyId: response.activePropertyId,
              requiresAuthForHandoff: response.requiresAuthForHandoff,
            },
          });
          response.threadId = saved.threadId;
        }

        await captureAssistantAnalytics(ctx, {
          event: "assistant_action_completed",
          authUserId,
          threadId: response.threadId ? String(response.threadId) : args.threadId ? String(args.threadId) : undefined,
          properties: {
            activePropertyId: String(response.activePropertyId),
            cardTypes: response.cards.map((card) => card.type),
            channel: "web",
            durationMs: Date.now() - startedAt,
            locale,
            propertyCount: response.properties.length,
            requiresAuthForHandoff: response.requiresAuthForHandoff,
            source: "user_zone.web.assistant",
            status: "completed",
            threadId: response.threadId ? String(response.threadId) : args.threadId ? String(args.threadId) : undefined,
            userId: authUserId ?? undefined,
            inputMode: args.inputMode ?? "text",
          },
        });

        return response;
      }

      const propertySearchResults = await ctx.runQuery((api as any)["shared_logic/properties/search"].search, {
        query: args.message,
        limit: 4,
        onlyAvailable: true,
      });
      const mappedProperties = await ctx.runQuery(
        (api as any)["user_zone/web/properties"].searchAssistantFeedItems,
        {
          query: args.message,
          limit: 4,
        },
      ) as PropertyFeedItem[];

      const properties = mappedProperties;

      const activeProperty = properties[0];
      const cards = activeProperty
        ? (await buildCardsForProperty({
            ctx,
            locale,
            message: normalizedMessage,
            property: activeProperty,
            qualification: args.qualification,
          })).filter((card) =>
            isExplicitSearchIntent(normalizedMessage)
              ? card.type === "broker_handoff"
              : true,
          )
        : [];

      const response = {
        message: buildPropertySearchMessage(
          locale,
          (propertySearchResults as Array<unknown>).length,
        ),
        properties,
        cards,
        suggestedPrompts: buildSearchPrompts(locale),
        activePropertyId: activeProperty?.id,
        requiresAuthForHandoff: cards.some((card) => card.type === "broker_handoff"),
        threadId: undefined,
      };
      if (authUserId) {
        const saved = await ctx.runMutation((internal as any)["user_zone/web/threads"].persistClientConversationTurn, {
          threadId: args.threadId,
          userId: authUserId,
          userMessage: trimmedMessage,
            userMessageMetadata: {
              inputMode: args.inputMode,
              locale,
              selectedPropertyId: args.selectedPropertyId,
            },
          assistantMessage: response.message,
          assistantMetadata: {
            properties: response.properties,
            cards: response.cards,
            suggestedPrompts: response.suggestedPrompts,
            activePropertyId: response.activePropertyId,
            requiresAuthForHandoff: response.requiresAuthForHandoff,
          },
        });
        response.threadId = saved.threadId;
      }

      await captureAssistantAnalytics(ctx, {
        event: "assistant_action_completed",
        authUserId,
        threadId: response.threadId ? String(response.threadId) : args.threadId ? String(args.threadId) : undefined,
        properties: {
          activePropertyId: response.activePropertyId ? String(response.activePropertyId) : undefined,
          cardTypes: response.cards.map((card) => card.type),
          channel: "web",
          durationMs: Date.now() - startedAt,
          locale,
          propertyCount: response.properties.length,
          requiresAuthForHandoff: response.requiresAuthForHandoff,
            source: "user_zone.web.assistant",
            status: "completed",
            threadId: response.threadId ? String(response.threadId) : args.threadId ? String(args.threadId) : undefined,
            inputMode: args.inputMode ?? "text",
            userId: authUserId ?? undefined,
          },
        });

      return response;
    } catch (error) {
      await captureAssistantAnalytics(ctx, {
        event: "assistant_action_failed",
        authUserId,
        threadId: args.threadId ? String(args.threadId) : undefined,
        properties: {
          channel: "web",
          durationMs: Date.now() - startedAt,
          failureCode: describeFailure(error),
          locale,
          selectedPropertyId: args.selectedPropertyId ? String(args.selectedPropertyId) : undefined,
          source: "user_zone.web.assistant",
          status: "failed",
          threadId: args.threadId ? String(args.threadId) : undefined,
          userId: authUserId ?? undefined,
        },
      });
      throw error;
    }
  },
});
