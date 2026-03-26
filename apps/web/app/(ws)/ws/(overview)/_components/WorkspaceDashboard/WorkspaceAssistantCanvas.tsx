"use client";

import type { AnanProThread } from "@/server/contracts/ananPro";
import type { SessionUser } from "@/server/contracts/session";
import type { WorkspaceAudience } from "@/server/contracts/workspace";
import { AIMotionLogo, type AIMotionState } from "../../../_components/AIMotion";
import { motion, LayoutGroup } from "framer-motion";
import { LandingView, ThreadView, type AssistantComposerProps } from "./WorkspaceAssistantCanvas.sections";

type WorkspaceAssistantCanvasProps = {
  audience: WorkspaceAudience;
  user: SessionUser;
  thread: AnanProThread | null;
  unavailableThreadId: string | null;
  value: string;
  sendError: string | null;
  isLoadingThread: boolean;
  isSending: boolean;
  isVoiceRecording: boolean;
  isVoiceTranscribing: boolean;
  voiceProcessingPhase: "idle" | "waiting_for_speech" | "recording" | "silence_countdown" | "uploading" | "transcribing" | "sending" | "error";
  canRegenerate: boolean;
  liveAssistantMotionState: AIMotionState;
  liveStageLabel: string;
  voiceElapsedMs: number;
  voiceLevels: number[];
  onToggleVoiceRecording: () => void;
  onStopStreaming: () => void;
  onRegenerate: () => void;
  onResetUnavailableThread: () => void;
  onChange: (value: string) => void;
  onSend: (message?: string) => void;
};

function LoadingState() {
  return (
    <LayoutGroup id="workspace-assistant-surface">
      <section className="flex h-full min-h-0 flex-1 flex-col bg-[#fafaf8] px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6">
          <div className="flex items-center gap-3">
            <motion.div layoutId="assistant-motion-logo" className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-stone-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
              <AIMotionLogo state="loading" size="compact" />
            </motion.div>
            <div className="space-y-2">
              <div className="h-3 w-28 animate-pulse rounded-[8px] bg-stone-200 dark:bg-slate-700" />
              <div className="h-2.5 w-40 animate-pulse rounded-[8px] bg-stone-100 dark:bg-slate-800" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="ml-auto h-14 w-[60%] animate-pulse rounded-[8px] bg-slate-900/[0.06]" />
            <div className="h-20 w-[70%] animate-pulse rounded-[8px] border border-stone-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:shadow-none" />
            <div className="ml-auto h-12 w-[40%] animate-pulse rounded-[8px] bg-slate-900/[0.06]" />
          </div>

          <div className="mx-auto mt-auto w-full max-w-3xl">
            <div className="animate-pulse rounded-[8px] border border-stone-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
              <div className="h-12 rounded-[8px] bg-stone-100 dark:bg-slate-800" />
              <div className="mt-3 flex items-center justify-between">
                <div className="h-3 w-20 rounded-[8px] bg-stone-100 dark:bg-slate-800" />
                <div className="flex items-center gap-1.5">
                  <div className="h-9 w-9 rounded-[8px] bg-stone-100 dark:bg-slate-800" />
                  <div className="h-9 w-9 rounded-[8px] bg-stone-100 dark:bg-slate-800" />
                </div>
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
    audience: props.audience,
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
        <LandingView
          {...composerProps}
          layout="landing"
          unavailableThreadId={props.unavailableThreadId}
          onResetUnavailableThread={props.onResetUnavailableThread}
        />
      )}
    </section>
  );
}
