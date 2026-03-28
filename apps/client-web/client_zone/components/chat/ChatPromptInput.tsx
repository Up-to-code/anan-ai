"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Mic, Square } from "lucide-react";
import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import { Textarea } from "@/client_zone/components/ui/textarea";

function useMobileViewportOffset() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) {
      return;
    }

    const updateOffset = () => {
      const viewport = window.visualViewport;
      if (!viewport) {
        setOffset(0);
        return;
      }
      const keyboardInset = Math.max(window.innerHeight - viewport.height - viewport.offsetTop, 0);
      setOffset(keyboardInset);
    };

    updateOffset();
    window.visualViewport.addEventListener("resize", updateOffset);
    window.visualViewport.addEventListener("scroll", updateOffset);

    return () => {
      window.visualViewport?.removeEventListener("resize", updateOffset);
      window.visualViewport?.removeEventListener("scroll", updateOffset);
    };
  }, []);

  return offset;
}

/**
 * WHY:   The main interaction surface is now the chat composer fixed at the bottom of the thread.
 * WHAT:  Renders the sticky prompt input and submit action.
 * HOW:   Uses a compact card wrapper and a single textarea/button pair in a ChatGPT-like arrangement.
 */
export function ChatPromptInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  className,
  dockRef,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  className?: string;
  dockRef?: React.MutableRefObject<HTMLDivElement | null>;
}) {
  const { dictionary, locale } = useLocaleDictionary();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const viewportOffset = useMobileViewportOffset();
  const [isRecording, setIsRecording] = useState(false);
  const isSubmitDisabled = disabled || !value.trim();

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 192)}px`;
  }, [value]);

  return (
    <div
      ref={dockRef}
      data-slot="chat-input"
      className={cn("pointer-events-none sticky bottom-0 z-30 shrink-0 px-4 pt-3 sm:px-6 lg:px-8", className)}
      style={{ paddingBottom: `calc(env(safe-area-inset-bottom) + 1.5rem + ${viewportOffset}px)` }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[260px] bg-[linear-gradient(to_top,color-mix(in_srgb,var(--workspace-highlight)_22%,transparent)_0%,color-mix(in_srgb,var(--workspace-highlight)_10%,transparent)_35%,transparent_100%)]"
      />
      <div className="pointer-events-auto mx-auto w-full max-w-3xl">
        <div className="overflow-hidden rounded-[32px] border border-[color:color-mix(in_srgb,var(--workspace-border)_90%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-panel)_86%,white)] shadow-[0_28px_60px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
          <div className="px-5 pt-4 sm:px-6">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  if (isSubmitDisabled) {
                    return;
                  }
                  onSubmit();
                }
              }}
              aria-label={dictionary.app.composerPlaceholder}
              placeholder={dictionary.app.composerPlaceholder}
              rows={1}
              className="max-h-48 min-h-[56px] resize-none border-0 bg-transparent px-0 py-2 text-[15px] font-semibold leading-relaxed shadow-none focus-visible:ring-0"
            />
          </div>
          <div
            className="mt-2 flex items-center justify-between gap-3 border-t border-[color:color-mix(in_srgb,var(--workspace-border)_88%,transparent)] px-4 pb-4 pt-3 sm:px-5"
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            <span className="hidden text-[11px] font-black uppercase tracking-[0.18em] text-[var(--workspace-muted)] sm:block">
              {dictionary.app.composerHint}
            </span>
            <div className="ms-auto flex shrink-0 items-center gap-2" dir="ltr">
              <div className="relative">
                {isRecording ? (
                  <span className="absolute inset-0 rounded-full border border-red-300 animate-ping" />
                ) : null}
                <button
                  type="button"
                  className="relative flex h-11 w-11 items-center justify-center rounded-full border border-transparent text-[var(--workspace-muted)] transition hover:border-[color:var(--workspace-border)] hover:bg-[var(--workspace-panel)] hover:text-[var(--workspace-bubble-other-foreground)]"
                  onClick={() => setIsRecording((current) => !current)}
                  aria-label={isRecording ? "Stop microphone" : "Start microphone"}
                >
                  {isRecording ? (
                    <Square className="h-4 w-4 text-red-600" />
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                </button>
              </div>
              <button
                onClick={onSubmit}
                disabled={isSubmitDisabled}
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full text-white shadow-md transition-all",
                  isSubmitDisabled
                    ? "bg-slate-300 opacity-60"
                    : "bg-slate-950 hover:bg-[var(--workspace-highlight-strong)]",
                )}
                aria-label={dictionary.app.send}
              >
                <ArrowUp className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
