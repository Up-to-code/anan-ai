import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Modal, Pressable, StyleSheet, View } from "react-native";
import { Audio } from "expo-av";
import { Mic, Square, X } from "lucide-react-native";
import { AppText } from "@/components/ui/AppText";

type VoiceOverlayPhase =
  | "idle"
  | "waiting_for_permission"
  | "recording"
  | "uploading"
  | "transcribing"
  | "sending"
  | "error";

type VoiceRecordingOverlayProps = {
  visible: boolean;
  onClose: () => void;
  onSubmitRecording: (
    fileUri: string,
    setPhase: (phase: VoiceOverlayPhase) => void,
  ) => Promise<void>;
  onStateChange?: (phase: VoiceOverlayPhase) => void;
};

function setPhaseWithCallback(
  phase: VoiceOverlayPhase,
  setPhase: React.Dispatch<React.SetStateAction<VoiceOverlayPhase>>,
  onStateChange?: (phase: VoiceOverlayPhase) => void,
) {
  setPhase(phase);
  onStateChange?.(phase);
}

/**
 * WHY:   Mobile voice capture should feel like a premium assistant mode instead of a hidden utility dialog.
 * WHAT:  Presents a full-screen recording surface with live timer, pulse motion, and upload/transcription progress.
 * HOW:   Records through `expo-av`, exposes phase changes to the parent composer, and only closes after success or cancel.
 */
export function VoiceRecordingOverlay({
  visible,
  onClose,
  onSubmitRecording,
  onStateChange,
}: VoiceRecordingOverlayProps) {
  const [phase, setPhase] = useState<VoiceOverlayPhase>("idle");
  const [durationSeconds, setDurationSeconds] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const phaseLabel = useMemo(() => {
    switch (phase) {
      case "waiting_for_permission":
        return "نطلب إذن الميكروفون";
      case "recording":
        return "استمر في الحديث، وسأحوّلها إلى رسالة";
      case "uploading":
        return "نرفع التسجيل الآن";
      case "transcribing":
        return "نحوّل الصوت إلى نص";
      case "sending":
        return "نرسل الرسالة إلى المساعد";
      case "error":
        return "تعذر إكمال التسجيل";
      default:
        return "جاهز للتسجيل";
    }
  }, [phase]);

  const startPulseAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.22,
          duration: 920,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 920,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  const stopPulseAnimation = useCallback(() => {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [pulseAnim]);

  const cleanupTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setPhaseWithCallback("waiting_for_permission", setPhase, onStateChange);
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        setPhaseWithCallback("error", setPhase, onStateChange);
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setDurationSeconds(0);
      setPhaseWithCallback("recording", setPhase, onStateChange);
      startPulseAnimation();
      timerRef.current = setInterval(() => {
        setDurationSeconds((current) => current + 1);
      }, 1000);
    } catch {
      setPhaseWithCallback("error", setPhase, onStateChange);
    }
  }, [onStateChange, startPulseAnimation]);

  const resetRecorder = useCallback(async () => {
    cleanupTimer();
    stopPulseAnimation();
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch {
        // no-op
      }
      recordingRef.current = null;
    }
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    } catch {
      // no-op
    }
  }, [cleanupTimer, stopPulseAnimation]);

  const cancelRecording = useCallback(async () => {
    await resetRecorder();
    setDurationSeconds(0);
    setPhaseWithCallback("idle", setPhase, onStateChange);
    onClose();
  }, [onClose, onStateChange, resetRecorder]);

  const stopAndSubmit = useCallback(async () => {
    if (!recordingRef.current) return;
    cleanupTimer();
    stopPulseAnimation();

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      if (!uri) {
        setPhaseWithCallback("error", setPhase, onStateChange);
        return;
      }

      setPhaseWithCallback("uploading", setPhase, onStateChange);
      await onSubmitRecording(uri, (nextPhase) => setPhaseWithCallback(nextPhase, setPhase, onStateChange));
      setDurationSeconds(0);
      setPhaseWithCallback("idle", setPhase, onStateChange);
      onClose();
    } catch {
      setPhaseWithCallback("error", setPhase, onStateChange);
    }
  }, [cleanupTimer, onClose, onStateChange, onSubmitRecording, stopPulseAnimation]);

  useEffect(() => {
    if (visible) {
      void startRecording();
      return;
    }
    void resetRecorder();
    setDurationSeconds(0);
    setPhaseWithCallback("idle", setPhase, onStateChange);
  }, [onStateChange, resetRecorder, startRecording, visible]);

  useEffect(() => {
    return () => {
      cleanupTimer();
    };
  }, [cleanupTimer]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => void cancelRecording()}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View className="items-end">
            <Pressable
              onPress={() => void cancelRecording()}
              style={({ pressed }) => [
                styles.iconButton,
                { transform: [{ scale: pressed ? 0.94 : 1 }] },
              ]}
            >
              <X size={18} color="#CBD5E1" />
            </Pressable>
          </View>

          <View className="mt-4 items-center">
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  transform: [{ scale: pulseAnim }],
                  opacity: pulseAnim.interpolate({
                    inputRange: [1, 1.22],
                    outputRange: [0.24, 0.08],
                  }),
                },
              ]}
            />
            <View style={styles.centerOrb}>
              <Mic size={34} color="#FFFFFF" />
            </View>
          </View>

          <View className="mt-8 items-center gap-2">
            <AppText responsiveRole="title" className="font-cairo-black text-white">
              {formatDuration(durationSeconds)}
            </AppText>
            <AppText responsiveRole="body" className="font-cairo-black text-slate-200">
              {phaseLabel}
            </AppText>
            <AppText responsiveRole="meta" className="font-medium text-slate-400">
              سيتم إرسال الصوت داخل نفس المحادثة بعد تحويله إلى نص.
            </AppText>
          </View>

          <View className="mt-10 flex-row-reverse items-center justify-center gap-4">
            <Pressable
              onPress={() => void cancelRecording()}
              style={({ pressed }) => [
                styles.secondaryAction,
                { transform: [{ scale: pressed ? 0.96 : 1 }] },
              ]}
            >
              <AppText responsiveRole="chip" className="font-cairo-black text-slate-200">
                إلغاء
              </AppText>
            </Pressable>
            <Pressable
              onPress={() => void stopAndSubmit()}
              disabled={phase !== "recording"}
              style={({ pressed }) => [
                styles.primaryAction,
                {
                  opacity: phase === "recording" ? 1 : 0.5,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                },
              ]}
            >
              <Square size={16} color="#0F172A" fill="#0F172A" />
              <AppText responsiveRole="chip" className="font-cairo-black text-slate-950">
                إيقاف وإرسال
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.86)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  sheet: {
    width: "100%",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.2)",
    backgroundColor: "rgba(15, 23, 42, 0.96)",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
  },
  iconButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(30, 41, 59, 0.9)",
  },
  pulseRing: {
    position: "absolute",
    width: 156,
    height: 156,
    borderRadius: 78,
    backgroundColor: "#2563EB",
  },
  centerOrb: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.32,
    shadowRadius: 28,
    elevation: 12,
  },
  secondaryAction: {
    minWidth: 116,
    minHeight: 48,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.24)",
    backgroundColor: "rgba(15, 23, 42, 0.84)",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryAction: {
    minWidth: 148,
    minHeight: 48,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
});
