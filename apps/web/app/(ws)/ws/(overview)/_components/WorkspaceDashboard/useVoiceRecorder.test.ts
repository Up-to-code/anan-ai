import { describe, expect, it } from "vitest";
import {
  buildBarsFromFrequencyData,
  resolveVoiceActivityPhase,
  VOICE_SILENCE_AUTOSTOP_MS,
} from "./useVoiceRecorder";

describe("buildBarsFromFrequencyData", () => {
  it("returns zero bars when no frequency data exists", () => {
    const bars = buildBarsFromFrequencyData(new Uint8Array([]), 4);
    expect(bars).toEqual([0, 0, 0, 0]);
  });

  it("normalizes frequency buckets to the 0-1 range", () => {
    const bars = buildBarsFromFrequencyData(new Uint8Array([0, 128, 255, 255]), 2);
    expect(bars[0]).toBeGreaterThanOrEqual(0);
    expect(bars[0]).toBeLessThanOrEqual(1);
    expect(bars[1]).toBeGreaterThanOrEqual(0);
    expect(bars[1]).toBeLessThanOrEqual(1);
    expect(bars[1]).toBeGreaterThan(bars[0]);
  });

  it("waits for actual speech before starting silence countdown", () => {
    const phase = resolveVoiceActivityPhase({
      peakLevel: 0.02,
      hasDetectedSpeech: false,
      silenceStartedAt: null,
      now: 1_000,
    });

    expect(phase.phase).toBe("waiting_for_speech");
    expect(phase.shouldAutoStop).toBe(false);
  });

  it("auto-stops only after speech is followed by long enough silence", () => {
    const phase = resolveVoiceActivityPhase({
      peakLevel: 0.01,
      hasDetectedSpeech: true,
      silenceStartedAt: 1_000,
      now: 1_000 + VOICE_SILENCE_AUTOSTOP_MS + 10,
    });

    expect(phase.phase).toBe("silence_countdown");
    expect(phase.shouldAutoStop).toBe(true);
  });
});
