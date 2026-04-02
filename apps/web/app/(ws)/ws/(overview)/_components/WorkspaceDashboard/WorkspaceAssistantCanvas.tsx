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
  voiceProcessingPhase: "idle" | "waiting_for_permission" | "waiting_for_speech" | "recording" | "silence_countdown" | "uploading" | "transcribing" | "sending" | "error";
  canRegenerate: boolean;
  activeTeamId: string | null;
  activeAgentName: string | null;
  liveAssistantMotionState: AIMotionState;
  liveStageLabel: string;
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
      <section className="flex h-full min-h-0 flex-1 flex-col bg-background px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 pt-10">
          <div className="flex items-center gap-4">
            <motion.div layoutId="assistant-motion-logo" className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/40 bg-card shadow-sm dark:bg-slate-900 dark:shadow-none">
              <AIMotionLogo state="loading" size="compact" />
            </motion.div>
            <div className="space-y-3">
              <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-48 animate-pulse rounded-full bg-slate-100 dark:bg-slate-900" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="ml-auto h-20 w-[70%] animate-pulse rounded-t-3xl rounded-br-3xl rounded-bl-lg bg-slate-900/5 dark:bg-slate-50/5" />
            <div className="h-40 w-[80%] animate-pulse rounded-3xl border border-border/40 bg-card shadow-sm dark:bg-slate-900/50 dark:shadow-none" />
          </div>

          <div className="mx-auto mt-auto w-full max-w-3xl translate-y-4">
            <div className="animate-pulse rounded-[40px] border border-border/40 bg-card p-6 shadow-sm dark:bg-slate-900/50 dark:shadow-none">
              <div className="h-10 rounded-full bg-slate-100 dark:bg-slate-800/50" />
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
    activeTeamId: props.activeTeamId,
    activeAgentName: props.activeAgentName,
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
    <section className="relative flex min-h-0 min-w-0 flex-1 basis-0 flex-col overflow-hidden">
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
