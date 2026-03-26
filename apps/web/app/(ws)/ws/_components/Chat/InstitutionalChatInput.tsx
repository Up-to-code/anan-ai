"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowUp, Mic, RotateCcw, Square, Plus, Paperclip, Sparkles, Search, AudioLines } from "lucide-react";
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
 * WHY:  The workspace assistant needs one composer built on the blocks.so ai-01 design pattern.
 * WHAT: Renders a ChatGPT-style composer with adaptive grid layout, microphone action, and send action.
 * HOW:  Uses CSS grid for adaptive layout, delegates submit/mic actions to parent handlers.
 */
export default function InstitutionalChatInput({
  value,
  onChange,
  onSend,
  isSending,
  placeholder = "اسأل عنان عن السوق العقاري، أنشئ عرض سعر، أو تابع أداء فريقك...",
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isExpanded = value.length > 100 || value.includes("\n");

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${ta.scrollHeight}px`;
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sendDisabled) onSend();
    }
  };

  return (
    <div className="w-full" data-slot={`chat-input-shell-${layout}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!sendDisabled) onSend();
        }}
        className="group/composer w-full"
      >
        <div
          className={cn(
            "mx-auto flex w-full flex-col overflow-hidden bg-background shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-border/80 transition-all duration-300 ease-out dark:shadow-none",
            isExpanded ? "rounded-3xl p-3" : "rounded-[32px] p-2 hover:border-border"
          )}
        >
          {/* Text Area */}
          <div className={cn("flex w-full", isExpanded ? "min-h-[120px] px-3 pt-3" : "min-h-[44px] px-4 py-2.5")}>
            <div className="flex-1 overflow-auto max-h-52">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={Boolean(isMicProcessing)}
                placeholder={placeholder}
                dir="rtl"
                className="min-h-0 w-full resize-none border-0 bg-transparent p-0 text-[15px] font-medium leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 scrollbar-thin"
                rows={1}
              />
            </div>
          </div>

          {/* Action Ribbon */}
          <div className={cn("flex items-center justify-between", isExpanded ? "mt-4" : "")}>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="إرفاق ملفات"
              >
                <Plus className="h-5 w-5" />
              </button>
              
              <div className="hidden sm:flex items-center gap-1 border-r border-border/60 pr-1 mr-1">
                <button
                  type="button"
                  className="flex h-9 items-center gap-2 rounded-full px-3 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground font-bold text-[13px]"
                >
                  <Search className="h-4 w-4" />
                  بحث
                </button>
                <button
                  type="button"
                  className="flex h-9 items-center gap-2 rounded-full px-3 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground font-bold text-[13px]"
                >
                  <Sparkles className="h-4 w-4" />
                  بحث عميق
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {canRegenerate && !isSending ? (
                <button
                  type="button"
                  onClick={onRegenerate}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              ) : null}

              <div className="relative">
                <MicPulseRings active={isMicRecording} />
                <button
                  type="button"
                  onClick={onMicToggle}
                  disabled={!onMicToggle || (isMicProcessing && !isMicRecording)}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    isMicRecording && "text-destructive bg-destructive/10 hover:bg-destructive/20",
                  )}
                >
                  {isMicRecording ? <Square className="h-4 w-4" /> : <Mic className="h-5 w-5" />}
                </button>
              </div>

              {isSending ? (
                <button
                  type="button"
                  onClick={onStopGenerating}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-foreground text-background shadow-sm transition-transform hover:scale-105"
                >
                  <Square className="h-4 w-4 fill-current" />
                </button>
              ) : value.trim() ? (
                <button
                  type="submit"
                  disabled={sendDisabled}
                  className={cn(
                    "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-all",
                    sendDisabled
                      ? "bg-muted text-muted-foreground"
                      : "bg-foreground text-background shadow-sm hover:scale-105 active:scale-95",
                  )}
                >
                  <ArrowUp className="h-5 w-5" />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </form>

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
