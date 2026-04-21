import type { Id } from "../../../_generated/dataModel";
import type { MutationCtx } from "../../../_generated/server";
import { registerConversationAnalysisDraft } from "../../conversationAnalyzer/registration";
import {
  createCanonicalThread,
  getAssistantThreadStateByThreadId,
  mapAssistantThreadState,
  saveCanonicalMessage,
} from "./runtime";
import type {
  AssistantKind,
  AssistantOwner,
  AssistantThreadRecord,
  ThreadScope,
} from "./types";
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
  threadId?: string;
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

async function createLegacyThread(
  ctx: MutationCtx,
  args: {
    userId: string;
    ownerType: "broker" | "RED" | "user";
    ownerBrokerId?: Id<"brokers">;
    ownerREDId?: Id<"RED">;
    mode: "qa" | "action";
    assistantKind?: AssistantKind;
    orchestratorName?: string;
    title?: string;
    createdAt: number;
  },
) {
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
    title: args.title,
    createdAt: args.createdAt,
    updatedAt: args.createdAt,
  });
}

async function ensureAssistantThread(
  ctx: MutationCtx,
  args: SaveConversationArgs,
  now: number,
): Promise<AssistantThreadRecord> {
  const title = args.userMessage.slice(0, 80);
  if (args.threadId) {
    const existingState = await getAssistantThreadStateByThreadId(ctx, args.threadId);
    if (existingState) {
      return mapAssistantThreadState(existingState);
    }

    const legacyThreadId = ctx.db.normalizeId("assistantThreads", args.threadId);
    const legacyThread = legacyThreadId ? await ctx.db.get(legacyThreadId) : null;
    if (legacyThread) {
      const canonicalThreadId = await createCanonicalThread(ctx, {
        userId: args.userId,
        title: legacyThread.title ?? title,
      });
      await ctx.db.insert("assistantThreadState", {
        threadId: canonicalThreadId,
        userId: legacyThread.userId,
        scope: legacyThread.scope,
        ownerType: legacyThread.ownerType,
        ownerBrokerId: legacyThread.ownerBrokerId,
        ownerREDId: legacyThread.ownerREDId,
        mode: legacyThread.mode,
        orchestratorName: legacyThread.orchestratorName,
        assistantKind: legacyThread.assistantKind,
        title: legacyThread.title,
        legacyThreadId: legacyThreadId ?? undefined,
        migrationStatus: "backfilled",
        createdAt: legacyThread.createdAt,
        updatedAt: legacyThread.updatedAt,
      });
      return {
        _id: canonicalThreadId,
        userId: legacyThread.userId,
        scope: legacyThread.scope,
        ownerType: legacyThread.ownerType,
        ownerBrokerId: legacyThread.ownerBrokerId,
        ownerREDId: legacyThread.ownerREDId,
        mode: legacyThread.mode,
        orchestratorName: legacyThread.orchestratorName,
        assistantKind: legacyThread.assistantKind,
        title: legacyThread.title,
        legacyThreadId: legacyThreadId ?? undefined,
        createdAt: legacyThread.createdAt,
        updatedAt: legacyThread.updatedAt,
      };
    }

    throw new Error(`ASSISTANT_THREAD_NOT_FOUND:${args.threadId}`);
  }

  const canonicalThreadId = await createCanonicalThread(ctx, {
    userId: args.userId,
    title,
  });
  const legacyThreadId = await createLegacyThread(ctx, {
    userId: args.userId,
    ownerType: args.ownerType,
    ownerBrokerId: args.ownerBrokerId,
    ownerREDId: args.ownerREDId,
    mode: args.mode,
    assistantKind: args.assistantKind,
    orchestratorName: args.orchestratorName,
    title,
    createdAt: now,
  });

  await ctx.db.insert("assistantThreadState", {
    threadId: canonicalThreadId,
    userId: args.userId,
    scope: resolveThreadScope({
      ownerType: args.ownerType,
      assistantKind: args.assistantKind,
    }),
    ownerType: args.ownerType,
    ownerBrokerId: args.ownerBrokerId,
    ownerREDId: args.ownerREDId,
    mode: args.mode,
    orchestratorName: args.orchestratorName,
    assistantKind: args.assistantKind ?? "default",
    title,
    legacyThreadId,
    migrationStatus: "canonical",
    createdAt: now,
    updatedAt: now,
  });

  return {
    _id: canonicalThreadId,
    userId: args.userId,
    scope: resolveThreadScope({
      ownerType: args.ownerType,
      assistantKind: args.assistantKind,
    }),
    ownerType: args.ownerType,
    ownerBrokerId: args.ownerBrokerId,
    ownerREDId: args.ownerREDId,
    mode: args.mode,
    orchestratorName: args.orchestratorName,
    assistantKind: args.assistantKind ?? "default",
    title,
    legacyThreadId,
    createdAt: now,
    updatedAt: now,
  };
}

