"use client";

import type { AnanProInputMode, AnanProThread } from "@/server/contracts/ananPro";
import {
  buildStreamState,
  streamAssistantResponse,
  type StreamSetters,
} from "./useWorkspaceAssistantSend.stream";

export type SendOptions = { regenerate?: boolean; regenerateMessageId?: string };

export type SendFlowParams = StreamSetters & {
  setSendError: React.Dispatch<React.SetStateAction<string | null>>;
  setActiveStreamSessionId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsStoppingStream: React.Dispatch<React.SetStateAction<boolean>>;
  stopRequestedRef: React.MutableRefObject<boolean>;
};

function createOptimisticThread(args: {
  previousThread: AnanProThread | null;
  assistantMessageId: string;
  nextMessage: string;
  inputMode?: AnanProInputMode;
  options?: SendOptions;
}) {
  const optimisticThread: AnanProThread = args.previousThread ?? { id: "", title: null, messages: [] };
  const baseMessages = [...optimisticThread.messages];
  if (!args.options?.regenerate) {
    baseMessages.push({
      id: `optimistic-${Date.now()}`,
      role: "user",
      content: args.nextMessage,
      inputMode: args.inputMode,
      createdAt: Date.now(),
    });
  }
  baseMessages.push({
    id: args.assistantMessageId,
    role: "assistant",
    content: "",
    createdAt: Date.now() + 1,
  });
  return { ...optimisticThread, messages: baseMessages };
}

function buildSendBody(args: {
  previousThread: AnanProThread | null;
  startNewThread?: boolean;
  nextMessage: string;
  inputMode?: AnanProInputMode;
  streamSessionId: string;
  options?: SendOptions;
}) {
  return {
    message: args.nextMessage,
    threadId: args.previousThread?.id,
    startNewThread: args.startNewThread || undefined,
    inputMode: args.inputMode,
    streamSessionId: args.streamSessionId,
    regenerate: args.options?.regenerate,
    regenerateMessageId: args.options?.regenerateMessageId,
  };
}

function initializeStreamRun(args: {
  params: SendFlowParams;
  streamSessionId: string;
  optimisticThread: AnanProThread;
}) {
  args.params.setStreamStage(null);
  args.params.setStageHistory([]);
  args.params.setStreamLifecycleStatus("running");
  args.params.setActiveTeamId(null);
  args.params.setCompletedTeamIds([]);
  args.params.setActiveStreamSessionId(args.streamSessionId);
  args.params.setIsStoppingStream(false);
  args.params.stopRequestedRef.current = false;
  args.params.setThread(args.optimisticThread);
}

function finalizeStreamRun(params: SendFlowParams) {
  params.setActiveStreamSessionId(null);
  params.setIsStoppingStream(false);
  params.stopRequestedRef.current = false;
}

async function requestAssistantStream(args: {
  previousThread: AnanProThread | null;
  startNewThread?: boolean;
  nextMessage: string;
  inputMode?: AnanProInputMode;
  options?: SendOptions;
  streamSessionId: string;
}) {
  const response = await fetch("/api/workspace/anan-pro?stream=1", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
        buildSendBody({
          previousThread: args.previousThread,
          startNewThread: args.startNewThread,
          nextMessage: args.nextMessage,
          inputMode: args.inputMode,
          streamSessionId: args.streamSessionId,
        options: args.options,
      }),
    ),
  });
  if (!response.ok || !response.body) {
    throw new Error("تعذر إرسال الرسالة.");
  }
  return response;
}

function handleSendFlowError(args: {
  params: SendFlowParams;
  previousThread: AnanProThread | null;
  error: unknown;
}) {
  args.params.setStreamStage(null);
  args.params.setActiveTeamId(null);
  args.params.setCompletedTeamIds([]);
  if (args.params.stopRequestedRef.current) {
    args.params.setStreamLifecycleStatus("cancelled");
    return;
  }
  args.params.setThread(args.previousThread);
  args.params.setSendError(args.error instanceof Error ? args.error.message : "تعذر إرسال الرسالة.");
}

export async function runSendFlow(args: {
  params: SendFlowParams;
  previousThread: AnanProThread | null;
  startNewThread?: boolean;
  nextMessage: string;
  inputMode?: AnanProInputMode;
  options?: SendOptions;
  streamSessionId: string;
  assistantMessageId: string;
}) {
  const optimisticThread = createOptimisticThread({
    previousThread: args.previousThread,
    assistantMessageId: args.assistantMessageId,
    nextMessage: args.nextMessage,
    inputMode: args.inputMode,
    options: args.options,
  });
  initializeStreamRun({ params: args.params, streamSessionId: args.streamSessionId, optimisticThread });

  try {
    const response = await requestAssistantStream(args);
    const state = buildStreamState(args.assistantMessageId, optimisticThread);
    await streamAssistantResponse({ response, state, setters: args.params });
    if (!state.didFinish && !args.params.stopRequestedRef.current) {
      throw new Error("لم يكتمل بث الرد. حاول مرة أخرى.");
    }
  } catch (error) {
    handleSendFlowError({ params: args.params, previousThread: args.previousThread, error });
  } finally {
    finalizeStreamRun(args.params);
  }
}
