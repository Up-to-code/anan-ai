import { beforeEach, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

const {
  getAnanProThread,
  getAnanProVoiceUploadUrl,
  sendAnanProMessage,
  transcribeAnanProVoiceFromStorage,
} = vi.hoisted(() => ({
  getAnanProThread: vi.fn(),
  getAnanProVoiceUploadUrl: vi.fn(),
  sendAnanProMessage: vi.fn(),
  transcribeAnanProVoiceFromStorage: vi.fn(),
}));

vi.mock("@/server/domains/ananPro/service", () => ({
  getAnanProThread,
  getAnanProVoiceUploadUrl,
  sendAnanProMessage,
  transcribeAnanProVoiceFromStorage,
}));

import {
  getAssistantThread,
  getVoiceUploadUrl,
  sendAssistantMessage,
  transcribeVoiceFromStorage,
} from "./actions";

beforeEach(() => {
  getAnanProThread.mockReset();
  getAnanProVoiceUploadUrl.mockReset();
  sendAnanProMessage.mockReset();
  transcribeAnanProVoiceFromStorage.mockReset();
});

it("loads assistant thread successfully", async () => {
  getAnanProThread.mockResolvedValue({
    id: "thread-1",
    title: "Thread",
    messages: [],
  });

  const result = await getAssistantThread("thread-1");
  expect(result).toEqual({
    ok: true,
    data: {
      id: "thread-1",
      title: "Thread",
      messages: [],
    },
  });
});

it("validates send input and returns stable invalid argument errors", async () => {
  const result = await sendAssistantMessage({
    message: " ",
  });

  expect(result.ok).toBe(false);
  if (result.ok) return;
  expect(result.error.code).toBe("INVALID_ARGUMENT");
  expect(result.error.status).toBe(400);
});

it("sends a valid voice message", async () => {
  sendAnanProMessage.mockResolvedValue({
    id: "thread-2",
    title: "Voice",
    messages: [],
  });

  const result = await sendAssistantMessage({
    message: "صباح الخير",
    inputMode: "voice",
    threadId: "thread-2",
  });

  expect(sendAnanProMessage).toHaveBeenCalledWith({
    message: "صباح الخير",
    inputMode: "voice",
    threadId: "thread-2",
  });
  expect(result.ok).toBe(true);
});

it("returns normalized errors for upload url action", async () => {
  getAnanProVoiceUploadUrl.mockRejectedValue(
    new DomainError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
      status: 401,
    }),
  );

  const result = await getVoiceUploadUrl();
  expect(result).toEqual({
    ok: false,
    error: {
      code: "UNAUTHORIZED",
      message: "Authentication required",
      status: 401,
    },
  });
});

it("validates voice transcription payload", async () => {
  const result = await transcribeVoiceFromStorage({ storageId: "" });
  expect(result.ok).toBe(false);
  if (result.ok) return;
  expect(result.error.code).toBe("INVALID_ARGUMENT");
});
