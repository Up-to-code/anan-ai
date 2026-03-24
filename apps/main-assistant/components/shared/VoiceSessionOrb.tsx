"use client";

import { AlertCircle, LoaderCircle, Mic, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VoiceSessionState } from "@/hooks/useVoiceSession";

type VoiceSessionOrbProps = {
  state: VoiceSessionState;
  levels: number[];
  elapsedMs: number;
  detail?: string | null;
  disabled?: boolean;
  onPrimaryAction: () => void;
};

function resolveLabel(state: VoiceSessionState) {
  if (state === "listening") return "Listening";
  if (state === "capturing") return "Capturing";
  if (state === "processing") return "Processing";
  if (state === "speaking") return "Speaking";
  if (state === "error") return "Retry";
  return "Ready";
}

function resolveIcon(state: VoiceSessionState) {
  if (state === "processing") {
    return <LoaderCircle className="h-8 w-8 animate-spin" />;
  }
  if (state === "speaking") {
    return <Volume2 className="h-8 w-8" />;
  }
  if (state === "error") {
    return <AlertCircle className="h-8 w-8" />;
  }
  return <Mic className="h-8 w-8" />;
}

function formatElapsed(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function resolveTone(state: VoiceSessionState) {
  if (state === "error") {
    return {
      ring: "rgba(244, 63, 94, 0.4)",
      surface: "#32111a",
      border: "#7f1d1d",
      fill: "#fda4af",
      text: "text-rose-100",
      meter: "bg-rose-300",
    };
  }

  if (state === "speaking") {
    return {
      ring: "rgba(16, 185, 129, 0.36)",
      surface: "#10231d",
      border: "#1f4d3d",
      fill: "#a7f3d0",
      text: "text-emerald-50",
      meter: "bg-emerald-300",
    };
  }

  if (state === "processing") {
    return {
      ring: "rgba(148, 163, 184, 0.34)",
      surface: "#161f2c",
      border: "#334155",
      fill: "#e2e8f0",
      text: "text-slate-100",
      meter: "bg-slate-300",
    };
  }

  return {
    ring: "rgba(56, 189, 248, 0.32)",
    surface: "#111a26",
    border: "#274258",
    fill: "#dbeafe",
    text: "text-slate-50",
    meter: "bg-sky-300",
  };
}

function resolveTextDirection(text: string | null | undefined) {
  if (!text) return "ltr";
  return /[\u0600-\u06FF]/.test(text) ? "rtl" : "ltr";
}

/**
 * WHY:   The public voice assistant needs one centered, legible control instead of an offset decorative shell.
 * WHAT:  Renders a single orb with integrated status, mic activity, and the only primary action for the public assistant.
 * HOW:   Uses one outer session ring, one inner action surface, and restrained product styling so the UI stays clear on desktop and mobile Safari.
 */
export default function VoiceSessionOrb({
  state,
  levels,
  elapsedMs,
  detail = null,
  disabled = false,
  onPrimaryAction,
}: VoiceSessionOrbProps) {
  const label = resolveLabel(state);
  const tone = resolveTone(state);
  const isRecordingState = state === "listening" || state === "capturing";
  const meterLevels = isRecordingState ? levels : [0.16, 0.32, 0.48, 0.68, 0.48, 0.32, 0.16];
  const detailDirection = resolveTextDirection(detail);
  const labelDirection = resolveTextDirection(label);

  return (
    <div className="mx-auto flex items-center justify-center px-6">
      <div
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: "min(82vw, 26rem)",
          height: "min(82vw, 26rem)",
          minWidth: "18rem",
          minHeight: "18rem",
          border: `1px solid ${tone.border}`,
          boxShadow: `0 0 0 12px rgba(255,255,255,0.02), 0 0 0 1px ${tone.ring}`,
          backgroundColor: "#0c131d",
        }}
      >
        <div
          className={cn(
            "pointer-events-none absolute inset-3 rounded-full border transition-opacity duration-200",
            state === "capturing" || state === "speaking" ? "opacity-100" : "opacity-60",
          )}
          style={{ borderColor: tone.ring }}
        />

        {(state === "capturing" || state === "speaking") ? (
          <div
            className="pointer-events-none absolute inset-0 animate-pulse rounded-full"
            style={{ boxShadow: `0 0 0 1px ${tone.ring}` }}
          />
        ) : null}

        <button
          type="button"
          onClick={onPrimaryAction}
          disabled={disabled}
          className={cn(
            "relative flex h-[72%] w-[72%] flex-col items-center justify-center gap-4 rounded-full border px-8 text-center transition-colors duration-200",
            disabled ? "cursor-not-allowed text-slate-500" : tone.text,
          )}
          style={{
            backgroundColor: tone.surface,
            borderColor: tone.border,
          }}
          aria-label={detail ?? label}
        >
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full border"
            style={{
              borderColor: tone.ring,
              color: tone.fill,
              backgroundColor: "rgba(255,255,255,0.04)",
            }}
          >
            {resolveIcon(state)}
          </div>

          <div className="space-y-1" dir={detailDirection}>
            <p className="text-sm font-semibold" dir={labelDirection} style={{ unicodeBidi: "plaintext" }}>
              {label}
            </p>
            <p
              className="text-sm leading-6 text-slate-300"
              dir={detailDirection}
              style={{ unicodeBidi: "plaintext" }}
            >
              {detail ?? "Tap once and start speaking."}
            </p>
          </div>

          <div className="flex h-10 items-end gap-1" aria-hidden="true">
            {meterLevels.map((level, index) => (
              <span
                key={index}
                className={cn("w-1 rounded-full transition-[height,opacity] duration-150", tone.meter)}
                style={{
                  height: `${Math.max(8, Math.round(level * 36))}px`,
                  opacity: isRecordingState || state === "speaking" ? 1 : 0.72,
                }}
              />
            ))}
          </div>

          {isRecordingState ? (
            <span className="text-xs font-medium text-slate-400">
              {formatElapsed(elapsedMs)}
            </span>
          ) : null}
        </button>
      </div>
    </div>
  );
}
