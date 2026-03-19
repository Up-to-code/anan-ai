"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import type {
  AnanProInputMode,
  AnanProStreamStageEvent,
  AnanProThread,
} from "@/server/contracts/ananPro";
import type { AIMotionState } from "@/app/(ws)/ws/_components/AIMotion";
import {
  getAssistantThread,
  getVoiceUploadUrl,
  transcribeVoiceFromStorage,
} from "./actions";
import { useVoiceRecorder } from "./useVoiceRecorder";

type UseWorkspaceAssistantParams = {
  initialThread: AnanProThread | null;
  initialSelectedThreadId: string | null;
};

function updateThreadUrl(threadId: string | null, options?: { newThread?: boolean }) {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  if (threadId) {
    url.searchParams.set("threadId", threadId);
    url.searchParams.delete("newThread");
  } else {
    url.searchParams.delete("threadId");
    if (options?.newThread === true) {
      url.searchParams.set("newThread", "1");
    } else if (options?.newThread === false) {
      url.searchParams.delete("newThread");
    }
  }

  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

function notifyAssistantThreadsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("workspace-assistant-threads:changed"));
}

type AssistantStreamEvent =
  | { event: "thread"; data: { threadId: string; title?: string | null } }
  | { event: "delta"; data: { text: string } }
  | {
      event: "meta";
      data: {
        type?: string;
        stage?: AnanProStreamStageEvent;
        meta?: unknown;
        lifecycle?: {
          sessionId?: string;
          status?: "running" | "completed" | "failed" | "cancelled";
          details?: unknown;
          timestamp?: number;
        };
      };
    }
  | { event: "done"; data: { thread: AnanProThread } }
  | { event: "error"; data: { message?: string; code?: string; status?: number } };

function parseSseChunk(rawChunk: string): AssistantStreamEvent | null {
  const lines = rawChunk
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (lines.length === 0) return null;

  const eventLine = lines.find((line) => line.startsWith("event:"));
  const dataLine = lines.find((line) => line.startsWith("data:"));
  if (!eventLine || !dataLine) return null;

  const event = eventLine.slice("event:".length).trim();
  const dataJson = dataLine.slice("data:".length).trim();
  try {
    const data = JSON.parse(dataJson) as unknown;
    if (event === "thread") return { event, data: data as { threadId: string; title?: string | null } };
    if (event === "delta") return { event, data: data as { text: string } };
    if (event === "meta") {
      return {
        event,
        data: data as {
          type?: string;
          stage?: AnanProStreamStageEvent;
          meta?: unknown;
          lifecycle?: {
            sessionId?: string;
            status?: "running" | "completed" | "failed" | "cancelled";
            details?: unknown;
            timestamp?: number;
          };
        },
      };
    }
    if (event === "done") return { event, data: data as { thread: AnanProThread } };
    if (event === "error") return { event, data: data as { message?: string } };
  } catch {
    return null;
  }

  return null;
}

/**
 * WHY:   The workspace assistant needs one local state machine for thread selection, optimistic replies, and list refreshes.
 * WHAT:  Exposes thread state plus actions to select a thread, start a fresh one, and send messages through the Anan Workspace API.
 * HOW:   Uses optimistic local updates for message sends, re-fetches the durable thread list after changes, and mirrors the active thread in the URL query string.
 */
