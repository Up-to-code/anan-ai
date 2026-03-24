import { type Id } from "../../_generated/dataModel";
import { api, internal } from "../../_generated/api";
import { internalAction } from "../../_generated/server";
import { buildAssistantResponse } from "../mobile/assistant";
import {
  incomingWhatsAppTurnArgsValidator,
  type BuyerChannelState,
  type MobileAssistantCard,
  type MobilePropertyFeedItem,
  type MobileQualification,
  type UserWhatsAppReply,
  userWhatsAppReplyValidator,
} from "./contracts";
import {
  buildAssistantTranscript,
} from "./formatters";
import { buildHandoffReply, buildMissingPropertyReply, buildPropertyCardsReply, buildPropertySelectionReply } from "./propertyFlow";
import { buildSearchReply } from "./searchFlow";

const CHANNEL = "whatsapp";
const FINANCE_KEYWORDS = ["loan", "mortgage", "finance", "payment", "eligibility", "تمويل", "قرض", "راتب", "أهلية", "قسط"];
const ROI_KEYWORDS = ["roi", "yield", "investment", "return", "عائد", "استثمار"];
const PERMIT_KEYWORDS = ["permit", "legal", "license", "تصريح", "رخصة", "قانون"];
const COMPARE_KEYWORDS = ["compare", "comparison", "قارن", "مقارنة"];
const ADVISOR_KEYWORDS = ["advisor", "handoff", "book", "visit", "call", "contact", "مستشار", "زيارة", "احجز", "تواصل"];

type StoredBuyerState = {
  channel: "whatsapp" | "app" | "web";
  userId: string;
  threadId?: Id<"assistantThreads">;
  state: BuyerChannelState;
  selectedPropertyId?: Id<"properties">;
  lastResultPropertyIds: Id<"properties">[];
  lastSearchQuery?: string;
  qualification?: MobileQualification;
};

type PropertyAction = "finance" | "roi" | "advisor" | "permit" | "compare";

function matchesIntent(message: string, keywords: string[]) {
  return keywords.some((keyword) => message.includes(keyword));
}

function normalizeArabicDigits(input: string) {
  const digitMap: Record<string, string> = {
    "٠": "0",
    "١": "1",
    "٢": "2",
    "٣": "3",
    "٤": "4",
    "٥": "5",
    "٦": "6",
    "٧": "7",
    "٨": "8",
    "٩": "9",
  };

  return input
    .split("")
    .map((char) => digitMap[char] ?? char)
    .join("");
}

