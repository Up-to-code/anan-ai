import { expect, it } from "vitest";
import { shouldKeepLocalThreadSnapshot } from "./useWorkspaceAssistant";

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
