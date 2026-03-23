import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { transcribeStoredVoiceNote } from "./voiceTranscriptionService";

beforeEach(() => {
  vi.useFakeTimers();
  process.env.ASSEMBLYAI_API_KEY = "test-key";
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
  delete process.env.ASSEMBLYAI_API_KEY;
});

it("transcribes a stored voice note successfully", async () => {
  const fetchSpy = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "tr_1" }),
    } as Response)
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: "completed",
        text: "مرحبا",
        language_code: "ar",
      }),
    } as Response);

  const runQuery = vi
    .fn()
    .mockResolvedValueOnce({ thread: { _id: "thread_1" } })
    .mockResolvedValueOnce("https://storage.example.com/audio.webm");

  const promise = transcribeStoredVoiceNote({ runQuery } as any, "storage-id" as any);
  await vi.advanceTimersByTimeAsync(2_000);
  const result = await promise;

  expect(result).toEqual({
    text: "مرحبا",
    languageCode: "ar",
  });
  expect(fetchSpy).toHaveBeenCalledTimes(2);
});

it("fails when api key is not configured", async () => {
  delete process.env.ASSEMBLYAI_API_KEY;
  const runQuery = vi
    .fn()
    .mockResolvedValueOnce({ thread: { _id: "thread_1" } })
    .mockResolvedValueOnce("https://storage.example.com/audio.webm");
  await expect(
    transcribeStoredVoiceNote({ runQuery } as any, "storage-id" as any),
  ).rejects.toMatchObject({
    data: {
      code: "AUTH_CONFIGURATION_ERROR",
    },
  });
});
