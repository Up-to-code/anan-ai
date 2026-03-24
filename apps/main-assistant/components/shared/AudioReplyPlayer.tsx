"use client";

import { LoaderCircle, Pause, Play, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type AudioReplyPlayerProps = {
  audioUrl?: string;
  fallbackText?: string;
  isLoading?: boolean;
  autoplayKey?: string;
  stopKey?: string;
  hidden?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onAutoplayBlocked?: () => void;
  onUnavailable?: (reason?: string) => void;
};

function canUseSpeechSynthesis() {
  return (
    typeof window !== "undefined" &&
    typeof window.speechSynthesis !== "undefined" &&
    typeof SpeechSynthesisUtterance !== "undefined"
  );
}

function resolveSpeechLang(text: string) {
  return /[\u0600-\u06FF]/.test(text) ? "ar-SA" : "en-US";
}

/**
 * WHY:   Spoken replies are a core part of the dedicated assistant experience.
 * WHAT:  Renders a compact playback control while also supporting invisible autoplay for voice-first flows.
 * HOW:   Prefers server-provided audio, then falls back to browser speech synthesis when only text is available.
 */
export default function AudioReplyPlayer({
  audioUrl,
  fallbackText,
  isLoading = false,
  autoplayKey,
  stopKey,
  hidden = false,
  onPlay,
  onPause,
  onEnded,
  onAutoplayBlocked,
  onUnavailable,
}: AudioReplyPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fallbackTextRef = useRef(fallbackText);
  const onPlayRef = useRef(onPlay);
  const onPauseRef = useRef(onPause);
  const onEndedRef = useRef(onEnded);
  const onAutoplayBlockedRef = useRef(onAutoplayBlocked);
  const onUnavailableRef = useRef(onUnavailable);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  useEffect(() => {
    fallbackTextRef.current = fallbackText;
    onPlayRef.current = onPlay;
    onPauseRef.current = onPause;
    onEndedRef.current = onEnded;
    onAutoplayBlockedRef.current = onAutoplayBlocked;
    onUnavailableRef.current = onUnavailable;
  }, [fallbackText, onAutoplayBlocked, onEnded, onPause, onPlay, onUnavailable]);

  useEffect(() => {
    if (!stopKey) return;

    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setIsPlaying(false);
    setAutoplayBlocked(false);
    onPauseRef.current?.();
  }, [stopKey]);

  useEffect(() => {
    setIsPlaying(false);
    setAutoplayBlocked(false);

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      const handleEnded = () => {
        setIsPlaying(false);
        onEndedRef.current?.();
      };

      const handlePause = () => {
        setIsPlaying(false);
        onPauseRef.current?.();
      };

      const handlePlay = () => {
        setIsPlaying(true);
        onPlayRef.current?.();
      };

      audio.addEventListener("ended", handleEnded);
      audio.addEventListener("pause", handlePause);
      audio.addEventListener("play", handlePlay);

      if (autoplayKey) {
        void audio.play().catch(() => {
          setAutoplayBlocked(true);
          onAutoplayBlockedRef.current?.();
        });
      }

      return () => {
        audio.removeEventListener("ended", handleEnded);
        audio.removeEventListener("pause", handlePause);
        audio.removeEventListener("play", handlePlay);
        audio.pause();
        audioRef.current = null;
      };
    }

    const nextFallbackText = fallbackText?.trim();
    if (!nextFallbackText) {
      audioRef.current = null;
      return;
    }

    if (!canUseSpeechSynthesis()) {
      if (autoplayKey) {
        setAutoplayBlocked(true);
        onUnavailableRef.current?.("Voice playback is unavailable in this browser.");
      }
      return;
    }

    const utterance = new SpeechSynthesisUtterance(nextFallbackText);
    utterance.lang = resolveSpeechLang(nextFallbackText);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => {
      setIsPlaying(true);
      onPlayRef.current?.();
    };
    utterance.onend = () => {
      setIsPlaying(false);
      onEndedRef.current?.();
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      onUnavailableRef.current?.("Voice playback could not start.");
    };

    if (autoplayKey) {
      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      } catch {
        setAutoplayBlocked(true);
        onUnavailableRef.current?.("Voice playback is unavailable in this browser.");
      }
    }

    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      audioRef.current = null;
    };
  }, [audioUrl, autoplayKey, fallbackText]);

  const handleToggle = async () => {
    const audio = audioRef.current;
    if (audio) {
      if (audio.paused) {
        try {
          await audio.play();
          setAutoplayBlocked(false);
        } catch {
          setAutoplayBlocked(true);
          onAutoplayBlockedRef.current?.();
        }
        return;
      }

      audio.pause();
      return;
    }

    const nextFallbackText = fallbackTextRef.current?.trim();
    if (!nextFallbackText) return;
    if (!canUseSpeechSynthesis()) {
      setAutoplayBlocked(true);
      onUnavailableRef.current?.("Voice playback is unavailable in this browser.");
      return;
    }

    const synthesis = window.speechSynthesis;
    if (isPlaying || synthesis.speaking) {
      synthesis.cancel();
      setIsPlaying(false);
      onPauseRef.current?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(nextFallbackText);
    utterance.lang = resolveSpeechLang(nextFallbackText);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => {
      setIsPlaying(true);
      onPlayRef.current?.();
    };
    utterance.onend = () => {
      setIsPlaying(false);
      onEndedRef.current?.();
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      onUnavailableRef.current?.("Voice playback could not start.");
    };

    synthesis.cancel();
    synthesis.speak(utterance);
    setAutoplayBlocked(false);
  };

  if (hidden) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 rounded-full border border-stone-200 bg-white/90 px-3 py-2 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
      <button
        type="button"
        onClick={() => void handleToggle()}
        disabled={!audioUrl && !fallbackText && !isLoading}
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-full border transition",
          isPlaying
            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
            : "border-stone-200 bg-white text-stone-700 hover:border-stone-300",
        )}
      >
        {isLoading ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </button>

      <div className="min-w-0">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
          <Volume2 className="h-3.5 w-3.5" />
          <span>Voice Reply</span>
        </div>
        <p className="mt-1 text-sm text-stone-700">
          {isLoading
            ? "جارٍ تجهيز النسخة الصوتية..."
            : autoplayBlocked
              ? "تم تجهيز الصوت. اضغط للتشغيل."
              : audioUrl || fallbackText
                ? "الرد الصوتي جاهز."
                : "سيظهر الصوت هنا بعد الرد."}
        </p>
      </div>
    </div>
  );
}
