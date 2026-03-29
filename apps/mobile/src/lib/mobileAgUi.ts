import { buildBuyerUiTurn } from "@/lib/buyerAssistantShared";
import type { MobileAgUiTurn, MobileAssistantCard, MobileProperty } from "@/types/mobile";

/**
 * WHY:   Mobile assistant turns should render from a structured turn contract instead of raw arrays whenever possible.
 * WHAT:  Maps buyer assistant properties/cards into the mobile AG UI turn payload.
 * HOW:   Reuses the shared buyer assistant mapper so web and mobile keep the same card ordering and semantics.
 */
export function buildMobileAgUiTurn(args: {
  assistantText?: string;
  properties?: MobileProperty[];
  cards?: MobileAssistantCard[];
}): MobileAgUiTurn | undefined {
  return buildBuyerUiTurn({
    assistantText: args.assistantText,
    properties: args.properties,
    cards: args.cards,
    targetZone: "mobile_app",
  });
}
