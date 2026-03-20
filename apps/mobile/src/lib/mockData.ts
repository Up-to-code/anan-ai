import { AIPanelResult } from "@/types/assistant";
import { MobilePropertyFeedItem } from "@/types/mobile";
import { mockProperties } from "./mockData/mockProperties";

export { mockProperties };

export function mockAssistantResponse(
  property: MobilePropertyFeedItem,
  query: string
): { message: string; cards: AIPanelResult[] } {
  const normalized = query.trim();
  const cards: AIPanelResult[] = [];

  if (normalized.includes("عائد") || normalized.toLowerCase().includes("roi")) {
    cards.push({
      type: "roi_summary",
      title: "ملخص العائد الاستثماري",
      purchasePrice: property.price,
      estimatedAnnualRent: Math.round(property.price * 0.08),
      grossYieldPercent: 8,
      summary: "تقدير أولي مبني على الطلب الحالي في المنطقة.",
    });
  }

  if (normalized.includes("سداد") || normalized.includes("دفعة") || normalized.includes("قسط")) {
    cards.push({
      type: "payment_plan",
      title: "خطة سداد استرشادية",
      downPayment: Math.round(property.price * 0.1),
      monthlyInstallment: Math.round(property.price * 0.015),
      durationMonths: 60,
      summary: "خطة سداد تقديرية. يرجى مراجعة البنك المعتمد للتفاصيل النهائية.",
    });
  }

  if (
    normalized.includes("راتب") ||
    normalized.includes("تمويل") ||
    normalized.includes("أهل") ||
    normalized.includes("بنك")
  ) {
    cards.push({
      type: "mortgage_check",
      title: "فحص أهلية التمويل",
      estimatedEligibility: property.price > 2500000 ? "review" : "eligible",
      recommendedBudget: Math.round(property.price * 0.92),
      monthlyInstallmentEstimate: Math.round(property.price * 0.0048),
      summary: "تقدير أولي. البنوك المعتمدة: الراجحي، الأهلي، الإنماء.",
    });
  }

  if (normalized.includes("تصريح") || normalized.includes("رخص")) {
    cards.push({
      type: "permit_status",
      title: "حالة التصاريح",
      permitStatus: property.owner.isVerified ? "verified" : "pending_review",
      summary: property.owner.isVerified ? "الوسيط موثق داخل عنان." : "يحتاج مراجعة مستندية إضافية.",
    });
  }

  if (normalized.includes("قارن") || normalized.includes("مقارن")) {
    cards.push({
      type: "comparison_table",
      title: "مقارنة سريعة",
      columns: ["البند", "القيمة"],
      rows: [
        ["السعر", `${property.price.toLocaleString("en-US")} SAR`],
        ["المنطقة", property.area ?? "غير محدد"],
        ["غرف النوم", String(property.beds)],
        ["الحمامات", String(property.baths)],
        ["المساحة", property.sqft ? `${property.sqft} م²` : "غير محدد"],
      ],
      summary: "بطاقة مقارنة سريعة لعناصر القرار الأساسية.",
    });
  }

  if (
    normalized.includes("ميزانية") ||
    normalized.includes("أبحث") ||
    normalized.includes("شقة") ||
    normalized.includes("فيلا")
  ) {
    cards.push({
      type: "comparison_table",
      title: "نتائج البحث",
      columns: ["العقار", "السعر"],
      rows: mockProperties.slice(0, 5).map((p) => [p.title, `${p.price.toLocaleString("en-US")} SAR`]),
      summary: "وجدت عدة وحدات مطابقة. اضغط على أي وحدة أعلاه للتفاصيل.",
    });
  }

  if (cards.length === 0) {
    cards.push({
      type: "payment_plan",
      title: "خطة سداد استرشادية",
      downPayment: Math.round(property.price * 0.1),
      monthlyInstallment: Math.round(property.price * 0.015),
      durationMonths: 60,
      summary: "معاينة تقديرية لتجربة الواجهة.",
    });
  }

  return {
    message: `تم تحليل ${property.title} وإعداد ${cards.length} ${
      cards.length === 1 ? "بطاقة" : "بطاقات"
    } بناءً على سؤالك.`,
    cards,
  };
}
