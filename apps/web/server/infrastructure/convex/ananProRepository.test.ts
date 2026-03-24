import { beforeEach, expect, it, vi } from "vitest";

const { fetchAction, fetchMutation, fetchQuery } = vi.hoisted(() => ({
  fetchAction: vi.fn(),
  fetchMutation: vi.fn(),
  fetchQuery: vi.fn(),
}));

vi.mock("convex/nextjs", () => ({
  fetchAction,
  fetchMutation,
  fetchQuery,
}));

vi.mock("@/lib/convexApi", () => ({
  apiUnsafe: {
    "ai_zone/assistantWorkspace": {
      getThreadSafe: "getThreadSafe",
      getThreadById: "getThreadById",
      listMessages: "listMessages",
      listThreads: "listThreads",
      listStreamEvents: "listStreamEvents",
      cancelStreamSession: "cancelStreamSession",
      sendMessage: "sendMessage",
      generateVoiceUploadUrl: "generateVoiceUploadUrl",
      transcribeVoiceFromStorage: "transcribeVoiceFromStorage",
    },
  },
}));

import { convexAnanProRepository } from "./ananProRepository";

beforeEach(() => {
  fetchAction.mockReset();
  fetchMutation.mockReset();
  fetchQuery.mockReset();
});

it("returns a thread shell when the thread exists but messages are not persisted yet", async () => {
  fetchQuery.mockImplementation(async (ref: string) => {
    if (ref === "listMessages") {
      return [];
    }
    if (ref === "getThreadById") {
      return { _id: "thread-123", title: "Fresh draft", updatedAt: 10 };
    }
    throw new Error(`Unexpected query ref: ${ref}`);
  });

  await expect(convexAnanProRepository.getThread("token-1", "thread-123")).resolves.toEqual({
    id: "thread-123",
    title: "Fresh draft",
    messages: [],
  });

  expect(fetchQuery).toHaveBeenNthCalledWith(1, "listMessages", { threadId: "thread-123" }, { token: "token-1" });
  expect(fetchQuery).toHaveBeenNthCalledWith(2, "getThreadById", { threadId: "thread-123" }, { token: "token-1" });
});

it("returns null when the thread id is not accessible or does not exist", async () => {
  fetchQuery.mockImplementation(async (ref: string) => {
    if (ref === "listMessages") {
      return [];
    }
    if (ref === "getThreadById") {
      return null;
    }
    throw new Error(`Unexpected query ref: ${ref}`);
  });

  await expect(convexAnanProRepository.getThread("token-1", "missing-thread")).resolves.toBeNull();
});
