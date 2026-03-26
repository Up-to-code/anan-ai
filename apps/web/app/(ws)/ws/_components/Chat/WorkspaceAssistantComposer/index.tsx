"use client";

import { useCallback, useMemo, useState } from "react";
import { ArrowUp, Loader2, Mic, RotateCcw } from "lucide-react";
import type { WorkspaceAudience } from "@/server/contracts/workspace";
import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputTextarea,
  PromptInputTools,
} from "@/app/(ws)/ws/_components/ai-elements/prompt-input";
import { cn } from "@/lib/utils";
import type { AnanProInputMode } from "@/server/contracts/ananPro";

const AUDIENCE_CONFIG = {
  developer: {
    title: "عنان - مساعد المطور العقاري",
    containerBg: "bg-gradient-to-r transition-all duration-500 from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10",
    textColor: "text-blue-800 dark:text-blue-400",
  },
  broker: {
    title: "عنان - مساعد الوسيط العقاري",
    containerBg: "bg-gradient-to-r transition-all duration-500 from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10",
    textColor: "text-blue-800 dark:text-blue-400",
  },
  default: {
    title: "عنان - المساعد الذكي",
    containerBg: "bg-gradient-to-r transition-all duration-500 from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10",
    textColor: "text-blue-800 dark:text-blue-400",
  }
};

type WorkspaceAssistantComposerProps = {
  audience: WorkspaceAudience;
  value: string;
  onChange: (val: string) => void;
  onSend: (message?: string, inputMode?: AnanProInputMode) => void;
  isSending?: boolean;
  onMicToggle?: () => void;
  isMicRecording?: boolean;
  isMicProcessing?: boolean;
  voiceProcessingPhase?: "idle" | "waiting_for_speech" | "recording" | "silence_countdown" | "uploading" | "transcribing" | "sending" | "error";
  micLevels?: number[];
  onStopGenerating?: () => void;
};

function resolvePlaceholder(audience: WorkspaceAudience) {
  if (audience === "developer") return "اسأل عن تحليل السوق، تجهيز عرض سعر، أو نشر مشروع جديد...";
  if (audience === "broker") return "اسأل عن تقييم عقار، مقارنة أداء الوسطاء، أو فرص السوق...";
  return "اسأل عنان عن العقارات، السوق، أو العروض...";
}

function ComposerMicMeter({ levels }: { levels: number[] }) {
  if (levels.length === 0) return null;
  return (
    <div className="pointer-events-none flex items-end gap-0.5 rounded-full border border-red-200 bg-white px-2 py-1 shadow-sm dark:border-red-500/30 dark:bg-slate-900 dark:shadow-none">
      {levels.map((level, index) => (
        <span
          key={index}
          className="w-0.5 rounded-full bg-red-500 transition-all duration-100"
          style={{ height: `${Math.max(3, Math.round(level * 18))}px` }}
        />
      ))}
    </div>
  );
}

/**
 * WHY:   The user requested a simplified "Nexus" chat input: Only Text and Mic.
 * WHAT:  Modernizes the Workspace assistant composer by removing attachments, regeneration, and complex tools.
 * HOW:   Uses a clean rounded-[40px] pill with an internal textarea and a single toggle for Mic/Send.
 */