async function insertUserMessageIfEnabled(
  ctx: MutationCtx,
  thread: AssistantThreadRecord,
  args: SaveConversationArgs,
  now: number,
) {
  if (args.persistUserMessage === false) return null;

  const legacyMessageId = thread.legacyThreadId
    ? await ctx.db.insert("assistantMessages", {
        threadId: thread.legacyThreadId,
        role: "user",
        content: args.userMessage,
        mode: args.mode,
        metadata: args.userMessageMetadata,
        createdAt: now,
      })
    : undefined;

  const canonical = await saveCanonicalMessage(ctx, {
    threadId: thread._id,
    role: "user",
    content: args.userMessage,
  });

  await ctx.db.insert("assistantMessageState", {
    messageId: canonical.messageId,
    threadId: thread._id,
    role: "user",
    mode: args.mode,
    metadata: args.userMessageMetadata,
    legacyMessageId,
    createdAt: now,
  });

  return {
    messageId: canonical.messageId,
    legacyMessageId,
  };
}

async function insertAssistantMessage(
  ctx: MutationCtx,
  thread: AssistantThreadRecord,
  args: SaveConversationArgs,
  now: number,
  promptMessageId?: string,
) {
  const legacyMessageId = thread.legacyThreadId
    ? await ctx.db.insert("assistantMessages", {
        threadId: thread.legacyThreadId,
        role: "assistant",
        content: args.assistantMessage,
        mode: args.mode,
        metadata: args.assistantMetadata,
        createdAt: now + 1,
      })
    : undefined;

  const canonical = await saveCanonicalMessage(ctx, {
    threadId: thread._id,
    role: "assistant",
    content: args.assistantMessage,
    promptMessageId,
  });

  await ctx.db.insert("assistantMessageState", {
    messageId: canonical.messageId,
    threadId: thread._id,
    role: "assistant",
    mode: args.mode,
    metadata: args.assistantMetadata,
    legacyMessageId,
    promptMessageId,
    createdAt: now + 1,
  });

  return {
    messageId: canonical.messageId,
    legacyMessageId,
  };
}

async function updateThreadMetadata(
  ctx: MutationCtx,
  thread: AssistantThreadRecord,
  args: SaveConversationArgs,
  now: number,
) {
  const threadState = await getAssistantThreadStateByThreadId(ctx, thread._id);
  if (threadState) {
    await ctx.db.patch(threadState._id, {
      updatedAt: now,
      mode: args.mode,
      assistantKind: args.assistantKind ?? "default",
      orchestratorName: args.orchestratorName,
      title: threadState.title ?? args.userMessage.slice(0, 80),
    });
  }

  if (thread.legacyThreadId) {
    await ctx.db.patch(thread.legacyThreadId, {
      updatedAt: now,
      mode: args.mode,
      assistantKind: args.assistantKind ?? "default",
      orchestratorName: args.orchestratorName,
      title: thread.title ?? args.userMessage.slice(0, 80),
    });
  }
}

export async function saveConversationStep(
  ctx: MutationCtx,
  args: SaveConversationArgs,
) {
  const now = Date.now();
  const thread = await ensureAssistantThread(ctx, args, now);
  const userMessage = await insertUserMessageIfEnabled(ctx, thread, args, now);
  const assistantMessage = await insertAssistantMessage(
    ctx,
    thread,
    args,
    now,
    userMessage?.messageId,
  );
  await updateThreadMetadata(ctx, thread, args, now);
  if (thread.legacyThreadId) {
    await registerConversationAnalysisDraft(ctx, {
      threadId: thread.legacyThreadId,
      userId: args.userId,
      ownerType: args.ownerType,
      assistantKind: args.assistantKind,
      timestampMs: now,
    });
  }

  return {
    threadId: thread._id,
    userMessageId: userMessage?.messageId,
    assistantMessageId: assistantMessage.messageId,
    legacyThreadId: thread.legacyThreadId,
    legacyUserMessageId: userMessage?.legacyMessageId,
    legacyAssistantMessageId: assistantMessage.legacyMessageId,
  };
}

export async function createAssistantThread(
  ctx: MutationCtx,
  args: {
    owner: AssistantOwner;
    mode?: "qa" | "action";
    assistantKind?: AssistantKind;
    orchestratorName?: string;
    title?: string;
  },
) {
  const now = Date.now();
  const mode = args.mode ?? "qa";
  const assistantKind = args.assistantKind ?? "default";
  const canonicalThreadId = await createCanonicalThread(ctx, {
    userId: args.owner.userId,
    title: args.title,
  });
  const legacyThreadId = await createLegacyThread(ctx, {
    userId: args.owner.userId,
    ownerType: args.owner.ownerType,
    ownerBrokerId: args.owner.ownerBrokerId,
    ownerREDId: args.owner.ownerREDId,
    mode,
    assistantKind,
    orchestratorName: args.orchestratorName,
    title: args.title,
    createdAt: now,
  });

  await ctx.db.insert("assistantThreadState", {
    threadId: canonicalThreadId,
    userId: args.owner.userId,
    scope: resolveThreadScope({
      ownerType: args.owner.ownerType,
      assistantKind,
    }),
    ownerType: args.owner.ownerType,
    ownerBrokerId: args.owner.ownerBrokerId,
    ownerREDId: args.owner.ownerREDId,
    mode,
    orchestratorName: args.orchestratorName,
    assistantKind,
    title: args.title,
    legacyThreadId,
    migrationStatus: "canonical",
    createdAt: now,
    updatedAt: now,
  });

  return { threadId: canonicalThreadId, legacyThreadId };
}
