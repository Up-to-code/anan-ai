import type { MutationCtx } from "../../../_generated/server";
import type { Id } from "../../../_generated/dataModel";
import type { AssistantKind, AssistantOwner, ThreadScope } from "./types";
import { isWorkspaceKind } from "./utils";

function resolveThreadScope(args: {
  ownerType: "broker" | "RED" | "user";
  assistantKind?: AssistantKind;
}): ThreadScope {
  if (
    isWorkspaceKind(args.assistantKind) &&
    (args.ownerType === "broker" || args.ownerType === "RED")
  ) {
    return "organization";
  }
  return "user";
}

type SaveConversationArgs = {
  threadId?: Id<"assistantThreads">;
  userId: string;
  ownerType: "broker" | "RED" | "user";
  ownerBrokerId?: Id<"brokers">;
  ownerREDId?: Id<"RED">;
  userMessage: string;
  userMessageMetadata?: Record<string, unknown>;
  persistUserMessage?: boolean;
  assistantMessage: string;
  assistantMetadata?: Record<string, unknown>;
  mode: "qa" | "action";
  assistantKind?: AssistantKind;
  orchestratorName?: string;
};

async function ensureAssistantThread(ctx: MutationCtx, args: SaveConversationArgs, now: number) {
  if (args.threadId) return args.threadId;
  return ctx.db.insert("assistantThreads", {
    userId: args.userId,
    scope: resolveThreadScope({
      ownerType: args.ownerType,
      assistantKind: args.assistantKind,
    }),
    ownerType: args.ownerType,
    ownerBrokerId: args.ownerBrokerId,
    ownerREDId: args.ownerREDId,
    mode: args.mode,
    assistantKind: args.assistantKind ?? "default",
    orchestratorName: args.orchestratorName,
    title: args.userMessage.slice(0, 80),
    createdAt: now,
    updatedAt: now,
  });
}

async function insertUserMessageIfEnabled(
  ctx: MutationCtx,
  threadId: Id<"assistantThreads">,
  args: SaveConversationArgs,
  now: number
) {
  if (args.persistUserMessage === false) return null;
  return ctx.db.insert("assistantMessages", {
    threadId,
    role: "user",
    content: args.userMessage,
    mode: args.mode,
    metadata: args.userMessageMetadata,
    createdAt: now,
  });
}

async function insertAssistantMessage(ctx: MutationCtx, threadId: Id<"assistantThreads">, args: SaveConversationArgs, now: number) {
  return ctx.db.insert("assistantMessages", {
    threadId,
    role: "assistant",
    content: args.assistantMessage,
    mode: args.mode,
    metadata: args.assistantMetadata,
    createdAt: now + 1,
  });
}

async function updateThreadMetadata(ctx: MutationCtx, threadId: Id<"assistantThreads">, args: SaveConversationArgs, now: number) {
  await ctx.db.patch(threadId, {
    updatedAt: now,
    mode: args.mode,
    assistantKind: args.assistantKind ?? "default",
    orchestratorName: args.orchestratorName,
  });
}

/**
 * Persists a conversation step: creates a thread if needed,
 * saves both user and assistant messages, and updates the thread timestamp.
 */
export async function saveConversationStep(
  ctx: MutationCtx,
  args: SaveConversationArgs
) {
  const now = Date.now();
  const threadId = await ensureAssistantThread(ctx, args, now);
  const userMessageId = await insertUserMessageIfEnabled(ctx, threadId, args, now);
  const assistantMessageId = await insertAssistantMessage(ctx, threadId, args, now);
  await updateThreadMetadata(ctx, threadId, args, now);
  return { threadId, userMessageId, assistantMessageId };
}

/**
 * Creates an empty assistant thread so the UI can start from a durable thread id
 * before the first message is sent.
 */
export async function createAssistantThread(
  ctx: MutationCtx,
  args: {
    owner: AssistantOwner;
    mode?: "qa" | "action";
    assistantKind?: AssistantKind;
    orchestratorName?: string;
    title?: string;
  }
) {
  const now = Date.now();
  const mode = args.mode ?? "qa";
  const assistantKind = args.assistantKind ?? "default";

  const threadId = await ctx.db.insert("assistantThreads", {
    userId: args.owner.userId,
    scope: resolveThreadScope({
      ownerType: args.owner.ownerType,
      assistantKind,
    }),
    ownerType: args.owner.ownerType,
    ownerBrokerId: args.owner.ownerBrokerId,
    ownerREDId: args.owner.ownerREDId,
    mode,
    assistantKind,
    orchestratorName: args.orchestratorName,
    title: args.title,
    createdAt: now,
    updatedAt: now,
  });

  return { threadId };
}
