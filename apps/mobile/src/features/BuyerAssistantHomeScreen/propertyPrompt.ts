import type { MobileLocale } from "@/lib/locale";
import type { MobileProperty } from "@/types/mobile";

export type PropertySelectionTopicId =
  | "overview"
  | "details"
  | "comparison"
  | "price"
  | "location"
  | "finance"
  | "roi"
  | "developer"
  | "advisor";

function joinPropertyTitles(properties: MobileProperty[], locale: MobileLocale) {
  const titles = properties
    .map((property) => property.title.trim())
    .filter(Boolean);

  if (titles.length <= 1) return titles[0] ?? "";
  if (locale === "en") {
    if (titles.length === 2) return `${titles[0]} and ${titles[1]}`;
    return `${titles.slice(0, -1).join(", ")}, and ${titles.at(-1)}`;
  }
  if (titles.length === 2) return `${titles[0]} و${titles[1]}`;
  return `${titles.slice(0, -1).join("، ")}، و${titles.at(-1)}`;
}

function buildSinglePropertyPrompt(property: MobileProperty, locale: MobileLocale) {
  return locale === "en" ? `I want more details about ${property.title}` : `أريد تفاصيل أكثر عن ${property.title}`;
}

/**
 * WHY:   Multi-property compare needs one compact, reusable prompt model instead of ad-hoc string building in the screen.
 * WHAT:  Builds the default prompt for either one focused property or a small comparison set.
 * HOW:   Falls back to the historic single-property wording for one item and switches to a compare-oriented sentence for two or more items.
 */
export function buildPropertySelectionPrompt(properties: MobileProperty[], locale: MobileLocale = "ar") {
  if (properties.length === 0) return "";
  if (properties.length === 1) {
    return buildSinglePropertyPrompt(properties[0], locale);
  }

  return locale === "en"
    ? `I want a comparison between ${joinPropertyTitles(properties, locale)} in terms of price, size, location, and financing options`
    : `أريد مقارنة بين ${joinPropertyTitles(properties, locale)} من حيث السعر والمساحة والموقع وخيارات التمويل`;
}

/**
 * WHY:   The composer should keep lightweight property context without silently turning normal chat into compare mode.
 * WHAT:  Applies the current property selection onto the draft while avoiding duplicate prefixes.
 * HOW:   Uses a single-property prefix for focused follow-ups and leaves multi-property drafts unchanged unless the user explicitly chose compare.
 */
export function applyPropertySelectionPromptToDraft(draft: string, properties: MobileProperty[], locale: MobileLocale = "ar") {
  if (properties.length === 0) return draft.trim();
  if (properties.length === 1) {
    const property = properties[0];
    const trimmedDraft = draft.trim();
    const propertyTitle = property.title.trim();
    const propertyPrefix = locale === "en" ? `About ${propertyTitle}:` : `عن ${propertyTitle}:`;

    if (!trimmedDraft) {
      return buildSinglePropertyPrompt(property, locale);
    }

    if (trimmedDraft.includes(propertyTitle) || trimmedDraft.startsWith(propertyPrefix)) {
      return trimmedDraft;
    }

    return `${propertyPrefix} ${trimmedDraft}`;
  }

  return draft.trim();
}

/**
 * WHY:   The fixed property card needs a durable set of shortcut prompts so each horizontal "page" chip triggers a useful next step.
 * WHAT:  Builds a topic-specific prompt for one focused property or a small comparison set.
 * HOW:   Chooses concise Arabic intents that map to the existing assistant capabilities and broker handoff flow.
 */
export function buildPropertySelectionTopicPrompt(properties: MobileProperty[], topicId: PropertySelectionTopicId) {
  return buildPropertySelectionTopicPromptForLocale(properties, topicId, "ar");
}

export function buildPropertySelectionTopicPromptForLocale(
  properties: MobileProperty[],
  topicId: PropertySelectionTopicId,
  locale: MobileLocale = "ar",
) {
  if (properties.length === 0) return "";

  if (properties.length === 1) {
    const propertyTitle = properties[0].title.trim();

    switch (topicId) {
      case "overview":
        return locale === "en" ? `Give me a quick summary of ${propertyTitle}` : `اعطني ملخصاً سريعاً عن ${propertyTitle}`;
      case "details":
        return locale === "en" ? `I want more details about ${propertyTitle}` : `أريد تفاصيل أكثر عن ${propertyTitle}`;
      case "price":
        return locale === "en" ? `Explain the price of ${propertyTitle} and what it includes` : `اشرح لي سعر ${propertyTitle} وما يشمله`;
      case "location":
        return locale === "en" ? `Explain the location of ${propertyTitle} and nearby advantages` : `اشرح لي موقع ${propertyTitle} والمزايا القريبة`;
      case "finance":
        return locale === "en" ? `Calculate financing for ${propertyTitle}` : `احسب تمويل ${propertyTitle}`;
      case "roi":
        return locale === "en" ? `What is the ROI for ${propertyTitle}?` : `ما العائد على ${propertyTitle}؟`;
      case "developer":
        return locale === "en" ? `Check the developer of ${propertyTitle}` : `تحقق من مطور ${propertyTitle}`;
      case "advisor":
        return locale === "en" ? `Arrange an appointment to discuss ${propertyTitle}` : `رتب لي موعداً لمناقشة ${propertyTitle}`;
      case "comparison":
        return locale === "en" ? `Compare ${propertyTitle} with similar alternatives` : `قارن ${propertyTitle} مع بدائل مشابهة`;
      default:
        return buildSinglePropertyPrompt(properties[0], locale);
    }
  }

  const titles = joinPropertyTitles(properties, locale);

  switch (topicId) {
    case "overview":
      return locale === "en" ? `Give me a quick summary of ${titles} as shortlisted options` : `اعطني ملخصاً سريعاً عن ${titles} كخيارات مرشحة`;
    case "details":
      return locale === "en" ? `Explain the main differences between ${titles}` : `اشرح لي الفروقات الأساسية بين ${titles}`;
    case "comparison":
      return locale === "en"
        ? `I want a comparison between ${titles} in terms of price, size, location, and financing options`
        : `أريد مقارنة بين ${titles} من حيث السعر والمساحة والموقع وخيارات التمويل`;
    case "price":
      return locale === "en" ? `Compare ${titles} in terms of price and value` : `قارن بين ${titles} من حيث السعر والقيمة`;
    case "location":
      return locale === "en" ? `Compare ${titles} in terms of location and neighborhood` : `قارن بين ${titles} من حيث الموقع والحي`;
    case "finance":
      return locale === "en" ? `Compare financing and repayment plans between ${titles}` : `قارن التمويل وخطط السداد بين ${titles}`;
    case "roi":
      return locale === "en" ? `Compare the investment return between ${titles}` : `قارن العائد الاستثماري بين ${titles}`;
    case "developer":
      return locale === "en" ? `Compare the developers or brokers connected to ${titles}` : `قارن بين المطورين أو الوسطاء المرتبطين بـ ${titles}`;
    case "advisor":
      return locale === "en" ? `Arrange an appointment to discuss ${titles}` : `رتب لي موعداً لمناقشة ${titles}`;
    default:
      return buildPropertySelectionPrompt(properties, locale);
  }
}
