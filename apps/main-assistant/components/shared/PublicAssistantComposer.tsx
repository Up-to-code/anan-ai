"use client";

import { ArrowUp, Mic, RotateCcw, Square } from "lucide-react";
import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { cn } from "@/lib/utils";

type PublicAssistantComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isSending?: boolean;
  placeholder?: string;
  onMicToggle?: () => void;
  isMicRecording?: boolean;
  isMicProcessing?: boolean;
  micLevels?: number[];
  onReplayLast?: () => void;
  canReplayLast?: boolean;
};

function MicMeter({ active, levels }: { active: boolean; levels: number[] }) {
  if (!active || levels.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none flex items-end gap-0.5 rounded-full border border-amber-200 bg-white px-2 py-1">
      {levels.map((level, index) => (
        <span
          key={index}
          className="w-0.5 rounded-full bg-amber-500 transition-[height] duration-100"
          style={{ height: `${Math.max(4, Math.round(level * 18))}px` }}
        />
      ))}
    </div>
  );
}

/**
 * WHY:   The app needs one reusable composer that preserves the existing prompt-input interaction pattern.
 * WHAT:  Renders a compact AI-style composer with send, microphone, and replay actions.
 * HOW:   Uses local `PromptInput*` primitives so the public app stays self-contained while matching the shared pattern.
 */
export default function PublicAssistantComposer({
  value,
  onChange,
  onSend,
  isSending = false,
  placeholder = "اسأل عنان عن مشروع، منطقة، استثمار، أو تمويل...",
  onMicToggle,
  isMicRecording = false,
  isMicProcessing = false,
  micLevels = [],
  onReplayLast,
  canReplayLast = false,
}: PublicAssistantComposerProps) {
  const sendDisabled = !value.trim() || isSending || isMicProcessing;

  return (
    <div className="w-full">
      <PromptInput
        onSubmit={() => {
          if (!sendDisabled) {
            onSend();
          }
        }}
        className="border border-stone-200 bg-white shadow-[0_8px_20px_rgba(15,23,42,0.05)]"
      >
        <PromptInputBody>
          <PromptInputTextarea
            value={value}
            onChange={(event) => onChange(event.currentTarget.value)}
            disabled={isMicProcessing}
            placeholder={placeholder}
            className="px-4 pt-4 text-stone-900 placeholder:text-stone-400"
            dir="rtl"
          />
        </PromptInputBody>

        <PromptInputFooter className="border-t border-stone-100 bg-stone-50/90">
          <div className="flex items-center gap-2 text-[11px] font-medium text-stone-500">
            <MicMeter active={isMicRecording} levels={micLevels} />
            <span>Enter للإرسال و Shift + Enter لسطر جديد</span>
          </div>

          <PromptInputTools>
            {canReplayLast ? (
              <PromptInputButton
                onClick={onReplayLast}
                className="border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:text-stone-900"
              >
                <RotateCcw className="h-4 w-4" />
              </PromptInputButton>
            ) : null}

            <PromptInputButton
              onClick={onMicToggle}
              disabled={!onMicToggle || (isMicProcessing && !isMicRecording)}
              className={cn(
                isMicRecording
                  ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
                  : "border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:text-stone-900",
              )}
            >
              {isMicRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </PromptInputButton>

            <PromptInputButton
              type="submit"
              disabled={sendDisabled}
              className={cn(
                sendDisabled
                  ? "border-stone-200 bg-stone-100 text-stone-400"
                  : "border-stone-900 bg-stone-950 text-white hover:bg-stone-800",
              )}
            >
              <ArrowUp className="h-4 w-4" />
            </PromptInputButton>
          </PromptInputTools>
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
