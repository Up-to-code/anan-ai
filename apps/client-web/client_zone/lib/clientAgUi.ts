import { buildBuyerUiTurn } from "./buyerAssistantShared";
import type { AssistantCard, ClientAgUiTurn, ClientProperty } from "./types";

/**
 * WHY:   Live client assistant messages still arrive as property arrays plus domain cards.
 * WHAT:  Converts assistant payloads into the AG UI turn model rendered by the chat surface.
 * HOW:   Delegates to the shared buyer assistant mapper so web and mobile stay aligned.
 */
export function buildClientUiTurn({
  assistantText,
  properties = [],
  cards = [],
}: {
  assistantText?: string;
  properties?: ClientProperty[];
  cards?: AssistantCard[];
}): ClientAgUiTurn | undefined {
  return buildBuyerUiTurn({
    assistantText,
    properties,
    cards,
    targetZone: "client_web",
  });
}
