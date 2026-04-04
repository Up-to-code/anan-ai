"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
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
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    initialSelectedConversationId ?? initialConversation?.id ?? null,
  );
  const [search, setSearch] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(() => Boolean(initialConversation?.archivedAt));
  const [isArchivingConversation, setIsArchivingConversation] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const deferredSearch = useDeferredValue(search.trim());
  const hasInitializedAutoSelectionRef = useRef(false);
  // Track the last conversation ID for which we successfully received live data
  // to avoid showing the loading spinner on every conversation switch.
  const lastResolvedLiveIdRef = useRef<string | null>(null);

  const liveConversations = useQuery(inboxApi.listConversations, { archived: false });
  const liveArchivedConversations = useQuery(inboxApi.listConversations, { archived: true });
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
  const setConversationArchived = useMutation(inboxApi.setConversationArchived);
  const baseSendConversationMessage = useMutation(inboxApi.sendConversationMessage);
  const sendConversationMessage = useMemo(
    () =>
      baseSendConversationMessage.withOptimisticUpdate(
        createOptimisticSendConversationUpdate({ currentUserId, inboxApi }),
      ),
    [baseSendConversationMessage, currentUserId],
  );

  const activeConversations = liveConversations ?? initialConversations;
  const archivedConversations = liveArchivedConversations ?? [];
  const conversations = showArchived ? archivedConversations : activeConversations;
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
      hasInitializedAutoSelectionRef.current = true;
      setActiveConversationId(initialSelectedConversationId);
      setShowArchived(Boolean(initialConversation?.archivedAt));
    }
  }, [initialConversation?.archivedAt, initialSelectedConversationId]);

  const syncConversationUrl = (conversationId: string | null, method: "push" | "replace" = "push") => {
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
  };

  useEffect(() => {
    if (showArchived) {
      return;
    }

    const nextConversationId = getInboxAutoSelectedConversationId({
      activeConversationId,
      conversations: activeConversations,
      hasInitializedAutoSelection: hasInitializedAutoSelectionRef.current,
      hasConversationRoute,
    });

    if (!nextConversationId) {
      if (
        !hasInitializedAutoSelectionRef.current &&
        (activeConversationId !== null || hasConversationRoute || activeConversations.length > 0)
      ) {
        hasInitializedAutoSelectionRef.current = true;
      }
      return;
    }

    hasInitializedAutoSelectionRef.current = true;
    setActiveConversationId(nextConversationId);
    syncConversationUrl(nextConversationId, "replace");
  }, [activeConversationId, activeConversations, hasConversationRoute, showArchived]);

  useEffect(() => {
    if (showArchived) {
      return;
    }

    if (!activeConversationId || activeConversations.length > 0) {
      return;
    }
    syncConversationUrl(null, "replace");
  }, [activeConversationId, activeConversations.length, showArchived]);

  useEffect(() => {
    if (!hasConversationRoute && conversation && !activeConversationId) {
      const conversationId = conversation.id ? String(conversation.id) : null;
      if (conversationId) {
        setActiveConversationId(conversationId);
      }
    }
  }, [activeConversationId, conversation, hasConversationRoute]);

  useEffect(() => {
    const scopedConversations = showArchived ? archivedConversations : activeConversations;
    if (!activeConversationId) {
      if (scopedConversations.length === 0) {
        return;
      }

      const nextConversationId = scopedConversations[0]?.id ?? null;
      setActiveConversationId(nextConversationId);
      syncConversationUrl(nextConversationId, "replace");
      return;
    }

    const stillExists = scopedConversations.some((item) => item.id === activeConversationId);
    if (stillExists) {
      return;
    }

    const nextConversationId = scopedConversations[0]?.id ?? null;
    setActiveConversationId(nextConversationId);

    syncConversationUrl(nextConversationId, "replace");
  }, [activeConversationId, activeConversations, archivedConversations, showArchived]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const nextConversationId = params.get("conversationId");
      if (nextConversationId) {
        setShowArchived(archivedConversations.some((item) => item.id === nextConversationId));
        setActiveConversationId(nextConversationId);
        return;
      }
      setShowArchived(false);
      setActiveConversationId(activeConversations[0]?.id ?? null);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [activeConversations, archivedConversations]);

  useEffect(() => {
    if (!activeConversationId || !conversation || conversation.unreadCount === 0 || conversation.archivedAt) {
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
    hasInitializedAutoSelectionRef.current = true;
    setShowArchived(archivedConversations.some((item) => item.id === conversationId));
    setActiveConversationId(conversationId);
    syncConversationUrl(conversationId);
  };

  const handleStartConversation = async (targetUserId: string) => {
    setSendError(null);
    const conversationId = await resolveConversation({ targetUserId });
    setSearch("");
    setShowArchived(false);
    hasInitializedAutoSelectionRef.current = true;
    setActiveConversationId(conversationId);
    syncConversationUrl(conversationId);
  };

  const handleSetConversationArchived = async (conversationId: string, archived: boolean) => {
    setIsArchivingConversation(true);
    try {
      await setConversationArchived({
        conversationId: conversationId as Id<"inboxConversations">,
        archived,
      });

      if (archived) {
        const nextConversationId =
          activeConversationId === conversationId
            ? activeConversations.find((item) => item.id !== conversationId)?.id ?? null
            : activeConversationId;
        setShowArchived(false);
        setActiveConversationId(nextConversationId);
        syncConversationUrl(nextConversationId, "replace");
        return;
      }

      setShowArchived(false);
      setActiveConversationId(conversationId);
      syncConversationUrl(conversationId, "replace");
    } finally {
      setIsArchivingConversation(false);
    }
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
    archivedConversations: archivedConversations as unknown as ConversationSummary[],
    conversation: normalizedConversation,
    conversations: normalizedConversations,
    handleSetConversationArchived,
    isArchivingConversation,
    isLiveConversationLoading,
    isShowingArchived: showArchived,
    isSending,
    isSearching: deferredSearch.length > 0 && liveSearchResults === undefined,
    search,
    searchResults: normalizedSearchResults,
    sendError,
    setShowArchived,
    setSearch,
    handleSelectConversation,
    handleStartConversation,
    handleSendMessage,
  };
}
