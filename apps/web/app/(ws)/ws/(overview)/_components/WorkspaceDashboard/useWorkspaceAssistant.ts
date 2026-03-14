"use client";

import { useEffect, useState, useTransition } from "react";
import type { AnanProThread } from "@/server/contracts/ananPro";

type UseWorkspaceAssistantParams = {
  initialThread: AnanProThread | null;
  initialSelectedThreadId: string | null;
};

function updateThreadUrl(threadId: string | null) {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  if (threadId) {
    url.searchParams.set("threadId", threadId);
  } else {
    url.searchParams.delete("threadId");
  }

  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

async function parseThreadResponse(response: Response) {
  if (!response.ok) {
    throw new Error("تعذر تحميل المحادثة.");
  }

  return (await response.json()) as AnanProThread | null;
}

function notifyAssistantThreadsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("workspace-assistant-threads:changed"));
}

/**
 * WHY:   The workspace assistant needs one local state machine for thread selection, optimistic replies, and list refreshes.
 * WHAT:  Exposes thread state plus actions to select a thread, start a fresh one, and send messages through the Anan Pro API.
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
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (initialThread?.id && !initialSelectedThreadId) {
      updateThreadUrl(initialThread.id);
    }
  }, [initialSelectedThreadId, initialThread?.id]);

  const handleSelectThread = (threadId: string) => {
    if (threadId === selectedThreadId || isLoadingThread) {
      return;
    }

    setSendError(null);
    setSelectedThreadId(threadId);
    setIsLoadingThread(true);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/workspace/anan-pro?threadId=${encodeURIComponent(threadId)}`);
        const nextThread = await parseThreadResponse(response);
        setThread(nextThread);
        setSelectedThreadId(nextThread?.id ?? null);
        updateThreadUrl(nextThread?.id ?? null);
      } catch (error) {
        setThread(null);
        setSelectedThreadId(null);
        setSendError(error instanceof Error ? error.message : "تعذر تحميل المحادثة.");
        updateThreadUrl(null);
      } finally {
        setIsLoadingThread(false);
      }
    });
  };

  const handleCreateThread = () => {
    setThread(null);
    setSelectedThreadId(null);
    setValue("");
    setSendError(null);
    updateThreadUrl(null);
  };

  const handleSend = (message?: string) => {
    const nextMessage = (message ?? value).trim();
    if (!nextMessage || isPending || isLoadingThread) {
      return;
    }

    const previousThread = thread;
    const optimisticThread: AnanProThread = previousThread ?? {
      id: "",
      title: null,
      messages: [],
    };

    setValue("");
    setSendError(null);

    startTransition(async () => {
      setThread({
        ...optimisticThread,
        messages: [
          ...optimisticThread.messages,
          {
            id: `optimistic-${Date.now()}`,
            role: "user",
            content: nextMessage,
            createdAt: Date.now(),
          },
        ],
      });

      try {
        const response = await fetch("/api/workspace/anan-pro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            previousThread?.id
              ? {
                  message: nextMessage,
                  threadId: previousThread.id,
                }
              : {
                  message: nextMessage,
                },
          ),
        });

        if (!response.ok) {
          throw new Error("تعذر إرسال الرسالة.");
        }

        const nextThread = (await response.json()) as AnanProThread;
        setThread(nextThread);
        setSelectedThreadId(nextThread.id);
        updateThreadUrl(nextThread.id);
        notifyAssistantThreadsChanged();
      } catch (error) {
        setThread(previousThread);
        setSendError(error instanceof Error ? error.message : "تعذر إرسال الرسالة.");
      }
    });
  };

  return {
    activeThreadId: selectedThreadId,
    handleCreateThread,
    handleSelectThread,
    handleSend,
    isLoadingThread,
    isSending: isPending,
    sendError,
    setValue,
    thread,
    value,
  };
}
