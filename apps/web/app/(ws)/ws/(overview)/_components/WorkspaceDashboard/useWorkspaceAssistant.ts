"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Id } from "@convex/dataModel";
import { useQuery } from "convex/react";
import { usePathname, useSearchParams } from "next/navigation";
import { api } from "@/lib/convexApi";
import type { AnanProInputMode, AnanProStreamStageEvent, AnanProThread } from "@/server/contracts/ananPro";
import {
  getVoiceUploadUrl,
  transcribeVoiceFromStorage,
} from "./actions";
import {
  buildWorkspaceAssistantHref,
  getAssistantMotionState,
  getAssistantStageLabel,
  normalizeAssistantTeamLabel,
} from "./useWorkspaceAssistant.shared";
import { useWorkspaceAssistantSend } from "./useWorkspaceAssistantSend";
import { useVoiceRecorder } from "./useVoiceRecorder";

const assistantApi = api.ai_zone.assistantWorkspace;

type UseWorkspaceAssistantParams = {
  initialThread: AnanProThread | null;
  initialSelectedThreadId: string | null;
};

type LiveAssistantThreadSummary = {
  _id: string;
  title?: string | null;
};

type LiveAssistantMessage = {
  _id: string;
  role: "user" | "assistant";
  content: string;
  metadata?: {
    uiTurn?: unknown;
    meta?: unknown;
    inputMode?: AnanProInputMode;
  };
  createdAt: number;
};

function mapLiveAssistantMessages(messages: LiveAssistantMessage[]) {
  return messages.map((message) => ({
    id: String(message._id),
    role: message.role,
    content: message.content,
    uiTurn: message.metadata?.uiTurn,
    meta: message.metadata?.meta,
    inputMode: message.metadata?.inputMode,
    createdAt: message.createdAt,
  }));
}

function buildLiveAssistantThread(
  summary: LiveAssistantThreadSummary | null | undefined,
  messages: LiveAssistantMessage[] | undefined,
): AnanProThread | null | undefined {
  if (summary === undefined || messages === undefined) {
    return undefined;
  }

  if (!summary?._id) {
    return null;
  }

  return {
    id: String(summary._id),
    title: summary.title ?? null,
    messages: mapLiveAssistantMessages(messages),
  };
}

export function shouldKeepLocalThreadSnapshot(args: {
  currentThread: AnanProThread | null;
  incomingThread: AnanProThread | null;
  routeThreadId: string | null;
  nextSelectedThreadId: string | null;
  activeStreamSessionId: string | null;
}) {
  if (!args.routeThreadId || args.nextSelectedThreadId !== args.routeThreadId) {
    return false;
  }

  const currentThread = args.currentThread;
  if (!currentThread || currentThread.id !== args.routeThreadId) {
    return false;
  }

  const currentMessageCount = currentThread.messages.length;
  const incomingMessageCount = args.incomingThread?.messages.length ?? 0;
  if (currentMessageCount === 0) {
    return false;
  }

  if (args.activeStreamSessionId) {
    return currentMessageCount >= incomingMessageCount;
  }

  return currentMessageCount > incomingMessageCount;
}

/**
 * WHY:   The workspace assistant needs one local state machine for thread selection, optimistic replies, and list refreshes.
 * WHAT:  Exposes thread state plus actions to select a thread, start a fresh one, and send messages through the Anan Workspace API.
 * HOW:   Uses optimistic local updates for sends, hydrates the active thread through live Convex queries, and mirrors selection in the URL without forcing App Router refreshes.
 */
