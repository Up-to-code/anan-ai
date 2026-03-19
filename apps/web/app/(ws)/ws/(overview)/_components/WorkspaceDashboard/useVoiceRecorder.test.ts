import { describe, expect, it } from "vitest";
import { buildBarsFromFrequencyData } from "./useVoiceRecorder";

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
});
