import {
  inferPropertyTypeLabel,
  normalizeMarketArea,
  normalizeSaudiCity,
  parseSaudiGeography,
} from "../../shared_logic/market/normalizers";
import {
  buildConfigurationLabel,
  normalizeSearchText,
  tokenizeKeywordText,
} from "../../shared_logic/market/analytics/utils";
import type {
  ConversationAnalyzerIntent,
  ConversationAnalyzerPaymentIntent,
  ConversationDemandOutput,
  ConversationTranscript,
} from "./types";

const BUDGET_MARKERS = /(ميزاني|budget|price|سعر|ر\.?س|sar|ريال|مليون|million|ألف|الف|k\b|m\b)/iu;
const CASH_MARKERS = /(كاش|نقد|cash|full payment)/iu;
const INSTALLMENT_MARKERS = /(تقسيط|اقساط|أقساط|installment|payment plan|دفعات|سداد)/iu;
const MORTGAGE_MARKERS = /(تمويل|رهن|mortgage|loan|bank finance|بنك)/iu;
const INVESTMENT_MARKERS = /(استثمار|استثماري|عوائد?|roi|yield|investment|investor)/iu;
const RESIDENTIAL_MARKERS = /(سكن|للسكن|عائلة|أسرة|family|live in|residential|سكني)/iu;
const MUST_HAVE_MARKERS = /(لازم|ضروري|شرط|must|need to|non-negotiable|مهم جدا|ضروري جدا)/iu;
const IMMEDIATE_TIMELINE_MARKERS = /(اليوم|فور[يى]|خلال أسبوع|this week|urgent|asap|immediately|ready now)/iu;
const SHORT_TIMELINE_MARKERS = /(خلال شهر|خلال شهرين|within 1 month|within 2 months|next month)/iu;
const MEDIUM_TIMELINE_MARKERS = /(خلال 3|خلال 4|خلال 6|three months|four months|six months)/iu;
const LONG_TIMELINE_MARKERS = /(آخر السنة|بعد سنة|next year|later|later on)/iu;
const FEATURE_DEFINITIONS: Array<{ label: string; pattern: RegExp }> = [
  { label: "مواقف خاصة", pattern: /(parking|garage|مواقف?|جراج)/iu },
  { label: "خطة سداد", pattern: /(installment|payment plan|تقسيط|دفعات|سداد)/iu },
  { label: "مسبح", pattern: /(pool|مسبح)/iu },
  { label: "مصعد", pattern: /(elevator|lift|مصعد)/iu },
  { label: "غرفة خادمة", pattern: /(maid|خادمة)/iu },
  { label: "مدخل خاص", pattern: /(private entrance|مدخل خاص)/iu },
  { label: "إطلالة مفتوحة", pattern: /(view|اطلالة|إطلالة)/iu },
  { label: "جاهز للسكن", pattern: /(جاهز|ready|move in)/iu },
  { label: "تشطيب حديث", pattern: /(تشطيب|renovated|modern finish)/iu },
  { label: "قريب من الخدمات", pattern: /(close to|near services|قريب من|الخدمات)/iu },
  { label: "عائد استثماري", pattern: /(yield|investment return|عائد|استثماري)/iu },
];

function normalizeArabicDigits(value: string) {
  return value.replace(/[٠-٩]/g, (digit) =>
    String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)),
  );
}

function dedupeValues(values: Array<string | undefined | null>) {
  return Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  );
}

function isUsefulHotAreaCandidate(
  value: string | undefined,
  city?: string,
): value is string {
  if (!value) return false;
  const normalized = normalizeSearchText(value);
  if (!normalized || normalized === normalizeSearchText(city)) return false;
  if (/\d/.test(normalized)) return false;
  const words = normalized.split(/\s+/).filter(Boolean);
  return words.length > 0 && words.length <= 3;
}

