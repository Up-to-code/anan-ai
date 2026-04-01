"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { ArrowUp, Mic, Search, Sparkles, Loader2, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";

interface InstitutionalChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  isSending?: boolean;
  placeholder?: string;
  onMicToggle?: () => void;
  isMicRecording?: boolean;
  isMicProcessing?: boolean;
  micLevels?: number[];
}

function MicMeter({ levels }: { levels: number[] }) {
  if (levels.length === 0) return null;
  return (
    <div className="flex items-center gap-[2px] h-4">
      {levels.slice(-10).map((level, index) => (
        <motion.span
          key={index}
          initial={{ height: 2 }}
          animate={{ height: Math.max(2, Math.round(level * 14)) }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-[2px] rounded-full bg-red-500"
        />
      ))}
    </div>
  );
}

export default function InstitutionalChatInput({
  value,
  onChange,
  onSend,
  isSending = false,
  placeholder,
  onMicToggle,
  isMicRecording = false,
  isMicProcessing = false,
  micLevels = [],
}: InstitutionalChatInputProps) {
  const { dictionary, direction, isRtl } = useWebLocale();
  const isBusy = isSending || isMicProcessing;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
      if (textarea.scrollHeight > 200) {
        textarea.style.overflowY = "auto";
      } else {
        textarea.style.overflowY = "hidden";
      }
    }
  }, [value]);

  const handleSubmit = useCallback(() => {
    const trimmedText = value.trim();
    if (!trimmedText || isBusy) return;
    try {
      onSend();
      onChange("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      // Intentionally empty, handled by parent
    }
  }, [value, isBusy, onSend, onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const isTyping = value.trim().length > 0;

  return (
    <div className="w-full" data-slot="institutional-chat-input-nexus">
      <div
        className={cn(
          "mx-auto flex w-full flex-col overflow-hidden rounded-[32px] transition-all duration-500",
          "bg-white/40 backdrop-blur-3xl border border-white/40 shadow-[0_4px_20px_rgba(0,0,0,0.03)]",
          "dark:bg-white/[0.03] dark:border-white/[0.08] dark:shadow-none",
          "focus-within:bg-white/60 dark:focus-within:bg-white/[0.06] focus-within:border-white/60 dark:focus-within:border-white/20 focus-within:shadow-2xl focus-within:shadow-black/[0.02]"
        )}
      >
        <div className="flex w-full flex-col items-start px-6 pt-4">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isBusy}
            placeholder={placeholder ?? dictionary.assistant.placeholderDefault}
            className={cn(
              "w-full resize-none border-0 bg-transparent p-0 py-2 pt-3 text-[15px] font-semibold leading-relaxed outline-none ring-0 appearance-none transition-colors",
              "text-slate-900 placeholder:text-slate-400/50",
              "dark:text-white dark:placeholder:text-white/20"
            )}
            style={{ minHeight: "48px", maxHeight: "200px" }}
            dir={direction}
            rows={1}
          />
        </div>

        <div className="flex items-center justify-between px-4 pb-4 pt-1" dir={direction}>
          <div className={cn("flex items-center gap-1.5", !isRtl && "order-2")}>
            <button
              type="button"
              className="flex h-10 items-center gap-2 rounded-full px-4 text-slate-500 transition-all hover:bg-slate-100/50 hover:text-slate-900 dark:text-white/40 dark:hover:bg-white/5 dark:hover:text-white font-bold text-[12px] uppercase tracking-wider"
            >
              <Paperclip className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{dictionary.assistant.attach}</span>
            </button>
            <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10 mx-1 hidden sm:block" />
            <button
              type="button"
              className="hidden sm:flex h-9 items-center gap-2 rounded-full px-3 text-slate-500 transition-colors hover:bg-slate-100/50 hover:text-slate-900 dark:text-white/40 dark:hover:bg-white/5 dark:hover:text-white font-black text-[10px] uppercase tracking-[0.15em]"
            >
              <Search className="h-3 w-3" />
              {dictionary.assistant.search}
            </button>
            <button
              type="button"
              className="hidden sm:flex h-9 items-center gap-2 rounded-full px-3 text-slate-500 transition-colors hover:bg-slate-100/50 hover:text-slate-900 dark:text-white/40 dark:hover:bg-white/5 dark:hover:text-white font-black text-[10px] uppercase tracking-[0.15em]"
            >
              <Sparkles className="h-3 w-3" />
              {dictionary.assistant.deepSearch}
            </button>
          </div>

          <div className={cn("flex items-center gap-2.5", !isRtl && "order-1")} dir="ltr">
            <AnimatePresence>
              {isMicRecording && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-3.5 px-4 py-1.5 rounded-full bg-red-50/50 dark:bg-red-500/10 border border-red-100/50 dark:border-red-500/10 mr-2"
                >
                  <button
                    type="button"
                    onClick={onMicToggle}
                    className="text-[10px] font-black uppercase tracking-[0.15em] text-red-600 dark:text-red-400"
                  >
                    {dictionary.assistant.stop}
                  </button>
                  <MicMeter levels={micLevels} />
                </motion.div>
              )}
            </AnimatePresence>

            {!isMicRecording && (
              <button
                type="button"
                onClick={onMicToggle}
                disabled={!onMicToggle || (isMicProcessing && !isMicRecording)}
                className="flex h-11 w-11 items-center justify-center rounded-full text-slate-400 transition-all duration-500 hover:bg-slate-100/50 hover:text-slate-900 dark:text-white/30 dark:hover:bg-white/5 dark:hover:text-white"
              >
                {isMicProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </button>
            )}

            <button
              onClick={handleSubmit}
              disabled={isBusy || !isTyping}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full transition-all duration-500 shadow-md",
                isTyping
                  ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950 scale-100 hover:scale-105 hover:shadow-xl"
                  : "bg-slate-200 text-slate-400 scale-95 opacity-50 dark:bg-white/5 dark:text-white/10"
              )}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-5 w-5 stroke-[2.5px]" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
