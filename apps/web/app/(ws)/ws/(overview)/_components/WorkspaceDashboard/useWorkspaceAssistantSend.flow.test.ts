import { afterEach, expect, it, vi } from "vitest";
import type { AnanProThread } from "@/server/contracts/ananPro";
import { runSendFlow, type SendFlowParams } from "./useWorkspaceAssistantSend.flow";

function createSetter<T>(store: { current: T }) {
  return (value: T | ((current: T) => T)) => {
    store.current = typeof value === "function"
      ? (value as (current: T) => T)(store.current)
      : value;
  };
}

function createSendFlowParams() {
  const thread = { current: null as AnanProThread | null };
  const sendError = { current: null as string | null };
  const streamStage = { current: null };
  const stageHistory = { current: [] as unknown[] };
  const streamLifecycleStatus = { current: null as "running" | "completed" | "failed" | "cancelled" | null };
  const activeTeamId = { current: null as string | null };
  const completedTeamIds = { current: [] as string[] };
  const activeStreamSessionId = { current: null as string | null };
  const isStoppingStream = { current: false };
  const selectedThreadId = { current: null as string | null };
  const routeCalls: string[] = [];
  const stopRequestedRef = { current: false };

  const params: SendFlowParams = {
    setThread: createSetter(thread),
    setSelectedThreadId: createSetter(selectedThreadId),
    setSendError: createSetter(sendError),
    setStreamStage: createSetter(streamStage),
    setStageHistory: createSetter(stageHistory),
    setStreamLifecycleStatus: createSetter(streamLifecycleStatus),
    setActiveTeamId: createSetter(activeTeamId),
    setCompletedTeamIds: createSetter(completedTeamIds),
    setActiveStreamSessionId: createSetter(activeStreamSessionId),
    setIsStoppingStream: createSetter(isStoppingStream),
    replaceThreadRoute: (threadId) => {
      if (threadId) routeCalls.push(threadId);
    },
    stopRequestedRef,
  };

  return {
    params,
    thread,
    selectedThreadId,
    routeCalls,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

it("keeps the newly created thread active for the next send", async () => {
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(new Response(
      [
        'event: thread\ndata: {"threadId":"thread-A","title":"First"}\n\n',
        'event: done\ndata: {"thread":{"id":"thread-A","title":"First","messages":[{"id":"user-1","role":"user","content":"First message","createdAt":1},{"id":"assistant-1","role":"assistant","content":"First answer","createdAt":2}]}}\n\n',
      ].join(""),
      { status: 200 },
    ))
    .mockResolvedValueOnce(new Response(
      [
        'event: done\ndata: {"thread":{"id":"thread-A","title":"First","messages":[{"id":"user-1","role":"user","content":"First message","createdAt":1},{"id":"assistant-1","role":"assistant","content":"First answer","createdAt":2},{"id":"user-2","role":"user","content":"Second message","createdAt":3},{"id":"assistant-2","role":"assistant","content":"Second answer","createdAt":4}]}}\n\n',
      ].join(""),
      { status: 200 },
    ));
  vi.stubGlobal("fetch", fetchMock);

  const { params, thread, selectedThreadId, routeCalls } = createSendFlowParams();

  await runSendFlow({
    params,
    previousThread: null,
    startNewThread: true,
    nextMessage: "First message",
    streamSessionId: "session-1",
    assistantMessageId: "assistant-1",
  });

  expect(selectedThreadId.current).toBe("thread-A");
  expect(thread.current?.id).toBe("thread-A");
  expect(routeCalls).toContain("thread-A");

  await runSendFlow({
    params,
    previousThread: thread.current,
    nextMessage: "Second message",
    streamSessionId: "session-2",
    assistantMessageId: "assistant-2",
  });

  const firstBody = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body ?? "{}")) as {
    threadId?: string;
    startNewThread?: boolean;
  };
  const secondBody = JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body ?? "{}")) as {
    threadId?: string;
    startNewThread?: boolean;
  };

  expect(firstBody.threadId).toBeUndefined();
  expect(firstBody.startNewThread).toBe(true);
  expect(secondBody.threadId).toBe("thread-A");
  expect(secondBody.startNewThread).toBeUndefined();
  expect(thread.current?.messages.at(-1)?.content).toBe("Second answer");
});
