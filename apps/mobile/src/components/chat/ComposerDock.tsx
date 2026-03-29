import { ArrowUp, Loader2, Mic, Square } from "lucide-react-native";
import { Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
import { useState } from "react";
import { useMobileLayout } from "@/lib/mobileLayout";
import { VoiceRecordingOverlay } from "@/components/chat/VoiceRecordingOverlay";
import { AppText } from "@/components/ui/AppText";

type ComposerDockProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onSubmitVoiceRecording: (fileUri: string) => Promise<void>;
};

/**
 * WHY:   The buyer assistant needs a bottom dock that feels like the main product surface, not a generic mobile chat bar.
 * WHAT:  Renders a ChatGPT-style composer with multiline input, compact action row, and integrated voice recording entry point.
 * HOW:   Uses a layered rounded panel, swaps mic/send by input state, and delegates recording capture to the full-screen voice overlay.
 */
export function ComposerDock({ value, onChange, onSend, onSubmitVoiceRecording }: ComposerDockProps) {
  const layout = useMobileLayout();
  const isTyping = value.trim().length > 0;
  const canSend = isTyping;
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<
    "idle" | "waiting_for_permission" | "recording" | "uploading" | "transcribing" | "sending" | "error"
  >("idle");
  const [voiceError, setVoiceError] = useState<string | null>(null);

  return (
    <View className="w-full bg-transparent">
      <View
        className="overflow-hidden border border-slate-200/90 bg-white/96 dark:border-slate-800 dark:bg-slate-950/96"
        style={{
          borderRadius: layout.cardRadius + 10,
          minHeight: layout.composerHeight + 34,
          shadowColor: "#0F172A",
          shadowOffset: { width: 0, height: 16 },
          shadowOpacity: 0.08,
          shadowRadius: 32,
          elevation: 10,
        }}
      >
        {voiceStatus === "error" && voiceError ? (
          <View className="border-b border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/30 dark:bg-red-950/40">
            <AppText responsiveRole="chip" className="font-cairo-black text-red-600 dark:text-red-300">
              {voiceError}
            </AppText>
          </View>
        ) : null}

        {(voiceStatus === "uploading" || voiceStatus === "transcribing" || voiceStatus === "sending") ? (
          <View className="border-b border-slate-200/80 px-4 py-3 dark:border-slate-800">
            <View className="flex-row-reverse items-center justify-between">
              <View className="flex-row-reverse items-center gap-2">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900">
                  <Loader2 size={16} color="#2563EB" />
                </View>
                <View>
                  <AppText responsiveRole="chip" className="font-cairo-black text-slate-900 dark:text-slate-50">
                    {voiceStatus === "uploading"
                      ? "نرفع التسجيل"
                      : voiceStatus === "transcribing"
                        ? "نحوّل الصوت إلى نص"
                        : "نرسل الرسالة"}
                  </AppText>
                  <AppText responsiveRole="meta" className="font-medium text-slate-500 dark:text-slate-400">
                    سيتم إرسالها كمحادثة عادية حال اكتمال المعالجة.
                  </AppText>
                </View>
              </View>
              <View className="flex-row-reverse gap-1">
                {Array.from({ length: 4 }).map((_, index) => (
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

        <View className="px-4 pt-4">
          <TextInput
            value={value}
            onChangeText={onChange}
            multiline
            blurOnSubmit={false}
            editable={voiceStatus === "idle" || voiceStatus === "error"}
            className="text-slate-900 dark:text-slate-50"
            placeholder="اسأل عن عقار، التمويل، المقارنة، أو اطلب مستشاراً"
            placeholderTextColor="#94A3B8"
            cursorColor="#2563EB"
            style={{
              minHeight: layout.composerHeight + 8,
              maxHeight: 132,
              textAlign: "right",
              fontFamily: "Cairo_600SemiBold",
              fontSize: layout.typeScale.body.fontSize,
              lineHeight: layout.typeScale.body.lineHeight,
              writingDirection: "rtl",
              paddingTop: Platform.OS === "ios" ? 8 : 4,
              paddingBottom: Platform.OS === "ios" ? 8 : 4,
              paddingHorizontal: 0,
            }}
          />
        </View>

        <View className="mt-2 flex-row-reverse items-center justify-between border-t border-slate-200/80 px-4 pb-4 pt-3 dark:border-slate-800">
          <AppText responsiveRole="meta" className="font-cairo-black uppercase tracking-[2px] text-slate-400">
            مساعد عنان
          </AppText>
          <View className="flex-row-reverse items-center gap-2">
            <Pressable
              onPress={() => {
                setVoiceError(null);
                setVoiceStatus("recording");
                setIsVoiceOpen(true);
              }}
              accessibilityRole="button"
              disabled={voiceStatus === "uploading" || voiceStatus === "transcribing" || voiceStatus === "sending"}
              style={({ pressed }) => [
                styles.fab,
                {
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  borderWidth: 1,
                  borderColor: voiceStatus === "recording" ? "#FCA5A5" : "#E2E8F0",
                  backgroundColor: voiceStatus === "recording" ? "#FEF2F2" : "#F8FAFC",
                  transform: [{ scale: pressed ? 0.94 : 1 }],
                  opacity: voiceStatus === "uploading" || voiceStatus === "transcribing" || voiceStatus === "sending" ? 0.5 : 1,
                },
              ]}
            >
              {voiceStatus === "recording" ? (
                <Square size={16} color="#DC2626" fill="#DC2626" />
              ) : (
                <Mic size={20} color="#475569" />
              )}
            </Pressable>
            <Pressable
              onPress={onSend}
              accessibilityRole="button"
              disabled={!canSend || voiceStatus === "uploading" || voiceStatus === "transcribing" || voiceStatus === "sending"}
              style={({ pressed }) => [
                styles.fab,
                {
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: canSend ? "#0F172A" : "#CBD5E1",
                  transform: [{ scale: pressed ? 0.94 : 1 }],
                  opacity: voiceStatus === "uploading" || voiceStatus === "transcribing" || voiceStatus === "sending" ? 0.5 : 1,
                },
              ]}
            >
              <ArrowUp size={18} color="#FFFFFF" strokeWidth={3} />
            </Pressable>
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
  fab: {
    alignItems: "center",
    justifyContent: "center",
  },
});
