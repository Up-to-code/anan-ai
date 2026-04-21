import { describe, expect, it } from "vitest";
import { buildFallbackAnalyticsSummary } from "@/lib/mobileAnalytics";
import type { MobileProperty } from "@/types/mobile";

function createProperty(
  id: string,
  area: string,
  price: number,
  isVerified: boolean,
): MobileProperty {
  return {
    id,
    title: `Property ${id}`,
    address: `${area}, Riyadh`,
    location: "الرياض",
    area,
    price,
    beds: 3,
    baths: 3,
    media: ["https://example.com/cover.jpg"],
    owner: {
      id: `owner-${id}`,
      type: "broker",
      name: `Owner ${id}`,
      slug: `owner-${id}`,
      isVerified,
    },
  };
}

describe("mobileAnalytics", () => {
  it("builds a deterministic buyer summary from grouped fallback inventory", () => {
    const summary = buildFallbackAnalyticsSummary([
      createProperty("1", "الياسمين", 1200000, true),
      createProperty("2", "الياسمين", 1400000, true),
      createProperty("3", "الياسمين", 1600000, false),
      createProperty("4", "الصحافة", 1100000, false),
      createProperty("5", "الصحافة", 1350000, true),
    ]);

    expect(summary.headline).toContain("الياسمين");
    expect(summary.topSignalLabel).toContain("الياسمين");
    expect(summary.updatedAtLabel).toBe("آخر تحديث: من بيانات التطبيق المحلية");
    expect(summary.areaSignals).toHaveLength(2);
    expect(summary.areaSignals[0]).toMatchObject({
      name: "الياسمين",
      budget: "1.2 - 1.4 م",
    });
    expect(summary.trendPoints).toHaveLength(4);
    expect(summary.trendPoints[0]?.label).toBe("الأسبوع 1");
    expect(summary.trendPoints[3]!.visits).toBeGreaterThan(summary.trendPoints[0]!.visits);
    expect(summary.journeyStages.map((stage) => stage.label)).toEqual([
      "اكتشاف أولي",
      "تفاعل جاد",
      "طلب متابعة",
    ]);
    expect(summary.nextSteps[0]).toContain("الياسمين");
  });

  it("keeps the fallback analytics screen coherent even when inventory is empty", () => {
    const summary = buildFallbackAnalyticsSummary([]);

    expect(summary.headline).toBe("السوق الحالي يميل إلى العروض الواضحة سعرياً.");
    expect(summary.topSignalLabel).toBe("إشارة مستقرة");
    expect(summary.areaSignals).toEqual([]);
    expect(summary.nextSteps).toEqual([
      "ابدأ من العروض الموثقة أولاً ثم تابع التمويل في نفس الرحلة.",
      "اجعل الانتقال من البحث إلى المحادثة هو الخطوة الطبيعية التالية للمشتري.",
    ]);
  });
});
