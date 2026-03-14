"use client";

import { AlertTriangle, Mic, MicOff, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

export type AgVoiceState = "idle" | "listening" | "thinking" | "streaming" | "error";

const stateLabel: Record<AgVoiceState, string> = {
  idle: "جاهز",
  listening: "يستمع",
  thinking: "يفكر",
  streaming: "يبث",
  error: "خطأ",
};

export default function AgVoiceControl({
  state,
  onToggle,
}: {
  state: AgVoiceState;
  onToggle?: () => void;
}) {
  const Icon = state === "error" ? AlertTriangle : state === "idle" ? Mic : state === "listening" ? Radio : MicOff;

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center overflow-hidden border transition",
        state === "error"
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : state === "idle"
            ? "border-slate-200 bg-white text-slate-700"
            : "border-blue-200 bg-blue-50 text-blue-700",
      )}
      aria-label={`الميكروفون: ${stateLabel[state]}`}
    >
      {(state === "listening" || state === "streaming") ? (
        <span className="absolute inset-0 animate-ping border border-blue-300 opacity-40" />
      ) : null}
      <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 items-end gap-[2px]">
        {[0.45, 0.8, 0.6].map((height, index) => (
          <span
            key={index}
            className={cn(
              "w-[3px] bg-current transition-all",
              state === "listening" || state === "streaming" || state === "thinking"
                ? "animate-pulse"
                : "opacity-40",
            )}
            style={{ height: `${height * 12}px`, animationDelay: `${index * 120}ms` }}
          />
        ))}
      </div>
      <Icon className="relative z-10 h-4 w-4" />
    </button>
  );
}
