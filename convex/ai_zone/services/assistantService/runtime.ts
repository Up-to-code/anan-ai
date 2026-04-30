import {
  createThread as createAgentThread,
  saveMessage as saveAgentMessage,
  type AgentComponent,
  type MessageDoc,
} from "@convex-dev/agent";
import { components } from "../../../_generated/api";
import type { Doc, Id } from "../../../_generated/dataModel";
import type { ActionCtx, MutationCtx } from "../../../_generated/server";
import type {
  AssistantMessageRecord,
  AssistantThreadRecord,
} from "./types";
import { normalizeAssistantKind } from "./utils";

const AGENT_COMPONENT = components.agent as unknown as AgentComponent;
const MESSAGE_PAGE_SIZE = 256;

type AnyCtx = any;

export function getAgentComponent() {
  return AGENT_COMPONENT;
}

function readMetadataObject(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function readMessageText(message: MessageDoc) {
  if (typeof message.text === "string") return message.text;
  const content = message.message?.content;
  return typeof content === "string" ? content : "";
}

export function mapAssistantThreadState(
  thread: Doc<"assistantThreadState">,
): AssistantThreadRecord {
  return {
    _id: thread.threadId,
    userId: thread.userId,
    scope: thread.scope,
    ownerType: thread.ownerType,
    ownerBrokerId: thread.ownerBrokerId,
    ownerREDId: thread.ownerREDId,
    mode: thread.mode,
    channel: thread.channel,
    orchestratorName: thread.orchestratorName,
    assistantKind: normalizeAssistantKind(thread.assistantKind),
    title: thread.title,
    legacyThreadId: thread.legacyThreadId,
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
  };
}

export function mapAssistantMessageState(args: {
  message: MessageDoc;
  state?: Doc<"assistantMessageState"> | null;
}): AssistantMessageRecord {
  const role =
    args.message.message?.role === "user" || args.message.message?.role === "assistant"
      ? args.message.message.role
      : (args.state?.role ?? "assistant");

  return {
    _id: args.message._id,
    threadId: args.message.threadId,
    role,
    content: readMessageText(args.message),
    mode: args.state?.mode ?? "qa",
    metadata: readMetadataObject(args.state?.metadata),
    legacyMessageId: args.state?.legacyMessageId,
    promptMessageId: args.state?.promptMessageId,
    createdAt: args.state?.createdAt ?? args.message._creationTime,
  };
}

export async function getAssistantThreadStateByThreadId(
  ctx: AnyCtx,
  threadId: string,
) {
  return ctx.db
    .query("assistantThreadState")
    .withIndex("threadId", (q: any) => q.eq("threadId", threadId))
    .first();
}

export async function getAssistantThreadStateByLegacyThreadId(
  ctx: AnyCtx,
  legacyThreadId: Id<"assistantThreads">,
) {
  return ctx.db
    .query("assistantThreadState")
    .withIndex("legacyThreadId", (q: any) => q.eq("legacyThreadId", legacyThreadId))
    .first();
}

export async function getAssistantMessageStateByMessageId(
  ctx: AnyCtx,
  messageId: string,
) {
  return ctx.db
    .query("assistantMessageState")
    .withIndex("messageId", (q: any) => q.eq("messageId", messageId))
    .first();
}

export async function getAssistantMessageStateByLegacyMessageId(
  ctx: AnyCtx,
  legacyMessageId: Id<"assistantMessages">,
) {
  return ctx.db
    .query("assistantMessageState")
    .withIndex("legacyMessageId", (q: any) => q.eq("legacyMessageId", legacyMessageId))
    .first();
}

export async function listAssistantMessageStatesByThreadId(
  ctx: AnyCtx,
  threadId: string,
) {
  return ctx.db
    .query("assistantMessageState")
    .withIndex("threadId_createdAt", (q: any) => q.eq("threadId", threadId))
    .collect();
}

export async function listAgentThreadMessages(
  ctx: AnyCtx,
  threadId: string,
): Promise<MessageDoc[]> {
  const messages: MessageDoc[] = [];
  let cursor: string | null = null;

  while (true) {
    const page: {
      page: MessageDoc[];
      continueCursor: string;
      isDone: boolean;
    } = await ctx.runQuery(
      AGENT_COMPONENT.messages.listMessagesByThreadId as any,
      {
        order: "asc",
        threadId,
        excludeToolMessages: true,
        paginationOpts: {
          cursor,
          numItems: MESSAGE_PAGE_SIZE,
        },
      },
    );

    messages.push(...(page.page as MessageDoc[]));
    if (page.isDone) break;
    cursor = page.continueCursor;
  }

  return messages;
}

export async function getAgentMessageById(
  ctx: AnyCtx,
  messageId: string,
): Promise<MessageDoc | null> {
  const messages = await ctx.runQuery(
    AGENT_COMPONENT.messages.getMessagesByIds as any,
    { messageIds: [messageId] },
  );
  return ((messages as MessageDoc[])[0] ?? null);
}

export async function createCanonicalThread(
  ctx: MutationCtx | ActionCtx,
  args: { userId?: string | null; title?: string; summary?: string },
) {
  return createAgentThread(ctx, AGENT_COMPONENT, args);
}

export async function saveCanonicalMessage(
  ctx: MutationCtx | ActionCtx,
  args: {
    threadId: string;
    role: "user" | "assistant";
    content: string;
    promptMessageId?: string;
  },
) {
  return saveAgentMessage(ctx, AGENT_COMPONENT, {
    threadId: args.threadId,
    promptMessageId: args.promptMessageId,
    message: {
      role: args.role,
      content: args.content,
    },
  });
}

export async function rewriteCanonicalAssistantMessage(
  ctx: MutationCtx | ActionCtx,
  args: {
    messageId: string;
    content: string;
  },
) {
  return ctx.runMutation(AGENT_COMPONENT.messages.updateMessage as any, {
    messageId: args.messageId,
    patch: {
      message: {
        role: "assistant",
        content: args.content,
      },
    },
  });
}
