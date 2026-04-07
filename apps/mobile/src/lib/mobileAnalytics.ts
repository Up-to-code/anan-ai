import { formatPercent } from "@/lib/formatters";
import type {
  MobileAnalyticsAreaSignal,
  MobileAnalyticsJourneyStage,
  MobileAnalyticsTrendPoint,
  MobileBuyerAnalyticsSummary,
  MobileProperty,
} from "@/types/mobile";

function formatCompactArabicNumber(value: number) {
  if (value >= 1_000_000) {
    const scaled = value / 1_000_000;
    return `${scaled >= 10 ? scaled.toFixed(0) : scaled.toFixed(1)}م`;
  }

  if (value >= 1_000) {
    const scaled = value / 1_000;
    return `${scaled >= 10 ? scaled.toFixed(0) : scaled.toFixed(1)}ألف`;
  }

  return new Intl.NumberFormat("ar-EG").format(Math.round(value));
}

function formatBudgetRange(properties: MobileProperty[]) {
  if (properties.length === 0) return "غير متاح";
  const sortedPrices = properties.map((property) => property.price).sort((left, right) => left - right);
  const low = sortedPrices[Math.floor((sortedPrices.length - 1) * 0.25)] ?? sortedPrices[0]!;
  const high = sortedPrices[Math.floor((sortedPrices.length - 1) * 0.75)] ?? sortedPrices[sortedPrices.length - 1]!;
  return `${(low / 1_000_000).toFixed(1)} - ${(high / 1_000_000).toFixed(1)} م`;
}

/**
 * WHY:   Analytics must still render coherent buyer-facing insight blocks while the app runs without Convex.
 * WHAT:  Builds a deterministic market summary from the fallback property catalog only.
 * HOW:   Uses inventory distribution, verification share, and simple interest heuristics so the analytics route stays structurally identical across modes.
 */
export function buildFallbackAnalyticsSummary(properties: MobileProperty[]): MobileBuyerAnalyticsSummary {
  const areaGroups = new Map<string, MobileProperty[]>();
  properties.forEach((property) => {
    const area = property.area ?? property.location ?? property.address.split(/[,-]/)[0]?.trim() ?? "مناطق مختلطة";
    const group = areaGroups.get(area) ?? [];
    group.push(property);
    areaGroups.set(area, group);
  });

  const areaSignals: MobileAnalyticsAreaSignal[] = Array.from(areaGroups.entries())
    .map(([name, group], index) => {
      const verifiedCount = group.filter((property) => property.owner.isVerified).length;
      const signalScore = Math.min(92, 48 + group.length * 8 + verifiedCount * 6);
      const conversion = Math.min(18, 7 + verifiedCount * 1.5 + index * 1.2);
      return {
        name,
        story:
          verifiedCount > 0
            ? "العروض هنا متماسكة وواضحة، ما يجعل القرار أسرع عند الانتقال من البحث إلى التمويل."
            : "المنطقة مفيدة للاكتشاف الأولي، لكن المقارنة الدقيقة هي الخطوة التالية الأهم.",
        growth: `+${Math.round(conversion)}%`,
        signalScore,
        budget: formatBudgetRange(group),
        response: `${formatPercent(conversion)} تفاعل`,
      };
    })
    .sort((left, right) => right.signalScore - left.signalScore)
    .slice(0, 3);

  const topArea = areaSignals[0];
  const totalVisits = properties.length * 84;
  const seriousJourneys = properties.length * 21;
  const followUps = Math.max(1, Math.round(properties.length * 0.4));
  const averageConversion = totalVisits > 0 ? (seriousJourneys / totalVisits) * 100 : 0;

  const trendPoints: MobileAnalyticsTrendPoint[] = [0, 1, 2, 3].map((index) => {
    const visits = Math.round(totalVisits * (0.72 + index * 0.1));
    const qualified = Math.round(visits * (0.12 + index * 0.01));
    return {
      label: `الأسبوع ${index + 1}`,
      visits,
      qualified,
      conversion: visits > 0 ? Number(((qualified / visits) * 100).toFixed(1)) : 0,
    };
  });

  const journeyStages: MobileAnalyticsJourneyStage[] = [
    {
      label: "اكتشاف أولي",
      count: formatCompactArabicNumber(totalVisits),
      helper: "عدد الرحلات التي بدأت من عرض العقارات أو المساعد.",
      progress: 86,
    },
    {
      label: "تفاعل جاد",
      count: formatCompactArabicNumber(seriousJourneys),
      helper: "الرحلات التي وصلت إلى فتح تفاصيل أو نية تمويل أولية.",
      progress: 58,
    },
    {
      label: "طلب متابعة",
      count: formatCompactArabicNumber(followUps),
      helper: "الإشارات الأقرب إلى تسليم الحالة إلى مستشار.",
      progress: 28,
    },
  ];

  return {
    headline: topArea ? `${topArea.name} هي الإشارة الأوضح حالياً.` : "السوق الحالي يميل إلى العروض الواضحة سعرياً.",
    headlineBody: topArea
      ? `أعلى قراءة تأتي من ${topArea.name} بفضل وضوح الأسعار ونسبة التحقق الأفضل داخل العروض المتاحة.`
      : "حتى في وضع التطوير المحلي، نحافظ على نفس بنية التحليل التي تركز على الرحلة لا على الزخرفة.",
    updatedAtLabel: "آخر تحديث: من بيانات التطبيق المحلية",
    topSignalLabel: topArea ? `${topArea.name} ${topArea.growth}` : "إشارة مستقرة",
    qualifiedLeadLabel: `${formatCompactArabicNumber(followUps)} متابعة`,
    averageResponseLabel: `${formatPercent(averageConversion)} تفاعل`,
    metrics: {
      visits: formatCompactArabicNumber(totalVisits),
      seriousJourneys: formatCompactArabicNumber(seriousJourneys),
      conversion: formatPercent(averageConversion),
      followUps: formatCompactArabicNumber(followUps),
    },
    trendPoints,
    areaSignals,
    journeyStages,
    nextSteps: topArea
      ? [
          `ابدأ المقارنة من ${topArea.name} ثم افتح التمويل مباشرة لأن الإشارة هناك هي الأقوى.`,
          `استخدم نطاق ${topArea.budget} كبداية سريعة قبل الدخول في التفاصيل الأوسع.`,
        ]
      : [
          "ابدأ من العروض الموثقة أولاً ثم تابع التمويل في نفس الرحلة.",
          "اجعل الانتقال من البحث إلى المحادثة هو الخطوة الطبيعية التالية للمشتري.",
        ],
  };
}

