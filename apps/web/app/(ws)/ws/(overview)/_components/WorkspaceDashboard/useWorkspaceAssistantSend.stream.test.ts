import { expect, it, vi } from "vitest";
import type { AnanProThread } from "@/server/contracts/ananPro";

import { buildStreamState, streamAssistantResponse, type StreamSetters } from "./useWorkspaceAssistantSend.stream";

function createSetter<T>(store: { current: T }) {
  return (value: T | ((current: T) => T)) => {
    store.current = typeof value === "function"
      ? (value as (current: T) => T)(store.current)
      : value;
  };
}

function createSetters() {
  const thread = { current: null as AnanProThread | null };
  const selectedThreadId = { current: null as string | null };
  const streamStage = { current: null };
  const stageHistory = { current: [] as unknown[] };
  const streamLifecycleStatus = { current: null as "running" | "completed" | "failed" | "cancelled" | null };
  const activeTeamId = { current: null as string | null };
  const completedTeamIds = { current: [] as string[] };
  const routeCalls: Array<{ threadId: string | null }> = [];

  const setters: StreamSetters = {
    setThread: createSetter(thread),
    setSelectedThreadId: createSetter(selectedThreadId),
    setStreamStage: createSetter(streamStage),
    setStageHistory: createSetter(stageHistory),
    setStreamLifecycleStatus: createSetter(streamLifecycleStatus),
    setActiveTeamId: createSetter(activeTeamId),
    setCompletedTeamIds: createSetter(completedTeamIds),
    replaceThreadRoute: (threadId) => {
      routeCalls.push({ threadId });
    },
  };

  return {
    setters,
    thread,
    selectedThreadId,
    streamLifecycleStatus,
    routeCalls,
  };
}

it("treats the streamed thread event as authoritative and refreshes the sidebar immediately", async () => {
  const optimisticThread: AnanProThread = {
    id: "",
    title: null,
    messages: [
      { id: "optimistic-user", role: "user", content: "ابدأ", createdAt: 1 },
      { id: "assistant-1", role: "assistant", content: "", createdAt: 2 },
    ],
  };
  const state = buildStreamState("assistant-1", optimisticThread);
  const { setters, routeCalls, selectedThreadId, streamLifecycleStatus, thread } = createSetters();

  await streamAssistantResponse({
    response: new Response(
      [
        'event: thread\ndata: {"threadId":"thread-A","title":"First"}\n\n',
        'event: delta\ndata: {"text":"مرحبا"}\n\n',
        'event: done\ndata: {"thread":{"id":"thread-A","title":"First","messages":[{"id":"user-1","role":"user","content":"ابدأ","createdAt":1},{"id":"assistant-1","role":"assistant","content":"مرحبا","createdAt":2}]}}\n\n',
      ].join(""),
    ),
    state,
    setters,
  });

  expect(selectedThreadId.current).toBe("thread-A");
  expect(routeCalls).toEqual([
    { threadId: "thread-A" },
    { threadId: "thread-A" },
  ]);
  expect(streamLifecycleStatus.current).toBe("completed");
  expect(thread.current?.id).toBe("thread-A");
  expect(state.didFinish).toBe(true);
});

it("patches the optimistic thread id before persistence completes", async () => {
  const optimisticThread: AnanProThread = {
    id: "",
    title: null,
    messages: [
      { id: "optimistic-user", role: "user", content: "ابدأ", createdAt: 1 },
      { id: "assistant-1", role: "assistant", content: "", createdAt: 2 },
    ],
  };
  const state = buildStreamState("assistant-1", optimisticThread);
  const { setters, thread, selectedThreadId, routeCalls } = createSetters();
  setters.setThread(optimisticThread);

  await streamAssistantResponse({
    response: new Response(
      [
        'event: thread\ndata: {"threadId":"thread-B","title":"Fresh"}\n\n',
        'event: delta\ndata: {"text":"مرحبا"}\n\n',
      ].join(""),
    ),
    state,
    setters,
  });

  expect(selectedThreadId.current).toBe("thread-B");
  expect(routeCalls).toEqual([{ threadId: "thread-B" }]);
  expect(thread.current?.id).toBe("thread-B");
  expect(thread.current?.title).toBe("Fresh");
  expect(thread.current?.messages[1]?.content).toBe("مرحبا");
  expect(state.didFinish).toBe(false);
});
