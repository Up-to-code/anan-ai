"use client";

import { useMemo } from "react";
import type { MainAssistantThread } from "@/server/contracts/mainAssistant";
import AudioReplyPlayer from "@/components/shared/AudioReplyPlayer";
import VoiceSessionOrb from "@/components/shared/VoiceSessionOrb";
import { useVoiceSession } from "@/hooks/useVoiceSession";
import {
  bootstrapAssistant,
  getVoiceUploadUrl,
  sendAssistantMessage,
  synthesizeAssistantVoice,
  transcribeVoiceFromStorage,
} from "./actions";

type PublicAssistantClientProps = {
  initialThread: MainAssistantThread | null;
};

function resolveSurfaceMessage(session: ReturnType<typeof useVoiceSession>) {
  const normalize = (message: string) => {
    if (/missing elevenlabs configuration/i.test(message)) {
      return "Server voice is not configured yet.";
    }
    if (/automatic playback was blocked/i.test(message)) {
      return "Playback was blocked. Tap again when you are ready.";
    }
    if (/voice playback is unavailable/i.test(message)) {
      return "Voice playback is unavailable in this browser.";
    }
    return message;
  };

  if (session.voiceUnavailableReason) {
    return normalize(session.voiceUnavailableReason);
  }
  if (session.voiceReplyUnavailableReason) {
    return normalize(session.voiceReplyUnavailableReason);
  }
  if (session.error) {
    return normalize(session.error);
  }
  return normalize(session.statusHint ?? "Tap the circle and speak. I will listen, think, and answer with voice.");
}

/**
 * WHY:   The public assistant should read like one voice control, not a prototype canvas with extra decoration.
 * WHAT:  Hosts a single centered orb and keeps playback infrastructure invisible behind it.
 * HOW:   Maps the live session hook into the orb state while forwarding playback lifecycle events to the hidden audio player.
 */
export default function PublicAssistantClient({ initialThread }: PublicAssistantClientProps) {
  const sessionActions = useMemo(
    () => ({
      bootstrapAssistant,
      sendAssistantMessage,
      getVoiceUploadUrl,
      transcribeVoiceFromStorage,
      synthesizeAssistantVoice,
    }),
    [],
  );

  const session = useVoiceSession({
    initialThread,
    actions: sessionActions,
  });

  const surfaceMessage = resolveSurfaceMessage(session);

  return (
    <div
      className="min-h-screen bg-[#0e131a] text-white"
      style={{
        backgroundColor: "#0e131a",
        backgroundImage:
          "radial-gradient(circle at 50% 80%, rgba(36, 51, 70, 0.48), transparent 28%), linear-gradient(180deg, #0e131a 0%, #10161e 100%)",
      }}
    >
      <main className="flex min-h-screen items-center justify-center px-6 py-8">
        <VoiceSessionOrb
          state={session.sessionState}
          levels={session.levels}
          elapsedMs={session.elapsedMs}
          detail={surfaceMessage}
          disabled={session.isHydrating}
          onPrimaryAction={() => {
            void session.toggleVoiceTurn();
          }}
        />
      </main>

      <AudioReplyPlayer
        hidden
        audioUrl={session.latestAudioUrl}
        fallbackText={session.latestPlaybackFallbackText}
        isLoading={session.latestAudioStatus === "loading"}
        autoplayKey={session.latestAudioKey ?? undefined}
        stopKey={session.playbackStopKey ?? undefined}
        onPlay={session.onAudioPlay}
        onPause={session.onAudioPause}
        onEnded={() => {
          void session.onAudioEnded();
        }}
        onAutoplayBlocked={session.onAudioAutoplayBlocked}
        onUnavailable={session.onPlaybackUnavailable}
      />
    </div>
  );
}
