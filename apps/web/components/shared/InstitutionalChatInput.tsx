"use client";

import React from "react";
import { ArrowUp, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface InstitutionalChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  isSending?: boolean;
  placeholder?: string;
  layout?: "landing" | "thread";
}

/**
 * WHY:  The workspace assistant needs one composer that supports both the centered first-run prompt and the normal thread reply state.
 * WHAT: Renders a textarea-based composer with send/microphone actions and layout variants for landing and thread modes.
 * HOW:  Adjusts spacing, minimum height, and helper text based on the `layout` prop while keeping the same send behavior.
 */
export default function InstitutionalChatInput({
  value,
  onChange,
  onSend,
  isSending,
  placeholder = "اسأل أنان، أو ابدأ بإنشاء عرض، أو ابحث في مشاريعك...",
  layout = "thread",
}: InstitutionalChatInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const isLanding = layout === "landing";

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 240)}px`;
    }
  }, [value]);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden border bg-white transition-colors duration-150 focus-within:border-slate-400",
        isLanding ? "border-stone-300" : "border-stone-200",
      )}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        placeholder={placeholder}
        className={cn(
          "w-full resize-none border-none bg-transparent text-slate-900 outline-none placeholder:text-slate-400",
          isLanding ? "px-8 py-8 text-lg font-semibold" : "px-5 py-4 text-base font-medium",
        )}
        rows={1}
        style={{ minHeight: isLanding ? "132px" : "64px" }}
        dir="rtl"
      />

      <div
        className={cn(
          "flex items-center justify-between border-t px-4 py-3",
          isLanding ? "border-stone-200 bg-stone-50" : "border-stone-100 bg-white",
        )}
      >
        <div className="text-xs text-slate-500">اضغط Enter للإرسال و Shift + Enter لسطر جديد</div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center border border-stone-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700"
          >
            <Mic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onSend()}
            disabled={!value.trim() || isSending}
            className={cn(
              "flex h-10 w-10 items-center justify-center transition-colors",
              value.trim() && !isSending
                ? "bg-slate-950 text-white hover:bg-slate-800"
                : "cursor-not-allowed bg-stone-100 text-stone-400"
            )}
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
