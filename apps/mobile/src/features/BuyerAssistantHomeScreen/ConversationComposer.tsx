import { ArrowUp, Mic } from "lucide-react-native";
import { useState } from "react";
import { Platform, Pressable, TextInput, View, useColorScheme } from "react-native";
import { VoiceRecordingOverlay } from "@/components/chat/VoiceRecordingOverlay";
import { AppText } from "@/components/ui/AppText";
import { MobilePill } from "@/components/ui/MobileChrome";
import { useMobileLayout } from "@/lib/mobileLayout";
import { mobileTheme } from "@/lib/mobileTheme";

type ConversationComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onSubmitVoiceRecording: (fileUri: string) => Promise<void>;
  variant?: "landing" | "thread";
};

/**
 * WHY:   The buyer home screen needs a dedicated composer that matches the new screen hierarchy instead of inheriting the old chat dock.
 * WHAT:  Renders the feature-owned assistant composer with one compact expanding input and one trailing voice/send action.
 * HOW:   Preserves the existing voice overlay and input logic while keeping the visible anatomy to a single field plus one contextual action button.
 */
export function ConversationComposer({
  value,
  onChange,
  onSend,
  onSubmitVoiceRecording,
  variant = "thread",
}: ConversationComposerProps) {
  const layout = useMobileLayout();
  const isDark = useColorScheme() === "dark";
  const trimmedValue = value.trim();
  const canSend = trimmedValue.length > 0;
  const startsWithLatin = /^[A-Za-z0-9]/.test(trimmedValue);
  const textAlign = startsWithLatin ? "left" : "right";
  const writingDirection = startsWithLatin ? "ltr" : "rtl";
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<
    "idle" | "waiting_for_permission" | "recording" | "uploading" | "transcribing" | "sending" | "error"
  >("idle");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const isVoiceBusy = voiceStatus === "uploading" || voiceStatus === "transcribing" || voiceStatus === "sending";
  const isLanding = variant === "landing";
  const shellBackgroundColor = isDark ? "#1A1C21" : "#F5F6FA";
  const shellBorderColor = isDark ? "rgba(255,255,255,0.08)" : "#E2E5EC";
  const inputColor = isDark ? "#F8FAFC" : mobileTheme.colors.ink;
  const placeholderColor = isDark ? "rgba(248,250,252,0.46)" : "#8D94A8";
  const secondaryTextColor = isDark ? "#CBD5E1" : "#64748B";
  const shellRadius = layout.isCompact ? 24 : 28;
  const actionButtonSize = layout.isCompact ? 40 : 44;
  const sendIconSize = layout.isCompact ? 17 : 18;
  const micIconSize = layout.isCompact ? 17 : 18;
  const inputMinHeight = actionButtonSize;
  const inputMaxHeight = layout.isCompact ? 112 : 132;
  const inputFontSize = layout.isCompact ? 14 : 15;
  const inputLineHeight = layout.isCompact ? 20 : 22;
  const outerInset = layout.isCompact ? 10 : 12;
  const shellPaddingHorizontal = layout.isCompact ? 16 : 18;
  const shellPaddingVertical = layout.isCompact ? 10 : 12;
  const shellPaddingRight = actionButtonSize + outerInset * 2 + 4;
  const actionButtonColor = canSend ? mobileTheme.colors.primary : isDark ? "#2A2D34" : "#E7EAF0";
  const rightButtonIconColor = canSend ? "#FFFFFF" : isDark ? "#F8FAFC" : mobileTheme.colors.inkSoft;
  const inputPlaceholder = "اكتب رسالتك هنا";
  const isExpanded = value.includes("\n") || trimmedValue.length > 48;

  return (
    <View className="w-full gap-3">
      {voiceError ? (
        <View
          className="rounded-[22px] px-4 py-3"
          style={{
            borderWidth: 1,
            borderColor: "#F6CFCF",
            backgroundColor: mobileTheme.colors.dangerSoft,
          }}
        >
          <AppText className="text-[13px] font-cairo-black text-red-600">{voiceError}</AppText>
        </View>
      ) : null}

      {isVoiceBusy ? (
        <View
          className="flex-row-reverse items-center justify-between rounded-[22px] px-4 py-3"
          style={{
            borderWidth: 1,
            borderColor: shellBorderColor,
            backgroundColor: shellBackgroundColor,
          }}
        >
          <View className="items-end">
            <AppText className="text-[14px] font-cairo-black" style={{ color: inputColor }}>
              {voiceStatus === "uploading"
                ? "نرفع التسجيل"
                : voiceStatus === "transcribing"
                  ? "نحوّل الصوت إلى نص"
                  : "نرسل الرسالة"}
            </AppText>
            <AppText className="mt-1 text-[12px] font-medium" style={{ color: secondaryTextColor }}>
              ستصل الرسالة داخل نفس المحادثة بعد اكتمال المعالجة.
            </AppText>
          </View>
          <MobilePill label="جارٍ التنفيذ" tone="primary" active />
        </View>
      ) : null}

      <View
        className="relative overflow-hidden"
        style={{
          borderRadius: shellRadius,
          borderWidth: 1,
          borderColor: shellBorderColor,
          backgroundColor: shellBackgroundColor,
        }}
      >
        <View
          style={{
            minHeight: actionButtonSize + shellPaddingVertical * 2 + 2,
            paddingLeft: shellPaddingHorizontal,
            paddingRight: shellPaddingRight,
            paddingTop: shellPaddingVertical,
            paddingBottom: shellPaddingVertical,
            justifyContent: "center",
          }}
        >
          <TextInput
            value={value}
            onChangeText={onChange}
            multiline
            blurOnSubmit={false}
            editable={voiceStatus === "idle" || voiceStatus === "error"}
            placeholder=""
            placeholderTextColor={placeholderColor}
            cursorColor={mobileTheme.colors.primary}
            textAlignVertical={isExpanded ? "top" : "center"}
            style={{
              minHeight: inputMinHeight,
              maxHeight: inputMaxHeight,
              textAlign,
              writingDirection,
              fontFamily: trimmedValue.length === 0 ? "Cairo_700Bold" : "Cairo_600SemiBold",
              fontSize: trimmedValue.length === 0 ? inputFontSize + 1 : inputFontSize,
              lineHeight: inputLineHeight,
              color: inputColor,
              paddingHorizontal: 0,
              paddingVertical: 0,
              includeFontPadding: false,
              backgroundColor: "transparent",
            }}
          />

          {trimmedValue.length === 0 ? (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                left: shellPaddingHorizontal,
                right: shellPaddingRight,
                top: shellPaddingVertical,
                bottom: shellPaddingVertical,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AppText
                className="font-cairo-black"
                style={{
                  color: placeholderColor,
                  fontSize: inputFontSize + 1,
                  lineHeight: inputLineHeight,
                  textAlign: "center",
                }}
              >
                {inputPlaceholder}
              </AppText>
            </View>
          ) : null}
        </View>

        <Pressable
          onPress={() => {
            if (canSend) {
              onSend();
              return;
            }
            setVoiceError(null);
            setVoiceStatus("recording");
            setIsVoiceOpen(true);
          }}
          disabled={isVoiceBusy}
          className="absolute items-center justify-center rounded-full"
          style={{
            right: outerInset,
            top: "50%",
            marginTop: -(actionButtonSize / 2),
            width: actionButtonSize,
            height: actionButtonSize,
            backgroundColor: actionButtonColor,
            opacity: isVoiceBusy ? 0.6 : 1,
          }}
        >
          {canSend ? (
            <ArrowUp size={sendIconSize} color={rightButtonIconColor} />
          ) : (
            <Mic size={micIconSize} color={rightButtonIconColor} />
          )}
        </Pressable>
      </View>

      <VoiceRecordingOverlay
        visible={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSubmitRecording={async (fileUri, setPhase) => {
          setVoiceError(null);
          try {
            setPhase("uploading");
            setVoiceStatus("uploading");
            await onSubmitVoiceRecording(fileUri);
            setPhase("sending");
            setVoiceStatus("sending");
            setIsVoiceOpen(false);
            setVoiceStatus("idle");
          } catch (error) {
            const message = error instanceof Error ? error.message : "تعذر إكمال التسجيل الصوتي.";
            setVoiceError(message);
            setVoiceStatus("error");
            setPhase("error");
            throw error;
          }
        }}
        onStateChange={(nextPhase) => {
          setVoiceStatus(nextPhase);
          if (nextPhase !== "error") {
            setVoiceError(null);
          }
        }}
      />
    </View>
  );
}
