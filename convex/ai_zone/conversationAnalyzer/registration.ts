import type { MutationCtx } from "../../_generated/server";
import type { Id } from "../../_generated/dataModel";
import type { AssistantKind } from "../services/assistantService/types";
import {
  BUYER_ANALYZER_ASSISTANT_KINDS,
  type BuyerAnalyzerAssistantKind,
} from "./constants";
import { getNextConversationAnalyzerWindow } from "./time";

function toBuyerAssistantKind(
  assistantKind?: AssistantKind,
): BuyerAnalyzerAssistantKind | null {
  const normalized = assistantKind ?? "default";
  return BUYER_ANALYZER_ASSISTANT_KINDS.includes(
    normalized as BuyerAnalyzerAssistantKind,
  )
    ? (normalized as BuyerAnalyzerAssistantKind)
    : null;
}

/**
 * WHY:   Live assistant persistence should only queue buyer threads for later analysis instead of doing heavy market work inline.
 * WHAT:  Creates or refreshes one draft analyzer row for the buyer thread's next Riyadh-noon batch window.
 * HOW:   Filters to buyer assistant kinds, computes the target noon run key, and upserts a draft analysis row keyed by `threadId + runKey`.
 */
export async function registerConversationAnalysisDraft(
  ctx: MutationCtx,
  args: {
    threadId: Id<"assistantThreads">;
    userId: string;
    ownerType: "broker" | "RED" | "user";
    assistantKind?: AssistantKind;
    timestampMs: number;
  },
) {
  if (args.ownerType !== "user") return null;
  const buyerAssistantKind = toBuyerAssistantKind(args.assistantKind);
  if (!buyerAssistantKind) return null;

  const window = getNextConversationAnalyzerWindow(args.timestampMs);
  const existing = await ctx.db
    .query("aiConversationAnalyses")
    .withIndex("by_threadId_runKey", (q) =>
      q.eq("threadId", args.threadId).eq("runKey", window.runKey),
    )
    .first();

  if (existing) {
    await ctx.db.patch(existing._id, {
      userId: args.userId,
      assistantKind: buyerAssistantKind,
      updatedAt: args.timestampMs,
      firstMessageAt: Math.min(existing.firstMessageAt, args.timestampMs),
      lastMessageAt: Math.max(existing.lastMessageAt, args.timestampMs),
    });
    return existing._id;
  }

  return ctx.db.insert("aiConversationAnalyses", {
    threadId: args.threadId,
    userId: args.userId,
    assistantKind: buyerAssistantKind,
    runKey: window.runKey,
    windowStartMs: window.windowStartMs,
    windowEndMs: window.windowEndMs,
    timezone: window.timezone,
    status: "draft",
    attemptCount: 0,
    messageCount: 0,
    firstMessageAt: args.timestampMs,
    lastMessageAt: args.timestampMs,
    createdAt: args.timestampMs,
    updatedAt: args.timestampMs,
  });
}
