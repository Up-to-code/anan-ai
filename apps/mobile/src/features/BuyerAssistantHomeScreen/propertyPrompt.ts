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

function joinPropertyTitles(properties: MobileProperty[]) {
  const titles = properties
    .map((property) => property.title.trim())
    .filter(Boolean);

  if (titles.length <= 1) return titles[0] ?? "";
  if (titles.length === 2) return `${titles[0]} و${titles[1]}`;
  return `${titles.slice(0, -1).join("، ")}، و${titles.at(-1)}`;
}

function buildComparisonPrefix(properties: MobileProperty[]) {
  return `بالنسبة إلى مقارنة بين ${joinPropertyTitles(properties)}:`;
}

function buildSinglePropertyPrompt(property: MobileProperty) {
  return `أريد تفاصيل أكثر عن ${property.title}`;
}

/**
 * WHY:   Multi-property compare needs one compact, reusable prompt model instead of ad-hoc string building in the screen.
 * WHAT:  Builds the default prompt for either one focused property or a small comparison set.
 * HOW:   Falls back to the historic single-property wording for one item and switches to a compare-oriented sentence for two or more items.
 */
export function buildPropertySelectionPrompt(properties: MobileProperty[]) {
  if (properties.length === 0) return "";
  if (properties.length === 1) {
    return buildSinglePropertyPrompt(properties[0]);
  }

  return `أريد مقارنة بين ${joinPropertyTitles(properties)} من حيث السعر والمساحة والموقع وخيارات التمويل`;
}

/**
 * WHY:   The composer badge should let users continue with one property or a comparison set without losing their current wording.
 * WHAT:  Applies the current property selection onto the draft while avoiding duplicate prefixes.
 * HOW:   Uses the single-property prefix for focused follow-ups and a compare prefix when multiple properties are selected.
 */
export function applyPropertySelectionPromptToDraft(draft: string, properties: MobileProperty[]) {
  if (properties.length === 0) return draft.trim();
  if (properties.length === 1) {
    const property = properties[0];
    const trimmedDraft = draft.trim();
    const propertyTitle = property.title.trim();
    const propertyPrefix = `عن ${propertyTitle}:`;

    if (!trimmedDraft) {
      return buildSinglePropertyPrompt(property);
    }

    if (trimmedDraft.includes(propertyTitle) || trimmedDraft.startsWith(propertyPrefix)) {
      return trimmedDraft;
    }

    return `${propertyPrefix} ${trimmedDraft}`;
  }

  const trimmedDraft = draft.trim();
  const comparisonPrefix = buildComparisonPrefix(properties);

  if (!trimmedDraft) {
    return buildPropertySelectionPrompt(properties);
  }

  if (trimmedDraft.startsWith(comparisonPrefix) || properties.every((property) => trimmedDraft.includes(property.title.trim()))) {
    return trimmedDraft;
  }

  return `${comparisonPrefix} ${trimmedDraft}`;
}

/**
 * WHY:   The fixed property card needs a durable set of shortcut prompts so each horizontal "page" chip triggers a useful next step.
 * WHAT:  Builds a topic-specific prompt for one focused property or a small comparison set.
 * HOW:   Chooses concise Arabic intents that map to the existing assistant capabilities and broker handoff flow.
 */
export function buildPropertySelectionTopicPrompt(properties: MobileProperty[], topicId: PropertySelectionTopicId) {
  if (properties.length === 0) return "";

  if (properties.length === 1) {
    const propertyTitle = properties[0].title.trim();

    switch (topicId) {
      case "overview":
        return `اعطني ملخصاً سريعاً عن ${propertyTitle}`;
      case "details":
        return `أريد تفاصيل أكثر عن ${propertyTitle}`;
      case "price":
        return `اشرح لي سعر ${propertyTitle} وما يشمله`;
      case "location":
        return `اشرح لي موقع ${propertyTitle} والمزايا القريبة`;
      case "finance":
        return `احسب تمويل ${propertyTitle}`;
      case "roi":
        return `ما العائد على ${propertyTitle}؟`;
      case "developer":
        return `تحقق من مطور ${propertyTitle}`;
      case "advisor":
        return `رتب لي موعداً لمناقشة ${propertyTitle}`;
      case "comparison":
        return `قارن ${propertyTitle} مع بدائل مشابهة`;
      default:
        return buildSinglePropertyPrompt(properties[0]);
    }
  }

  const titles = joinPropertyTitles(properties);

  switch (topicId) {
    case "overview":
      return `اعطني ملخصاً سريعاً عن ${titles} كخيارات مرشحة`;
    case "details":
      return `اشرح لي الفروقات الأساسية بين ${titles}`;
    case "comparison":
      return `أريد مقارنة بين ${titles} من حيث السعر والمساحة والموقع وخيارات التمويل`;
    case "price":
      return `قارن بين ${titles} من حيث السعر والقيمة`;
    case "location":
      return `قارن بين ${titles} من حيث الموقع والحي`;
    case "finance":
      return `قارن التمويل وخطط السداد بين ${titles}`;
    case "roi":
      return `قارن العائد الاستثماري بين ${titles}`;
    case "developer":
      return `قارن بين المطورين أو الوسطاء المرتبطين بـ ${titles}`;
    case "advisor":
      return `رتب لي موعداً لمناقشة ${titles}`;
    default:
      return buildPropertySelectionPrompt(properties);
  }
}