function extractAreaHint(text: string, city?: string) {
  const patterns = [
    /(?:في|حي|منطقة)\s+([^\n،,]+)/iu,
    /(?:district|area)\s+([^\n,]+)/iu,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    const candidate = match?.[1]?.trim();
    if (!candidate) continue;
    const withoutCity =
      city && city.length > 0
        ? candidate
            .replace(new RegExp(`(?:ب|بال)${city}$`, "iu"), "")
            .replace(new RegExp(`${city}$`, "iu"), "")
            .trim()
        : candidate;
    const normalized =
      normalizeMarketArea(withoutCity) ?? normalizeMarketArea(candidate);
    if (isUsefulHotAreaCandidate(normalized, city)) {
      return normalized;
    }
  }

  return undefined;
}

function sanitizeSentence(value: string) {
  return normalizeArabicDigits(value)
    .replace(/\s+/g, " ")
    .replace(/[|]+/g, " ")
    .trim();
}

function classifyBudgetBand(amount: number) {
  if (amount < 500_000) return "أقل من 500 ألف";
  if (amount < 1_000_000) return "500 ألف - 1 مليون";
  if (amount < 2_000_000) return "1 - 2 مليون";
  if (amount < 3_000_000) return "2 - 3 مليون";
  return "3 مليون+";
}

function extractBudgetBands(text: string) {
  if (!BUDGET_MARKERS.test(text)) return [] as string[];
  const normalized = normalizeArabicDigits(text);
  const matches = Array.from(
    normalized.matchAll(
      /(\d+(?:[.,]\d+)?)\s*(مليون|million|ألف|الف|k\b|m\b|ر\.?س|sar|ريال)?/giu,
    ),
  );

  const amounts = matches
    .map((match) => {
      const raw = Number(match[1]?.replace(/,/g, ""));
      if (!Number.isFinite(raw)) return null;
      const unit = (match[2] ?? "").toLowerCase();
      if (unit.includes("مليون") || unit.includes("million") || unit === "m") {
        return raw * 1_000_000;
      }
      if (unit.includes("ألف") || unit.includes("الف") || unit === "k") {
        return raw * 1_000;
      }
      if (raw >= 50_000) return raw;
      return null;
    })
    .filter((value): value is number => value !== null);

  return dedupeValues(amounts.map(classifyBudgetBand));
}

function detectPaymentIntent(text: string): ConversationAnalyzerPaymentIntent {
  const wantsCash = CASH_MARKERS.test(text);
  const wantsInstallments = INSTALLMENT_MARKERS.test(text);
  const wantsMortgage = MORTGAGE_MARKERS.test(text);

  const positive = [wantsCash, wantsInstallments, wantsMortgage].filter(Boolean)
    .length;
  if (positive > 1) return "mixed";
  if (wantsMortgage) return "mortgage";
  if (wantsInstallments) return "installments";
  if (wantsCash) return "cash";
  return "unknown";
}

function detectIntent(text: string): ConversationAnalyzerIntent {
  const wantsInvestment = INVESTMENT_MARKERS.test(text);
  const wantsResidential = RESIDENTIAL_MARKERS.test(text);
  if (wantsInvestment && wantsResidential) return "mixed";
  if (wantsInvestment) return "investment";
  if (wantsResidential) return "residential";
  return "unknown";
}

function detectTimelineSignals(text: string) {
  const values: string[] = [];
  if (IMMEDIATE_TIMELINE_MARKERS.test(text)) values.push("فوري");
  if (SHORT_TIMELINE_MARKERS.test(text)) values.push("خلال 1-2 شهر");
  if (MEDIUM_TIMELINE_MARKERS.test(text)) values.push("خلال 3-6 أشهر");
  if (LONG_TIMELINE_MARKERS.test(text)) values.push("أكثر من 6 أشهر");
  return values;
}

function collectFeatureSignals(text: string) {
  return FEATURE_DEFINITIONS.filter((definition) => definition.pattern.test(text)).map(
    (definition) => definition.label,
  );
}

function collectBedroomCounts(text: string) {
  const matches = Array.from(
    normalizeArabicDigits(text).matchAll(/(\d+)\s*(?:غرف?|bed(?:room)?s?)/giu),
  );
  return dedupeValues(matches.map((match) => `${match[1]} غرف`));
}

function collectBathroomCounts(text: string) {
  const matches = Array.from(
    normalizeArabicDigits(text).matchAll(/(\d+)\s*(?:حمام|حمامات|bath(?:room)?s?)/giu),
  );
  return dedupeValues(matches.map((match) => `${match[1]} حمامات`));
}