export function useWorkspaceAssistant({
  initialThread,
  initialSelectedThreadId,
}: UseWorkspaceAssistantParams) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [thread, setThread] = useState<AnanProThread | null>(initialThread);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(initialSelectedThreadId ?? initialThread?.id ?? null);
  const [value, setValue] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const [streamStage, setStreamStage] = useState<AnanProStreamStageEvent | null>(null);
  const [stageHistory, setStageHistory] = useState<AnanProStreamStageEvent[]>([]);
  const [streamLifecycleStatus, setStreamLifecycleStatus] = useState<"running" | "completed" | "failed" | "cancelled" | null>(null);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [completedTeamIds, setCompletedTeamIds] = useState<string[]>([]);
  const [activeStreamSessionId, setActiveStreamSessionId] = useState<string | null>(null);
  const [isStoppingStream, setIsStoppingStream] = useState(false);
  const stopRequestedRef = useRef(false);
  const latestAssistantHrefRef = useRef("");
  const lastResolvedLiveThreadIdRef = useRef<string | null>(initialThread?.id ?? null);
  const routeThreadId = pathname === "/ws" ? searchParams.get("threadId") : null;
  const isDraftRoute = pathname === "/ws" && searchParams.get("newThread") === "1";
  const shouldStartNewThread = !selectedThreadId && pathname === "/ws" && (isDraftRoute || !routeThreadId);

  const liveThreadSummary = useQuery(
    assistantApi.getThreadById,
    selectedThreadId ? { threadId: selectedThreadId as Id<"assistantThreads"> } : "skip",
  );
  const liveThreadMessages = useQuery(
    assistantApi.listMessages,
    selectedThreadId ? { threadId: selectedThreadId as Id<"assistantThreads"> } : "skip",
  );
  const liveThread = useMemo(
    () =>
      buildLiveAssistantThread(
        liveThreadSummary as LiveAssistantThreadSummary | null | undefined,
        liveThreadMessages as LiveAssistantMessage[] | undefined,
      ),
    [liveThreadMessages, liveThreadSummary],
  );

  const resetEphemeralAssistantState = useCallback(() => {
    setStreamStage(null);
    setStageHistory([]);
    setStreamLifecycleStatus(null);
    setActiveTeamId(null);
    setCompletedTeamIds([]);
    setActiveStreamSessionId(null);
    setIsStoppingStream(false);
    stopRequestedRef.current = false;
    setSendError(null);
    setValue("");
  }, []);

  const replaceAssistantRoute = useCallback((
    threadId: string | null,
    options?: { history?: "push" | "replace"; newThread?: boolean },
  ) => {
    if (pathname !== "/ws") return;
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    const currentHref = latestAssistantHrefRef.current || buildWorkspaceAssistantHref({
      pathname,
      search: searchParams.toString(),
      hash,
      threadId: routeThreadId,
      newThread: isDraftRoute ? true : false,
    });
    const nextHref = buildWorkspaceAssistantHref({
      pathname,
      search: searchParams.toString(),
      hash,
      threadId,
      newThread: options?.newThread,
    });

    if (nextHref === currentHref) return;
    latestAssistantHrefRef.current = nextHref;
    if (options?.history === "push") {
      window.history.pushState(null, "", nextHref);
      return;
    }
    window.history.replaceState(null, "", nextHref);
  }, [isDraftRoute, pathname, routeThreadId, searchParams]);

  useEffect(() => {
    if (pathname !== "/ws") {
      latestAssistantHrefRef.current = "";
      return;
    }

    const hash = typeof window === "undefined" ? "" : window.location.hash;
    latestAssistantHrefRef.current = buildWorkspaceAssistantHref({
      pathname,
      search: searchParams.toString(),
      hash,
      threadId: routeThreadId,
      newThread: isDraftRoute ? true : false,
    });
  }, [isDraftRoute, pathname, routeThreadId, searchParams]);

  useEffect(() => {
    if (isDraftRoute) {
      setThread(null);
      setSelectedThreadId(null);
      resetEphemeralAssistantState();
      return;
    }

    if (!routeThreadId) {
      if (selectedThreadId !== null || thread !== null) {
        setThread(null);
        setSelectedThreadId(null);
        resetEphemeralAssistantState();
        return;
      }
      return;
    }

    if (routeThreadId === selectedThreadId) {
      return;
    }

    setThread((current) => (current?.id === routeThreadId ? current : null));
    setSelectedThreadId(routeThreadId);
    resetEphemeralAssistantState();
  }, [
    isDraftRoute,
    resetEphemeralAssistantState,
    routeThreadId,
    selectedThreadId,
    thread,
  ]);

  useEffect(() => {
    if (!selectedThreadId || liveThread === undefined) {
      return;
    }

    if (liveThread?.id === selectedThreadId) {
      lastResolvedLiveThreadIdRef.current = selectedThreadId;
    }

    if (shouldKeepLocalThreadSnapshot({
      currentThread: thread,
      incomingThread: liveThread,
      routeThreadId: routeThreadId ?? selectedThreadId,
      nextSelectedThreadId: selectedThreadId,
      activeStreamSessionId,
    })) {
      return;
    }

    setThread(liveThread);
  }, [
    activeStreamSessionId,
    liveThread,
    routeThreadId,
    selectedThreadId,
    thread,
  ]);

  const isLoadingThread =
    Boolean(selectedThreadId) &&
    liveThread === undefined &&
    lastResolvedLiveThreadIdRef.current !== selectedThreadId &&
    thread?.id !== selectedThreadId;
  const isSending = activeStreamSessionId !== null || streamLifecycleStatus === "running";

  const sendWithOptimisticUpdate = useWorkspaceAssistantSend({
    thread,
    shouldStartNewThread,
    setThread,
    setSelectedThreadId,
    setSendError,
    setStreamStage,
    setStageHistory,
    setStreamLifecycleStatus,
    setActiveTeamId,
    setCompletedTeamIds,
    setActiveStreamSessionId,
    setIsStoppingStream,
    replaceThreadRoute: replaceAssistantRoute,
    stopRequestedRef,
  });

  const voiceRecorder = useVoiceRecorder({
    getUploadUrl: getVoiceUploadUrl,
    transcribeFromStorage: transcribeVoiceFromStorage,
    maxDurationMs: 300_000,
    disabled: isSending || isLoadingThread,
    onTranscriptReady: async (transcript) => {
      setSendError(null);
      sendWithOptimisticUpdate(transcript, "voice");
    },
    onError: (message) => {
      setSendError(message);
    },
  });

  const handleSelectThread = (threadId: string) => {
    if (threadId === selectedThreadId || isLoadingThread) {
      return;
    }

    setSendError(null);
    setSelectedThreadId(threadId);
    setThread((current) => (current?.id === threadId ? current : null));
    resetEphemeralAssistantState();
    replaceAssistantRoute(threadId, { history: "push" });
  };

  const handleCreateThread = () => {
    setThread(null);
    setSelectedThreadId(null);
    resetEphemeralAssistantState();
    replaceAssistantRoute(null, { history: "push", newThread: true });
  };

  const handleStopStreaming = useCallback(async () => {
    if (!activeStreamSessionId || isStoppingStream) {
      return;
    }

    setIsStoppingStream(true);
    stopRequestedRef.current = true;
    setSendError(null);
    try {
      const response = await fetch(`/api/workspace/anan-pro?sessionId=${encodeURIComponent(activeStreamSessionId)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("تعذر إيقاف التوليد حالياً.");
      }
    } catch (error) {
      stopRequestedRef.current = false;
      setIsStoppingStream(false);
      setSendError(error instanceof Error ? error.message : "تعذر إيقاف التوليد حالياً.");
    }
  }, [activeStreamSessionId, isStoppingStream]);

  const handleRegenerate = useCallback(() => {
    if (!thread || isSending || isLoadingThread) return;
    const targetUserMessage = [...thread.messages].reverse().find((message) => message.role === "user");
    if (!targetUserMessage?.content?.trim()) return;
    setSendError(null);
    sendWithOptimisticUpdate(targetUserMessage.content, targetUserMessage.inputMode, {
      regenerate: true,
      regenerateMessageId: targetUserMessage.id,
    });
  }, [isLoadingThread, isSending, sendWithOptimisticUpdate, thread]);

  const handleSend = (message?: string, inputMode?: AnanProInputMode) => {
    const nextMessage = (message ?? value).trim();
    if (!nextMessage || isSending || isLoadingThread) {
      return;
    }

    if (typeof message !== "string") {
      setValue("");
    }
    setSendError(null);
    sendWithOptimisticUpdate(nextMessage, inputMode);
  };

  const assistantMotionState = getAssistantMotionState(isSending, streamStage);
  const stageLabel = getAssistantStageLabel(isSending, streamStage, streamLifecycleStatus);

  const activeTeamLabel = activeTeamId ? normalizeAssistantTeamLabel(activeTeamId) : null;
  const completedTeamLabels = completedTeamIds.map(normalizeAssistantTeamLabel);
  const canRegenerate = Boolean(thread?.messages.some((message) => message.role === "user")) && !isSending && !isLoadingThread;

  return {
    activeThreadId: selectedThreadId,
    handleCreateThread,
    handleRegenerate,
    handleSelectThread,
    handleSend,
    handleStopStreaming,
    isLoadingThread,
    isStoppingStream,
    isSending,
    isVoiceRecording: voiceRecorder.isRecording,
    isVoiceTranscribing: voiceRecorder.isTranscribing,
    voiceProcessingPhase: voiceRecorder.processingPhase,
    canRegenerate,
    activeTeamLabel,
    completedTeamLabels,
    stageHistory,
    streamLifecycleStatus,
    liveAssistantMotionState: assistantMotionState,
    liveStageLabel: stageLabel,
    voiceElapsedMs: voiceRecorder.elapsedMs,
    voiceLevels: voiceRecorder.levels,
    toggleVoiceRecording: voiceRecorder.toggleRecording,
    sendError,
    setValue,
    thread,
    value,
  };
}
