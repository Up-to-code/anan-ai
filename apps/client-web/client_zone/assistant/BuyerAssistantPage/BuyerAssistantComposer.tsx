"use client";

import { ArrowUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * WHY:   The buyer app needs the same input quality as the workspace without the workspace-only controls.
 * WHAT:  Renders a text-only buyer composer derived from the workspace assistant input shell.
 * HOW:   Keeps the same rounded shell, spacing, focus behavior, and send affordance while stripping team and attachment concerns.
 */
export default function BuyerAssistantComposer({
  value,
  isSending,
  placeholder,
  onChange,
  onSend,
}: {
  value: string;
  isSending: boolean;
  placeholder: string;
  onChange: (value: string) => void;
  onSend: () => void;
}) {
  const isReady = value.trim().length > 0 && !isSending;

  return (
    <div className="w-full">
      <div className="relative w-full overflow-hidden rounded-[26px] border border-zinc-300/80 bg-zinc-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] transition-all duration-300 focus-within:border-slate-300 focus-within:shadow-xl focus-within:shadow-black/[0.03] dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-[0_20px_48px_rgba(0,0,0,0.28)] dark:focus-within:border-slate-500">
        <div className="flex flex-col justify-center">
          <textarea
            data-testid="client-chat-input"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSend();
              }
            }}
            disabled={isSending}
            placeholder={placeholder}
            className="min-h-[96px] w-full resize-none border-0 bg-transparent px-6 py-5 text-right text-[15px] font-medium leading-relaxed text-zinc-900 outline-none placeholder:text-zinc-500/80 dark:text-zinc-100 dark:placeholder:text-zinc-400/80"
          />
        </div>
        <div className="flex items-center justify-between border-t border-black/5 px-4 py-3 dark:border-white/5">
          <p className="text-[11px] font-bold text-[var(--workspace-muted)]">اكتب رسالة واضحة ومباشرة</p>
          <button
            type="button"
            data-testid="client-chat-send"
            onClick={onSend}
            disabled={!isReady}
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center rounded-full transition",
              isReady
                ? "bg-[var(--workspace-highlight)] text-white shadow-[0_10px_30px_rgba(37,99,235,0.28)] hover:brightness-110"
                : "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950",
            )}
            aria-label="Send message"
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
