import {
  buildBuyerChatSuggestions,
  buildBuyerUiTurn,
  type BuyerAssistantCard,
  type BuyerAssistantMessage,
  type BuyerProperty,
} from "../../../../../packages/client-assistant/src/index";

/**
 * WHY:   The mobile web UI needs the same buyer property contract regardless of whether data comes from web or mobile Convex reads.
 * WHAT:  Normalizes a loosely typed property payload into the shared buyer property shape used by the new mobile-style screens.
 * HOW:   Coerces ids to strings, preserves known nested owner fields, and keeps optional values nullable-safe for direct rendering.
 */
export function normalizeBuyerProperty(value: any): BuyerProperty {
  return {
    id: String(value.id),
    title: String(value.title ?? ""),
    address: String(value.address ?? ""),
    bankId: value.bankId ? String(value.bankId) : undefined,
    location: value.location ? String(value.location) : undefined,
    area: value.area ? String(value.area) : undefined,
    price: Number(value.price ?? 0),
    beds: Number(value.beds ?? 0),
    baths: Number(value.baths ?? 0),
    sqft: value.sqft == null ? undefined : Number(value.sqft),
    status: value.status ? String(value.status) : undefined,
    media: Array.isArray(value.media) ? value.media.map((item: unknown) => String(item)) : [],
    owner: {
      id: String(value.owner?.id ?? ""),
      type: value.owner?.type === "broker" ? "broker" : "RED",
      name: String(value.owner?.name ?? ""),
      slug: String(value.owner?.slug ?? ""),
      isVerified: Boolean(value.owner?.isVerified),
      description: value.owner?.description ? String(value.owner.description) : undefined,
      phone: value.owner?.phone ? String(value.owner.phone) : undefined,
      contactEmail: value.owner?.contactEmail ? String(value.owner.contactEmail) : undefined,
      agencyLabel: value.owner?.agencyLabel ? String(value.owner.agencyLabel) : undefined,
      rating: value.owner?.rating == null ? undefined : Number(value.owner.rating),
      activeListings: value.owner?.activeListings == null ? undefined : Number(value.owner.activeListings),
      establishedYear: value.owner?.establishedYear == null ? undefined : Number(value.owner.establishedYear),
      completedProjects: value.owner?.completedProjects == null ? undefined : Number(value.owner.completedProjects),
    },
    aiSummary: value.aiSummary ? String(value.aiSummary) : undefined,
  };
}

/**
 * WHY:   Multiple screens need the same Arabic money formatting used by the mobile buyer app.
 * WHAT:  Formats a number as Saudi Riyal currency.
 * HOW:   Uses the Arabic Saudi locale with zero fraction digits to match the mobile application output.
 */
export function formatCurrency(value: number) {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * WHY:   Insight cards in the assistant render yield and trend metrics repeatedly.
 * WHAT:  Formats a number as a percentage string with one decimal place.
 * HOW:   Keeps the formatting tiny and deterministic so all cards display consistently.
 */
export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

/**
 * WHY:   The mobile property cards and detail screen need one resilient location label.
 * WHAT:  Returns the best display-ready location string for a buyer property.
 * HOW:   Prefers `area`, then `location`, then the first address segment to mirror the mobile helper order.
 */
export function getPropertyLocationLabel(property: BuyerProperty) {
  if (property.area?.trim()) return property.area.trim();
  if (property.location?.trim()) return property.location.trim();
  return property.address.split(/[,-]/)[0]?.trim() || property.address;
}

/**
 * WHY:   Several screens need a stable fallback hero image when a property record is incomplete.
 * WHAT:  Returns the first media asset or a neutral placeholder URL.
 * HOW:   Reads from the normalized `media` array and falls back to the same kind of catalog-safe image used in mobile.
 */
export function getPropertyHeroImage(property: BuyerProperty) {
  return property.media[0] ?? "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80";
}

/**
 * WHY:   The mobile assistant always opens with short Arabic prompt chips before the user types.
 * WHAT:  Returns the default prompt set for the mobile-style web assistant.
 * HOW:   Reuses the shared buyer assistant prompt builder in Arabic default mode.
 */
export function getDefaultSuggestions() {
  return buildBuyerChatSuggestions("ar", "default");
}

/**
 * WHY:   Property-focused assistant turns need tighter follow-up prompts than the generic welcome state.
 * WHAT:  Builds the property-specific prompt set shown under assistant turns.
 * HOW:   Uses the same direct Arabic phrasing as the mobile app for financing, ROI, verification, and advisor handoff.
 */
export function buildPropertySuggestedPrompts(property?: BuyerProperty | null) {
  if (!property) return getDefaultSuggestions().map((item) => item.prompt);
  return [
    `احسب تمويل ${property.title}`,
    `ما العائد على ${property.title}؟`,
    `تحقق من مطور ${property.title}`,
    "أريد مستشاراً",
  ];
}

/**
 * WHY:   The mobile assistant UI is driven by structured AG UI cards instead of raw arrays whenever possible.
 * WHAT:  Maps one assistant message into the shared buyer AG UI turn for web rendering.
 * HOW:   Reuses the package-level turn builder so mobile web and mobile app stay aligned on card ordering and component types.
 */
export function buildAssistantUiTurn(message: BuyerAssistantMessage) {
  return buildBuyerUiTurn({
    assistantText: message.text,
    properties: message.properties,
    cards: message.cards as BuyerAssistantCard[] | undefined,
    targetZone: "client_web",
    locale: "ar",
  });
}

/**
 * WHY:   Assistant responses can arrive from Convex with mixed id types that are awkward for route building.
 * WHAT:  Normalizes one buyer assistant message for the mobile-style web renderer.
 * HOW:   Coerces ids, normalizes property arrays, and supplies fallback prompt chips when the response includes a focused property.
 */
export function normalizeAssistantMessage(message: any): BuyerAssistantMessage {
  const properties = Array.isArray(message.properties)
    ? message.properties.map((property: unknown) => normalizeBuyerProperty(property))
    : undefined;

  return {
    id: String(message.id),
    role: message.role === "user" ? "user" : "assistant",
    text: String(message.text ?? ""),
    createdAt: typeof message.createdAt === "number" ? message.createdAt : Date.now(),
    properties,
    cards: message.cards as BuyerAssistantCard[] | undefined,
    activePropertyId: message.activePropertyId ? String(message.activePropertyId) : undefined,
    suggestedPrompts:
      Array.isArray(message.suggestedPrompts) && message.suggestedPrompts.length > 0
        ? message.suggestedPrompts.map((prompt: unknown) => String(prompt))
        : buildPropertySuggestedPrompts(properties?.[0] ?? null),
    requiresAuthForHandoff: Boolean(message.requiresAuthForHandoff),
    uiTurn: buildAssistantUiTurn({
      ...message,
      properties,
    } as BuyerAssistantMessage),
  };
}
