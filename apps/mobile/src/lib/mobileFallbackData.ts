import { buildAssistantReply, getPropertyById, listCatalogProperties } from "@/lib/mvp/ananAssistant";
import { buildSuggestedPrompts } from "@/lib/mobileData";
import type { MobileLocale } from "@/lib/locale";
import { buildMobileAgUiTurn } from "@/lib/mobileAgUi";
import type { CapabilityResultCard, ConversationMessage, PropertyPreview } from "@/types/chat";
import type { MobileAssistantCard, MobileConversationMessage, MobileProperty } from "@/types/mobile";

/**
 * WHY:   Legacy development fixtures still need a home while the shipped app moves to backend-required runtime behavior.
 * WHAT:  Hosts the old MVP-to-mobile adapters outside the production runtime import graph.
 * HOW:   Reuses the deterministic catalog and assistant helpers only from tests or non-runtime tooling.
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

function mapFallbackCards(cards: CapabilityResultCard[] | undefined): MobileAssistantCard[] | undefined {
  if (!cards) return undefined;
  return cards.flatMap((card) => {
    if (card.type === "market_analysis") {
      return [{ ...card, priceTrend: card.priceTrend === "stable" ? "flat" : card.priceTrend } as MobileAssistantCard];
    }
    return [{ ...card } as MobileAssistantCard];
  });
}

function mapFallbackMessage(message: ConversationMessage, locale: MobileLocale = "ar"): MobileConversationMessage {
  const properties = message.properties?.map(mapMvpPropertyToMobileProperty);
  const cards = mapFallbackCards(message.cards);
  return {
    id: message.id,
    role: message.role,
    text: message.text,
    properties,
    cards,
    suggestedPrompts: buildSuggestedPrompts(properties?.[0] ?? null, locale),
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

export function buildFallbackAssistantMessage(args: {
  message: string;
  activeProperty: MobileProperty | null;
  locale?: MobileLocale;
}): MobileConversationMessage {
  const fallbackProperty = args.activeProperty ? getPropertyById(args.activeProperty.id) : undefined;
  const reply = buildAssistantReply({
    message: args.message,
    contextPropertyId: fallbackProperty?.id,
  });

  return mapFallbackMessage(
    {
      id: `assistant-fallback-${Date.now()}`,
      role: "assistant",
      text: reply.text,
      properties: reply.properties,
      cards: reply.cards,
      actions: reply.actions,
    },
    args.locale,
  );
}

export function getFallbackProperties() {
  return listCatalogProperties().map(mapMvpPropertyToMobileProperty);
}
