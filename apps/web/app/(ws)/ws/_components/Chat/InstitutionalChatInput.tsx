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
          "w-full overflow-hidden transition-all duration-300",
          isLanding
            ? "rounded-2xl border border-slate-200 bg-white shadow-[0_2px_24px_-4px_rgba(0,0,0,0.08)] focus-within:border-slate-300 focus-within:shadow-[0_4px_32px_-4px_rgba(0,0,0,0.12)]"
            : "rounded-2xl border border-slate-200 bg-white shadow-sm focus-within:border-slate-400 focus-within:shadow-[0_2px_16px_-4px_rgba(0,0,0,0.1)]",
        )}
      >
        <PromptInputBody>
          <PromptInputTextarea
            value={value}
            onChange={(event) => onChange(event.currentTarget.value)}
            disabled={Boolean(isMicProcessing)}
            placeholder={placeholder}
            className={cn(
              "w-full resize-none text-right text-slate-900 placeholder:text-slate-400 focus:outline-none",
              isLanding
                ? "px-6 pt-6 pb-4 text-base font-medium leading-relaxed"
                : "px-5 pt-5 pb-3 text-[15px] font-medium leading-relaxed",
            )}
            rows={1}
            style={{ minHeight: isLanding ? "100px" : "72px" }}
            dir="rtl"
          />
        </PromptInputBody>

        <PromptInputFooter
          className={cn(
            "flex items-center justify-between",
            isLanding ? "px-4 pb-4 pt-1" : "px-4 pb-3 pt-1",
          )}
        >
          <div className="text-[11px] font-medium text-slate-400">
            {isSending ? "الرسالة قيد المعالجة..." : "Enter للإرسال"}
          </div>

          <PromptInputTools className="gap-1.5">
            {canRegenerate && !isSending ? (
              <PromptInputButton
                type="button"
                onClick={onRegenerate}
                className="h-9 w-9 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition-all hover:border-slate-300 hover:bg-white hover:text-slate-900 hover:shadow-sm"
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
                  "relative h-9 w-9 rounded-xl border transition-all",
                  isMicRecording
                    ? "border-red-200 bg-red-50 text-red-600 shadow-sm shadow-red-100 hover:bg-red-100"
                    : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-white hover:text-slate-800 hover:shadow-sm",
                )}
              >
                {isMicRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </PromptInputButton>
            </div>

            {isSending ? (
              <PromptInputButton
                type="button"
                onClick={onStopGenerating}
                className="h-9 w-9 rounded-xl bg-red-600 text-white shadow-sm shadow-red-200 transition-all hover:bg-red-500 hover:shadow-md"
              >
                <Square className="h-4 w-4" />
              </PromptInputButton>
            ) : (
              <PromptInputButton
                type="submit"
                disabled={sendDisabled}
                className={cn(
                  "h-9 w-9 rounded-xl transition-all",
                  sendDisabled
                    ? "cursor-not-allowed bg-slate-100 text-slate-300"
                    : "bg-slate-900 text-white shadow-sm shadow-slate-300 hover:bg-slate-800 hover:shadow-md",
                )}
              >
                <ArrowUp className="h-4 w-4" />
              </PromptInputButton>
            )}
          </PromptInputTools>
        </PromptInputFooter>
      </PromptInput>

      {isMicRecording && micLevels.length > 0 ? (
        <div className="mt-3 flex items-center justify-end">
          <div className="pointer-events-none flex items-end gap-0.5 rounded-xl border border-red-200 bg-white px-3 py-1.5 shadow-sm">
            {micLevels.map((level, index) => (
              <motion.span
                key={index}
                className="w-0.5 rounded-full bg-red-500"
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

