import { useRef, useMemo, useCallback, useState, useEffect } from "react";
import { Animated, Keyboard } from "react-native";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { useMobileLayout } from "@/lib/mobileLayout";
import { useMobileLocale } from "@/lib/mobileLocale";
import { useAppTheme } from "@/lib/mobileTheme";

export interface UseComposerStateOptions {
  value: string;
  onChange: (value: string) => void;
  onSend: (value: string) => void;
  onSubmitVoiceRecording: (fileUri: string) => Promise<void>;
}

export interface UseComposerStateReturn {
  layout: ReturnType<typeof useMobileLayout>;
  theme: ReturnType<typeof useAppTheme>;
  locale: string;
  voiceError: string | null;
  setVoiceError: (error: string | null) => void;
  phase: string;
  durationSeconds: number;
  waveAnims: Animated.Value[];
  isRecording: boolean;
  isRecordingSession: boolean;
  isVoiceBusy: boolean;
  hasText: boolean;
  isTyping: boolean;
  trimmedValue: string;
  canSend: boolean;
  textAlign: "left" | "right";
  writingDirection: "ltr" | "rtl";
  actionButtonSize: number;
  inputFontSize: number;
  inputMaxHeight: number;
  actionButtonColor: string;
  actionIconColor: string;
  actionButtonBorderWidth: number;
  actionButtonBorderColor: string;
  inputPillHeight: number;
  actionHolderSize: number;
  handleChangeText: (nextValue: string) => void;
  handlePrimaryActionPress: () => void;
  cancelRecording: () => void;
  stopAndSubmit: () => void;
}

export function useComposerState({
  value,
  onChange,
  onSend,
  onSubmitVoiceRecording,
}: UseComposerStateOptions): UseComposerStateReturn {
  const layout = useMobileLayout();
  const theme = useAppTheme();
  const { locale } = useMobileLocale();

  const [voiceError, setVoiceError] = useState<string | null>(null);
  const latestValueRef = useRef(value);
  const [draftValue, setDraftValue] = useState(value);

  useEffect(() => {
    latestValueRef.current = value;
    setDraftValue(value);
  }, [value]);

  const {
    phase,
    durationSeconds,
    waveAnims,
    startRecording,
    stopAndSubmit,
    cancelRecording,
  } = useVoiceRecording({
    onStateChange: (nextPhase) => {
      if (nextPhase !== "error") {
        setVoiceError(null);
      }
    },
    onSubmitRecording: async (uri) => {
      try {
        await onSubmitVoiceRecording(uri);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : locale === "en"
              ? "Could not complete voice recording."
              : "تعذر إكمال التسجيل الصوتي.";
        setVoiceError(message);
        throw error;
      }
    },
  });

  const isRecording = phase === "recording";
  const isRecordingSession = isRecording;
  const isVoiceBusy =
    phase === "waiting_for_permission" ||
    phase === "uploading" ||
    phase === "transcribing" ||
    phase === "sending";

  const [hasText, setHasText] = useState(() => value.trim().length > 0);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const trimmed = draftValue.trim();
    const hasTextNow = trimmed.length > 0;
    
    if (hasTextNow) {
      setHasText(true);
      setIsTyping(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 800);
    } else {
      setHasText(false);
      setIsTyping(false);
    }
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [draftValue]);

  const trimmedValue = useMemo(() => draftValue.trim(), [draftValue]);
  const canSend = trimmedValue.length > 0 && !isRecording && !isVoiceBusy;
  const startsWithLatin = useMemo(
    () => /^[A-Za-z0-9]/.test(trimmedValue),
    [trimmedValue]
  );
  const textAlign = trimmedValue.length === 0 ? (locale === "en" ? "left" : "right") : startsWithLatin ? "left" : "right";
  const writingDirection = trimmedValue.length === 0 ? (locale === "en" ? "ltr" : "rtl") : startsWithLatin ? "ltr" : "rtl";

  const actionButtonSize = layout.isCompact ? 40 : 44;
  const inputFontSize = layout.isCompact ? 15 : 16;
  const inputMaxHeight = layout.isCompact ? 112 : 132;
  const actionButtonColor = canSend
    ? theme.colors.send
    : theme.colors.composerActionSurface;
  const actionIconColor = canSend
    ? theme.colors.sendIcon
    : theme.colors.composerActionIcon;
  const actionButtonBorderWidth = !canSend && theme.isDark ? 1.5 : 0;
  const actionButtonBorderColor = canSend
    ? "transparent"
    : theme.colors.composerActionRing;
  const inputPillHeight = layout.isCompact ? 44 : 48;
  const actionHolderSize = inputPillHeight;

  const handleChangeText = useCallback(
    (nextValue: string) => {
      latestValueRef.current = nextValue;
      setDraftValue(nextValue);
      onChange(nextValue);
    },
    [onChange]
  );

  const handlePrimaryActionPress = useCallback(() => {
    const nextValue = latestValueRef.current.trim();
    if (nextValue.length > 0 && !isRecording && !isVoiceBusy) {
      Keyboard.dismiss();
      onSend(nextValue);
      return;
    }
    setVoiceError(null);
    void startRecording();
  }, [isRecording, isVoiceBusy, onSend, startRecording]);

  return {
    layout,
    theme,
    locale,
    voiceError,
    setVoiceError,
    phase,
    durationSeconds,
    waveAnims,
    isRecording,
    isRecordingSession,
    isVoiceBusy,
    hasText,
    isTyping,
    trimmedValue,
    canSend,
    textAlign,
    writingDirection,
    actionButtonSize,
    inputFontSize,
    inputMaxHeight,
    actionButtonColor,
    actionIconColor,
    actionButtonBorderWidth,
    actionButtonBorderColor,
    inputPillHeight,
    actionHolderSize,
    handleChangeText,
    handlePrimaryActionPress,
    cancelRecording,
    stopAndSubmit,
  };
}
