"use client";

import type { AnanProThread } from "@/server/contracts/ananPro";
import type { SessionUser } from "@/server/contracts/session";
import { AIMotionLogo, type AIMotionState } from "../../../_components/AIMotion";
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
      <section className="flex h-full min-h-0 flex-1 flex-col bg-[#f5f3ef] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6">
          <div className="flex items-center gap-3">
            <motion.div layoutId="assistant-motion-logo" className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-stone-300 bg-white">
              <AIMotionLogo state="loading" size="compact" />
            </motion.div>
            <div className="space-y-2">
              <div className="h-3 w-28 rounded-[8px] bg-stone-200" />
              <div className="h-2.5 w-40 rounded-[8px] bg-stone-100" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="ml-auto h-16 w-[68%] rounded-[8px] bg-slate-950/8" />
            <div className="h-24 w-[74%] rounded-[8px] border border-stone-200 bg-white" />
            <div className="ml-auto h-14 w-[42%] rounded-[8px] bg-slate-950/8" />
          </div>

          <div className="mt-auto rounded-[8px] border border-stone-300 bg-white p-4">
            <div className="h-16 rounded-[8px] bg-stone-100" />
            <div className="mt-3 flex items-center justify-between">
              <div className="h-8 w-24 rounded-[8px] bg-stone-100" />
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-[8px] bg-stone-100" />
                <div className="h-8 w-8 rounded-[8px] bg-stone-100" />
              </div>
            </div>
          </div>
        </div>
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
    <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
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
