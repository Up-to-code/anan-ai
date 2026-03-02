import { useAction, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useMemo, useState } from "react";
import type { AssistantMessage } from "../types";
import { useConvexBootstrapState } from "@/_core/hooks/useConvexBootstrapState";

export function useAssistantChat() {
  const { shouldRunProtectedQueries } = useConvexBootstrapState();
  const threadInfo = useQuery(
    api.ai_zone.assistant.getThreadSafe,
    shouldRunProtectedQueries ? {} : "skip",
  );
  const threadId = threadInfo?.thread?._id;
  const messages = useQuery(
    api.ai_zone.assistant.listMessagesSafe,
    shouldRunProtectedQueries && threadId ? { threadId } : shouldRunProtectedQueries ? {} : "skip",
  );
  const sendMessage = useAction(api.ai_zone.assistant.sendMessage);
  const streamMessage = useAction(api.ai_zone.assistant.streamMessage);
  const entitlement = useQuery(
    api.shared_logic.subscriptions.index.getAssistantEntitlementSafe,
    shouldRunProtectedQueries ? {} : "skip",
  );
  const [isSending, setIsSending] = useState(false);
  const [localMessages, setLocalMessages] = useState<AssistantMessage[]>([]);

  const submitMessage = async (message: string) => {
    if (!message.trim()) return;
    const tempId = `local-${Date.now()}`;
    const userMsg: AssistantMessage = {
      _id: tempId,
      role: "user",
      content: message,
      mode: entitlement?.mode ?? "qa",
      createdAt: Date.now(),
      streamState: "done",
    };
    setLocalMessages((prev) => [...prev, userMsg]);

    setIsSending(true);
    try {
      // Try streaming first
      const streamed = await streamMessage({ message, threadId });
      const assistantMsg: AssistantMessage = {
        _id: streamed.messageId ?? `assistant-${Date.now()}`,
        role: "assistant",
        content: streamed.output,
        mode: streamed.mode,
        createdAt: Date.now(),
        streamState: "done",
      };
      setLocalMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsSending(false);
    }
  };

  return useMemo(
    () => ({
      messages: ([...(messages ?? []), ...localMessages]) as AssistantMessage[],
      isLoading: shouldRunProtectedQueries && (threadInfo === undefined || messages === undefined),
      isSending,
      submitMessage,
      mode: entitlement?.mode ?? "qa",
      entitlement,
    }),
    [messages, localMessages, threadInfo, isSending, entitlement, shouldRunProtectedQueries],
  );
}
