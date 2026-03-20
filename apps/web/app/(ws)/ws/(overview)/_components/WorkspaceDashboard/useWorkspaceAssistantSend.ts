"use client";

import { useCallback } from "react";
import type { AnanProInputMode, AnanProStreamStageEvent, AnanProThread } from "@/server/contracts/ananPro";
import { runSendFlow, type SendOptions } from "./useWorkspaceAssistantSend.flow";

type UseWorkspaceAssistantSendParams = {
  thread: AnanProThread | null;
  startTransition: React.TransitionStartFunction;
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
    stopRequestedRef: params.stopRequestedRef,
  };
}

export function useWorkspaceAssistantSend(params: UseWorkspaceAssistantSendParams) {
  return useCallback(
    (nextMessage: string, inputMode?: AnanProInputMode, options?: SendOptions) => {
      const previousThread = params.thread;
      const { assistantMessageId, streamSessionId } = createStreamIdentifiers();

      params.startTransition(() => {
        void runSendFlow({
          params: toSendFlowParams(params),
          previousThread,
          nextMessage,
          inputMode,
          options,
          streamSessionId,
          assistantMessageId,
        });
      });
    },
    [params],
  );
}
