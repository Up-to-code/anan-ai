import { type Infer, v } from "convex/values";
import {
  mobileAssistantResultCardValidator,
  mobilePropertyFeedItemValidator,
  mobileQualificationContextValidator,
} from "../mobile/contracts";

/**
 * WHY:   The WhatsApp buyer state machine needs one shared source of truth for persisted turn states.
 * WHAT:  Validates all supported deterministic buyer states.
 * HOW:   Restricts the flow to the states that the persisted channel state table understands.
 */
export const buyerChannelStateValidator = v.union(
  v.literal("idle"),
  v.literal("search_results"),
  v.literal("property_selected"),
  v.literal("handoff_ready"),
);

/**
 * WHY:   The user-zone WhatsApp orchestrator needs one stable internal response envelope.
 * WHAT:  Validates the structured buyer turn returned before channel transport formatting.
 * HOW:   Reuses the mobile property and card contracts so buyer logic stays consistent across channels.
 */
export const userWhatsAppTurnResultValidator = v.object({
  threadId: v.id("assistantThreads"),
  state: buyerChannelStateValidator,
  message: v.string(),
  properties: v.array(mobilePropertyFeedItemValidator),
  cards: v.array(mobileAssistantResultCardValidator),
  selectedPropertyId: v.optional(v.id("properties")),
  nextActions: v.array(v.string()),
});

const replyButtonValidator = v.object({
  id: v.string(),
  title: v.string(),
});

const listRowValidator = v.object({
  id: v.string(),
  title: v.string(),
  description: v.optional(v.string()),
});

const textOutboundValidator = v.object({
  type: v.literal("text"),
  text: v.string(),
});

const replyButtonsOutboundValidator = v.object({
  type: v.literal("reply_buttons"),
  body: v.string(),
  footer: v.optional(v.string()),
  buttons: v.array(replyButtonValidator),
});

const listOutboundValidator = v.object({
  type: v.literal("list"),
  header: v.optional(v.string()),
  body: v.string(),
  footer: v.optional(v.string()),
  buttonText: v.string(),
  sectionTitle: v.string(),
  rows: v.array(listRowValidator),
});

/**
 * WHY:   The ai_zone adapter needs a transport-ready outbound sequence contract from user_zone.
 * WHAT:  Validates every WhatsApp message variant emitted by the deterministic buyer flow.
 * HOW:   Keeps transport concerns explicit: plain text, reply buttons, and list messages only.
 */
export const whatsappOutboundMessageValidator = v.union(
  textOutboundValidator,
  replyButtonsOutboundValidator,
  listOutboundValidator,
);

/**
 * WHY:   The webhook adapter delegates exactly one buyer turn at a time into user_zone.
 * WHAT:  Validates the normalized inbound WhatsApp turn arguments.
 * HOW:   Preserves the transport metadata the state machine needs for dedupe and reply decoding.
 */
export const incomingWhatsAppTurnArgsValidator = v.object({
  userId: v.string(),
  message: v.string(),
  displayName: v.optional(v.string()),
  messageId: v.optional(v.string()),
  messageType: v.union(
    v.literal("text"),
    v.literal("image"),
    v.literal("audio"),
    v.literal("video"),
    v.literal("document"),
    v.literal("interactive_button_reply"),
    v.literal("interactive_list_reply"),
  ),
  interactiveReplyId: v.optional(v.string()),
  interactiveReplyTitle: v.optional(v.string()),
  qualification: v.optional(mobileQualificationContextValidator),
});

/**
 * WHY:   The ai_zone webhook needs both business-state output and transport output from one internal action.
 * WHAT:  Validates the complete result returned by the deterministic buyer flow.
 * HOW:   Wraps the buyer turn state with a sequence of transport-ready outbound messages.
 */
export const userWhatsAppReplyValidator = v.object({
  turn: userWhatsAppTurnResultValidator,
  outboundMessages: v.array(whatsappOutboundMessageValidator),
});

export type BuyerChannelState = Infer<typeof buyerChannelStateValidator>;
export type MobileQualification = Infer<typeof mobileQualificationContextValidator>;
export type MobileAssistantCard = Infer<typeof mobileAssistantResultCardValidator>;
export type MobilePropertyFeedItem = Infer<typeof mobilePropertyFeedItemValidator>;
export type UserWhatsAppTurnResult = Infer<typeof userWhatsAppTurnResultValidator>;
export type WhatsAppOutboundMessage = Infer<typeof whatsappOutboundMessageValidator>;
export type UserWhatsAppReply = Infer<typeof userWhatsAppReplyValidator>;
