"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2, Mic, Square } from "lucide-react";
import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import { Textarea } from "@/client_zone/components/ui/textarea";

type VoiceProcessingPhase =
  | "idle"
  | "waiting_for_permission"
  | "recording"
  | "uploading"
  | "transcribing"
  | "sending"
  | "error";

type VoicePermissionState = "unknown" | "unsupported" | "prompt" | "granted" | "denied";

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
  voicePermissionState = "unknown",
  voiceProcessingPhase = "idle",
  voiceElapsedMs = 0,
  voiceLevels = [],
  voiceError = null,
  isVoiceRecording = false,
  onStartVoiceRecording,
  onStopVoiceRecording,
  onCancelVoiceRecording,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  className?: string;
  dockRef?: React.MutableRefObject<HTMLDivElement | null>;
  voicePermissionState?: VoicePermissionState;
  voiceProcessingPhase?: VoiceProcessingPhase;
  voiceElapsedMs?: number;
  voiceLevels?: number[];
  voiceError?: string | null;
  isVoiceRecording?: boolean;
  onStartVoiceRecording?: () => void;
  onStopVoiceRecording?: () => void;
  onCancelVoiceRecording?: () => void;
}) {
  const { dictionary, locale } = useLocaleDictionary();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const viewportOffset = useMobileViewportOffset();
  const isSubmitDisabled = disabled || !value.trim();
  const isVoiceBusy = voiceProcessingPhase !== "idle" && voiceProcessingPhase !== "error";
  const showVoicePanel = voiceProcessingPhase !== "idle" || voiceError;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 192)}px`;
  }, [value]);

  const voiceStatusLabel =
    voiceProcessingPhase === "waiting_for_permission"
      ? locale === "ar"
        ? "نطلب إذن الميكروفون"
        : "Requesting microphone access"
      : voiceProcessingPhase === "recording"
        ? locale === "ar"
          ? "جاري التسجيل"
          : "Recording"
        : voiceProcessingPhase === "uploading"
          ? locale === "ar"
            ? "نرفع التسجيل"
            : "Uploading audio"
          : voiceProcessingPhase === "transcribing"
            ? locale === "ar"
              ? "نحوّل الصوت إلى نص"
              : "Transcribing"
            : voiceProcessingPhase === "sending"
              ? locale === "ar"
                ? "نرسل الرسالة"
                : "Sending message"
              : voiceProcessingPhase === "error"
                ? locale === "ar"
                  ? "تعذر إكمال التسجيل"
                  : "Voice input failed"
                : null;

  const voiceActionLabel =
    voicePermissionState === "unsupported"
      ? locale === "ar"
        ? "غير مدعوم"
        : "Unsupported"
      : isVoiceRecording
        ? locale === "ar"
          ? "إيقاف"
          : "Stop"
        : locale === "ar"
          ? "صوت"
          : "Voice";

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
        <div className="overflow-hidden rounded-[32px] border border-[color:color-mix(in_srgb,var(--workspace-border)_88%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-panel)_92%,white)] shadow-[0_24px_56px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
          {showVoicePanel ? (
            <div className="border-b border-[color:color-mix(in_srgb,var(--workspace-border)_88%,transparent)] px-4 pt-4 sm:px-5">
              <div className="rounded-[24px] border border-[color:color-mix(in_srgb,var(--workspace-border)_82%,transparent)] bg-[var(--workspace-elevated)] px-4 py-4">
                <div className="flex items-start justify-between gap-3" dir={locale === "ar" ? "rtl" : "ltr"}>
                  <div className="min-w-0">
                    <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--workspace-muted)]">
                      {locale === "ar" ? "صوت" : "Voice"}
                    </div>
                    <div className="mt-2 text-sm font-black text-[var(--workspace-bubble-other-foreground)]">
                      {voiceStatusLabel}
                    </div>
                    {voiceError ? (
                      <div className="mt-2 text-sm font-medium text-red-500">{voiceError}</div>
                    ) : null}
                  </div>
                  <div className="shrink-0 text-sm font-black text-[var(--workspace-bubble-other-foreground)]" dir="ltr">
                    {formatVoiceElapsed(voiceElapsedMs)}
                  </div>
                </div>
                <div className="mt-4 flex h-10 items-end gap-1.5" dir="ltr">
                  {(voiceLevels.length > 0 ? voiceLevels : Array.from({ length: 12 }, () => 0.08)).map((level, index) => (
                    <span
                      key={index}
                      className="flex-1 rounded-full bg-[linear-gradient(to_top,var(--workspace-highlight),color-mix(in_srgb,var(--workspace-highlight)_35%,white))]"
                      style={{ minHeight: 8, height: `${Math.max(16, Math.round(level * 100))}%` }}
                    />
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between gap-3" dir={locale === "ar" ? "rtl" : "ltr"}>
                  <button
                    type="button"
                    onClick={onCancelVoiceRecording}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-[color:color-mix(in_srgb,var(--workspace-border)_82%,transparent)] px-4 text-xs font-black text-[var(--workspace-bubble-other-foreground)] transition hover:bg-[var(--workspace-panel)]"
                  >
                    {locale === "ar" ? "إلغاء" : "Cancel"}
                  </button>
                  {isVoiceRecording ? (
                    <button
                      type="button"
                      onClick={onStopVoiceRecording}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[var(--workspace-bubble-other-foreground)] px-4 text-xs font-black text-[var(--workspace-panel)] transition hover:opacity-90"
                    >
                      <Square className="h-3.5 w-3.5 fill-current" />
                      {locale === "ar" ? "إيقاف وإرسال" : "Stop and send"}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
          <div className="px-5 pt-4 sm:px-6">
            <Textarea
              data-testid="client-chat-input"
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
              className="max-h-48 min-h-[58px] resize-none border-0 bg-transparent px-0 py-2 text-[15px] font-semibold leading-relaxed shadow-none focus-visible:ring-0"
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
                {isVoiceRecording ? (
                  <span className="absolute inset-0 rounded-full border border-red-300 animate-ping" />
                ) : null}
                <button
                  type="button"
                  className={cn(
                    "relative flex h-11 w-11 items-center justify-center rounded-full border transition",
                    voicePermissionState === "unsupported"
                      ? "cursor-not-allowed border-[color:var(--workspace-border)] text-[var(--workspace-muted)] opacity-50"
                      : isVoiceRecording
                        ? "border-red-300 bg-red-50 text-red-600"
                        : "border-transparent text-[var(--workspace-muted)] hover:border-[color:var(--workspace-border)] hover:bg-[var(--workspace-panel)] hover:text-[var(--workspace-bubble-other-foreground)]",
                  )}
                  onClick={() => {
                    if (voicePermissionState === "unsupported") return;
                    if (isVoiceRecording) {
                      onStopVoiceRecording?.();
                      return;
                    }
                    onStartVoiceRecording?.();
                  }}
                  disabled={disabled || isVoiceBusy || voicePermissionState === "unsupported"}
                  aria-label={voiceActionLabel}
                >
                  {voiceProcessingPhase === "uploading" || voiceProcessingPhase === "transcribing" || voiceProcessingPhase === "sending" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isVoiceRecording ? (
                    <Square className="h-4 w-4 fill-current" />
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                </button>
              </div>
              <button
                data-testid="client-chat-send"
                onClick={onSubmit}
                disabled={isSubmitDisabled || isVoiceBusy}
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full text-white shadow-md transition-all",
                  isSubmitDisabled || isVoiceBusy
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

function formatVoiceElapsed(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
