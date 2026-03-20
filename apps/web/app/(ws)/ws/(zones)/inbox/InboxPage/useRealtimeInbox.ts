"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import type { ConversationDetail, ConversationSummary, UserConversationTarget } from "@/server/contracts/inbox";

import { Id } from "@convex/dataModel";
import {
  createOptimisticSendConversationUpdate,
  type UseRealtimeInboxArgs,
  type UseRealtimeInboxResult,
} from "./useRealtimeInbox.shared";
export { useWorkspaceSignalCounts } from "./useWorkspaceSignalCounts";

const inboxApi = api.shared_logic.inbox;

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
  // Track the last conversation ID for which we successfully received live data
  // to avoid showing the loading spinner on every conversation switch.
  const lastResolvedLiveIdRef = useRef<string | null>(null);

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
      baseSendConversationMessage.withOptimisticUpdate(
        createOptimisticSendConversationUpdate({ currentUserId, inboxApi }),
      ),
    [baseSendConversationMessage, currentUserId],
  );

  const conversations = liveConversations ?? initialConversations;
  const initialConversationForActiveThread =
    initialConversation?.id === activeConversationId ? initialConversation : null;
  const conversation = liveConversation ?? initialConversationForActiveThread;

  // Keep the ref in sync so we know for which conversation ID live data last resolved.
  useEffect(() => {
    if (liveConversation && activeConversationId === liveConversation.id) {
      lastResolvedLiveIdRef.current = activeConversationId;
    }
  }, [liveConversation, activeConversationId]);

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

  // Only show loading when the active conversation ID has changed and we don't yet have
  // live data for it. This prevents the loading flicker on every conversation switch caused
  // by liveConversation briefly becoming undefined while Convex re-fetches.
  const isLiveConversationLoading =
    Boolean(activeConversationId) &&
    liveConversation === undefined &&
    lastResolvedLiveIdRef.current !== activeConversationId &&
    !conversation;

  return {
    activeConversationId,
    conversation: normalizedConversation,
    conversations: normalizedConversations,
    isLiveConversationLoading,
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
