import { ArrowUp, Loader2, Mic, X } from "lucide-react-native";
import { Platform, Pressable, TextInput, View } from "react-native";
import React from "react";
import {
  MobilePromptInputRecordingRow,
  MobilePromptInputShell,
  MobilePromptInputStatus,
} from "@/components/ui/MobilePromptInput";
import { getMobileShadow } from "@/lib/mobileTheme";
import { useComposerState } from "@/hooks/useComposerState";

type ComposerDockProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: (value: string) => void;
  onSubmitVoiceRecording: (fileUri: string) => Promise<void>;
};

export function ComposerDock({ value, onChange, onSend, onSubmitVoiceRecording }: ComposerDockProps) {
  const {
    theme,
    locale,
    voiceError,
    setVoiceError,
    phase,
    durationSeconds,
    waveAnims,
    isRecordingSession,
    isVoiceBusy,
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
  } = useComposerState({ value, onChange, onSend, onSubmitVoiceRecording });

  return (
    <View className="w-full bg-transparent px-3 pb-2 gap-2.5">
      {voiceError ? (
        <MobilePromptInputStatus label={voiceError} tone="danger" icon={<X size={14} color={theme.colors.danger} />} />
      ) : null}

      {isVoiceBusy ? (
        <MobilePromptInputStatus
          label={
            phase === "waiting_for_permission"
              ? (locale === "en" ? "Waiting for microphone permission" : "ننتظر إذن الميكروفون")
              : phase === "uploading"
                ? (locale === "en" ? "Uploading recording" : "نرفع التسجيل")
                : phase === "transcribing"
                  ? (locale === "en" ? "Transcribing voice to text" : "نحوّل الصوت إلى نص")
                  : (locale === "en" ? "Sending message" : "نرسل الرسالة")
          }
          icon={<Loader2 size={14} color={theme.colors.primary} />}
        />
      ) : null}

      <MobilePromptInputShell active={isTyping || isRecordingSession} expanded={value.includes("\n") || trimmedValue.length > 48} style={{ minHeight: 56 }}>
        <View className="flex-row items-center gap-2.5">
          {isRecordingSession ? (
            <MobilePromptInputRecordingRow
              durationSeconds={durationSeconds}
              waveAnims={waveAnims}
              onCancel={() => {
                void cancelRecording();
              }}
              onStop={() => {
                void stopAndSubmit();
              }}
            />
          ) : (
            <>
              <View
                className="flex-1 justify-center"
                style={{
                  minHeight: inputPillHeight,
                  borderRadius: 22,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                  paddingHorizontal: 16,
                }}
              >
                <TextInput
                  value={value}
                  onChangeText={handleChangeText}
                  multiline
                  blurOnSubmit={false}
                  editable={!isVoiceBusy}
                  placeholder={locale === "en" ? "Message the Anan assistant..." : "رسالة مساعد عنان..."}
                  placeholderTextColor={theme.colors.inkMuted}
                  cursorColor={theme.colors.primary}
                  textAlignVertical="center"
                  style={{
                    minHeight: 36,
                    maxHeight: inputMaxHeight,
                    textAlign,
                    writingDirection,
                    fontFamily: trimmedValue.length === 0 ? "Cairo_500Medium" : "Cairo_600SemiBold",
                    fontSize: inputFontSize + 1,
                    color: theme.colors.ink,
                    paddingVertical: Platform.OS === "ios" ? 6 : 5,
                    includeFontPadding: false,
                    backgroundColor: "transparent",
                  }}
                />
              </View>

              <View
                className="items-center justify-center rounded-full"
                style={{
                  width: actionHolderSize,
                  height: actionHolderSize,
                  backgroundColor: theme.colors.composerActionBackdrop,
                }}
              >
                <Pressable
                  onPress={handlePrimaryActionPress}
                  disabled={isVoiceBusy}
                  className="items-center justify-center"
                  style={({ pressed }) => ({
                    width: actionButtonSize,
                    height: actionButtonSize,
                    borderRadius: 999,
                    backgroundColor: actionButtonColor,
                    borderWidth: actionButtonBorderWidth,
                    borderColor: actionButtonBorderColor,
                    ...getMobileShadow("float"),
                    opacity: isVoiceBusy ? 0.6 : 1,
                    transform: [{ scale: pressed ? 0.92 : 1 }],
                  })}
                >
                  {canSend ? (
                    <ArrowUp size={18} color={actionIconColor} strokeWidth={2.35} />
                  ) : (
                    <Mic size={18} color={actionIconColor} strokeWidth={2.2} />
                  )}
                </Pressable>
              </View>
            </>
          )}
        </View>
      </MobilePromptInputShell>
    </View>
  );
}