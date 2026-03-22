import { expect, it } from "vitest";
import {
  isIncomingThreadWeaker,
  shouldKeepLocalThreadSnapshot,
  shouldPreserveOptimisticDraftThread,
  shouldPreserveLocalThreadWhileRouteSyncs,
} from "./useWorkspaceAssistant";

it("preserves a newly created local thread while the URL is still catching up", () => {
  expect(shouldPreserveLocalThreadWhileRouteSyncs({
    pendingRouteThreadId: "thread-1",
    routeThreadId: null,
    selectedThreadId: "thread-1",
    currentThread: {
      id: "thread-1",
      title: "Fresh",
      messages: [],
    },
  })).toBe(true);
});

it("does not preserve old local thread state when there is no pending route sync", () => {
  expect(shouldPreserveLocalThreadWhileRouteSyncs({
    pendingRouteThreadId: null,
    routeThreadId: null,
    selectedThreadId: "thread-1",
    currentThread: {
      id: "thread-1",
      title: "Fresh",
      messages: [],
    },
  })).toBe(false);
});

it("preserves the first optimistic draft thread while the stream is active and no threadId exists yet", () => {
  expect(shouldPreserveOptimisticDraftThread({
    routeThreadId: null,
    selectedThreadId: null,
    currentThread: {
      id: "",
      title: null,
      messages: [
        { id: "user-1", role: "user", content: "ابدأ", createdAt: 1 },
        { id: "assistant-1", role: "assistant", content: "", createdAt: 2 },
      ],
    },
    activeStreamSessionId: "session-1",
  })).toBe(true);
});

it("does not preserve a draft thread once the stream is no longer active", () => {
  expect(shouldPreserveOptimisticDraftThread({
    routeThreadId: null,
    selectedThreadId: null,
    currentThread: {
      id: "",
      title: null,
      messages: [
        { id: "user-1", role: "user", content: "ابدأ", createdAt: 1 },
      ],
    },
    activeStreamSessionId: null,
  })).toBe(false);
});

it("treats an incoming thread as weaker when the last assistant message is shorter", () => {
  expect(isIncomingThreadWeaker({
    currentThread: {
      id: "thread-1",
      title: "Fresh",
      messages: [
        { id: "user-1", role: "user", content: "ابدأ", createdAt: 1 },
        { id: "assistant-1", role: "assistant", content: "مرحبا بك في التقرير النهائي", createdAt: 2 },
      ],
    },
    incomingThread: {
      id: "thread-1",
      title: "Fresh",
      messages: [
        { id: "user-1", role: "user", content: "ابدأ", createdAt: 1 },
        { id: "assistant-1", role: "assistant", content: "مرحبا", createdAt: 2 },
      ],
    },
  })).toBe(true);
});

it("keeps the local completed thread when the incoming snapshot has the same count but weaker content", () => {
  expect(shouldKeepLocalThreadSnapshot({
    currentThread: {
      id: "thread-1",
      title: "Fresh",
      messages: [
        { id: "user-1", role: "user", content: "ابدأ", createdAt: 1 },
        { id: "assistant-1", role: "assistant", content: "مرحبا بك في التقرير النهائي", createdAt: 2 },
      ],
    },
    incomingThread: {
      id: "thread-1",
      title: "Fresh",
      messages: [
        { id: "user-1", role: "user", content: "ابدأ", createdAt: 1 },
        { id: "assistant-1", role: "assistant", content: "مرحبا", createdAt: 2 },
      ],
    },
    routeThreadId: "thread-1",
    nextSelectedThreadId: "thread-1",
    activeStreamSessionId: null,
  })).toBe(true);
});

it("keeps the optimistic local thread while the streamed run is ahead of the server snapshot", () => {
  expect(shouldKeepLocalThreadSnapshot({
    currentThread: {
      id: "thread-1",
      title: "Fresh",
      messages: [
        { id: "user-1", role: "user", content: "ابدأ", createdAt: 1 },
        { id: "assistant-1", role: "assistant", content: "مرحبا", createdAt: 2 },
      ],
    },
    incomingThread: {
      id: "thread-1",
      title: "Fresh",
      messages: [],
    },
    routeThreadId: "thread-1",
    nextSelectedThreadId: "thread-1",
    activeStreamSessionId: "session-1",
  })).toBe(true);
});

it("allows the server snapshot to hydrate once it is at least as complete as the local state", () => {
  expect(shouldKeepLocalThreadSnapshot({
    currentThread: {
      id: "thread-1",
      title: "Fresh",
      messages: [
        { id: "user-1", role: "user", content: "ابدأ", createdAt: 1 },
        { id: "assistant-1", role: "assistant", content: "مرحبا", createdAt: 2 },
      ],
    },
    incomingThread: {
      id: "thread-1",
      title: "Fresh",
      messages: [
        { id: "user-1", role: "user", content: "ابدأ", createdAt: 1 },
        { id: "assistant-1", role: "assistant", content: "مرحبا", createdAt: 2 },
      ],
    },
    routeThreadId: "thread-1",
    nextSelectedThreadId: "thread-1",
    activeStreamSessionId: null,
  })).toBe(false);
});
