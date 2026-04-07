import { buildAssistantReply, listCatalogProperties, getPropertyById } from "@/lib/mvp/ananAssistant";
import { buildBuyerChatSuggestions } from "@/lib/buyerAssistantShared";
import { buildMobileAgUiTurn } from "@/lib/mobileAgUi";
import type { CapabilityResultCard, ConversationMessage, PropertyPreview } from "@/types/chat";
import type {
  MobileAssistantCard,
  MobileConversationMessage,
  MobileProperty,
} from "@/types/mobile";

const DEFAULT_SUGGESTED_PROMPTS = buildBuyerChatSuggestions("ar", "default").map((suggestion) => suggestion.prompt);

/**
 * WHY:   Mobile components need one stable view-model regardless of whether data comes from Convex or the local MVP fallback.
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
 * WHY:   The guest fallback mode still needs to present the same UI contract as the live Convex-backed mode.
 * WHAT:  Maps the legacy MVP catalog property into the live mobile property shape.
 * HOW:   Reuses the first gallery image as media and projects the old owner fields into the new nested owner object.
 */
export function mapMvpPropertyToMobileProperty(property: PropertyPreview): MobileProperty {
  const defaultDownPayment = Math.round(property.price * (property.downPaymentRate ?? 0.1));
  const defaultAnnualRate = 4.75;
  const defaultYears = 20;
  const loanAmount = Math.max(0, property.price - defaultDownPayment);
  const monthlyRate = defaultAnnualRate / 100 / 12;
  const installments = defaultYears * 12;
  const factor = Math.pow(1 + monthlyRate, installments);
  const estimatedMonthlyPayment =
    monthlyRate > 0 ? Math.round((loanAmount * monthlyRate * factor) / (factor - 1)) : Math.round(loanAmount / installments);

  return {
    id: property.id,
    title: property.title,
    address: property.address,
    area: property.area,
    location: property.city,
    price: property.price,
    beds: property.beds,
    baths: property.baths,
    sqft: property.sqft,
    status: property.permitStatus,
    media: property.gallery.length > 0 ? property.gallery : [property.heroImage],
    owner: {
      id: `${property.ownerType}-${property.id}`,
      type: property.ownerType,
      name: property.ownerName,
      slug: property.ownerName.toLowerCase().replace(/\s+/g, "-"),
      isVerified: property.isVerified,
      activeListings: undefined,
    },
    aiSummary: property.summary,
    finance: {
      defaultDownPayment,
      defaultYears,
      defaultAnnualRate,
      estimatedLoanAmount: loanAmount,
      estimatedMonthlyPayment,
      bankOfferCount: 0,
    },
    contact: {
      hasPhone: false,
      hasEmail: false,
      hasWhatsApp: false,
      mapQuery: property.address,
    },
    compliance: {
      permitStatus:
        property.permitStatus === "verified"
          ? "verified"
          : property.permitStatus === "pending_review"
            ? "pending_review"
            : "not_available",
      ownerVerified: property.isVerified,
      listingVerified: property.permitStatus === "verified",
    },
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
 * WHY:   The app should open the current property context with helpful prompts before the user types.
 * WHAT:  Builds the introductory assistant turn for a selected property.
 * HOW:   Surfaces the property summary and a small set of high-intent prompts.
 */
export function buildPropertyFocusMessage(property: MobileProperty): MobileConversationMessage {
  const messageText = property.aiSummary
    ? `${property.aiSummary} اسألني عن التمويل أو العائد أو حالة التحقق أو اطلب مستشاراً.`
    : `اخترت ${property.title}. أقدر الآن أحسب القسط، أراجع العائد، أو أجهز طلب المستشار.`;
  return {
    id: `assistant-focus-${property.id}`,
    role: "assistant",
    text: messageText,
    properties: [property],
    suggestedPrompts: buildSuggestedPrompts(property),
    activePropertyId: property.id,
    uiTurn: buildMobileAgUiTurn({
      assistantText: messageText,
      properties: [property],
    }),
  };
}

/**
 * WHY:   The live mobile assistant returns prompts after each turn, and the empty property state still needs sensible defaults.
 * WHAT:  Returns a stable prompt set for the active property.
 * HOW:   Uses short Arabic prompts tuned to the deterministic mobile assistant contract.
 */
export function buildSuggestedPrompts(property?: MobileProperty | null) {
  if (!property) return DEFAULT_SUGGESTED_PROMPTS;
  return [
    `احسب تمويل ${property.title}`,
    `ما العائد على ${property.title}؟`,
    `تحقق من مطور ${property.title}`,
    "اعرض نتائج مشابهة",
    "أريد مستشاراً",
  ];
}

function mapFallbackCards(cards: CapabilityResultCard[] | undefined): MobileAssistantCard[] | undefined {
  if (!cards) return undefined;
  return cards.flatMap((card) => {
    if (card.type === "market_analysis") {
      return [{ ...card, priceTrend: card.priceTrend === "stable" ? "flat" : card.priceTrend } as MobileAssistantCard];
    }
    return [{ ...card } as MobileAssistantCard];
  });
}

function mapFallbackMessage(message: ConversationMessage): MobileConversationMessage {
  const properties = message.properties?.map(mapMvpPropertyToMobileProperty);
  const cards = mapFallbackCards(message.cards);
  return {
    id: message.id,
    role: message.role,
    text: message.text,
    properties,
    cards,
    suggestedPrompts: buildSuggestedPrompts(properties?.[0] ?? null),
    activePropertyId: properties?.[0]?.id,
    requiresAuthForHandoff: message.actions?.some((action) => action.type === "advisor_handoff"),
    uiTurn:
      message.role === "assistant"
        ? buildMobileAgUiTurn({
            assistantText: message.text,
            properties,
            cards,
          })
        : undefined,
  };
}

/**
 * WHY:   The explicit no-backend mode should still exercise the mobile UI without silently diverging from the live contract.
 * WHAT:  Builds a fallback assistant reply using the local MVP dataset and maps it into the live mobile message shape.
 * HOW:   Delegates conversational intent handling to the existing deterministic MVP helper, then projects the result into live DTOs.
 */
export function buildFallbackAssistantMessage(args: {
  message: string;
  activeProperty: MobileProperty | null;
}): MobileConversationMessage {
  const fallbackProperty = args.activeProperty ? getPropertyById(args.activeProperty.id) : undefined;
  const reply = buildAssistantReply({
    message: args.message,
    contextPropertyId: fallbackProperty?.id,
  });

  return mapFallbackMessage({
    id: `assistant-fallback-${Date.now()}`,
    role: "assistant",
    text: reply.text,
    properties: reply.properties,
    cards: reply.cards,
    actions: reply.actions,
  });
}

/**
 * WHY:   The fallback search mode should still surface realistic-looking properties with the same list/detail components.
 * WHAT:  Returns the local catalog mapped into the live mobile property contract.
 * HOW:   Reuses the existing deterministic catalog and converts every property once.
 */
export function getFallbackProperties() {
  return listCatalogProperties().map(mapMvpPropertyToMobileProperty);
}