export function useWorkspaceAssistant({
  initialThread,
  initialSelectedThreadId,
}: UseWorkspaceAssistantParams) {
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

  useEffect(() => {
    const nextSelectedThreadId = initialSelectedThreadId ?? initialThread?.id ?? null;
    setThread(initialThread);
    setSelectedThreadId(nextSelectedThreadId);
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
  }, [initialSelectedThreadId, initialThread]);

  useEffect(() => {
    if (initialThread?.id && !initialSelectedThreadId) {
      updateThreadUrl(initialThread.id);
    }
  }, [initialSelectedThreadId, initialThread?.id]);

  const sendWithOptimisticUpdate = useCallback(
    (
      nextMessage: string,
      inputMode?: AnanProInputMode,
      options?: { regenerate?: boolean; regenerateMessageId?: string },
    ) => {
      const previousThread = thread;
      const assistantMessageId = `stream-assistant-${Date.now()}`;
      const streamSessionId = typeof crypto !== "undefined" ? crypto.randomUUID() : `${Date.now()}`;
      const optimisticThread: AnanProThread = previousThread ?? {
        id: "",
        title: null,
        messages: [],
      };

      startTransition(async () => {
        setStreamStage(null);
        setStageHistory([]);
        setStreamLifecycleStatus("running");
        setActiveTeamId(null);
        setCompletedTeamIds([]);
        setActiveStreamSessionId(streamSessionId);
        setIsStoppingStream(false);
        stopRequestedRef.current = false;

        setThread({
          ...optimisticThread,
          messages: options?.regenerate
            ? [
                ...optimisticThread.messages,
                {
                  id: assistantMessageId,
                  role: "assistant",
                  content: "",
                  createdAt: Date.now() + 1,
                },
              ]
            : [
                ...optimisticThread.messages,
                {
                  id: `optimistic-${Date.now()}`,
                  role: "user",
                  content: nextMessage,
                  inputMode,
                  createdAt: Date.now(),
                },
                {
                  id: assistantMessageId,
                  role: "assistant",
                  content: "",
                  createdAt: Date.now() + 1,
                },
              ],
        });

        try {
          const response = await fetch("/api/workspace/anan-pro?stream=1", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              previousThread?.id
                ? {
                    message: nextMessage,
                    threadId: previousThread.id,
                    inputMode,
                    streamSessionId,
                    regenerate: options?.regenerate,
                    regenerateMessageId: options?.regenerateMessageId,
                  }
                : {
                    message: nextMessage,
                    inputMode,
                    streamSessionId,
                    regenerate: options?.regenerate,
                    regenerateMessageId: options?.regenerateMessageId,
                  },
            ),
          });

          if (!response.ok || !response.body) {
            throw new Error("تعذر إرسال الرسالة.");
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          let assembledAssistantText = "";
          let streamMeta: unknown;
          let didFinish = false;

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            let separatorIndex = buffer.indexOf("\n\n");

            while (separatorIndex !== -1) {
              const chunk = buffer.slice(0, separatorIndex);
              buffer = buffer.slice(separatorIndex + 2);

              const event = parseSseChunk(chunk);
              if (!event) {
                separatorIndex = buffer.indexOf("\n\n");
                continue;
              }

              if (event.event === "thread") {
                setSelectedThreadId(event.data.threadId);
                updateThreadUrl(event.data.threadId);
              }

              if (event.event === "delta") {
                assembledAssistantText += event.data.text ?? "";
                setThread((current) => {
                  const source = current ?? optimisticThread;
                  return {
                    ...source,
                    messages: source.messages.map((message) =>
                      message.id === assistantMessageId
                        ? {
                            ...message,
                            content: assembledAssistantText,
                            meta: streamMeta,
                          }
                        : message,
                    ),
                  };
                });
              }

              if (event.event === "meta") {
                if (event.data.type === "stage" && event.data.stage) {
                  setStreamStage(event.data.stage);
                  setStageHistory((current) =>
                    current.some((stage) => stage.seq === event.data.stage?.seq)
                      ? current
                      : [...current, event.data.stage!],
                  );
                  if (event.data.stage.phase === "team_started" && event.data.stage.teamId) {
                    setActiveTeamId(event.data.stage.teamId);
                  }
                  if (event.data.stage.phase === "team_done" && event.data.stage.teamId) {
                    setCompletedTeamIds((current) =>
                      current.includes(event.data.stage.teamId!)
                        ? current
                        : [...current, event.data.stage.teamId!],
                    );
                    setActiveTeamId((current) =>
                      current === event.data.stage.teamId ? null : current,
                    );
                  }
                }
                if (event.data.type === "lifecycle" && event.data.lifecycle?.status) {
                  setStreamLifecycleStatus(event.data.lifecycle.status);
                }
                if (event.data.type === "assistant_meta") {
                  streamMeta = event.data.meta;
                }
                setThread((current) => {
                  const source = current ?? optimisticThread;
                  return {
                    ...source,
                    messages: source.messages.map((message) =>
                      message.id === assistantMessageId
                        ? {
                            ...message,
                            meta: streamMeta,
                          }
                        : message,
                    ),
                  };
                });
              }

              if (event.event === "error") {
                throw new Error(event.data?.message || "تعذر إرسال الرسالة.");
              }

              if (event.event === "done") {
                didFinish = true;
                setStreamStage(null);
                setActiveTeamId(null);
                setCompletedTeamIds([]);
                setStreamLifecycleStatus("completed");
                setThread(event.data.thread);
                setSelectedThreadId(event.data.thread.id);
                updateThreadUrl(event.data.thread.id);
                notifyAssistantThreadsChanged();
              }

              separatorIndex = buffer.indexOf("\n\n");
            }
          }

          if (!didFinish && !stopRequestedRef.current) {
            throw new Error("لم يكتمل بث الرد. حاول مرة أخرى.");
          }
        } catch (error) {
          setStreamStage(null);
          setActiveTeamId(null);
          setCompletedTeamIds([]);

          if (stopRequestedRef.current) {
            setStreamLifecycleStatus("cancelled");
          } else {
            setThread(previousThread);
            setSendError(error instanceof Error ? error.message : "تعذر إرسال الرسالة.");
          }
        } finally {
          setActiveStreamSessionId(null);
          setIsStoppingStream(false);
          stopRequestedRef.current = false;
        }
      });
    },
    [thread],
  );

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
        updateThreadUrl(nextThread?.id ?? null);
      } catch (error) {
        setThread(null);
        setSelectedThreadId(null);
        setStageHistory([]);
        setStreamLifecycleStatus(null);
        setSendError(error instanceof Error ? error.message : "تعذر تحميل المحادثة.");
        updateThreadUrl(null, { newThread: false });
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
    updateThreadUrl(null, { newThread: true });
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

  const assistantMotionState: AIMotionState = (() => {
    if (!isPending || !streamStage) return "idle";
    switch (streamStage.phase) {
      case "intent_started":
      case "intent_done":
      case "merge_started":
      case "merge_done":
        return "thinking";
      case "team_started":
      case "team_done":
        return "agent";
      case "action_started":
      case "action_done":
        return "tool";
      case "persist_started":
      case "persist_done":
        return "syncing";
      default:
        return "thinking";
    }
  })();

  const stageLabel = (() => {
    if (streamLifecycleStatus === "cancelled") {
      return "تم إيقاف التوليد.";
    }
    if (!isPending || !streamStage) return "anan workspace يجهز الخطوة التالية...";
    const team = streamStage.teamId?.replace("team_workspace_", "");
    switch (streamStage.phase) {
      case "intent_started":
        return "جاري تحليل الطلب وتحديد الفريق المناسب...";
      case "intent_done":
        return team ? `تم تحديد المسارات: ${team}` : "تم تحديد مسار التنفيذ.";
      case "team_started":
        return team ? `فريق ${team} يعمل الآن...` : "الفريق يعمل الآن...";
      case "team_done":
        return streamStage.status === "failed"
          ? "انتهت مهمة فريق مع تعذر جزئي، نكمل الدمج..."
          : "تم إنهاء معالجة الفريق.";
      case "merge_started":
        return "جاري دمج نتائج الفرق...";
      case "merge_done":
        return "تم تجهيز الرد الأولي.";
      case "action_started":
        return "جاري تنفيذ الإجراء المطلوب...";
      case "action_done":
        return streamStage.status === "failed" ? "تعذر تنفيذ الإجراء." : "تم تنفيذ الإجراء.";
      case "persist_started":
        return "جاري حفظ المحادثة...";
      case "persist_done":
        return "اكتمل حفظ المحادثة.";
      default:
        return "anan workspace يجهز الخطوة التالية...";
    }
  })();

  const normalizeTeamLabel = (teamId: string) =>
    teamId.replace("team_workspace_", "").replaceAll("_", " ");

  const activeTeamLabel = activeTeamId ? normalizeTeamLabel(activeTeamId) : null;
  const completedTeamLabels = completedTeamIds.map(normalizeTeamLabel);
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