function collectConfigurations(text: string) {
  const normalized = normalizeArabicDigits(text);
  const bedMatch = normalized.match(/(\d+)\s*(?:غرف?|bed(?:room)?s?)/iu);
  const bathMatch = normalized.match(
    /(\d+)\s*(?:حمام|حمامات|bath(?:room)?s?)/iu,
  );
  const areaMatch = normalized.match(/(\d+)\s*(?:متر|sqm|sqft|م²)/iu);
  return dedupeValues([
    buildConfigurationLabel({
      beds: bedMatch?.[1],
      baths: bathMatch?.[1],
      area: areaMatch?.[1],
    }),
  ]);
}

function buildConstraintLabel(text: string) {
  const sentence = sanitizeSentence(text);
  const geography = parseSaudiGeography({ query: sentence });
  const propertyType = inferPropertyTypeLabel(sentence);
  const feature = collectFeatureSignals(sentence)[0];
  const budget = extractBudgetBands(sentence)[0];
  const timeline = detectTimelineSignals(sentence)[0];
  const payment = detectPaymentIntent(sentence);
  if (geography.area) return geography.city ? `${geography.city} / ${geography.area}` : geography.area;
  if (geography.city) return geography.city;
  if (propertyType) return propertyType;
  if (feature) return feature;
  if (budget) return budget;
  if (timeline) return timeline;
  if (payment !== "unknown") return `الدفع: ${payment}`;
  const tokens = sentence.split(/\s+/).slice(0, 8).join(" ");
  return tokens.length > 0 ? tokens : undefined;
}

function buildSummary(args: {
  intent: ConversationAnalyzerIntent;
  cities: string[];
  areas: string[];
  propertyTypes: string[];
  budgetBands: string[];
  paymentIntents: ConversationAnalyzerPaymentIntent[];
  features: string[];
}) {
  const parts: string[] = [];
  if (args.intent !== "unknown") parts.push(`النية ${args.intent}`);
  if (args.areas[0]) parts.push(`التركيز على ${args.areas[0]}`);
  else if (args.cities[0]) parts.push(`التركيز على ${args.cities[0]}`);
  if (args.propertyTypes[0]) parts.push(`الطلب على ${args.propertyTypes[0]}`);
  if (args.budgetBands[0]) parts.push(`الميزانية ${args.budgetBands[0]}`);
  const payment = args.paymentIntents.find((value) => value !== "unknown");
  if (payment) parts.push(`الدفع ${payment}`);
  if (args.features[0]) parts.push(`الميزة المطلوبة ${args.features[0]}`);
  return parts.join("، ") || "طلب عقاري عام بدون إشارات سوقية كافية";
}

/**
 * WHY:   The daily analyzer needs one deterministic per-chat output that can be safely aggregated into market signals.
 * WHAT:  Extracts normalized demand signals from a buyer transcript while preferring user-stated demand over assistant suggestions.
 * HOW:   Reads user turns only, derives geography/property/payment/budget/timeline signals with lightweight heuristics, and deduplicates each signal within the chat.
 */
