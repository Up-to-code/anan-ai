import { ArrowUp, Loader2, Mic } from "lucide-react-native";
import { Platform, Pressable, StyleSheet, TextInput, View, useColorScheme } from "react-native";
import { useState } from "react";
import { useMobileLayout } from "@/lib/mobileLayout";
import { VoiceRecordingOverlay } from "@/components/chat/VoiceRecordingOverlay";
import { AppText } from "@/components/ui/AppText";
import { getMobileShadow, mobileTheme } from "@/lib/mobileTheme";

type ComposerDockProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onSubmitVoiceRecording: (fileUri: string) => Promise<void>;
};

/**
 * WHY:   The buyer assistant needs a bottom dock that feels like the main product surface, not a generic mobile chat bar.
 * WHAT:  Renders the mobile chat input as a single rounded message card with inline actions and integrated voice recording.
 * HOW:   Uses a reference-matched shell, adapts text direction for Arabic and Latin prompts, and preserves the existing voice overlay flow.
 */
export function ComposerDock({ value, onChange, onSend, onSubmitVoiceRecording }: ComposerDockProps) {
  const layout = useMobileLayout();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isTyping = value.trim().length > 0;
  const canSend = isTyping;
  const trimmedValue = value.trim();
  const startsWithLatin = /^[A-Za-z0-9]/.test(trimmedValue);
  const textAlign = startsWithLatin ? "left" : "right";
  const writingDirection = startsWithLatin ? "ltr" : "rtl";
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<
    "idle" | "waiting_for_permission" | "recording" | "uploading" | "transcribing" | "sending" | "error"
  >("idle");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const isVoiceBusy = voiceStatus === "uploading" || voiceStatus === "transcribing" || voiceStatus === "sending";
  const panelBorderColor = isDark ? "rgba(255,255,255,0.08)" : mobileTheme.colors.borderStrong;
  const panelBackgroundColor = isDark ? "rgba(24,24,27,0.98)" : mobileTheme.colors.surface;
  const buttonIconColor = isDark ? "#E2E8F0" : mobileTheme.colors.inkSoft;
  const sendBackgroundColor = canSend ? mobileTheme.colors.send : isDark ? "#334155" : "#CBD5E1";
  const inputMinHeight = layout.isCompact ? 42 : 44;
  const inputMaxHeight = 126;

  return (
    <View className="w-full bg-transparent">
      <View
        className="overflow-hidden"
        style={{
          borderRadius: mobileTheme.radii.panel,
          borderWidth: 1,
          borderColor: panelBorderColor,
          backgroundColor: panelBackgroundColor,
          ...getMobileShadow("float"),
        }}
      >
        {voiceStatus === "error" && voiceError ? (
          <View className="px-4 pt-3">
            <View className="rounded-2xl border border-red-200/80 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/40">
              <AppText responsiveRole="chip" className="font-cairo-black text-red-600 dark:text-red-300">
                {voiceError}
              </AppText>
            </View>
          </View>
        ) : null}

        {isVoiceBusy ? (
          <View className="px-4 pt-3">
            <View className="flex-row-reverse items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/80">
              <View className="flex-row-reverse items-center gap-2">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-slate-950">
                  <Loader2 size={16} color="#2563EB" />
                </View>
                <View className="items-end">
                  <AppText responsiveRole="chip" className="font-cairo-black text-slate-900 dark:text-slate-50">
                    {voiceStatus === "uploading"
                      ? "نرفع التسجيل"
                      : voiceStatus === "transcribing"
                        ? "نحوّل الصوت إلى نص"
                        : "نرسل الرسالة"}
                  </AppText>
                  <AppText responsiveRole="meta" className="font-medium text-slate-500 dark:text-slate-400">
                    ستصل كمحادثة عادية بعد اكتمال المعالجة.
                  </AppText>
                </View>
              </View>
              <View className="flex-row-reverse gap-1">
                {Array.from({ length: 3 }).map((_, index) => (
                  <View
                    key={index}
                    className="w-1.5 rounded-full bg-blue-500/80"
                    style={{ height: 10 + index * 4 }}
                  />
                ))}
              </View>
            </View>
          </View>
        ) : null}

        <View className="px-4 pb-3 pt-3">
          <View style={styles.composerRow}>
            <TextInput
              value={value}
              onChangeText={onChange}
              multiline
              blurOnSubmit={false}
              editable={voiceStatus === "idle" || voiceStatus === "error"}
              className="text-slate-900 dark:text-slate-50"
              placeholder="اسأل عن عقار أو اطلب مستشاراً"
              placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
              cursorColor="#E57B4B"
              textAlignVertical="top"
              style={{
                flex: 1,
                minHeight: inputMinHeight,
                maxHeight: inputMaxHeight,
                textAlign,
                fontFamily: "Cairo_600SemiBold",
                fontSize: layout.typeScale.body.fontSize,
                lineHeight: layout.typeScale.body.lineHeight,
                writingDirection,
                paddingTop: Platform.OS === "ios" ? 8 : 6,
                paddingBottom: 6,
                paddingHorizontal: 0,
              }}
            />

            <View style={styles.actionsRow}>
              <Pressable
                onPress={() => {
                  setVoiceError(null);
                  setVoiceStatus("recording");
                  setIsVoiceOpen(true);
                }}
                accessibilityRole="button"
                accessibilityLabel="تسجيل رسالة صوتية"
                disabled={isVoiceBusy}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.iconAction,
                  {
                    backgroundColor: "transparent",
                    opacity: isVoiceBusy ? 0.5 : 1,
                    transform: [{ scale: pressed ? 0.94 : 1 }],
                  },
                ]}
              >
                <Mic size={22} color={buttonIconColor} strokeWidth={2.1} />
              </Pressable>

              <Pressable
                onPress={onSend}
                accessibilityRole="button"
                accessibilityLabel="إرسال الرسالة"
                disabled={!canSend || isVoiceBusy}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.sendAction,
                  {
                    backgroundColor: sendBackgroundColor,
                    opacity: !canSend || isVoiceBusy ? 0.6 : 1,
                    transform: [{ scale: pressed ? 0.94 : 1 }],
                  },
                ]}
              >
                <ArrowUp size={18} color="#FFFFFF" strokeWidth={2.8} />
              </Pressable>
            </View>
          </View>
        </View>
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

const styles = StyleSheet.create({
  composerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  iconAction: {
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  sendAction: {
    alignItems: "center",
    justifyContent: "center",
    width: 42,
    height: 42,
    borderRadius: 21,
  },
});
