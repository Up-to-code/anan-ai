import { getAuthUserId } from "../../_core/security/authIdentity";
import { ConvexError, type Infer, v } from "convex/values";
import { action, mutation } from "../../_generated/server";
import { internal } from "../../_generated/api";
import {
  mobileAssistantResponseValidator,
  mobileQualificationContextValidator,
} from "./contracts";

function describeFailure(error: unknown) {
  if (error instanceof Error && error.message.trim()) return error.message;
  return "unknown_failure";
}

/**
 * WHY:   The mobile feed needs a property-aware assistant that returns UI cards rather than plain chat prose.
 * WHAT:  Generates a typed assistant response for ROI, payment plans, mortgage checks, permits, or comparisons.
 * HOW:   Reads property context from the mobile feed query and selects a deterministic card set based on message intent.
 */
export const askPropertyAssistant = action({
  args: {
    propertyId: v.id("properties"),
    message: v.string(),
    qualification: v.optional(mobileQualificationContextValidator),
  },
  returns: mobileAssistantResponseValidator,
  handler: async (ctx, args): Promise<Infer<typeof mobileAssistantResponseValidator>> => {
    const property = await ctx.runQuery(internal.user_zone.mobile.feed.getPropertyContext as any, {
      propertyId: args.propertyId,
    });
    if (!property) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Property not found for mobile assistant" });
    }

    return buildAssistantResponse({
      property,
      message: args.message,
      qualification: args.qualification,
    });
  },
});

/**
 * WHY:   Verified mobile leads should land in the existing CRM/orders pipeline instead of a parallel table.
 * WHAT:  Creates an AI-qualified property order from the active feed conversation.
 * HOW:   Uses the authenticated auth user when available and falls back to a caller-provided external user id.
 */
export const createQualifiedHandoff = mutation({
  args: {
    propertyId: v.id("properties"),
    message: v.string(),
    qualification: v.optional(mobileQualificationContextValidator),
    externalUserId: v.optional(v.string()),
    threadId: v.optional(v.string()),
    sourceChannel: v.optional(v.union(v.literal("app"), v.literal("web"))),
  },
  returns: v.object({
    orderId: v.id("orders"),
    status: v.literal("qualified"),
  }),
  handler: async (ctx, args) => {
    const fallbackDistinctId = args.threadId?.trim()
      ? `thread:${args.threadId.trim()}`
      : `property:${String(args.propertyId)}`;

    try {
      const property = await ctx.db.get(args.propertyId);
      if (!property) {
        throw new ConvexError({ code: "NOT_FOUND", message: "Property not found for qualified handoff" });
      }

      const authUserId = await getAuthUserId(ctx);
      const userId = authUserId ?? args.externalUserId;
      if (!userId) {
        throw new ConvexError({ code: "UNAUTHORIZED", message: "A user id is required for qualified handoff" });
      }

      const orderId = await ctx.db.insert("orders", {
        userId,
        type: "property",
        status: "qualified",
        propertyId: args.propertyId,
        REDId: property.REDId,
        intent: "mobile_ai_handoff",
        notes: buildQualificationNotes(args.message, args.qualification, property.title),
        assignedTo: property.brokerId ? `broker:${String(property.brokerId)}` : undefined,
        threadId: args.threadId,
        sourceChannel: args.sourceChannel ?? "app",
      });

      await ctx.scheduler.runAfter(
        0,
        (internal as any)["shared_logic/analytics/posthog"].captureEvent,
        {
          event: "qualified_order_created",
          distinctId: userId ?? fallbackDistinctId,
          properties: {
            orderId: String(orderId),
            propertyId: String(args.propertyId),
            sourceChannel: args.sourceChannel ?? "app",
            status: "qualified",
            threadId: args.threadId,
            userId,
          },
        },
      );

      return {
        orderId,
        status: "qualified" as const,
      };
    } catch (error) {
      await ctx.scheduler.runAfter(
        0,
        (internal as any)["shared_logic/analytics/posthog"].captureEvent,
        {
          event: "qualified_handoff_failed",
          distinctId: args.externalUserId?.trim() || fallbackDistinctId,
          properties: {
            propertyId: String(args.propertyId),
            sourceChannel: args.sourceChannel ?? "app",
            status: "failed",
            threadId: args.threadId,
            failureCode: describeFailure(error),
            userId: args.externalUserId,
          },
        },
      );

      throw error;
    }
  },
});

