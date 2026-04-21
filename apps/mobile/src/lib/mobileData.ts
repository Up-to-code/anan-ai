import { buildBuyerChatSuggestions } from "@/lib/buyerAssistantShared";
import type { MobileLocale } from "@/lib/locale";
import { getMobileDictionary } from "@/lib/i18n";
import type { MobileProperty } from "@/types/mobile";

/**
 * WHY:   Mobile components need one stable view-model for the live buyer contracts returned by Convex.
 * WHAT:  Normalizes buyer-facing property records into the shared mobile property shape.
 * HOW:   Copies the live contract fields directly and leaves missing optional fields undefined.
 */
export function toMobileProperty(value: {
  id: string;
  title: string;
  address: string;
  bankId?: string;
  location?: string;
  area?: string;
  price: number;
  beds: number;
  baths: number;
  sqft?: number;
  status?: string;
  media: string[];
  owner: MobileProperty["owner"];
  aiSummary?: string;
  finance?: MobileProperty["finance"];
  contact?: MobileProperty["contact"];
  compliance?: MobileProperty["compliance"];
}): MobileProperty {
  return {
    id: value.id,
    title: value.title,
    address: value.address,
    bankId: value.bankId,
    location: value.location,
    area: value.area,
    price: value.price,
    beds: value.beds,
    baths: value.baths,
    sqft: value.sqft,
    status: value.status,
    media: [...value.media],
    owner: { ...value.owner },
    aiSummary: value.aiSummary,
    finance: value.finance ? { ...value.finance } : undefined,
    contact: value.contact ? { ...value.contact } : undefined,
    compliance: value.compliance ? { ...value.compliance } : undefined,
  };
}

/**
 * WHY:   Multiple mobile surfaces need one friendly location label even when only partial property geography is available.
 * WHAT:  Resolves the best display label for the property's location.
 * HOW:   Prefers area, then location, then the first chunk of the address string.
 */
export function getPropertyLocationLabel(property: MobileProperty) {
  if (property.area?.trim()) return property.area.trim();
  if (property.location?.trim()) return property.location.trim();
  return property.address.split(/[,-]/)[0]?.trim() || property.address;
}

/**
 * WHY:   Cards and list rows need one resilient hero-image lookup without assuming media is always populated.
 * WHAT:  Returns the first usable image for a property.
 * HOW:   Prefers the first media URL and falls back to a neutral image placeholder.
 */
export function getPropertyHeroImage(property: MobileProperty) {
  return property.media[0] ?? "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80";
}

/**
 * WHY:   The live mobile assistant returns prompts after each turn, and the empty property state still needs sensible defaults.
 * WHAT:  Returns a stable prompt set for the active property.
 * HOW:   Uses short Arabic prompts tuned to the deterministic mobile assistant contract.
 */
export function buildSuggestedPrompts(property?: MobileProperty | null, locale: MobileLocale = "ar") {
  const dictionary = getMobileDictionary(locale);
  if (!property) return buildBuyerChatSuggestions(locale, "default").map((suggestion) => suggestion.prompt);

  if (locale === "en") {
    return [
      `Calculate financing for ${property.title}`,
      `What is the ROI for ${property.title}?`,
      `Verify the developer for ${property.title}`,
      dictionary.assistant.showMoreResults,
      dictionary.assistant.requestAdvisor,
    ];
  }

  return [
    `احسب تمويل ${property.title}`,
    `ما العائد على ${property.title}؟`,
    `تحقق من مطور ${property.title}`,
    dictionary.assistant.showMoreResults,
    dictionary.assistant.requestAdvisor,
  ];
}
