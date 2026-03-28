"use client";

import type { AnanProStreamStageEvent, AnanProThread } from "@/server/contracts/ananPro";
import {
  parseSseChunk,
  type AssistantStreamEvent,
} from "./useWorkspaceAssistant.shared";

export type StreamSetters = {
  setThread: React.Dispatch<React.SetStateAction<AnanProThread | null>>;
  setSelectedThreadId: React.Dispatch<React.SetStateAction<string | null>>;
  setStreamStage: React.Dispatch<React.SetStateAction<AnanProStreamStageEvent | null>>;
  setStageHistory: React.Dispatch<React.SetStateAction<AnanProStreamStageEvent[]>>;
  setStreamLifecycleStatus: React.Dispatch<React.SetStateAction<"running" | "completed" | "failed" | "cancelled" | null>>;
  setActiveTeamId: React.Dispatch<React.SetStateAction<string | null>>;
  setActiveAgentName: React.Dispatch<React.SetStateAction<string | null>>;
  setCompletedTeamIds: React.Dispatch<React.SetStateAction<string[]>>;
  replaceThreadRoute: (threadId: string | null) => void;
};

export type StreamRunState = {
  assistantMessageId: string;
  optimisticThread: AnanProThread;
  assistantText: string;
  streamMeta: unknown;
  didFinish: boolean;
};

function setAssistantMessageState(args: {
  setThread: StreamSetters["setThread"];
  optimisticThread: AnanProThread;
  assistantMessageId: string;
  apply: (message: AnanProThread["messages"][number]) => AnanProThread["messages"][number];
}) {
  args.setThread((current) => {
    const source = current ?? args.optimisticThread;
    return {
      ...source,
      messages: source.messages.map((message) =>
        message.id === args.assistantMessageId ? args.apply(message) : message,
      ),
    };
  });
}

function handleThreadEvent(
  event: Extract<AssistantStreamEvent, { event: "thread" }>,
  setters: StreamSetters,
) {
  setters.setThread((current) => {
    if (!current) {
      return {
        id: event.data.threadId,
        title: event.data.title ?? null,
        messages: [],
      };
    }
    return {
      ...current,
      id: event.data.threadId,
      title: event.data.title ?? current.title ?? null,
    };
  });
  setters.setSelectedThreadId(event.data.threadId);
  setters.replaceThreadRoute(event.data.threadId);
}

function handleDeltaEvent(
  event: Extract<AssistantStreamEvent, { event: "delta" }>,
  state: StreamRunState,
  setters: StreamSetters,
) {
  state.assistantText += event.data.text ?? "";
  setAssistantMessageState({
    setThread: setters.setThread,
    optimisticThread: state.optimisticThread,
    assistantMessageId: state.assistantMessageId,
    apply: (message) => ({ ...message, content: state.assistantText, meta: state.streamMeta }),
  });
}

function updateStageMeta(
  stage: AnanProStreamStageEvent,
  setters: StreamSetters,
) {
  setters.setStreamStage(stage);
  setters.setStageHistory((current) =>
    current.some((item) => item.seq === stage.seq) ? current : [...current, stage],
  );
  if (stage.phase === "team_started" && stage.teamId) {
    setters.setActiveTeamId(stage.teamId);
  }
  if (stage.phase === "team_started" && stage.agentName) {
    setters.setActiveAgentName(stage.agentName);
  }
  if (stage.phase !== "team_done" || !stage.teamId) {
    return;
  }
  const teamId = stage.teamId;
  setters.setCompletedTeamIds((current) =>
    current.includes(teamId) ? current : [...current, teamId],
  );
  setters.setActiveTeamId((current) => (current === teamId ? null : current));
  if (stage.agentName) {
    setters.setActiveAgentName((current) => (current === stage.agentName ? null : current));
  }
}

