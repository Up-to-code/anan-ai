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

function includesIntent(message: string, keywords: string[]) {
  return keywords.some((keyword) => message.includes(keyword));
}

function formatCurrency(value: number, locale: SupportedLocale) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(value);
}

function buildPropertySearchMessage(locale: SupportedLocale, count: number) {
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

function buildMortgageCard(locale: SupportedLocale, salary?: number, priceHint?: number): AssistantCard {
  const estimatedEligibility =
    salary === undefined ? "insufficient_data" : salary >= 12000 ? "eligible" : salary >= 8000 ? "review" : "insufficient_data";
  const recommendedBudget = salary ? salary * 55 : priceHint;
  const monthlyInstallmentEstimate = recommendedBudget ? Math.round(recommendedBudget / (20 * 12)) : undefined;

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
    : {
        type: "payment_plan",
        title: "خطة السداد المبدئية",
        downPayment: resolvedDownPayment,
        monthlyInstallment,
        durationMonths,
        summary: `بدفعة أولى ${formatCurrency(resolvedDownPayment, locale)} يمكن توزيع الباقي على ${durationMonths} شهر بقسط تقريبي ${formatCurrency(monthlyInstallment, locale)}.`,
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
    : {
        type: "broker_handoff",
        title: "تحويل إلى مستشار",
        handoffStatus: "qualified",
        summary: "الطلب جاهز للتحويل إلى مستشار بمجرد تسجيل الدخول وتأكيد بيانات التواصل.",
      };
}

function extractSalary(message: string) {
  const match = message.match(/\d[\d,.]*/);
  if (!match) return undefined;
  return Number(match[0].replace(/[^\d]/g, ""));
}

function buildAssistantMessage(locale: SupportedLocale, propertyTitle: string, cardsCount: number) {
  if (locale === "en") {
    return `I reviewed ${propertyTitle} and prepared ${cardsCount} decision card${cardsCount === 1 ? "" : "s"} for you.`;
  }
  return `حللت ${propertyTitle} وأعددت لك ${cardsCount === 1 ? "بطاقة" : `${cardsCount} بطاقات`} تساعدك على القرار.`;
}

function buildCardsForProperty(params: {
  locale: SupportedLocale;
  message: string;
  property: PropertyFeedItem;
  qualification?: Infer<typeof mobileQualificationContextValidator>;
}): AssistantCard[] {
  const { locale, message, property, qualification } = params;
  const normalizedMessage = message.toLowerCase();
  const salary = qualification?.monthlySalary ?? extractSalary(normalizedMessage);
  const cards: AssistantCard[] = [];

  if (includesIntent(normalizedMessage, ROI_KEYWORDS)) cards.push(buildRoiCard(locale, property));
  if (includesIntent(normalizedMessage, FINANCE_KEYWORDS)) {
    cards.push(buildMortgageCard(locale, salary, property.price));
    cards.push(buildPaymentPlanCard(locale, property, qualification?.downPayment));
  }
  if (includesIntent(normalizedMessage, COMPARE_KEYWORDS)) cards.push(buildComparisonCard(locale, property));
  if (includesIntent(normalizedMessage, PERMIT_KEYWORDS)) cards.push(buildPermitCard(locale, property));
  if (includesIntent(normalizedMessage, HANDOFF_KEYWORDS)) cards.push(buildHandoffCard(locale));

  if (cards.length === 0) {
    cards.push(buildPaymentPlanCard(locale, property, qualification?.downPayment));
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
    selectedPropertyId: v.optional(v.id("properties")),
    locale: v.optional(clientWebLocaleValidator),
    qualification: v.optional(mobileQualificationContextValidator),
  },
  returns: clientWebAssistantResponseValidator,
  handler: async (ctx, args): Promise<Infer<typeof clientWebAssistantResponseValidator>> => {
    const locale = args.locale ?? "ar";
    const normalizedMessage = args.message.trim().toLowerCase();

    const selectedProperty = args.selectedPropertyId
      ? await ctx.runQuery((api as any)["user_zone/web/properties"].getPropertyDetail, { propertyId: args.selectedPropertyId })
      : null;

    if (selectedProperty && !includesIntent(normalizedMessage, SEARCH_KEYWORDS)) {
      const cards = buildCardsForProperty({
        locale,
        message: normalizedMessage,
        property: selectedProperty,
        qualification: args.qualification,
      });
      return {
        message: buildAssistantMessage(locale, selectedProperty.title, cards.length),
        properties: [selectedProperty],
        cards,
        suggestedPrompts: buildSearchPrompts(locale),
        activePropertyId: selectedProperty.id,
        requiresAuthForHandoff: cards.some((card) => card.type === "broker_handoff"),
      };
    }

    const propertySearchResults = await ctx.runQuery((api as any)["shared_logic/properties/search"].search, {
      query: args.message,
      limit: 4,
      onlyAvailable: true,
    });

    const mappedProperties = (
      await Promise.all(
        propertySearchResults.map((result: { _id: string }) =>
          ctx.runQuery((api as any)["user_zone/web/properties"].getPropertyDetail, { propertyId: result._id }),
        ),
      )
    ).filter(Boolean) as PropertyFeedItem[];

    const properties = mappedProperties.length > 0
      ? mappedProperties
      : (
          await ctx.runQuery((api as any)["user_zone/mobile/feed"].listFeed, {
            paginationOpts: { numItems: 4, cursor: null },
          })
        ).page;

    const activeProperty = properties[0];
    const cards = activeProperty
      ? buildCardsForProperty({
          locale,
          message: normalizedMessage,
          property: activeProperty,
          qualification: args.qualification,
        }).filter((card) =>
          includesIntent(normalizedMessage, SEARCH_KEYWORDS)
            ? card.type === "broker_handoff"
            : true,
        )
      : [];

    return {
      message: buildPropertySearchMessage(locale, mappedProperties.length),
      properties,
      cards,
      suggestedPrompts: buildSearchPrompts(locale),
      activePropertyId: activeProperty?.id,
      requiresAuthForHandoff: cards.some((card) => card.type === "broker_handoff"),
    };
  },
});
