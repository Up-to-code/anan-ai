"use client";

import type { Id } from "@convex/dataModel";
import type {
  ConversationDetail,
  ConversationMessage,
  ConversationSummary,
  UserConversationTarget,
} from "@/server/contracts/inbox";

export type UseRealtimeInboxArgs = {
  currentUserId: string;
  initialConversations: ConversationSummary[];
  initialConversation: ConversationDetail | null;
  initialSelectedConversationId: string | null;
  hasConversationRoute: boolean;
};

export type UseRealtimeInboxResult = {
  activeConversationId: string | null;
  conversation: ConversationDetail | null;
  conversations: ConversationSummary[];
  isLiveConversationLoading: boolean;
  isSending: boolean;
  isSearching: boolean;
  search: string;
  searchResults: UserConversationTarget[];
  sendError: string | null;
  setSearch: (value: string) => void;
  handleSelectConversation: (conversationId: string) => void;
  handleStartConversation: (targetUserId: string) => Promise<void>;
  handleSendMessage: (body: string) => Promise<void>;
};

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

function buildOptimisticConversationState(args: {
  localStore: any;
  currentUserId: string;
  mutationArgs: { conversationId?: Id<"inboxConversations">; body: string; clientRequestId?: string };
  inboxApi: any;
}) {
  if (!args.mutationArgs.conversationId) return null;
  const conversation = args.localStore.getQuery(args.inboxApi.getConversation, {
    conversationId: args.mutationArgs.conversationId,
  });
  if (!conversation?.otherUser) return null;
  const optimisticMessage = buildOptimisticMessage({
    body: args.mutationArgs.body,
    clientRequestId: args.mutationArgs.clientRequestId ?? `client-${Date.now()}`,
    currentUserId: args.currentUserId,
    recipientUserId: conversation.otherUser.id,
  });
  const optimisticStoreMessage = optimisticMessage as unknown as (typeof conversation.messages)[number];
  return { conversation, optimisticStoreMessage, updatedAt: optimisticStoreMessage.createdAt };
}

function applyOptimisticConversation(args: {
  localStore: any;
  inboxApi: any;
  conversationId: Id<"inboxConversations">;
  conversation: any;
  optimisticStoreMessage: any;
  updatedAt: number;
}) {
  const optimisticConversation = {
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
  localStore: any;
  inboxApi: any;
  optimisticConversation: any;
  optimisticStoreMessage: any;
  updatedAt: number;
}) {
  const conversations = args.localStore.getQuery(args.inboxApi.listConversations, {});
  if (!conversations) return;
  const summary = {
    id: args.optimisticConversation.id,
    directKey: args.optimisticConversation.directKey || "",
    otherUser: args.optimisticConversation.otherUser,
    unreadCount: 0,
    updatedAt: args.updatedAt,
    lastMessage: buildSummaryPreview(args.optimisticStoreMessage),
    lastMessagePreview: args.optimisticStoreMessage.body,
  } as (typeof conversations)[number];
  args.localStore.setQuery(args.inboxApi.listConversations, {}, upsertConversationSummary(conversations, summary));
}

export function createOptimisticSendConversationUpdate(args: { currentUserId: string; inboxApi: any }) {
  return (localStore: any, mutationArgs: { conversationId?: Id<"inboxConversations">; body: string; clientRequestId?: string }) => {
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
