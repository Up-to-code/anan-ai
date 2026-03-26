import { beforeEach, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

const {
  finalizeAnanProUploadedFiles,
  getAnanProVoiceUploadUrl,
  sendAnanProMessage,
  transcribeAnanProVoiceFromStorage,
} = vi.hoisted(() => ({
  finalizeAnanProUploadedFiles: vi.fn(),
  getAnanProVoiceUploadUrl: vi.fn(),
  sendAnanProMessage: vi.fn(),
  transcribeAnanProVoiceFromStorage: vi.fn(),
}));

vi.mock("@/server/domains/workspace/ananPro/service", () => ({
  finalizeAnanProUploadedFiles,
  getAnanProVoiceUploadUrl,
  sendAnanProMessage,
  transcribeAnanProVoiceFromStorage,
}));

import {
  finalizeAssistantUploads,
  getAssistantUploadUrl,
  getVoiceUploadUrl,
  sendAssistantMessage,
  transcribeVoiceFromStorage,
} from "./actions";

beforeEach(() => {
  finalizeAnanProUploadedFiles.mockReset();
  getAnanProVoiceUploadUrl.mockReset();
  sendAnanProMessage.mockReset();
  transcribeAnanProVoiceFromStorage.mockReset();
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

it("sends attachment-aware assistant messages", async () => {
  sendAnanProMessage.mockResolvedValue({
    id: "thread-3",
    title: "Attachments",
    messages: [],
  });

  const result = await sendAssistantMessage({
    message: "",
    inputMode: "attachment",
    attachments: [
      {
        key: "storage-1",
        url: "https://example.com/image.jpg",
        name: "image.jpg",
        mime: "image/jpeg",
        size: 1024,
      },
    ],
  });

  expect(sendAnanProMessage).toHaveBeenCalledWith({
    message: "",
    inputMode: "attachment",
    attachments: [
      {
        key: "storage-1",
        url: "https://example.com/image.jpg",
        name: "image.jpg",
        mime: "image/jpeg",
        size: 1024,
      },
    ],
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

it("reuses the assistant upload url action for file attachments", async () => {
  getAnanProVoiceUploadUrl.mockResolvedValue("https://example.com/upload");
  const result = await getAssistantUploadUrl();
  expect(result).toEqual({
    ok: true,
    data: {
      uploadUrl: "https://example.com/upload",
    },
  });
});

it("validates voice transcription payload", async () => {
  const result = await transcribeVoiceFromStorage({ storageId: "" });
  expect(result.ok).toBe(false);
  if (result.ok) return;
  expect(result.error.code).toBe("INVALID_ARGUMENT");
});

it("finalizes uploaded files into shared attachment references", async () => {
  finalizeAnanProUploadedFiles.mockResolvedValue([
    {
      key: "storage_1",
      url: "https://example.com/uploaded.png",
      name: "uploaded.png",
      mime: "image/png",
      size: 2048,
    },
  ]);

  const result = await finalizeAssistantUploads({
    files: [
      {
        storageId: "storage_1",
        name: "uploaded.png",
        mime: "image/png",
        size: 2048,
      },
    ],
  });

  expect(finalizeAnanProUploadedFiles).toHaveBeenCalledWith({
    files: [
      {
        storageId: "storage_1",
        name: "uploaded.png",
        mime: "image/png",
        size: 2048,
      },
    ],
  });
  expect(result).toEqual({
    ok: true,
    data: [
      {
        key: "storage_1",
        url: "https://example.com/uploaded.png",
        name: "uploaded.png",
        mime: "image/png",
        size: 2048,
      },
    ],
  });
});
