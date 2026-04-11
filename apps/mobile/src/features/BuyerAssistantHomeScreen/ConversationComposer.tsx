import { ArrowUp, Loader2, Mic, X } from "lucide-react-native";
import { Animated, Platform, Pressable, TextInput, View } from "react-native";
import React, { useEffect, useRef } from "react";
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
  isProcessing?: boolean;
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
  isProcessing = false,
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
  const showProcessingAction = isProcessing || phase === "sending";

  const showPropertyPromptRail =
    variant === "thread" &&
    selectedProperties.length > 0 &&
    onPressPromptProperty &&
    onRemoveSelectedProperty;
  const rowDirectionClassName = locale === "en" ? "flex-row" : "flex-row-reverse";

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
        active={isProcessing || isTyping || isRecordingSession || canSend}
        expanded={isExpanded}
        hint={null}
      >
        <View className={`${rowDirectionClassName} items-center gap-2.5`}>
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
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surfaceMuted,
                  paddingHorizontal: 16,
                  paddingTop: 4,
                  paddingBottom: 4,
                }}
              >
                <TextInput
                  value={value}
                  onChangeText={handleChangeText}
                  multiline
                  blurOnSubmit={false}
                  editable={!isVoiceBusy}
                  textAlign={textAlign}
                  placeholder={inputPlaceholder}
                  placeholderTextColor={theme.colors.inkMuted}
                  cursorColor={theme.colors.primary}
                  selectionColor={theme.colors.primary}
                  textAlignVertical="center"
                  scrollEnabled={isExpanded}
                  underlineColorAndroid="transparent"
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
                  disabled={isVoiceBusy || showProcessingAction}
                  hitSlop={10}
                  pressRetentionOffset={12}
                  className="items-center justify-center"
                  style={({ pressed }) => ({
                    borderRadius: actionButtonSizeCalc / 2,
                    width: actionButtonSizeCalc,
                    height: actionButtonSizeCalc,
                    backgroundColor: actionButtonColor,
                    borderWidth: actionButtonBorderWidthCalc,
                    borderColor: actionButtonBorderColorCalc,
                    ...getMobileShadow("float"),
                    opacity: isVoiceBusy || showProcessingAction ? 0.92 : 1,
                    transform: [{ scale: pressed ? 0.94 : 1 }],
                  })}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showProcessingAction
                      ? (locale === "en" ? "Processing response" : "نعالج الرد الآن")
                      : canSend
                        ? (locale === "en" ? "Send message" : "إرسال الرسالة")
                        : (locale === "en" ? "Start voice recording" : "بدء التسجيل الصوتي")
                  }
                >
                  {showProcessingAction ? (
                    <ProcessingActionIcon color={actionIconColor} compact={layout.isCompact} />
                  ) : canSend ? (
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

function ProcessingActionIcon({
  color,
  compact,
}: {
  color: string;
  compact: boolean;
}) {
  const pulse = useRef(new Animated.Value(0.86)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 620,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.86,
          duration: 620,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [pulse]);

  const squareSize = compact ? 11 : 12;

  return (
    <Animated.View
      style={{
        width: squareSize,
        height: squareSize,
        borderRadius: compact ? 3 : 4,
        backgroundColor: color,
        opacity: pulse,
        transform: [{ scale: pulse }],
      }}
    />
  );
}
