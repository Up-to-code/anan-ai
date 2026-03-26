"use client";

import { useCallback } from "react";
import type { AnanProInputMode, AnanProStreamStageEvent, AnanProThread } from "@/server/contracts/ananPro";
import type { UploadedFileReference } from "@/server/contracts/files";
import { runSendFlow, type SendOptions } from "./useWorkspaceAssistantSend.flow";

type UseWorkspaceAssistantSendParams = {
  thread: AnanProThread | null;
  shouldStartNewThread: boolean;
  setThread: React.Dispatch<React.SetStateAction<AnanProThread | null>>;
  setSelectedThreadId: React.Dispatch<React.SetStateAction<string | null>>;
  setSendError: React.Dispatch<React.SetStateAction<string | null>>;
  setStreamStage: React.Dispatch<React.SetStateAction<AnanProStreamStageEvent | null>>;
  setStageHistory: React.Dispatch<React.SetStateAction<AnanProStreamStageEvent[]>>;
  setStreamLifecycleStatus: React.Dispatch<React.SetStateAction<"running" | "completed" | "failed" | "cancelled" | null>>;
  setActiveTeamId: React.Dispatch<React.SetStateAction<string | null>>;
  setCompletedTeamIds: React.Dispatch<React.SetStateAction<string[]>>;
  setActiveStreamSessionId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsStoppingStream: React.Dispatch<React.SetStateAction<boolean>>;
  replaceThreadRoute: (threadId: string | null) => void;
  stopRequestedRef: React.MutableRefObject<boolean>;
};

function createStreamIdentifiers() {
  const assistantMessageId = `stream-assistant-${Date.now()}`;
  const streamSessionId = typeof crypto !== "undefined" ? crypto.randomUUID() : `${Date.now()}`;
  return { assistantMessageId, streamSessionId };
}

function toSendFlowParams(params: UseWorkspaceAssistantSendParams) {
  return {
    setThread: params.setThread,
    setSelectedThreadId: params.setSelectedThreadId,
    setSendError: params.setSendError,
    setStreamStage: params.setStreamStage,
    setStageHistory: params.setStageHistory,
    setStreamLifecycleStatus: params.setStreamLifecycleStatus,
    setActiveTeamId: params.setActiveTeamId,
    setCompletedTeamIds: params.setCompletedTeamIds,
    setActiveStreamSessionId: params.setActiveStreamSessionId,
    setIsStoppingStream: params.setIsStoppingStream,
    replaceThreadRoute: params.replaceThreadRoute,
    stopRequestedRef: params.stopRequestedRef,
  };
}

/**
 * WHY:   Sending a workspace assistant message needs one stable entry point that preserves optimistic UI and stream wiring.
 * WHAT:  Returns a callback that starts the send flow with the current thread context and stream session identifiers.
 * HOW:   Captures the latest active thread, then forwards all setters and route-sync callbacks into `runSendFlow`.
 */
export function useWorkspaceAssistantSend(params: UseWorkspaceAssistantSendParams) {
  return useCallback(
    (
      nextMessage: string,
      inputMode?: AnanProInputMode,
      options?: SendOptions,
      attachments?: UploadedFileReference[],
    ) => {
      const previousThread = params.thread;
      const startNewThread = params.shouldStartNewThread && !options?.regenerate;
      const { assistantMessageId, streamSessionId } = createStreamIdentifiers();

      void runSendFlow({
        params: toSendFlowParams(params),
        previousThread,
        startNewThread,
        nextMessage,
        inputMode,
        options,
        attachments,
        streamSessionId,
        assistantMessageId,
      });
    },
    [params],
  );
}
