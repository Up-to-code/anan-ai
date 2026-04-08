import { ArrowUp, Loader2, Mic, X } from "lucide-react-native";
import { Platform, Pressable, TextInput, View } from "react-native";
import { useState } from "react";
import {
  MobilePromptInputRecordingRow,
  MobilePromptInputShell,
  MobilePromptInputStatus,
} from "@/components/ui/MobilePromptInput";
import { PropertyPromptCardsRail } from "@/features/BuyerAssistantHomeScreen/PropertyPromptCardsRail";
import { useMobileLayout } from "@/lib/mobileLayout";
import { getMobileShadow, useAppTheme } from "@/lib/mobileTheme";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import type { MobileProperty } from "@/types/mobile";

type ConversationComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
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
  const layout = useMobileLayout();
  const theme = useAppTheme();
  const [voiceError, setVoiceError] = useState<string | null>(null);

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
        const message = error instanceof Error ? error.message : "تعذر إكمال التسجيل الصوتي.";
        setVoiceError(message);
        throw error;
      }
    },
  });

  const isRecording = phase === "recording";
  const isRecordingSession = isRecording;
  const isVoiceBusy =
    phase === "waiting_for_permission" || phase === "uploading" || phase === "transcribing" || phase === "sending";

  const trimmedValue = value.trim();
  const canSend = trimmedValue.length > 0 && !isRecording && !isVoiceBusy;
  const startsWithLatin = /^[A-Za-z0-9]/.test(trimmedValue);
  const textAlign = startsWithLatin ? "left" : "right";
  const writingDirection = startsWithLatin ? "ltr" : "rtl";

  const isExpanded = value.includes("\n") || trimmedValue.length > 48;
  const showLandingHint = variant === "landing" && trimmedValue.length === 0 && !isRecording && !isVoiceBusy;

  const actionButtonSize = layout.isCompact ? 40 : 44;
  const sendIconSize = layout.isCompact ? 17 : 18;
  const micIconSize = layout.isCompact ? 18 : 20;
  const inputMaxHeight = layout.isCompact ? 112 : 132;
  const inputFontSize = layout.isCompact ? 15 : 16;
  const inputPlaceholder =
    variant === "landing" ? "اسأل عن عقار، قارن، أو اطلب تمويلاً..." : "اكتب متابعتك هنا...";

  const actionButtonColor = canSend ? theme.colors.send : theme.colors.surface;
  const actionIconColor = canSend ? theme.colors.sendIcon : theme.colors.inkSoft;
  const actionButtonBorderWidth = canSend ? 0 : 1;
  const actionButtonBorderColor = canSend ? "transparent" : theme.colors.borderStrong;
  const inputPillHeight = layout.isCompact ? 42 : 44;
  const actionHolderSize = inputPillHeight;
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
              ? "ننتظر إذن الميكروفون"
              : phase === "uploading"
                ? "نرفع التسجيل"
                : phase === "transcribing"
                  ? "نحوّل الصوت إلى نص"
                  : "نرسل الرسالة"
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
        active={isRecordingSession || canSend}
        expanded={isExpanded}
        hint={showLandingHint ? "اكتب طلبك مباشرة." : null}
      >
        <View className="flex-row items-center gap-2">
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
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                  paddingHorizontal: 14,
                }}
              >
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  multiline
                  blurOnSubmit={false}
                  editable={!isVoiceBusy}
                  placeholder={inputPlaceholder}
                  placeholderTextColor={theme.colors.inkMuted}
                  cursorColor={theme.colors.primary}
                  textAlignVertical="center"
                  style={{
                    minHeight: layout.isCompact ? 34 : 36,
                    maxHeight: inputMaxHeight,
                    textAlign,
                    writingDirection,
                    fontFamily: trimmedValue.length === 0 ? "Cairo_500Medium" : "Cairo_600SemiBold",
                    fontSize: inputFontSize,
                    color: theme.colors.ink,
                    paddingVertical: Platform.OS === "ios" ? 5 : 4,
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
                  backgroundColor: "transparent",
                }}
              >
                <Pressable
                  onPress={() => {
                    if (canSend) {
                      onSend();
                      return;
                    }
                    setVoiceError(null);
                    void startRecording();
                  }}
                  disabled={isVoiceBusy}
                  className="items-center justify-center"
                  style={({ pressed }) => ({
                    borderRadius: actionButtonSize / 2,
                    width: actionButtonSize,
                    height: actionButtonSize,
                    backgroundColor: actionButtonColor,
                    borderWidth: actionButtonBorderWidth,
                    borderColor: actionButtonBorderColor,
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