function handleMetaEvent(
  event: Extract<AssistantStreamEvent, { event: "meta" }>,
  state: StreamRunState,
  setters: StreamSetters,
) {
  if (event.data.type === "stage" && event.data.stage) {
    updateStageMeta(event.data.stage, setters);
  }
  if (event.data.type === "lifecycle" && event.data.lifecycle?.status) {
    setters.setStreamLifecycleStatus(event.data.lifecycle.status);
  }
  if (event.data.type === "assistant_meta") {
    state.streamMeta = event.data.meta;
  }
  setAssistantMessageState({
    setThread: setters.setThread,
    optimisticThread: state.optimisticThread,
    assistantMessageId: state.assistantMessageId,
    apply: (message) => ({ ...message, meta: state.streamMeta }),
  });
}

function handleDoneEvent(
  event: Extract<AssistantStreamEvent, { event: "done" }>,
  state: StreamRunState,
  setters: StreamSetters,
) {
  state.didFinish = true;
  setters.setStreamStage(null);
  setters.setActiveTeamId(null);
  setters.setActiveAgentName(null);
  setters.setCompletedTeamIds([]);
  setters.setStreamLifecycleStatus("completed");
  setters.setThread(event.data.thread);
  setters.setSelectedThreadId(event.data.thread.id);
  setters.replaceThreadRoute(event.data.thread.id);
}

function dispatchStreamEvent(
  event: AssistantStreamEvent,
  state: StreamRunState,
  setters: StreamSetters,
) {
  if (event.event === "thread") {
    handleThreadEvent(event, setters);
    return;
  }
  if (event.event === "delta") {
    handleDeltaEvent(event, state, setters);
    return;
  }
  if (event.event === "meta") {
    handleMetaEvent(event, state, setters);
    return;
  }
  if (event.event === "done") {
    handleDoneEvent(event, state, setters);
    return;
  }
  if (event.event === "error") {
    throw new Error(event.data?.message || "تعذر إرسال الرسالة.");
  }
}

function pullNextSseChunk(buffer: string) {
  const separatorIndex = buffer.indexOf("\n\n");
  if (separatorIndex === -1) {
    return null;
  }
  return {
    chunk: buffer.slice(0, separatorIndex),
    remainder: buffer.slice(separatorIndex + 2),
  };
}

function consumeSseBuffer(args: {
  buffer: string;
  state: StreamRunState;
  setters: StreamSetters;
}) {
  let rest = args.buffer;
  while (true) {
    const next = pullNextSseChunk(rest);
    if (!next) {
      return rest;
    }
    rest = next.remainder;
    const event = parseSseChunk(next.chunk);
    if (!event) {
      continue;
    }
    dispatchStreamEvent(event, args.state, args.setters);
  }
}

/**
 * WHY:   Workspace assistant sends stream back partial results that must update the optimistic thread as bytes arrive.
 * WHAT:  Reads the SSE response body, parses each event, and applies it to the supplied thread/stream setters.
 * HOW:   Buffers chunks until full SSE frames are available, then dispatches the parsed events sequentially.
 */
export async function streamAssistantResponse(args: {
  response: Response;
  state: StreamRunState;
  setters: StreamSetters;
}) {
  const reader = args.response.body?.getReader();
  if (!reader) {
    throw new Error("تعذر إرسال الرسالة.");
  }
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      return;
    }
    buffer += decoder.decode(value, { stream: true });
    buffer = consumeSseBuffer({ buffer, state: args.state, setters: args.setters });
  }
}

/**
 * WHY:   The stream parser needs one mutable accumulator for assistant text while SSE chunks arrive incrementally.
 * WHAT:  Creates the initial per-send stream state used by the response consumer.
 * HOW:   Seeds the optimistic thread snapshot and empty assistant output so later events can mutate it safely.
 */
export function buildStreamState(assistantMessageId: string, optimisticThread: AnanProThread): StreamRunState {
  return {
    assistantMessageId,
    optimisticThread,
    assistantText: "",
    streamMeta: undefined,
    didFinish: false,
  };
}
