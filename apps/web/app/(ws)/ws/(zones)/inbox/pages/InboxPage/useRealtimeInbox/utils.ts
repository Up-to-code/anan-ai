"use client";

import type { Id } from "@convex/dataModel";
import type {
  ConversationDetail,
  ConversationMessage,
  ConversationSummary,
} from "@/server/contracts/inbox";

/**
 * WHY:   The inbox should only auto-open the first conversation when the user has not already chosen one.
 * WHAT:  Returns the first conversation id eligible for automatic selection.
 * HOW:   Skips auto-selection when the route is already pinned to a conversation or when local state already has an active id.
 */
export function getInboxAutoSelectedConversationId(args: {
  activeConversationId: string | null;
  conversations: Array<{ id: string }>;
  hasInitializedAutoSelection?: boolean;
  hasConversationRoute: boolean;
}) {
  if (args.hasInitializedAutoSelection || args.hasConversationRoute || args.activeConversationId) {
    return null;
  }

  return args.conversations[0]?.id ?? null;
}

export function syncConversationUrl(conversationId: string | null, method: "push" | "replace" = "push") {
  if (typeof window === "undefined") return;
  const nextUrl = new URL(window.location.href);
  if (conversationId) {
    nextUrl.searchParams.set("conversationId", conversationId);
  } else {
    nextUrl.searchParams.delete("conversationId");
  }
  const nextHref = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
  if (method === "replace") {
    window.history.replaceState(null, "", nextHref);
    return;
  }
  window.history.pushState(null, "", nextHref);
}

export function buildOptimisticMessage(args: {
  body: string;
  clientRequestId: string;
  currentUserId: string;
  recipientUserId: string;
}): ConversationMessage {
  return {
    id: `optimistic-${args.clientRequestId}` as unknown as Id<"inboxMessages">,
    senderUserId: args.currentUserId,
    recipientUserId: args.recipientUserId,
    type: "text",
    body: args.body.trim(),
    createdAt: Date.now(),
    metadata: {
      clientRequestId: args.clientRequestId,
      optimistic: true,
    },
  };
}

export function buildSummaryPreview<TMessageId extends string>(
  message: {
    id: TMessageId;
    senderUserId: string;
    body: string;
    type: ConversationMessage["type"];
    createdAt: number;
  },
) {
  return {
    id: message.id,
    senderUserId: message.senderUserId,
    body: message.body,
    type: message.type,
    createdAt: message.createdAt,
  };
}

export function upsertConversationSummary<T extends { id: string; updatedAt: number }>(
  conversations: T[],
  nextConversation: T,
) {
  const withoutCurrent = conversations.filter((item) => item.id !== nextConversation.id);
  return [nextConversation, ...withoutCurrent].sort((a, b) => b.updatedAt - a.updatedAt);
}

type OptimisticSendMutationArgs = {
  conversationId?: Id<"inboxConversations">;
  body: string;
  clientRequestId?: string;
};

type OptimisticLocalStore = {
  getQuery<QueryResult>(query: unknown, args: Record<string, unknown>): QueryResult | null | undefined;
  setQuery<QueryResult>(query: unknown, args: Record<string, unknown>, value: QueryResult): void;
};

type InboxApiRefs = {
  getConversation: unknown;
  listConversations: unknown;
};

function buildOptimisticConversationState(args: {
  localStore: OptimisticLocalStore;
  currentUserId: string;
  mutationArgs: OptimisticSendMutationArgs;
  inboxApi: InboxApiRefs;
}) {
  if (!args.mutationArgs.conversationId) return null;
  const conversation = args.localStore.getQuery<ConversationDetail>(args.inboxApi.getConversation, {
    conversationId: args.mutationArgs.conversationId,
  });
  if (!conversation?.otherUser) return null;
  const optimisticMessage = buildOptimisticMessage({
    body: args.mutationArgs.body,
    clientRequestId: args.mutationArgs.clientRequestId ?? `client-${Date.now()}`,
    currentUserId: args.currentUserId,
    recipientUserId: conversation.otherUser.id,
  });
  return { conversation, optimisticStoreMessage: optimisticMessage, updatedAt: optimisticMessage.createdAt };
}

function applyOptimisticConversation(args: {
  localStore: OptimisticLocalStore;
  inboxApi: InboxApiRefs;
  conversationId: Id<"inboxConversations">;
  conversation: ConversationDetail;
  optimisticStoreMessage: ConversationMessage;
  updatedAt: number;
}) {
  const optimisticConversation: ConversationDetail = {
    ...args.conversation,
    updatedAt: args.updatedAt,
    unreadCount: 0,
    lastMessage: buildSummaryPreview(args.optimisticStoreMessage),
    lastMessagePreview: args.optimisticStoreMessage.body,
    messages: [...(args.conversation.messages || []), args.optimisticStoreMessage],
  };
  args.localStore.setQuery(args.inboxApi.getConversation, { conversationId: args.conversationId }, optimisticConversation);
  return optimisticConversation;
}

function applyOptimisticConversationSummary(args: {
  localStore: OptimisticLocalStore;
  inboxApi: InboxApiRefs;
  optimisticConversation: ConversationDetail;
  optimisticStoreMessage: ConversationMessage;
  updatedAt: number;
}) {
  const conversations = args.localStore.getQuery<ConversationSummary[]>(args.inboxApi.listConversations, { archived: false });
  if (!conversations) return;
  const summary: ConversationSummary = {
    id: args.optimisticConversation.id,
    directKey: args.optimisticConversation.directKey || "",
    otherUser: args.optimisticConversation.otherUser,
    unreadCount: 0,
    updatedAt: args.updatedAt,
    lastMessage: buildSummaryPreview(args.optimisticStoreMessage),
    lastMessagePreview: args.optimisticStoreMessage.body,
    archivedAt: null,
  };
  args.localStore.setQuery(args.inboxApi.listConversations, { archived: false }, upsertConversationSummary(conversations, summary));
}

export function createOptimisticSendConversationUpdate(args: { currentUserId: string; inboxApi: InboxApiRefs }) {
  return (localStore: OptimisticLocalStore, mutationArgs: OptimisticSendMutationArgs) => {
    const state = buildOptimisticConversationState({
      localStore,
      currentUserId: args.currentUserId,
      mutationArgs,
      inboxApi: args.inboxApi,
    });
    if (!state || !mutationArgs.conversationId) return;
    const optimisticConversation = applyOptimisticConversation({
      localStore,
      inboxApi: args.inboxApi,
      conversationId: mutationArgs.conversationId,
      conversation: state.conversation,
      optimisticStoreMessage: state.optimisticStoreMessage,
      updatedAt: state.updatedAt,
    });
    applyOptimisticConversationSummary({
      localStore,
      inboxApi: args.inboxApi,
      optimisticConversation,
      optimisticStoreMessage: state.optimisticStoreMessage,
      updatedAt: state.updatedAt,
    });
  };
}