export default function WorkspaceAssistantComposer({
  audience,
  value,
  onChange,
  onSend,
  isSending = false,
  onMicToggle,
  isMicRecording = false,
  isMicProcessing = false,
  voiceProcessingPhase = "idle",
  micLevels = [],
}: WorkspaceAssistantComposerProps) {
  const [localSendError, setLocalSendError] = useState<string | null>(null);
  const resolvedPlaceholder = resolvePlaceholder(audience);
  const isBusy = isSending || isMicProcessing;
  const isTyping = value.trim().length > 0;
  
  const config = AUDIENCE_CONFIG[audience as keyof typeof AUDIENCE_CONFIG] || AUDIENCE_CONFIG.default;

  const handleSubmit = useCallback(
    async (message: { text: string }) => {
      const trimmedText = message.text.trim();
      if (!trimmedText) return;
      setLocalSendError(null);
      try {
        onSend(trimmedText);
      } catch (error) {
        setLocalSendError(error instanceof Error ? error.message : "تعذر إرسال الرسالة.");
      }
    },
    [onSend],
  );

  return (
    <div className="w-full px-4 pb-[env(safe-area-inset-bottom)]" data-slot="chat-input-simplified">
      {localSendError ? (
        <div className="mb-4 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-right text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300 shadow-sm animate-in fade-in slide-in-from-bottom-2">
          {localSendError}
        </div>
      ) : null}

      <div className={cn("flex flex-col rounded-[32px] p-[6px] transition-all duration-500 shadow-sm", config.containerBg)}>
        <div className="flex flex-row-reverse items-center justify-between px-5 pb-1.5 pt-3 text-[13px]">
           <span className={cn("font-bold tracking-tight", config.textColor)}>{config.title}</span>
        </div>

        <PromptInput
          onSubmit={handleSubmit}
          className="relative w-full overflow-hidden rounded-[26px] bg-white/90 p-2 transition-all duration-300 dark:bg-black/40 !ring-0 !outline-none !shadow-none focus-within:!ring-0 focus-within:!border-transparent focus-within:!outline-none"
        >
        <PromptInputBody className="flex flex-1 flex-col">
          <PromptInputTextarea
            value={value}
            onChange={(event) => onChange(event.currentTarget.value)}
            disabled={isBusy}
            placeholder={resolvedPlaceholder}
            className="w-full resize-none border-0 bg-transparent px-8 py-5 text-right text-[17px] font-medium leading-[1.6] text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-0 dark:text-slate-100 dark:placeholder:text-slate-600"
            rows={1}
            style={{ minHeight: "64px", maxHeight: "240px" }}
            dir="rtl"
          />
        </PromptInputBody>

        <PromptInputFooter className="px-4 pb-4 pt-0 flex flex-row-reverse items-center justify-between">
          <PromptInputTools className="flex flex-row-reverse items-center gap-3">
            {/* Main Action Button (Send) */}
            <PromptInputButton
              type="submit"
              disabled={isBusy || !isTyping}
              aria-label="إرسال"
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full transition-all active:scale-90 disabled:opacity-20 disabled:grayscale",
                "bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900 shadow-md"
              )}
            >
              {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5 stroke-[3px]" />}
            </PromptInputButton>

            {isMicRecording && (
              <div className="flex flex-row-reverse items-center gap-3 pr-2">
                <ComposerMicMeter levels={micLevels} />
                <PromptInputButton
                  type="button"
                  onClick={onMicToggle}
                  className="flex h-11 items-center gap-2 rounded-full px-5 text-[13px] font-black uppercase tracking-widest text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <StopIcon className="h-3 w-3 fill-current" />
                  <span>إيقاف</span>
                </PromptInputButton>
              </div>
            )}
          </PromptInputTools>

          <PromptInputTools className="flex flex-row-reverse items-center gap-2 pr-2">
            {/* Mic Toggle Button */}
            {!isMicRecording && (
              <PromptInputButton
                type="button"
                onClick={onMicToggle}
                disabled={!onMicToggle || isBusy}
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full transition-all hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900",
                  isMicProcessing && "animate-pulse text-primary"
                )}
                title="تسجيل صوتي"
              >
                {isMicProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mic className="h-6 w-6" />}
              </PromptInputButton>
            )}

            {/* Status indicator for processing */}
            {isBusy && !isSending && !isMicRecording && (
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 animate-pulse">
                Processing...
              </div>
            )}
          </PromptInputTools>
        </PromptInputFooter>
      </PromptInput>

      </div>
    </div>
  );
}

function StopIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} width="12" height="12" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}
