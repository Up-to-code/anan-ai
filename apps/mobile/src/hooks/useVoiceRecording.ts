import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing } from "react-native";
import { Audio } from "expo-av";

export type VoiceRecordingPhase =
  | "idle"
  | "waiting_for_permission"
  | "recording"
  | "paused"
  | "uploading"
  | "transcribing"
  | "sending"
  | "error";

interface UseVoiceRecordingProps {
  onStateChange?: (phase: VoiceRecordingPhase) => void;
  onSubmitRecording: (fileUri: string) => Promise<void>;
}

export function useVoiceRecording({ onStateChange, onSubmitRecording }: UseVoiceRecordingProps) {
  const [phase, setPhase] = useState<VoiceRecordingPhase>("idle");
  const [durationSeconds, setDurationSeconds] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<VoiceRecordingPhase>("idle");
  const actionLockRef = useRef(false);
  
  // Waveform animation values
  const waveAnims = useRef(Array.from({ length: 18 }, () => new Animated.Value(0))).current;
  const waveLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  const setPhaseWithCallback = useCallback((nextPhase: VoiceRecordingPhase) => {
    phaseRef.current = nextPhase;
    setPhase(nextPhase);
    onStateChange?.(nextPhase);
  }, [onStateChange]);

  const startWaveAnimation = useCallback(() => {
    waveLoopRef.current?.stop();
    waveAnims.forEach((anim) => anim.setValue(0));
    waveLoopRef.current = Animated.loop(
      Animated.stagger(
        90,
        waveAnims.map((anim) =>
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 320,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 320,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ),
      ),
    );
    waveLoopRef.current.start();
  }, [waveAnims]);

  const stopWaveAnimation = useCallback(() => {
    waveLoopRef.current?.stop();
    waveLoopRef.current = null;
    waveAnims.forEach((anim) => anim.setValue(0));
  }, [waveAnims]);

  const cleanupTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (actionLockRef.current) return;
    if (phaseRef.current !== "idle" && phaseRef.current !== "error") return;
    actionLockRef.current = true;

    try {
      setPhaseWithCallback("waiting_for_permission");
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        setPhaseWithCallback("error");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setDurationSeconds(0);
      setPhaseWithCallback("recording");
      startWaveAnimation();
      timerRef.current = setInterval(() => {
        setDurationSeconds((current) => current + 1);
      }, 1000);
    } catch (error) {
      console.error("Failed to start recording", error);
      setPhaseWithCallback("error");
    } finally {
      actionLockRef.current = false;
    }
  }, [setPhaseWithCallback, startWaveAnimation]);

  const resetRecorder = useCallback(async () => {
    cleanupTimer();
    stopWaveAnimation();
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
  }, [cleanupTimer, stopWaveAnimation]);

  const stopAndSubmit = useCallback(async () => {
    if (actionLockRef.current) return;
    if (!recordingRef.current) return;
    actionLockRef.current = true;
    cleanupTimer();
    stopWaveAnimation();

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      if (!uri) {
        setPhaseWithCallback("error");
        return;
      }

      setPhaseWithCallback("uploading");
      await onSubmitRecording(uri);
      setDurationSeconds(0);
      setPhaseWithCallback("idle");
    } catch (error) {
      console.error("Failed to stop and submit", error);
      setPhaseWithCallback("error");
    } finally {
      actionLockRef.current = false;
    }
  }, [cleanupTimer, onSubmitRecording, setPhaseWithCallback, stopWaveAnimation]);

  const resumeTimer = useCallback(() => {
    cleanupTimer();
    timerRef.current = setInterval(() => {
      setDurationSeconds((current) => current + 1);
    }, 1000);
  }, [cleanupTimer]);

  const pauseRecording = useCallback(async () => {
    if (actionLockRef.current) return;
    if (!recordingRef.current || phaseRef.current !== "recording") return;
    actionLockRef.current = true;

    try {
      cleanupTimer();
      stopWaveAnimation();
      await recordingRef.current.pauseAsync();
      setPhaseWithCallback("paused");
    } catch (error) {
      console.error("Failed to pause recording", error);
      setPhaseWithCallback("error");
    } finally {
      actionLockRef.current = false;
    }
  }, [cleanupTimer, setPhaseWithCallback, stopWaveAnimation]);

  const resumeRecording = useCallback(async () => {
    if (actionLockRef.current) return;
    if (!recordingRef.current || phaseRef.current !== "paused") return;
    actionLockRef.current = true;

    try {
      await recordingRef.current.startAsync();
      setPhaseWithCallback("recording");
      startWaveAnimation();
      resumeTimer();
    } catch (error) {
      console.error("Failed to resume recording", error);
      setPhaseWithCallback("error");
    } finally {
      actionLockRef.current = false;
    }
  }, [resumeTimer, setPhaseWithCallback, startWaveAnimation]);

  const cancelRecording = useCallback(async () => {
    if (actionLockRef.current) return;
    actionLockRef.current = true;
    try {
      await resetRecorder();
      setDurationSeconds(0);
      setPhaseWithCallback("idle");
    } finally {
      actionLockRef.current = false;
    }
  }, [resetRecorder, setPhaseWithCallback]);

  useEffect(() => {
    return () => {
      cleanupTimer();
      stopWaveAnimation();
    };
  }, [cleanupTimer, stopWaveAnimation]);

  return {
    phase,
    durationSeconds,
    waveAnims,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopAndSubmit,
    cancelRecording,
  };
}
