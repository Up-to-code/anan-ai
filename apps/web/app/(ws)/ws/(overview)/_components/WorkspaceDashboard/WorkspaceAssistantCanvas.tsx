"use client";

import type { AnanProStreamStageEvent, AnanProThread } from "@/server/contracts/ananPro";
import type { SessionUser } from "@/server/contracts/session";
import type { AIMotionState } from "@/app/(ws)/ws/_components/AIMotion";
import { AIMotionLogo } from "@/app/(ws)/ws/_components/AIMotion";
import { motion, LayoutGroup } from "framer-motion";
import { LandingView, ThreadView, type AssistantComposerProps } from "./WorkspaceAssistantCanvas.sections";

type WorkspaceAssistantCanvasProps = {
  user: SessionUser;
  thread: AnanProThread | null;
  value: string;
  sendError: string | null;
  isLoadingThread: boolean;
  isSending: boolean;
  isVoiceRecording: boolean;
  isVoiceTranscribing: boolean;
  voiceProcessingPhase: "idle" | "recording" | "uploading" | "transcribing" | "sending" | "error";
  canRegenerate: boolean;
  liveAssistantMotionState: AIMotionState;
  liveStageLabel: string;
  voiceElapsedMs: number;
  voiceLevels: number[];
  onToggleVoiceRecording: () => void;
  onStopStreaming: () => void;
  onRegenerate: () => void;
  onChange: (value: string) => void;
  onSend: (message?: string) => void;
};

function LoadingState() {
  return (
    <LayoutGroup id="workspace-assistant-surface">
      <section className="flex h-[calc(100dvh-7rem)] flex-1 flex-col items-center justify-center bg-white px-6">
        <motion.div layoutId="assistant-motion-logo" className="mb-6">
          <AIMotionLogo state="loading" size="hero" floating />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-sm font-bold tracking-wider text-slate-400 uppercase"
        >
          تهيئة بيئة العمل...
        </motion.div>
      </section>
    </LayoutGroup>
  );
}

function toComposerProps(props: WorkspaceAssistantCanvasProps): AssistantComposerProps {
  return {
    value: props.value,
    sendError: props.sendError,
    isSending: props.isSending,
    isVoiceRecording: props.isVoiceRecording,
    isVoiceTranscribing: props.isVoiceTranscribing,
    voiceProcessingPhase: props.voiceProcessingPhase,
    canRegenerate: props.canRegenerate,
    voiceElapsedMs: props.voiceElapsedMs,
    voiceLevels: props.voiceLevels,
    onToggleVoiceRecording: props.onToggleVoiceRecording,
    onStopStreaming: props.onStopStreaming,
    onRegenerate: props.onRegenerate,
    onChange: props.onChange,
    onSend: props.onSend,
    layout: "thread",
  };
}

export default function WorkspaceAssistantCanvas(props: WorkspaceAssistantCanvasProps) {
  const hasMessages = Boolean(props.thread?.messages.length);
  const lastAssistantMessageId = [...(props.thread?.messages ?? [])]
    .reverse()
    .find((message) => message.role === "assistant")?.id;

  if (props.isLoadingThread) return <LoadingState />;
  const composerProps = toComposerProps(props);

  return (
    <section className="flex h-[calc(100dvh-7rem)] min-w-0 flex-1 flex-col overflow-hidden">
      {hasMessages ? (
        <ThreadView
          {...composerProps}
          user={props.user}
          thread={props.thread}
          lastAssistantMessageId={lastAssistantMessageId}
          liveAssistantMotionState={props.liveAssistantMotionState}
          liveStageLabel={props.liveStageLabel}
        />
      ) : (
        <LandingView {...composerProps} layout="landing" />
      )}
    </section>
  );
}
