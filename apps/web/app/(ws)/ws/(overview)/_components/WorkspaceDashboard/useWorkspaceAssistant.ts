"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { AnanProInputMode, AnanProStreamStageEvent, AnanProThread } from "@/server/contracts/ananPro";
import {
  getAssistantThread,
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

type UseWorkspaceAssistantParams = {
  initialThread: AnanProThread | null;
  initialSelectedThreadId: string | null;
};

/**
 * WHY:   The workspace assistant needs one local state machine for thread selection, optimistic replies, and list refreshes.
 * WHAT:  Exposes thread state plus actions to select a thread, start a fresh one, and send messages through the Anan Workspace API.
 * HOW:   Uses optimistic local updates for message sends, re-fetches the durable thread list after changes, and mirrors the active thread in the URL query string.
 */
export function useWorkspaceAssistant({
  initialThread,
  initialSelectedThreadId,
}: UseWorkspaceAssistantParams) {
  const router = useRouter();
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
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [isPending, startTransition] = useTransition();
  const stopRequestedRef = useRef(false);
  const routeThreadId = pathname === "/ws" ? searchParams.get("threadId") : null;
  const isDraftRoute = pathname === "/ws" && searchParams.get("newThread") === "1";
  const shouldStartNewThread = !thread && pathname === "/ws" && (isDraftRoute || !routeThreadId);

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

  const replaceAssistantRoute = useCallback((threadId: string | null, options?: { newThread?: boolean }) => {
    if (pathname !== "/ws") return;

    const hash = typeof window === "undefined" ? "" : window.location.hash;
    const currentHref = buildWorkspaceAssistantHref({
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
    router.replace(nextHref, { scroll: false });
  }, [isDraftRoute, pathname, routeThreadId, router, searchParams]);

  useEffect(() => {
    const nextSelectedThreadId = initialSelectedThreadId ?? initialThread?.id ?? null;

    if (isDraftRoute) {
      setThread(null);
      setSelectedThreadId(null);
      setIsLoadingThread(false);
      resetEphemeralAssistantState();
      return;
    }

    if (!routeThreadId) {
      if (nextSelectedThreadId) {
        return;
      }
      setThread(null);
      setSelectedThreadId(null);
      setIsLoadingThread(false);
      resetEphemeralAssistantState();
      return;
    }

    if (nextSelectedThreadId !== routeThreadId) {
      return;
    }

    setThread(initialThread);
    setSelectedThreadId(nextSelectedThreadId);
    setIsLoadingThread(false);
    resetEphemeralAssistantState();
  }, [
    initialSelectedThreadId,
    initialThread,
    isDraftRoute,
    resetEphemeralAssistantState,
    routeThreadId,
  ]);

  const sendWithOptimisticUpdate = useWorkspaceAssistantSend({
    thread,
    shouldStartNewThread,
    startTransition,
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
    disabled: isPending || isLoadingThread,
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
    setIsLoadingThread(true);

    startTransition(async () => {
      try {
        const result = await getAssistantThread(threadId);
        if (!result.ok) {
          throw new Error(result.error.message || "تعذر تحميل المحادثة.");
        }

        const nextThread = result.data;
        setThread(nextThread);
        setSelectedThreadId(nextThread?.id ?? null);
        setStageHistory([]);
        setStreamLifecycleStatus(null);
        replaceAssistantRoute(nextThread?.id ?? null);
      } catch (error) {
        setThread(null);
        setSelectedThreadId(null);
        setStageHistory([]);
        setStreamLifecycleStatus(null);
        setSendError(error instanceof Error ? error.message : "تعذر تحميل المحادثة.");
        replaceAssistantRoute(null, { newThread: false });
      } finally {
        setIsLoadingThread(false);
      }
    });
  };

  const handleCreateThread = () => {
    setThread(null);
    setSelectedThreadId(null);
    setStageHistory([]);
    setStreamLifecycleStatus(null);
    setValue("");
    setSendError(null);
    replaceAssistantRoute(null, { newThread: true });
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
    if (!thread || isPending || isLoadingThread) return;
    const targetUserMessage = [...thread.messages].reverse().find((message) => message.role === "user");
    if (!targetUserMessage?.content?.trim()) return;
    setSendError(null);
    sendWithOptimisticUpdate(targetUserMessage.content, targetUserMessage.inputMode, {
      regenerate: true,
      regenerateMessageId: targetUserMessage.id,
    });
  }, [isLoadingThread, isPending, sendWithOptimisticUpdate, thread]);

  const handleSend = (message?: string, inputMode?: AnanProInputMode) => {
    const nextMessage = (message ?? value).trim();
    if (!nextMessage || isPending || isLoadingThread) {
      return;
    }

    if (typeof message !== "string") {
      setValue("");
    }
    setSendError(null);
    sendWithOptimisticUpdate(nextMessage, inputMode);
  };

  const assistantMotionState = getAssistantMotionState(isPending, streamStage);
  const stageLabel = getAssistantStageLabel(isPending, streamStage, streamLifecycleStatus);

  const activeTeamLabel = activeTeamId ? normalizeAssistantTeamLabel(activeTeamId) : null;
  const completedTeamLabels = completedTeamIds.map(normalizeAssistantTeamLabel);
  const canRegenerate = Boolean(thread?.messages.some((message) => message.role === "user")) && !isPending && !isLoadingThread;

  return {
    activeThreadId: selectedThreadId,
    handleCreateThread,
    handleRegenerate,
    handleSelectThread,
    handleSend,
    handleStopStreaming,
    isLoadingThread,
    isStoppingStream,
    isSending: isPending,
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