type AssistantResponseParams = {
  property: {
    title: string;
    price: number;
    area?: string;
    location?: string;
    beds: number;
    baths: number;
    sqft?: number;
    status?: string;
    owner: { name: string; isVerified: boolean };
    finance?: { bankOfferCount?: number };
  };
  message: string;
  qualification?: {
    monthlySalary?: number;
    downPayment?: number;
    preferredYears?: number;
    employmentStatus?: string;
    notes?: string;
  };
};

function buildRoiCard(property: AssistantResponseParams["property"]) {
  const annualRent = Math.round(property.price * 0.08);
  const grossYieldPercent = Number(((annualRent / property.price) * 100).toFixed(1));
  return {
    type: "roi_summary" as const,
    title: "ملخص العائد الاستثماري",
    purchasePrice: property.price,
    estimatedAnnualRent: annualRent,
    grossYieldPercent,
    summary: `العائد الإجمالي التقديري يقارب ${grossYieldPercent}% لهذه الوحدة في ${property.area ?? property.location ?? "هذه المنطقة"}.`,
  };
}

function buildPaymentPlanCard(
  property: AssistantResponseParams["property"],
  qualification: AssistantResponseParams["qualification"] | undefined,
) {
  const downPayment = qualification?.downPayment ?? Math.round(property.price * 0.1);
  const durationMonths = (qualification?.preferredYears ?? 5) * 12;
  const monthlyInstallment = Math.round((property.price - downPayment) / durationMonths);
  return {
    type: "payment_plan" as const,
    title: "خطة السداد المبدئية",
    downPayment,
    monthlyInstallment,
    durationMonths,
    summary: `بدفعة أولى ${formatCurrency(downPayment)} يمكن توزيع الباقي على ${durationMonths} شهر بقسط تقريبي ${formatCurrency(monthlyInstallment)}.`,
  };
}

function resolveMortgageEligibility(monthlySalary: number | undefined) {
  if (monthlySalary === undefined) return "insufficient_data" as const;
  if (monthlySalary >= 12000) return "eligible" as const;
  if (monthlySalary >= 8000) return "review" as const;
  return "insufficient_data" as const;
}

function resolveMortgageSummary(eligible: "eligible" | "review" | "insufficient_data") {
  if (eligible === "eligible") {
    return "المؤشرات الأولية جيدة، ويمكن متابعة فحص البنك والتزاماتك الحالية.";
  }
  if (eligible === "review") {
    return "هناك فرصة للتمويل لكننا نحتاج التزاماتك الحالية والدفعة الأولى للتأكيد.";
  }
  return "نحتاج بيانات راتب أو دفعة أولى أو مدة تمويل لإعطاء تقدير موثوق.";
}

function buildMortgageCard(
  qualification: AssistantResponseParams["qualification"] | undefined,
) {
  const monthlySalary = qualification?.monthlySalary;
  const preferredYears = qualification?.preferredYears ?? 20;
  const estimatedBudget = monthlySalary ? monthlySalary * 55 : undefined;
  const monthlyInstallmentEstimate = estimatedBudget
    ? Math.round(estimatedBudget / (preferredYears * 12))
    : undefined;
  const estimatedEligibility = resolveMortgageEligibility(monthlySalary);
  return {
    type: "mortgage_check" as const,
    title: "فحص أهلية التمويل",
    estimatedEligibility,
    recommendedBudget: estimatedBudget,
    monthlyInstallmentEstimate,
    summary: resolveMortgageSummary(estimatedEligibility),
  };
}

function buildPermitCard(property: AssistantResponseParams["property"]) {
  return {
    type: "permit_status" as const,
    title: "حالة التصاريح",
    permitStatus: property.owner.isVerified ? ("verified" as const) : ("pending_review" as const),
    summary: property.owner.isVerified
      ? `المالك ${property.owner.name} موثق داخل عنان، لكن التحقق النهائي من التصاريح يحتاج مستندات المشروع الرسمية.`
      : "بيانات المشروع متاحة، لكن يلزم مراجعة المستندات النظامية قبل تأكيد التصاريح.",
  };
}

function buildComparisonCard(property: AssistantResponseParams["property"]) {
  return {
    type: "comparison_table" as const,
    title: "خط أساس للمقارنة",
    columns: ["البند", property.title],
    rows: [
      ["السعر", formatCurrency(property.price)],
      ["الموقع", property.area ?? property.location ?? "غير محدد"],
      ["غرف النوم", String(property.beds)],
      ["الحمامات", String(property.baths)],
      ["المساحة", property.sqft ? String(property.sqft) : "غير محدد"],
      ["الحالة", property.status ?? "متاح"],
      ["الشريك", property.owner.name],
      [
        "التمويل",
        property.finance?.bankOfferCount
          ? `${property.finance.bankOfferCount} عروض بنكية متاحة`
          : "لا توجد عروض بنكية ظاهرة",
      ],
    ],
    summary: "هذا الجدول يستخدم نفس عناصر القرار الأساسية حتى يصبح هذا العقار جاهزاً للمقارنة مع خيارات أخرى.",
  };
}

