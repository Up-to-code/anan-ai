"use client";

import type { AnanProStreamStageEvent, AnanProThread } from "@/server/contracts/ananPro";
import type { AIMotionState } from "@/app/(ws)/ws/_components/AIMotion";
import { LandingView, ThreadView, type AssistantComposerProps } from "./WorkspaceAssistantCanvas.sections";

type WorkspaceAssistantCanvasProps = {
  thread: AnanProThread | null;
  value: string;
  sendError: string | null;
  isLoadingThread: boolean;
  isSending: boolean;
  isVoiceRecording: boolean;
  isVoiceTranscribing: boolean;
  voiceProcessingPhase: "idle" | "recording" | "uploading" | "transcribing" | "sending" | "error";
  canRegenerate: boolean;
  activeTeamLabel: string | null;
  completedTeamLabels: string[];
  stageHistory: AnanProStreamStageEvent[];
  streamLifecycleStatus: "running" | "completed" | "failed" | "cancelled" | null;
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
    <section className="flex h-[calc(100svh-7rem)] flex-1 items-center justify-center bg-[#f7f7f5] px-6">
      <div className="text-sm font-medium text-slate-500">جاري تحميل المحادثة...</div>
    </section>
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
    <section className="flex h-[calc(100svh-7rem)] min-w-0 flex-1 flex-col overflow-hidden">
      {hasMessages ? (
        <ThreadView
          {...composerProps}
          thread={props.thread}
          lastAssistantMessageId={lastAssistantMessageId}
          activeTeamLabel={props.activeTeamLabel}
          completedTeamLabels={props.completedTeamLabels}
          stageHistory={props.stageHistory}
          streamLifecycleStatus={props.streamLifecycleStatus}
          liveAssistantMotionState={props.liveAssistantMotionState}
          liveStageLabel={props.liveStageLabel}
        />
      ) : (
        <LandingView {...composerProps} layout="landing" />
      )}
    </section>
  );
}
