import { formatMobileCopy, getMobileDictionary } from "@/lib/i18n";
import { formatPercent } from "@/lib/formatters";
import type { MobileLocale } from "@/lib/locale";
import type {
  MobileAnalyticsAreaSignal,
  MobileAnalyticsJourneyStage,
  MobileAnalyticsTrendPoint,
  MobileBuyerAnalyticsSummary,
  MobileProperty,
} from "@/types/mobile";

function formatCompactNumber(value: number, locale: MobileLocale) {
  if (value >= 1_000_000) {
    const scaled = value / 1_000_000;
    return locale === "en"
      ? `${scaled >= 10 ? scaled.toFixed(0) : scaled.toFixed(1)}M`
      : `${scaled >= 10 ? scaled.toFixed(0) : scaled.toFixed(1)}م`;
  }

  if (value >= 1_000) {
    const scaled = value / 1_000;
    return locale === "en"
      ? `${scaled >= 10 ? scaled.toFixed(0) : scaled.toFixed(1)}K`
      : `${scaled >= 10 ? scaled.toFixed(0) : scaled.toFixed(1)}ألف`;
  }

  return new Intl.NumberFormat(locale === "en" ? "en-US" : "ar-EG").format(Math.round(value));
}

function formatBudgetRange(properties: MobileProperty[], locale: MobileLocale) {
  const dictionary = getMobileDictionary(locale);
  if (properties.length === 0) return dictionary.analytics.unavailable;
  const sortedPrices = properties.map((property) => property.price).sort((left, right) => left - right);
  const low = sortedPrices[Math.floor((sortedPrices.length - 1) * 0.25)] ?? sortedPrices[0]!;
  const high = sortedPrices[Math.floor((sortedPrices.length - 1) * 0.75)] ?? sortedPrices[sortedPrices.length - 1]!;
  return locale === "en"
    ? `${(low / 1_000_000).toFixed(1)} - ${(high / 1_000_000).toFixed(1)}M`
    : `${(low / 1_000_000).toFixed(1)} - ${(high / 1_000_000).toFixed(1)} م`;
}

/**
 * WHY:   Analytics must still render coherent buyer-facing insight blocks while the app runs without Convex.
 * WHAT:  Builds a deterministic market summary from the fallback property catalog only.
 * HOW:   Uses inventory distribution, verification share, and simple interest heuristics so the analytics route stays structurally identical across modes.
 */
export function buildFallbackAnalyticsSummary(
  properties: MobileProperty[],
  locale: MobileLocale = "ar",
): MobileBuyerAnalyticsSummary {
  const dictionary = getMobileDictionary(locale);
  const areaGroups = new Map<string, MobileProperty[]>();
  properties.forEach((property) => {
    const area =
      property.area ?? property.location ?? property.address.split(/[,-]/)[0]?.trim() ?? dictionary.analytics.mixedAreas;
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
        story: verifiedCount > 0 ? dictionary.analytics.verifiedAreaStory : dictionary.analytics.unverifiedAreaStory,
        growth: `+${Math.round(conversion)}%`,
        signalScore,
        budget: formatBudgetRange(group, locale),
        response: formatMobileCopy(dictionary.analytics.responseLabel, { value: formatPercent(conversion) }),
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
      label: formatMobileCopy(dictionary.analytics.weekLabel, { index: index + 1 }),
      visits,
      qualified,
      conversion: visits > 0 ? Number(((qualified / visits) * 100).toFixed(1)) : 0,
    };
  });

  const journeyStages: MobileAnalyticsJourneyStage[] = [
    {
      label: dictionary.analytics.journeyDiscovery,
      count: formatCompactNumber(totalVisits, locale),
      helper: dictionary.analytics.journeyDiscoveryBody,
      progress: 86,
    },
    {
      label: dictionary.analytics.journeySerious,
      count: formatCompactNumber(seriousJourneys, locale),
      helper: dictionary.analytics.journeySeriousBody,
      progress: 58,
    },
    {
      label: dictionary.analytics.journeyFollowUp,
      count: formatCompactNumber(followUps, locale),
      helper: dictionary.analytics.journeyFollowUpBody,
      progress: 28,
    },
  ];

  return {
    headline: topArea
      ? formatMobileCopy(dictionary.analytics.topAreaHeadline, { name: topArea.name })
      : dictionary.analytics.clearPricingHeadline,
    headlineBody: topArea
      ? formatMobileCopy(dictionary.analytics.topAreaBody, { name: topArea.name })
      : dictionary.analytics.localModeBody,
    updatedAtLabel: dictionary.analytics.localUpdated,
    topSignalLabel: topArea ? `${topArea.name} ${topArea.growth}` : dictionary.analytics.stableSignal,
    qualifiedLeadLabel: formatMobileCopy(dictionary.analytics.followUpsLabel, {
      count: formatCompactNumber(followUps, locale),
    }),
    averageResponseLabel: formatMobileCopy(dictionary.analytics.responseLabel, {
      value: formatPercent(averageConversion),
    }),
    metrics: {
      visits: formatCompactNumber(totalVisits, locale),
      seriousJourneys: formatCompactNumber(seriousJourneys, locale),
      conversion: formatPercent(averageConversion),
      followUps: formatCompactNumber(followUps, locale),
    },
    trendPoints,
    areaSignals,
    journeyStages,
    nextSteps: topArea
      ? [
          formatMobileCopy(dictionary.analytics.topAreaStepOne, { name: topArea.name }),
          formatMobileCopy(dictionary.analytics.topAreaStepTwo, { budget: topArea.budget }),
        ]
      : [dictionary.analytics.defaultNextStepOne, dictionary.analytics.defaultNextStepTwo],
  };
}