function buildFallbackCard(
  property: AssistantResponseParams["property"],
  qualification: AssistantResponseParams["qualification"] | undefined,
) {
  const downPayment = qualification?.downPayment ?? Math.round(property.price * 0.1);
  const durationMonths = 60;
  return {
    type: "payment_plan" as const,
    title: "نقطة بداية سريعة",
    downPayment,
    monthlyInstallment: Math.round((property.price - downPayment) / durationMonths),
    durationMonths,
    summary: "قدمت لك خطة أولية، ويمكنني بعدها حساب العائد أو فحص التمويل أو التحقق من التصاريح.",
  };
}

function buildIntentCards(
  property: AssistantResponseParams["property"],
  qualification: AssistantResponseParams["qualification"] | undefined,
  normalizedMessage: string,
) {
  const cards: any[] = [];
  if (matchesIntent(normalizedMessage, ["roi", "عائد", "استثمار", "yield"])) cards.push(buildRoiCard(property));
  if (matchesIntent(normalizedMessage, ["plan", "payment", "دفعة", "قسط", "سداد"])) cards.push(buildPaymentPlanCard(property, qualification));
  if (matchesIntent(normalizedMessage, ["afford", "mortgage", "qualif", "راتب", "تمويل", "أقدر"])) cards.push(buildMortgageCard(qualification));
  if (matchesIntent(normalizedMessage, ["permit", "legal", "تصريح", "رخص", "قانون"])) cards.push(buildPermitCard(property));
  if (matchesIntent(normalizedMessage, ["compare", "comparison", "قارن", "مقارنة"])) cards.push(buildComparisonCard(property));
  return cards;
}

function buildAssistantSummary(propertyTitle: string, cardsCount: number) {
  return `حللت ${propertyTitle} وأعددت لك ${cardsCount === 1 ? "بطاقة" : `${cardsCount} بطاقات`} مفيدة للقرار.`;
}

/**
 * WHY:   The MVP still needs reliable AI-like behavior before full LLM tool orchestration is wired.
 * WHAT:  Converts a mobile assistant request into typed cards and localized follow-up prompts.
 * HOW:   Uses keyword intent routing plus lightweight finance heuristics as a placeholder adapter.
 */
export function buildAssistantResponse({ property, message, qualification }: AssistantResponseParams) {
  const normalizedMessage = message.trim().toLowerCase();
  const intentCards = buildIntentCards(property, qualification, normalizedMessage);
  const cards = intentCards.length > 0 ? intentCards : [buildFallbackCard(property, qualification)];

  return {
    message: buildAssistantSummary(property.title, cards.length),
    cards,
    suggestedPrompts: [
      "احسب العائد الاستثماري",
      "اعرض خطة السداد",
      "هل راتبي يؤهلني؟",
      "تحقق من التصاريح",
    ],
  };
}

/**
 * WHY:   Order notes should preserve the AI qualification context for broker or developer follow-up.
 * WHAT:  Builds a single CRM note string from the mobile AI conversation.
 * HOW:   Concatenates structured qualification values into a compact readable summary.
 */
export function buildQualificationNotes(
  message: string,
  qualification: AssistantResponseParams["qualification"] | undefined,
  propertyTitle: string,
  channelLabel = "Mobile AI",
) {
  const chunks = [`${channelLabel} handoff for ${propertyTitle}`, `User request: ${message}`];
  if (qualification?.monthlySalary !== undefined) chunks.push(`Salary: ${qualification.monthlySalary}`);
  if (qualification?.downPayment !== undefined) chunks.push(`Down payment: ${qualification.downPayment}`);
  if (qualification?.preferredYears !== undefined) chunks.push(`Preferred years: ${qualification.preferredYears}`);
  if (qualification?.employmentStatus) chunks.push(`Employment: ${qualification.employmentStatus}`);
  if (qualification?.notes) chunks.push(`Qualification notes: ${qualification.notes}`);
  return chunks.join(" | ");
}

function matchesIntent(message: string, keywords: string[]) {
  return keywords.some((keyword) => message.includes(keyword));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(value);
}
