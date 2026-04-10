import { ArrowUp, Loader2, Mic, X } from "lucide-react-native";
import { Platform, Pressable, TextInput, View } from "react-native";
import React from "react";
import {
  MobilePromptInputRecordingRow,
  MobilePromptInputShell,
  MobilePromptInputStatus,
} from "@/components/ui/MobilePromptInput";
import { PropertyPromptCardsRail } from "@/features/BuyerAssistantHomeScreen/PropertyPromptCardsRail";
import { getMobileShadow } from "@/lib/mobileTheme";
import { useComposerState } from "@/hooks/useComposerState";
import type { MobileProperty } from "@/types/mobile";

type ConversationComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: (value: string) => void;
  onSubmitVoiceRecording: (fileUri: string) => Promise<void>;
  selectedProperties?: MobileProperty[];
  comparePicking?: boolean;
  maxCompareProperties?: number;
  onPressPromptProperty?: (property: MobileProperty) => void;
  onPressComparePrompt?: () => void;
  onRemoveSelectedProperty?: (propertyId: string) => void;
  onToggleComparePicking?: () => void;
  variant?: "landing" | "thread";
};

export function ConversationComposer({
  value,
  onChange,
  onSend,
  onSubmitVoiceRecording,
  selectedProperties = [],
  comparePicking = false,
  maxCompareProperties = 3,
  onPressPromptProperty,
  onPressComparePrompt,
  onRemoveSelectedProperty,
  onToggleComparePicking,
  variant = "thread",
}: ConversationComposerProps) {
  const {
    layout,
    theme,
    locale,
    voiceError,
    phase,
    durationSeconds,
    waveAnims,
    isRecordingSession,
    isVoiceBusy,
    hasText,
    isTyping,
    trimmedValue,
    canSend,
    textAlign,
    writingDirection,
    actionButtonSize,
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

  const isExpanded = value.includes("\n") || trimmedValue.length > 48;

  const actionButtonSizeCalc = layout.isCompact ? 40 : 44;
  const sendIconSize = layout.isCompact ? 17 : 18;
  const micIconSize = layout.isCompact ? 18 : 20;
  const inputMaxHeightCalc = layout.isCompact ? 112 : 132;
  const inputFontSize = layout.isCompact ? 15 : 16;
  const inputPlaceholder =
    variant === "landing"
      ? locale === "en"
        ? "Ask about a property or request financing..."
        : "اسأل عن عقار أو اطلب تمويلاً..."
      : locale === "en"
        ? "Type your follow-up here..."
        : "اكتب متابعتك هنا...";

  const actionButtonBorderWidthCalc = canSend ? 0 : theme.isDark ? 1.5 : 0;
  const actionButtonBorderColorCalc = canSend ? "transparent" : theme.colors.composerActionRing;
  const inputPillHeightCalc = layout.isCompact ? 44 : 46;

  const showPropertyPromptRail =
    variant === "thread" &&
    selectedProperties.length > 0 &&
    onPressPromptProperty &&
    onRemoveSelectedProperty;

  return (
    <View className="w-full gap-2">
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

      {showPropertyPromptRail ? (
        <PropertyPromptCardsRail
          properties={selectedProperties}
          comparePicking={comparePicking}
          maxCompareProperties={maxCompareProperties}
          onPressProperty={onPressPromptProperty}
          onPressCompare={onPressComparePrompt}
          onRemoveProperty={onRemoveSelectedProperty}
          onToggleComparePicking={onToggleComparePicking}
        />
      ) : null}

      <MobilePromptInputShell
        active={isTyping || isRecordingSession || canSend}
        expanded={isExpanded}
        hint={null}
      >
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
                  minHeight: inputPillHeightCalc,
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
                  placeholder={inputPlaceholder}
                  placeholderTextColor={theme.colors.inkMuted}
                  cursorColor={theme.colors.primary}
                  textAlignVertical="center"
                  style={{
                    minHeight: layout.isCompact ? 36 : 38,
                    maxHeight: inputMaxHeightCalc,
                    textAlign,
                    writingDirection,
                    fontFamily: trimmedValue.length === 0 ? "Cairo_500Medium" : "Cairo_600SemiBold",
                    fontSize: inputFontSize,
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
                    borderRadius: actionButtonSizeCalc / 2,
                    width: actionButtonSizeCalc,
                    height: actionButtonSizeCalc,
                    backgroundColor: actionButtonColor,
                    borderWidth: actionButtonBorderWidthCalc,
                    borderColor: actionButtonBorderColorCalc,
                    ...getMobileShadow("float"),
                    opacity: isVoiceBusy ? 0.6 : 1,
                    transform: [{ scale: pressed ? 0.94 : 1 }],
                  })}
                >
                  {canSend ? (
                    <ArrowUp size={sendIconSize} color={actionIconColor} strokeWidth={2.35} />
                  ) : (
                    <Mic size={micIconSize} color={actionIconColor} strokeWidth={2.2} />
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