"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Mic, Square } from "lucide-react";
import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import { Button } from "@/client_zone/components/ui/button";
import { Card } from "@/client_zone/components/ui/card";
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
  dockRef?: React.Ref<HTMLDivElement>;
}) {
  const { dictionary } = useLocaleDictionary();
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
      className={cn("sticky bottom-0 z-30 border-t border-slate-200 bg-white/96 px-4 pt-3 backdrop-blur", className)}
      style={{ paddingBottom: `calc(max(0.875rem, env(safe-area-inset-bottom)) + ${viewportOffset}px)` }}
    >
      <div className="mx-auto w-full max-w-[900px]">
        <Card className="rounded-2xl border-slate-200 p-2 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.24)]">
          <div className="px-2 pt-2">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  onSubmit();
                }
              }}
              aria-label={dictionary.app.composerPlaceholder}
              placeholder={dictionary.app.composerPlaceholder}
              rows={1}
              className="max-h-48 min-h-[64px] resize-none border-0 px-1 py-2 text-[15px] leading-7 shadow-none focus-visible:ring-0"
            />
          </div>
          <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-100 px-2 pb-2 pt-3">
            <span className="hidden text-xs text-slate-500 sm:block">{dictionary.app.composerHint}</span>
            <div className="ms-auto flex shrink-0 items-center gap-2">
              <div className="relative">
                {isRecording ? <span className="absolute inset-0 rounded-full border border-red-300 animate-ping" /> : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9 rounded-full"
                  onClick={() => setIsRecording((current) => !current)}
                  aria-label={isRecording ? "Stop microphone" : "Start microphone"}
                >
                  {isRecording ? <Square className="h-4 w-4 text-red-600" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                onClick={onSubmit}
                disabled={isSubmitDisabled}
                size="icon"
                className="h-10 w-10 rounded-full"
                aria-label={dictionary.app.send}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
