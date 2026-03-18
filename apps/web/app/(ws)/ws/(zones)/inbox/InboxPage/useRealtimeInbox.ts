"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import type {
  ConversationDetail,
  ConversationMessage,
  ConversationSummary,
  UserConversationTarget,
} from "@/server/contracts/inbox";

import { Id } from "@convex/dataModel";

const inboxApi = api.shared_logic.inbox;
const notificationsApi = api.shared_logic.notifications;

type UseRealtimeInboxArgs = {
  currentUserId: string;
  initialConversations: ConversationSummary[];
  initialConversation: ConversationDetail | null;
  initialSelectedConversationId: string | null;
  hasConversationRoute: boolean;
};

type UseRealtimeInboxResult = {
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

function buildOptimisticMessage(args: {
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

function buildSummaryPreview<TMessageId extends string>(
  message: {
    id: TMessageId;
    senderUserId: string;
    body: string;
    type: ConversationMessage["type"];
    createdAt: number;
  }) {
  return {
    id: message.id,
    senderUserId: message.senderUserId,
    body: message.body,
    type: message.type,
    createdAt: message.createdAt,
  };
}

function upsertConversationSummary<T extends { id: string; updatedAt: number }>(
  conversations: T[],
  nextConversation: T,
) {
  const withoutCurrent = conversations.filter((item) => item.id !== nextConversation.id);
  return [nextConversation, ...withoutCurrent].sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * WHY:   The inbox workspace needs one live coordinator for subscriptions, route sync, read state, and optimistic sends.
 * WHAT:  Exposes a realtime inbox model for the page orchestrator and keeps view components mostly presentational.
 * HOW:   Subscribes to Convex queries, mirrors route selection into local state, marks reads on visible active threads, and applies optimistic send updates.
 */
export function useRealtimeInbox({
  currentUserId,
  initialConversations,
  initialConversation,
  initialSelectedConversationId,
  hasConversationRoute,
}: UseRealtimeInboxArgs): UseRealtimeInboxResult {
  const router = useRouter();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    initialSelectedConversationId ?? initialConversation?.id ?? null,
  );
  const [search, setSearch] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const deferredSearch = useDeferredValue(search.trim());

  const liveConversations = useQuery(inboxApi.listConversations, {});
  const liveConversation = useQuery(
    inboxApi.getConversation,
    activeConversationId ? { conversationId: activeConversationId as Id<"inboxConversations"> } : "skip",
  );
  const liveSearchResults = useQuery(
    inboxApi.searchConversationTargets,
    deferredSearch ? { query: deferredSearch } : "skip",
  );

  const resolveConversation = useMutation(inboxApi.resolveDirectConversation);
  const markConversationRead = useMutation(inboxApi.markConversationRead);
  const baseSendConversationMessage = useMutation(inboxApi.sendConversationMessage);
  const sendConversationMessage = useMemo(
    () =>
      baseSendConversationMessage.withOptimisticUpdate((localStore, args) => {
        if (!args.conversationId) {
          return;
        }

        const conversation = localStore.getQuery(inboxApi.getConversation, {
          conversationId: args.conversationId,
        });
        if (!conversation) {
          return;
        }

        if (!conversation.otherUser) {
          return;
        }

        const optimisticMessage = buildOptimisticMessage({
          body: args.body,
          clientRequestId: args.clientRequestId ?? `client-${Date.now()}`,
          currentUserId,
          recipientUserId: conversation.otherUser.id,
        });
        const optimisticStoreMessage = optimisticMessage as unknown as (typeof conversation.messages)[number];
        const updatedAt = optimisticStoreMessage.createdAt;
        const messageSummary = buildSummaryPreview(optimisticStoreMessage);
        const optimisticConversation = {
          ...conversation,
          updatedAt,
          unreadCount: 0,
          lastMessage: messageSummary,
          lastMessagePreview: optimisticStoreMessage.body,
          messages: [...(conversation.messages || []), optimisticStoreMessage],
        };

        localStore.setQuery(
          inboxApi.getConversation,
          { conversationId: args.conversationId },
          optimisticConversation,
        );

        const conversations = localStore.getQuery(inboxApi.listConversations, {});
        if (!conversations) {
          return;
        }

        const summary = {
          id: optimisticConversation.id,
          directKey: optimisticConversation.directKey || "",
          otherUser: optimisticConversation.otherUser,
          unreadCount: 0,
          updatedAt,
          lastMessage: buildSummaryPreview(optimisticStoreMessage),
          lastMessagePreview: optimisticStoreMessage.body,
        } as (typeof conversations)[number];

        localStore.setQuery(
          inboxApi.listConversations,
          {},
          upsertConversationSummary(conversations, summary),
        );
      }),
    [baseSendConversationMessage, currentUserId],
  );

  const conversations = liveConversations ?? initialConversations;
  const initialConversationForActiveThread =
    initialConversation?.id === activeConversationId ? initialConversation : null;
  const conversation = liveConversation ?? initialConversationForActiveThread;

  useEffect(() => {
    if (initialSelectedConversationId) {
      setActiveConversationId(initialSelectedConversationId);
    }
  }, [initialSelectedConversationId]);

  useEffect(() => {
    if (hasConversationRoute || conversations.length === 0) {
      return;
    }

    const nextConversationId = conversations[0]?.id ?? null;
    if (!nextConversationId) {
      return;
    }

    if (activeConversationId !== nextConversationId) {
      setActiveConversationId(nextConversationId);
    }

    router.replace(`/ws/inbox/${nextConversationId}`);
  }, [activeConversationId, conversations, hasConversationRoute, router]);

  useEffect(() => {
    if (!activeConversationId || conversations.length > 0) {
      return;
    }

    router.replace("/ws/inbox");
  }, [activeConversationId, conversations.length, router]);

  useEffect(() => {
    if (!hasConversationRoute && conversation && !activeConversationId) {
      const conversationId = conversation.id ? String(conversation.id) : null;
      if (conversationId) {
        setActiveConversationId(conversationId);
      }
    }
  }, [activeConversationId, conversation, hasConversationRoute]);

  useEffect(() => {
    if (!activeConversationId || conversations.length === 0) {
      return;
    }

    const stillExists = conversations.some((item) => item.id === activeConversationId);
    if (stillExists) {
      return;
    }

    const nextConversationId = conversations[0]?.id ?? null;
    setActiveConversationId(nextConversationId);

    if (nextConversationId) {
      router.replace(`/ws/inbox/${nextConversationId}`);
      return;
    }

    router.replace("/ws/inbox");
  }, [activeConversationId, conversations, router]);

  useEffect(() => {
    if (!activeConversationId || !conversation || conversation.unreadCount === 0) {
      return;
    }

    const markActiveConversationRead = () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      void markConversationRead({
        conversationId: activeConversationId as Id<"inboxConversations">,
      });
    };

    markActiveConversationRead();
    document.addEventListener("visibilitychange", markActiveConversationRead);

    return () => {
      document.removeEventListener("visibilitychange", markActiveConversationRead);
    };
  }, [activeConversationId, conversation, markConversationRead]);

  const filteredSearchResults = useMemo(
    () =>
      (liveSearchResults ?? []).filter((result) => result.id !== currentUserId),
    [currentUserId, liveSearchResults],
  );

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    router.push(`/ws/inbox/${conversationId}`);
  };

  const handleStartConversation = async (targetUserId: string) => {
    setSendError(null);
    const conversationId = await resolveConversation({ targetUserId });
    setSearch("");
    setActiveConversationId(conversationId);
    router.push(`/ws/inbox/${conversationId}`);
  };

  const handleSendMessage = async (body: string) => {
    if (!activeConversationId) {
      return;
    }

    setSendError(null);
    const clientRequestId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `client-${Date.now()}`;

    try {
      setIsSending(true);
      await sendConversationMessage({
        conversationId: activeConversationId as Id<"inboxConversations">,
        body,
        clientRequestId,
      });
    } catch (error) {
      setSendError("تعذر إرسال الرسالة الآن. حاول مرة أخرى.");
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  const normalizedConversation = conversation as unknown as ConversationDetail | null;
  const normalizedConversations = conversations as unknown as ConversationSummary[];
  const normalizedSearchResults = filteredSearchResults as unknown as UserConversationTarget[];

  return {
    activeConversationId,
    conversation: normalizedConversation,
    conversations: normalizedConversations,
    isLiveConversationLoading: Boolean(activeConversationId) && liveConversation === undefined && !conversation,
    isSending,
    isSearching: deferredSearch.length > 0 && liveSearchResults === undefined,
    search,
    searchResults: normalizedSearchResults,
    sendError,
    setSearch,
    handleSelectConversation,
    handleStartConversation,
    handleSendMessage,
  };
}

/**
 * WHY:   Workspace top-bar badges should subscribe to realtime inbox and notification summaries.
 * WHAT:  Returns the latest unread counts with server-rendered values as a hydration fallback.
 * HOW:   Reads the Convex notification summary and inbox unread summary queries directly from the client provider.
 */
export function useWorkspaceSignalCounts(initialCounts: {
  notificationCount: number;
  inboxCount: number;
}) {
  const liveNotifications = useQuery(notificationsApi.getWorkspaceNotificationSummary, {});
  const liveInboxSummary = useQuery(inboxApi.getInboxUnreadSummary, {});

  return {
    notificationCount: liveNotifications?.unreadCount ?? initialCounts.notificationCount,
    inboxCount: liveInboxSummary?.unreadCount ?? initialCounts.inboxCount,
  };
}
