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
  const [menuOpen, setMenuOpen] = React.useState(false);

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
            "w-full mx-auto cursor-text overflow-clip bg-clip-padding p-2.5 shadow-lg border border-slate-200 transition-[border-radius] duration-200 ease-out",
            isLanding ? "bg-white dark:bg-slate-900/50" : "bg-white dark:bg-slate-900/50",
            isExpanded
              ? "rounded-3xl grid [grid-template-columns:1fr] [grid-template-rows:auto_1fr_auto] [grid-template-areas:'header'_'primary'_'footer']"
              : "rounded-3xl grid [grid-template-columns:auto_1fr_auto] [grid-template-rows:auto_1fr_auto] [grid-template-areas:'header_header_header'_'leading_primary_trailing'_'._footer_.']",
          )}
        >
          {/* ── Primary: Textarea ─────────────────────────────── */}
          <div
            className={cn(
              "flex min-h-14 items-center overflow-x-hidden px-1.5",
              isExpanded ? "px-2 py-1 mb-0" : "-my-2.5",
            )}
            style={{ gridArea: "primary" }}
          >
            <div className="flex-1 overflow-auto max-h-52">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={Boolean(isMicProcessing)}
                placeholder={placeholder}
                dir="rtl"
                className="min-h-0 w-full resize-none rounded-none border-0 bg-transparent p-0 text-[15px] font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0 scrollbar-thin leading-relaxed"
                rows={1}
              />
            </div>
          </div>

          {/* ── Leading: Plus / Menu Button ────────────────────── */}
          <div
            className={cn("flex", { hidden: isExpanded })}
            style={{ gridArea: "leading" }}
          >
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <Plus className="h-5 w-5" />
              </button>

              {menuOpen && (
                <div className="absolute bottom-full left-0 mb-2 z-50 min-w-[200px] rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl" dir="rtl">
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Paperclip className="h-4 w-4 opacity-60" />
                    إرفاق ملفات وصور
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Sparkles className="h-4 w-4 opacity-60" />
                    وضع المساعد الذكي
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Search className="h-4 w-4 opacity-60" />
                    بحث عميق
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Trailing: Action Buttons ───────────────────────── */}
          <div
            className="flex items-center gap-1.5"
            style={{ gridArea: isExpanded ? "footer" : "trailing" }}
          >
            <div className="ms-auto flex items-center gap-1">
              {canRegenerate && !isSending ? (
                <button
                  type="button"
                  onClick={onRegenerate}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
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
                    "flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600",
                    isMicRecording && "text-red-600 bg-red-50 hover:bg-red-100",
                  )}
                >
                  {isMicRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              </div>

              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <AudioLines className="h-4 w-4" />
              </button>

              {isSending ? (
                <button
                  type="button"
                  onClick={onStopGenerating}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm transition-transform hover:scale-105"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                </button>
              ) : value.trim() ? (
                <button
                  type="submit"
                  disabled={sendDisabled}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full transition-all",
                    sendDisabled
                      ? "cursor-not-allowed bg-slate-100 text-slate-300"
                      : "bg-slate-900 text-white shadow-sm hover:scale-105 active:scale-95",
                  )}
                >
                  <ArrowUp className="h-4 w-4" />
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
