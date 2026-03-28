import { expect, it, vi } from "vitest";

import {
  resolveVoiceActivityPhase,
  stopRecorderCapture,
} from "./useVoiceRecorder";

function createRef<T>(value: T) {
  return { current: value };
}

it("stops recorder capture immediately and only once", () => {
  const stopTrack = vi.fn();
  const recorderStop = vi.fn();
  const closeAudioContext = vi.fn().mockResolvedValue(undefined);

  const refs = {
    streamRef: createRef({
      getTracks: () => [{ stop: stopTrack }],
    } as unknown as MediaStream),
    mediaRecorderRef: createRef({
      state: "recording",
      stop: recorderStop,
    } as unknown as MediaRecorder),
    stopInFlightRef: createRef(false),
    durationIntervalRef: createRef(10),
    stopTimeoutRef: createRef(11),
    animationFrameRef: createRef(12),
    audioContextRef: createRef({
      close: closeAudioContext,
    } as unknown as AudioContext),
    analyserRef: createRef({} as AnalyserNode),
    analyserDataRef: createRef(new Uint8Array([1, 2, 3])),
  };

  vi.stubGlobal("window", {
    clearInterval: vi.fn(),
    clearTimeout: vi.fn(),
    cancelAnimationFrame: vi.fn(),
  } as unknown as Window & typeof globalThis);

  expect(stopRecorderCapture(refs).didStop).toBe(true);
  expect(stopRecorderCapture(refs).didStop).toBe(false);
  expect(recorderStop).toHaveBeenCalledTimes(1);
  expect(stopTrack).toHaveBeenCalledTimes(1);
  expect(refs.streamRef.current).toBeNull();
  expect(refs.stopInFlightRef.current).toBe(true);
});

it("keeps waiting when no speech has been detected yet", () => {
  const result = resolveVoiceActivityPhase({
    peakLevel: 0.01,
    hasDetectedSpeech: false,
    silenceStartedAt: null,
    now: 1000,
  });

  expect(result.phase).toBe("waiting_for_speech");
  expect(result.shouldAutoStop).toBe(false);
});

it("auto-stops after silence once speech was already detected", () => {
  const result = resolveVoiceActivityPhase({
    peakLevel: 0.01,
    hasDetectedSpeech: true,
    silenceStartedAt: 0,
    now: 1_200,
    silenceMs: 1_000,
  });

  expect(result.phase).toBe("silence_countdown");
  expect(result.shouldAutoStop).toBe(true);
});
