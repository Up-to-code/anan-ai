"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Id } from "@convex/dataModel";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import type { ConversationDetail, ConversationSummary, UserConversationTarget } from "@/server/contracts/inbox";

import type { UseRealtimeInboxArgs, UseRealtimeInboxResult } from "./types";
import {
  createOptimisticSendConversationUpdate,
  getInboxAutoSelectedConversationId,
  syncConversationUrl,
} from "./utils";
import { parseConversationRoute } from "./validation";

export { useWorkspaceSignalCounts } from "../useWorkspaceSignalCounts";
export { getInboxAutoSelectedConversationId } from "./utils";
export type { UseRealtimeInboxArgs, UseRealtimeInboxResult } from "./types";

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
  const lastResolvedLiveIdRef = useRef<string | null>(null);
  const { isAuthenticated, isLoading } = useConvexAuth();

  const liveConversationArgs =
    !isLoading && isAuthenticated && activeConversationId
      ? { conversationId: activeConversationId as Id<"inboxConversations"> }
      : "skip";
  const liveSearchArgs =
    !isLoading && isAuthenticated && deferredSearch
      ? { query: deferredSearch }
      : "skip";

  const liveConversations = useQuery(
    inboxApi.listConversations,
    !isLoading && isAuthenticated ? { archived: false } : "skip",
  );
  const liveArchivedConversations = useQuery(
    inboxApi.listConversations,
    !isLoading && isAuthenticated ? { archived: true } : "skip",
  );
  const liveConversation = useQuery(inboxApi.getConversation, liveConversationArgs);
  const liveSearchResults = useQuery(inboxApi.searchConversationTargets, liveSearchArgs);

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

  const activeConversations: ConversationSummary[] = liveConversations ?? initialConversations;
  const archivedConversations: ConversationSummary[] = liveArchivedConversations ?? [];
  const conversations = showArchived ? archivedConversations : activeConversations;
  const initialConversationForActiveThread =
    initialConversation?.id === activeConversationId ? initialConversation : null;
  const conversation = liveConversation ?? initialConversationForActiveThread;

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
      const { conversationId: nextConversationId } = parseConversationRoute(
        new URLSearchParams(window.location.search),
      );
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

  const filteredSearchResults = useMemo<UserConversationTarget[]>(
    () =>
      ((liveSearchResults ?? []) as UserConversationTarget[]).filter((result) => result.id !== currentUserId),
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