export function extractConversationDemand(
  transcript: ConversationTranscript,
): ConversationDemandOutput {
  const sourceMessages =
    transcript.messages.filter(
      (message) => message.role === "user" && message.content.trim().length > 0,
    ) || [];
  const effectiveMessages =
    sourceMessages.length > 0 ? sourceMessages : transcript.messages;
  const citySet = new Set<string>();
  const areaMap = new Map<string, { city?: string; area: string }>();
  const propertyTypeSet = new Set<string>();
  const budgetSet = new Set<string>();
  const paymentSet = new Set<ConversationAnalyzerPaymentIntent>();
  const configurationSet = new Set<string>();
  const bedroomSet = new Set<string>();
  const bathroomSet = new Set<string>();
  const timelineSet = new Set<string>();
  const featureSet = new Set<string>();
  const constraintSet = new Set<string>();
  const topicSet = new Set<string>();
  const keywordCounts = new Map<string, number>();
  let combinedIntent: ConversationAnalyzerIntent = "unknown";

  for (const message of effectiveMessages) {
    const text = sanitizeSentence(message.content);
    if (!text) continue;

    const geography = parseSaudiGeography({ query: text });
    if (geography.city) citySet.add(geography.city);
    const hotArea = isUsefulHotAreaCandidate(geography.area, geography.city)
      ? geography.area
      : extractAreaHint(text, geography.city);
    if (isUsefulHotAreaCandidate(hotArea, geography.city)) {
      const key = `${geography.city ?? ""}::${hotArea}`;
      areaMap.set(key, { city: geography.city, area: hotArea });
    }

    const propertyType = inferPropertyTypeLabel(text);
    if (propertyType) {
      propertyTypeSet.add(propertyType);
      topicSet.add(propertyType);
    }

    for (const budgetBand of extractBudgetBands(text)) budgetSet.add(budgetBand);
    const paymentIntent = detectPaymentIntent(text);
    if (paymentIntent !== "unknown") {
      paymentSet.add(paymentIntent);
      topicSet.add(paymentIntent);
    }
    const nextIntent = detectIntent(text);
    if (combinedIntent === "unknown") combinedIntent = nextIntent;
    else if (nextIntent !== "unknown" && nextIntent !== combinedIntent) combinedIntent = "mixed";

    for (const configuration of collectConfigurations(text)) {
      configurationSet.add(configuration);
      topicSet.add(configuration);
    }
    for (const bedrooms of collectBedroomCounts(text)) bedroomSet.add(bedrooms);
    for (const bathrooms of collectBathroomCounts(text)) bathroomSet.add(bathrooms);
    for (const timeline of detectTimelineSignals(text)) {
      timelineSet.add(timeline);
      topicSet.add(timeline);
    }
    for (const feature of collectFeatureSignals(text)) {
      featureSet.add(feature);
      topicSet.add(feature);
    }

    if (MUST_HAVE_MARKERS.test(text)) {
      const constraint = buildConstraintLabel(text);
      if (constraint) constraintSet.add(constraint);
      for (const feature of collectFeatureSignals(text)) featureSet.add(feature);
    }

    for (const token of tokenizeKeywordText(text, new Set<string>())) {
      keywordCounts.set(token, (keywordCounts.get(token) ?? 0) + 1);
    }
  }

  const repeatedKeywords = Array.from(keywordCounts.entries())
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ar"))
    .slice(0, 8)
    .map(([label]) => label);

  if (combinedIntent !== "unknown") topicSet.add(combinedIntent);
  for (const city of citySet) topicSet.add(city);
  for (const area of areaMap.values()) topicSet.add(area.area);

  const hotCities = Array.from(citySet);
  const hotAreas = Array.from(areaMap.values()).sort((a, b) =>
    `${a.city ?? ""}${a.area}`.localeCompare(`${b.city ?? ""}${b.area}`, "ar"),
  );
  const propertyTypes = Array.from(propertyTypeSet);
  const budgetBands = Array.from(budgetSet);
  const paymentIntents = Array.from(paymentSet);
  const configurations = Array.from(configurationSet);
  const bedroomCounts = Array.from(bedroomSet);
  const bathroomCounts = Array.from(bathroomSet);
  const timelineSignals = Array.from(timelineSet);
  const mustHaveFeatures = Array.from(featureSet);
  const strongConstraints = Array.from(constraintSet);
  const repeatedTopics = Array.from(topicSet).slice(0, 10);

  return {
    summary: buildSummary({
      intent: combinedIntent,
      cities: hotCities,
      areas: hotAreas.map((area) =>
        area.city ? `${area.city} / ${normalizeMarketArea(area.area) ?? area.area}` : area.area,
      ),
      propertyTypes,
      budgetBands,
      paymentIntents,
      features: mustHaveFeatures,
    }),
    hotCities,
    hotAreas,
    propertyTypes,
    budgetBands,
    paymentIntents: paymentIntents.length > 0 ? paymentIntents : ["unknown"],
    configurations,
    bedroomCounts,
    bathroomCounts,
    timelineSignals,
    mustHaveFeatures,
    strongConstraints,
    intent: combinedIntent,
    repeatedKeywords: repeatedKeywords.length > 0 ? repeatedKeywords : Array.from(keywordCounts.keys()).slice(0, 8),
    repeatedTopics,
  };
}
