import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { action, mutation } from "../../_generated/server";
import { internalRefs } from "../../shared_logic/lib/generatedApiRefs";
import {
  mobileAssistantResponseValidator,
  mobileQualificationContextValidator,
} from "./contracts";

const mobileFeedInternal = internalRefs["user_zone/mobile/feed"];

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
  handler: async (ctx, args) => {
    const property = await ctx.runQuery(mobileFeedInternal.getPropertyContext, {
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
  },
  returns: v.object({
    orderId: v.id("orders"),
    status: v.literal("qualified"),
  }),
  handler: async (ctx, args) => {
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
      sourceChannel: "app",
    });

    return {
      orderId,
      status: "qualified" as const,
    };
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
    owner: { name: string; isVerified: boolean };
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

/**
 * WHY:   The MVP still needs reliable AI-like behavior before full LLM tool orchestration is wired.
 * WHAT:  Converts a mobile assistant request into typed cards and localized follow-up prompts.
 * HOW:   Uses keyword intent routing plus lightweight finance heuristics as a placeholder adapter.
 */
export function buildAssistantResponse({ property, message, qualification }: AssistantResponseParams) {
  const normalizedMessage = message.trim().toLowerCase();
  const cards: any[] = [];

  if (matchesIntent(normalizedMessage, ["roi", "عائد", "استثمار", "yield"])) {
    const annualRent = Math.round(property.price * 0.08);
    const grossYieldPercent = Number(((annualRent / property.price) * 100).toFixed(1));
    cards.push({
      type: "roi_summary" as const,
      title: "ملخص العائد الاستثماري",
      purchasePrice: property.price,
      estimatedAnnualRent: annualRent,
      grossYieldPercent,
      summary: `العائد الإجمالي التقديري يقارب ${grossYieldPercent}% لهذه الوحدة في ${property.area ?? property.location ?? "هذه المنطقة"}.`,
    });
  }

  if (matchesIntent(normalizedMessage, ["plan", "payment", "دفعة", "قسط", "سداد"])) {
    const downPayment = qualification?.downPayment ?? Math.round(property.price * 0.1);
    const durationMonths = (qualification?.preferredYears ?? 5) * 12;
    const monthlyInstallment = Math.round((property.price - downPayment) / durationMonths);
    cards.push({
      type: "payment_plan" as const,
      title: "خطة السداد المبدئية",
      downPayment,
      monthlyInstallment,
      durationMonths,
      summary: `بدفعة أولى ${formatCurrency(downPayment)} يمكن توزيع الباقي على ${durationMonths} شهر بقسط تقريبي ${formatCurrency(monthlyInstallment)}.`,
    });
  }

  if (matchesIntent(normalizedMessage, ["afford", "mortgage", "qualif", "راتب", "تمويل", "أقدر"])) {
    const monthlySalary = qualification?.monthlySalary;
    const preferredYears = qualification?.preferredYears ?? 20;
    const estimatedBudget = monthlySalary ? monthlySalary * 55 : undefined;
    const monthlyInstallmentEstimate = estimatedBudget ? Math.round(estimatedBudget / (preferredYears * 12)) : undefined;
    const eligible: "eligible" | "review" | "insufficient_data" =
      monthlySalary === undefined
        ? "insufficient_data"
        : monthlySalary >= 12000
          ? "eligible"
          : monthlySalary >= 8000
            ? "review"
            : "insufficient_data";
    cards.push({
      type: "mortgage_check" as const,
      title: "فحص أهلية التمويل",
      estimatedEligibility: eligible,
      recommendedBudget: estimatedBudget,
      monthlyInstallmentEstimate,
      summary:
        eligible === "eligible"
          ? "المؤشرات الأولية جيدة، ويمكن متابعة فحص البنك والتزاماتك الحالية."
          : eligible === "review"
            ? "هناك فرصة للتمويل لكننا نحتاج التزاماتك الحالية والدفعة الأولى للتأكيد."
            : "نحتاج بيانات راتب أو دفعة أولى أو مدة تمويل لإعطاء تقدير موثوق.",
    });
  }

  if (matchesIntent(normalizedMessage, ["permit", "legal", "تصريح", "رخص", "قانون"])) {
    cards.push({
      type: "permit_status" as const,
      title: "حالة التصاريح",
      permitStatus: property.owner.isVerified ? ("verified" as const) : ("pending_review" as const),
      summary: property.owner.isVerified
        ? `المالك ${property.owner.name} موثق داخل أنان، لكن التحقق النهائي من التصاريح يحتاج مستندات المشروع الرسمية.`
        : "بيانات المشروع متاحة، لكن يلزم مراجعة المستندات النظامية قبل تأكيد التصاريح.",
    });
  }

  if (matchesIntent(normalizedMessage, ["compare", "comparison", "قارن", "مقارنة"])) {
    cards.push({
      type: "comparison_table" as const,
      title: "مقارنة سريعة",
      columns: ["البند", "القيمة"],
      rows: [
        ["السعر", formatCurrency(property.price)],
        ["الموقع", property.area ?? property.location ?? "غير محدد"],
        ["غرف النوم", String(property.beds)],
        ["الحمامات", String(property.baths)],
      ],
      summary: "هذا الجدول يلخص أهم عناصر القرار بسرعة قبل فتح مقارنة أوسع.",
    });
  }

  if (cards.length === 0) {
    const downPayment = qualification?.downPayment ?? Math.round(property.price * 0.1);
    const durationMonths = 60;
    cards.push({
      type: "payment_plan" as const,
      title: "نقطة بداية سريعة",
      downPayment,
      monthlyInstallment: Math.round((property.price - downPayment) / durationMonths),
      durationMonths,
      summary: "قدمت لك خطة أولية، ويمكنني بعدها حساب العائد أو فحص التمويل أو التحقق من التصاريح.",
    });
  }

  return {
    message: `حللت ${property.title} وأعددت لك ${cards.length === 1 ? "بطاقة" : `${cards.length} بطاقات`} مفيدة للقرار.`,
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
) {
  const chunks = [`Mobile AI handoff for ${propertyTitle}`, `User request: ${message}`];
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