function parseFirstNumber(input: string) {
  const normalized = normalizeArabicDigits(input);
  const match = normalized.match(/\d[\d,.]*/);
  if (!match) return undefined;
  const parsed = Number(match[0].replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parsePreferredYears(input: string) {
  const normalized = normalizeArabicDigits(input).toLowerCase();
  const match = normalized.match(/(\d+)\s*(سنة|سنوات|year|years)/);
  if (!match) return undefined;
  const years = Number(match[1]);
  return Number.isFinite(years) ? years : undefined;
}

function mergeQualification(existing: MobileQualification | undefined, message: string) {
  const normalized = message.toLowerCase();
  const next: MobileQualification = { ...(existing ?? {}) };
  const firstNumber = parseFirstNumber(message);
  const preferredYears = parsePreferredYears(message);

  if (preferredYears !== undefined) {
    next.preferredYears = preferredYears;
  }
  if (firstNumber !== undefined) {
    if (normalized.includes("راتب") || normalized.includes("salary")) {
      next.monthlySalary = firstNumber;
    }
    if (normalized.includes("دفعة") || normalized.includes("down payment")) {
      next.downPayment = firstNumber;
    }
  }
  if (normalized.includes("موظف")) next.employmentStatus = "موظف";
  if (normalized.includes("self-employed") || normalized.includes("عمل حر")) {
    next.employmentStatus = "عمل حر";
  }
  return next;
}

function resolvePropertyAction(message: string): PropertyAction | "search" {
  const normalized = message.toLowerCase();
  if (matchesIntent(normalized, ADVISOR_KEYWORDS)) return "advisor";
  if (matchesIntent(normalized, ROI_KEYWORDS)) return "roi";
  if (matchesIntent(normalized, PERMIT_KEYWORDS)) return "permit";
  if (matchesIntent(normalized, COMPARE_KEYWORDS)) return "compare";
  if (matchesIntent(normalized, FINANCE_KEYWORDS)) return "finance";
  return "search";
}

function buildSyntheticMessage(action: Exclude<PropertyAction, "advisor">, originalMessage: string) {
  if (action === "finance") return `تمويل قسط راتب ${originalMessage}`;
  if (action === "roi") return `عائد استثمار ${originalMessage}`;
  if (action === "permit") return `تصريح قانون ${originalMessage}`;
  return `مقارنة قارن ${originalMessage}`;
}

function filterCardsForAction(action: Exclude<PropertyAction, "advisor">, cards: MobileAssistantCard[]) {
  if (action === "finance") {
    return cards.filter((card) => card.type === "payment_plan" || card.type === "mortgage_check");
  }
  if (action === "roi") {
    return cards.filter((card) => card.type === "roi_summary");
  }
  if (action === "permit") {
    return cards.filter((card) => card.type === "permit_status");
  }
  return cards.filter((card) => card.type === "comparison_table");
}

function decodeInteractiveReply(replyId?: string) {
  if (!replyId) return null;
  // Interactive reply ids are the only trusted bridge between the rendered buttons/list rows and state transitions.
  if (replyId.startsWith("select_property:")) {
    return {
      kind: "select_property" as const,
      propertyId: replyId.replace("select_property:", "") as Id<"properties">,
    };
  }
  if (replyId.startsWith("property_action:")) {
    const action = replyId.replace("property_action:", "") as PropertyAction;
    if (["finance", "roi", "advisor", "permit", "compare"].includes(action)) {
      return { kind: "property_action" as const, action };
    }
  }
  return null;
}

function buildDefaultState(userId: string): StoredBuyerState {
  return {
    channel: CHANNEL,
    userId,
    state: "idle",
    lastResultPropertyIds: [],
  };
}

async function loadPropertyContext(
  ctx: any,
  propertyId: Id<"properties">,
): Promise<MobilePropertyFeedItem | null> {
  return (await ctx.runQuery(internal.user_zone.mobile.feed.getPropertyContext as any, {
    propertyId,
  })) as MobilePropertyFeedItem | null;
}

async function runSearch(
  ctx: any,
  query: string,
): Promise<{ properties: MobilePropertyFeedItem[]; fallbackUsed: boolean }> {
  const results = await ctx.runQuery((api as any)["shared_logic/properties/search"].search, {
    query,
    limit: 10,
    onlyAvailable: true,
  });

  const mapped = (
    await Promise.all(
      results.map((result: { _id: Id<"properties"> }) =>
        loadPropertyContext(ctx, result._id),
      ),
    )
  ).filter(Boolean) as MobilePropertyFeedItem[];

  if (mapped.length > 0) {
    return {
      properties: mapped.slice(0, 10),
      fallbackUsed: false,
    };
  }

  const featured = await ctx.runQuery((api as any)["user_zone/mobile/feed"].listFeed, {
    paginationOpts: { numItems: 10, cursor: null },
  });

  return {
    properties: (featured.page ?? []).slice(0, 10) as MobilePropertyFeedItem[],
    fallbackUsed: true,
  };
}

async function persistStateAndTranscript(ctx: any, params: {
  userId: string;
  previousState: StoredBuyerState;
  nextState: StoredBuyerState;
  message: string;
  messageId?: string;
  messageType: string;
  interactiveReplyId?: string;
  reply: {
    turn: {
      threadId: Id<"assistantThreads">;
      state: BuyerChannelState;
      message: string;
      properties: MobilePropertyFeedItem[];
      cards: MobileAssistantCard[];
      selectedPropertyId?: Id<"properties">;
      nextActions: string[];
    };
    outboundMessages: any[];
  };
  actionType?: string;
}): Promise<Id<"assistantThreads">> {
  const assistantMessage = buildAssistantTranscript(
    params.reply.outboundMessages,
    params.reply.turn.message,
  );

  const saved = (await ctx.runMutation(internal.ai_zone.assistant._saveConversationStep, {
    threadId: params.previousState.threadId,
    userId: params.userId,
    ownerType: "user",
    userMessage: params.message,
    userMessageMetadata: {
      channel: CHANNEL,
      messageId: params.messageId,
      messageType: params.messageType,
      interactiveReplyId: params.interactiveReplyId,
    },
    assistantMessage,
    assistantMetadata: {
      channel: CHANNEL,
      selectedPropertyId: params.reply.turn.selectedPropertyId,
      actionType: params.actionType,
      resultPropertyIds: params.reply.turn.properties.map((property) => property.id),
    },
    mode: "qa",
  })) as { threadId: Id<"assistantThreads"> };

  // Keep the persisted buyer state aligned with the thread created or reused for this exact turn.
  await ctx.runMutation((internal as any)["user_zone/whatsapp/state"].upsertBuyerChannelState, {
    channel: CHANNEL,
    userId: params.userId,
    threadId: saved.threadId,
    state: params.nextState.state,
    selectedPropertyId: params.nextState.selectedPropertyId,
    lastResultPropertyIds: params.nextState.lastResultPropertyIds,
    lastSearchQuery: params.nextState.lastSearchQuery,
    qualification: params.nextState.qualification,
  });

  return saved.threadId as Id<"assistantThreads">;
}

/**
 * WHY:   The WhatsApp webhook needs one deterministic buyer-facing backend entrypoint.
 * WHAT:  Runs a single WhatsApp buyer turn over persisted state, search data, and CRM handoff logic.
 * HOW:   Resolves the current state, applies one explicit state transition, persists the transcript, then returns transport-ready messages.
 */
export const generateBuyerReply: any = internalAction({
  args: incomingWhatsAppTurnArgsValidator,
  returns: userWhatsAppReplyValidator,
  handler: async (ctx, args): Promise<UserWhatsAppReply> => {
    const previousState: StoredBuyerState =
      ((await ctx.runQuery((internal as any)["user_zone/whatsapp/state"].getBuyerChannelState, {
        channel: CHANNEL,
        userId: args.userId,
      })) as StoredBuyerState | null) ?? buildDefaultState(args.userId);

    const qualification = mergeQualification(
      args.qualification ?? previousState.qualification,
      args.message,
    );
    const decodedReply = decodeInteractiveReply(args.interactiveReplyId);
    const workingThreadId: Id<"assistantThreads"> =
      previousState.threadId ?? ("pending-thread" as Id<"assistantThreads">);

    let reply: UserWhatsAppReply;
    let nextState: StoredBuyerState;
    let actionType = "search";

    if (decodedReply?.kind === "select_property") {
      const property: MobilePropertyFeedItem | null = await loadPropertyContext(ctx, decodedReply.propertyId);
      reply = property
        ? buildPropertySelectionReply({
            threadId: workingThreadId,
            property,
          })
        : buildMissingPropertyReply(workingThreadId);

      nextState = property
        ? {
            channel: CHANNEL,
            userId: args.userId,
            threadId: previousState.threadId,
            state: "property_selected",
            selectedPropertyId: property.id,
            lastResultPropertyIds: previousState.lastResultPropertyIds,
            lastSearchQuery: previousState.lastSearchQuery,
            qualification,
          }
        : {
            channel: CHANNEL,
            userId: args.userId,
            threadId: previousState.threadId,
            state: "idle",
            lastResultPropertyIds: [],
            qualification,
          };
      actionType = "select_property";
    } else {
      const selectedPropertyId = previousState.selectedPropertyId;
      const propertyAction =
        decodedReply?.kind === "property_action"
          ? decodedReply.action
          : selectedPropertyId
            ? resolvePropertyAction(args.message)
            : "search";

      if (selectedPropertyId && propertyAction !== "search") {
        const property: MobilePropertyFeedItem | null = await loadPropertyContext(ctx, selectedPropertyId);
        if (!property) {
          reply = buildMissingPropertyReply(workingThreadId);
          nextState = {
            channel: CHANNEL,
            userId: args.userId,
            threadId: previousState.threadId,
            state: "idle",
            lastResultPropertyIds: [],
            qualification,
          };
        } else if (propertyAction === "advisor") {
          await ctx.runMutation((internal as any)["user_zone/whatsapp/handoff"].createQualifiedWhatsAppHandoff, {
            propertyId: property.id,
            userId: args.userId,
            message: args.message,
            threadId: previousState.threadId,
            qualification,
          });
          reply = buildHandoffReply({
            threadId: workingThreadId,
            property,
          });
          nextState = {
            channel: CHANNEL,
            userId: args.userId,
            threadId: previousState.threadId,
            state: "handoff_ready",
            selectedPropertyId: property.id,
            lastResultPropertyIds: previousState.lastResultPropertyIds,
            lastSearchQuery: previousState.lastSearchQuery,
            qualification,
          };
        } else {
          const built = buildAssistantResponse({
            property,
            message: buildSyntheticMessage(propertyAction, args.message),
            qualification,
          });
          const cards = filterCardsForAction(propertyAction, built.cards);
          reply = buildPropertyCardsReply({
            threadId: workingThreadId,
            property,
            action: propertyAction,
            cards,
          });
          nextState = {
            channel: CHANNEL,
            userId: args.userId,
            threadId: previousState.threadId,
            state: "property_selected",
            selectedPropertyId: property.id,
            lastResultPropertyIds: previousState.lastResultPropertyIds,
            lastSearchQuery: previousState.lastSearchQuery,
            qualification,
          };
        }
        actionType = propertyAction;
      } else {
        const search = await runSearch(ctx, args.message);
        reply = buildSearchReply({
          threadId: workingThreadId,
          properties: search.properties,
          fallbackUsed: search.fallbackUsed,
        });

        // Reset property focus when the buyer sends a fresh discovery request.
        nextState = {
          channel: CHANNEL,
          userId: args.userId,
          threadId: previousState.threadId,
          state: reply.turn.state,
          lastResultPropertyIds: reply.turn.properties.map((property) => property.id),
          lastSearchQuery: args.message,
          qualification,
        };
        actionType = "search";
      }
    }

    console.info("user_zone.whatsapp.turn", {
      channel: CHANNEL,
      userId: args.userId,
      messageId: args.messageId,
      messageType: args.messageType,
      stateBefore: previousState.state,
      stateAfter: nextState.state,
      threadId: previousState.threadId,
      selectedPropertyId: nextState.selectedPropertyId,
      actionType,
    });

    const threadId: Id<"assistantThreads"> = await persistStateAndTranscript(ctx, {
      userId: args.userId,
      previousState,
      nextState,
      message: args.message,
      messageId: args.messageId,
      messageType: args.messageType,
      interactiveReplyId: args.interactiveReplyId,
      reply,
      actionType,
    });

    return {
      turn: {
        ...reply.turn,
        threadId,
      },
      outboundMessages: reply.outboundMessages,
    };
  },
});
