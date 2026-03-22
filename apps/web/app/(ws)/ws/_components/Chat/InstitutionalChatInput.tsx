"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowUp, Mic, RotateCcw, Square } from "lucide-react";
import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputTextarea,
  PromptInputTools,
} from "@/app/(ws)/ws/_components/ai-elements/prompt-input";
import { cn } from "@/lib/utils";

interface InstitutionalChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  isSending?: boolean;
  placeholder?: string;
  layout?: "landing" | "thread";
  onMicToggle?: () => void;
  isMicRecording?: boolean;
  isMicProcessing?: boolean;
  micLevels?: number[];
  onStopGenerating?: () => void;
  onRegenerate?: () => void;
  canRegenerate?: boolean;
}

function MicPulseRings({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <>
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          className="pointer-events-none absolute inset-0 rounded-full border border-red-300"
          initial={{ opacity: 0.65, scale: 0.7 }}
          animate={{ opacity: 0, scale: 1.45 }}
          transition={{
            duration: 1.2,
            ease: "easeOut",
            repeat: Infinity,
            delay: index * 0.25,
          }}
        />
      ))}
    </>
  );
}

/**
 * WHY:  The workspace assistant needs one composer built on the AI Elements prompt primitive while keeping server-driven send/voice behavior.
 * WHAT: Renders an AI Elements-based textarea composer with microphone action, animated recording state, and send action.
 * HOW:  Uses `PromptInput` for structure, delegates submit/mic actions to parent handlers, and keeps the microphone purely capture-only.
 */
export default function InstitutionalChatInput({
  value,
  onChange,
  onSend,
  isSending,
  placeholder = "اسأل عنان، أو ابدأ بإنشاء عرض، أو ابحث في مشاريعك...",
  layout = "thread",
  onMicToggle,
  isMicRecording = false,
  isMicProcessing = false,
  micLevels = [],
  onStopGenerating,
  onRegenerate,
  canRegenerate = false,
}: InstitutionalChatInputProps) {
  const isLanding = layout === "landing";
  const sendDisabled = !value.trim() || isSending || isMicProcessing;

  return (
    <div className="w-full" data-slot={`chat-input-shell-${layout}`}>
      <PromptInput
        onSubmit={() => {
          if (!sendDisabled) onSend();
        }}
        className={cn(
          "w-full overflow-hidden rounded-[8px] border border-slate-300 bg-white transition-colors duration-150 focus-within:border-slate-950 focus-within:ring-0",
        )}
      >
        <PromptInputBody>
          <PromptInputTextarea
            value={value}
            onChange={(event) => onChange(event.currentTarget.value)}
            disabled={Boolean(isMicProcessing)}
            placeholder={placeholder}
            className={cn(
              "w-full text-right text-slate-900 placeholder:text-slate-400",
              isLanding ? "px-4 py-4 text-[15px] font-medium" : "px-4 py-3 text-[15px] font-medium",
            )}
            rows={1}
            style={{ minHeight: isLanding ? "88px" : "72px" }}
            dir="rtl"
          />
        </PromptInputBody>

        <PromptInputFooter
          className={cn(
            "border-t border-slate-200 px-3 py-2.5",
            isLanding ? "bg-stone-50" : "bg-slate-50/60",
          )}
        >
          <div className="text-[11px] text-slate-400">
            {isSending ? "الرسالة قيد المتابعة" : "Enter للإرسال"}
          </div>

          <PromptInputTools className="gap-2">
            {canRegenerate && !isSending ? (
              <PromptInputButton
                type="button"
                onClick={onRegenerate}
                className="rounded-[8px] border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <RotateCcw className="h-4 w-4" />
              </PromptInputButton>
            ) : null}

            <div className="relative">
              <MicPulseRings active={isMicRecording} />
              <PromptInputButton
                type="button"
                onClick={onMicToggle}
                disabled={!onMicToggle || (isMicProcessing && !isMicRecording)}
                className={cn(
                  "relative rounded-[8px] border transition-colors",
                  isMicRecording
                    ? "border-red-300 bg-red-50 text-red-600 hover:bg-red-100"
                    : "border-slate-300 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800",
                )}
              >
                {isMicRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </PromptInputButton>
            </div>

            {isSending ? (
              <PromptInputButton
                type="button"
                onClick={onStopGenerating}
                className="rounded-[8px] bg-red-600 text-white hover:bg-red-500"
              >
                <Square className="h-4 w-4" />
              </PromptInputButton>
            ) : (
              <PromptInputButton
                type="submit"
                disabled={sendDisabled}
                className={cn(
                  sendDisabled
                    ? "cursor-not-allowed rounded-[8px] bg-slate-200 text-slate-400 hover:bg-slate-200"
                    : "rounded-[8px] bg-slate-950 text-white hover:bg-slate-800",
                )}
              >
                <ArrowUp className="h-4 w-4" />
              </PromptInputButton>
            )}
          </PromptInputTools>
        </PromptInputFooter>
      </PromptInput>

      {isMicRecording && micLevels.length > 0 ? (
        <div className="mt-2 flex items-center justify-end">
          <div className="pointer-events-none flex items-end gap-0.5 rounded-[8px] border border-red-200 bg-white px-2 py-1">
            {micLevels.map((level, index) => (
              <motion.span
                key={index}
                className="w-0.5 bg-red-500"
                animate={{ height: Math.max(2, Math.round(level * 18)) }}
                transition={{ duration: 0.12, ease: "easeOut" }}
                style={{ height: "2px" }}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
