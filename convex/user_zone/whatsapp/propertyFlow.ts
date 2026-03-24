import type {
  MobileAssistantCard,
  MobilePropertyFeedItem,
  UserWhatsAppReply,
  WhatsAppOutboundMessage,
} from "./contracts";
import { buildPropertySummary, renderCardsAsText } from "./formatters";

type PropertyAction = "finance" | "roi" | "advisor" | "permit" | "compare";

function buildPropertyButtons(): WhatsAppOutboundMessage {
  return {
    type: "reply_buttons",
    body: "اختر الخطوة التالية لهذا العقار.",
    footer: "يمكنك أيضاً كتابة: تصريح أو مقارنة أو إرسال بحث جديد.",
    buttons: [
      { id: "property_action:finance", title: "تمويل" },
      { id: "property_action:roi", title: "عائد" },
      { id: "property_action:advisor", title: "مستشار" },
    ],
  };
}

function buildHandoffCard(): MobileAssistantCard {
  return {
    type: "broker_handoff",
    title: "تحويل إلى مستشار",
    handoffStatus: "qualified",
    summary: "تم تسجيل طلبك وتحويله لفريق المتابعة داخل عنان.",
  };
}

/**
 * WHY:   After search, the buyer needs one focused property-selection response on WhatsApp.
 * WHAT:  Builds the selected-property turn and its follow-up buttons.
 * HOW:   Keeps the summary compact, then exposes the three primary next actions as reply buttons.
 */
export function buildPropertySelectionReply(params: {
  threadId: UserWhatsAppReply["turn"]["threadId"];
  property: MobilePropertyFeedItem;
}): UserWhatsAppReply {
  const summary = buildPropertySummary(params.property);
  return {
    turn: {
      threadId: params.threadId,
      state: "property_selected",
      message: summary,
      properties: [params.property],
      cards: [],
      selectedPropertyId: params.property.id,
      nextActions: ["finance", "roi", "advisor", "permit", "compare"],
    },
    outboundMessages: [
      { type: "text", text: summary },
      buildPropertyButtons(),
    ],
  };
}

/**
 * WHY:   Property follow-up actions should stay within the same selected-property context on WhatsApp.
 * WHAT:  Builds the action reply text from deterministic buyer cards plus reusable next-action buttons.
 * HOW:   Renders cards into compact Arabic text and keeps the property selected for the next turn.
 */
export function buildPropertyCardsReply(params: {
  threadId: UserWhatsAppReply["turn"]["threadId"];
  property: MobilePropertyFeedItem;
  action: Exclude<PropertyAction, "advisor">;
  cards: MobileAssistantCard[];
}): UserWhatsAppReply {
  const message = renderCardsAsText(params.cards);
  return {
    turn: {
      threadId: params.threadId,
      state: "property_selected",
      message,
      properties: [params.property],
      cards: params.cards,
      selectedPropertyId: params.property.id,
      nextActions: ["finance", "roi", "advisor", "permit", "compare"],
    },
    outboundMessages: [
      { type: "text", text: message },
      buildPropertyButtons(),
    ],
  };
}

/**
 * WHY:   Advisor handoff confirmation needs to close the buyer loop and preserve the selected property.
 * WHAT:  Builds the deterministic handoff confirmation reply after the CRM order is created.
 * HOW:   Adds a broker handoff card for transcript parity and returns a text confirmation only.
 */
export function buildHandoffReply(params: {
  threadId: UserWhatsAppReply["turn"]["threadId"];
  property: MobilePropertyFeedItem;
}): UserWhatsAppReply {
  const cards = [buildHandoffCard()];
  const message = `تم تسجيل طلب المستشار لعقار ${params.property.title}. سيتواصل معك الفريق على نفس الرقم قريباً.`;
  return {
    turn: {
      threadId: params.threadId,
      state: "handoff_ready",
      message,
      properties: [params.property],
      cards,
      selectedPropertyId: params.property.id,
      nextActions: ["search"],
    },
    outboundMessages: [{ type: "text", text: message }],
  };
}

/**
 * WHY:   The state machine still needs a safe recovery reply when a selected property is no longer available.
 * WHAT:  Builds a fallback message that asks the buyer to run a fresh search.
 * HOW:   Resets the state externally while keeping the reply concise and actionable.
 */
export function buildMissingPropertyReply(
  threadId: UserWhatsAppReply["turn"]["threadId"],
): UserWhatsAppReply {
  const message = "العقار المختار لم يعد متاحاً في هذه اللحظة. أرسل بحثاً جديداً لنقترح عليك بدائل مناسبة.";
  return {
    turn: {
      threadId,
      state: "idle",
      message,
      properties: [],
      cards: [],
      nextActions: ["search"],
    },
    outboundMessages: [{ type: "text", text: message }],
  };
}
