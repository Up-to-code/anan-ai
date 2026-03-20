"use client";

import InstitutionalChatInput from "@/components/shared/InstitutionalChatInput";
import MessageRow from "../../../_components/Chat/MessageRow";
import TypingIndicator from "../../../_components/Chat/TypingIndicator";
import AgUiTurnRenderer from "../../../_components/Chat/AgUiTurnRenderer";
import { AIMotionLogo } from "../../../_components/AIMotion";
import type { AnanProStreamStageEvent, AnanProThread } from "@/server/contracts/ananPro";
import type { AIMotionState } from "@/app/(ws)/ws/_components/AIMotion";

export type AssistantComposerProps = {
  value: string;
  sendError: string | null;
  isSending: boolean;
  isVoiceRecording: boolean;
  isVoiceTranscribing: boolean;
  voiceProcessingPhase: "idle" | "recording" | "uploading" | "transcribing" | "sending" | "error";
  canRegenerate: boolean;
  voiceElapsedMs: number;
  voiceLevels: number[];
  onToggleVoiceRecording: () => void;
  onStopStreaming: () => void;
  onRegenerate: () => void;
  onChange: (value: string) => void;
  onSend: (message?: string) => void;
  layout: "thread" | "landing";
};

type ThreadViewProps = AssistantComposerProps & {
  thread: AnanProThread | null;
  isSending: boolean;
  lastAssistantMessageId: string | undefined;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  activeTeamLabel: string | null;
  completedTeamLabels: string[];
  stageHistory: AnanProStreamStageEvent[];
  streamLifecycleStatus: "running" | "completed" | "failed" | "cancelled" | null;
  liveAssistantMotionState: AIMotionState;
  liveStageLabel: string;
};

function formatVoiceElapsed(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function stagePhaseLabel(phase: AnanProStreamStageEvent["phase"]) {
  switch (phase) {
    case "intent_started":
      return "تحليل النية";
    case "intent_done":
      return "تحديد المسارات";
    case "team_started":
      return "تشغيل الفرق";
    case "team_done":
      return "إنهاء الفرق";
    case "merge_started":
      return "دمج النتائج";
    case "merge_done":
      return "اكتمال الدمج";
    case "action_started":
      return "تنفيذ الإجراء";
    case "action_done":
      return "نتيجة الإجراء";
    case "persist_started":
      return "حفظ المحادثة";
    case "persist_done":
      return "تم الحفظ";
    default:
      return phase;
  }
}

function VoiceStatusBanners({
  sendError,
  isVoiceRecording,
  isVoiceTranscribing,
  voiceElapsedMs,
  voiceProcessingPhase,
}: Pick<AssistantComposerProps, "sendError" | "isVoiceRecording" | "isVoiceTranscribing" | "voiceElapsedMs" | "voiceProcessingPhase">) {
  return (
    <>
      {sendError ? <div className="mb-3 border border-red-200 bg-red-50 p-3 text-sm text-red-700">{sendError}</div> : null}
      {isVoiceRecording ? <div className="mb-3 text-xs font-bold text-red-600">جاري التسجيل الصوتي... {formatVoiceElapsed(voiceElapsedMs)}</div> : null}
      {voiceProcessingPhase === "uploading" ? <div className="mb-3 text-xs font-bold text-slate-500">جاري رفع التسجيل الصوتي...</div> : null}
      {voiceProcessingPhase === "transcribing" || isVoiceTranscribing ? <div className="mb-3 text-xs font-bold text-slate-500">جاري تفريغ الرسالة الصوتية...</div> : null}
      {voiceProcessingPhase === "sending" ? <div className="mb-3 text-xs font-bold text-slate-500">جاري إرسال النص إلى المساعد...</div> : null}
    </>
  );
}

function AssistantComposer(props: AssistantComposerProps) {
  return (
    <>
      <VoiceStatusBanners
        sendError={props.sendError}
        isVoiceRecording={props.isVoiceRecording}
        isVoiceTranscribing={props.isVoiceTranscribing}
        voiceElapsedMs={props.voiceElapsedMs}
        voiceProcessingPhase={props.voiceProcessingPhase}
      />
      <InstitutionalChatInput
        value={props.value}
        onChange={props.onChange}
        onSend={() => props.onSend()}
        isSending={props.isSending}
        onStopGenerating={props.onStopStreaming}
        onRegenerate={props.onRegenerate}
        canRegenerate={props.canRegenerate}
        onMicToggle={props.onToggleVoiceRecording}
        isMicRecording={props.isVoiceRecording}
        isMicProcessing={props.isVoiceTranscribing}
        micLevels={props.voiceLevels}
        layout={props.layout}
      />
    </>
  );
}

function ThreadHeader({ thread }: { thread: AnanProThread | null }) {
  return (
    <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-slate-950">{thread?.title?.trim() || "محادثة Anan Workspace"}</h1>
          <p className="mt-1 text-sm text-slate-500">استكمل العمل من آخر نقطة وصلت إليها داخل هذه المحادثة.</p>
        </div>
      </div>
    </div>
  );
}

function TeamLabels({ isSending, activeTeamLabel, completedTeamLabels }: { isSending: boolean; activeTeamLabel: string | null; completedTeamLabels: string[] }) {
  if (!isSending || (!activeTeamLabel && completedTeamLabels.length === 0)) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-600">
      {activeTeamLabel ? <span className="border border-slate-300 bg-white px-2 py-1 text-slate-900">يعمل الآن: {activeTeamLabel}</span> : null}
      {completedTeamLabels.map((team) => <span key={team} className="border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700">اكتمل: {team}</span>)}
    </div>
  );
}

function ExecutionStatusPanel({ isSending, stageHistory, streamLifecycleStatus }: { isSending: boolean; stageHistory: AnanProStreamStageEvent[]; streamLifecycleStatus: "running" | "completed" | "failed" | "cancelled" | null }) {
  if (!isSending && stageHistory.length === 0) return null;
  return (
    <div className="border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-[11px] font-black tracking-[0.16em] text-slate-700">حالة التنفيذ المباشرة</span>
        <span className="text-[10px] font-semibold text-slate-500">{streamLifecycleStatus ?? "running"}</span>
      </div>
      <div className="space-y-2">
        {stageHistory.slice(-5).map((stage) => (
          <div key={stage.seq} className="flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-800">{stagePhaseLabel(stage.phase)}</span>
            <span className="text-slate-500">{stage.status ?? "running"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ThreadMessages({
  thread,
  isSending,
  lastAssistantMessageId,
  liveAssistantMotionState,
  activeTeamLabel,
  completedTeamLabels,
  stageHistory,
  streamLifecycleStatus,
  liveStageLabel,
}: {
  thread: AnanProThread | null;
  isSending: boolean;
  lastAssistantMessageId: string | undefined;
  liveAssistantMotionState: AIMotionState;
  activeTeamLabel: string | null;
  completedTeamLabels: string[];
  stageHistory: AnanProStreamStageEvent[];
  streamLifecycleStatus: "running" | "completed" | "failed" | "cancelled" | null;
  liveStageLabel: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 pb-10">
      {thread?.messages.map((message) => (
        <MessageRow
          key={message.id}
          isUser={message.role === "user"}
          content={message.content}
          isStreaming={message.role === "assistant" && isSending && message.id === lastAssistantMessageId}
          avatarState={message.role === "assistant" ? (isSending && message.id === lastAssistantMessageId ? liveAssistantMotionState : "idle") : undefined}
        >
          {message.role === "assistant" && message.uiTurn ? <AgUiTurnRenderer turn={message.uiTurn} /> : null}
        </MessageRow>
      ))}
      <TeamLabels isSending={isSending} activeTeamLabel={activeTeamLabel} completedTeamLabels={completedTeamLabels} />
      <ExecutionStatusPanel isSending={isSending} stageHistory={stageHistory} streamLifecycleStatus={streamLifecycleStatus} />
      {isSending ? <TypingIndicator state={liveAssistantMotionState} text={liveStageLabel} /> : null}
    </div>
  );
}

export function ThreadView({ scrollRef, thread, lastAssistantMessageId, ...props }: ThreadViewProps) {
  return (
    <>
      <ThreadHeader thread={thread} />
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
        <ThreadMessages
          thread={thread}
          isSending={props.isSending}
          lastAssistantMessageId={lastAssistantMessageId}
          liveAssistantMotionState={props.liveAssistantMotionState}
          activeTeamLabel={props.activeTeamLabel}
          completedTeamLabels={props.completedTeamLabels}
          stageHistory={props.stageHistory}
          streamLifecycleStatus={props.streamLifecycleStatus}
          liveStageLabel={props.liveStageLabel}
        />
      </div>
      <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-4xl">
          <AssistantComposer {...props} layout="thread" />
        </div>
      </div>
    </>
  );
}

export function LandingView(props: AssistantComposerProps) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <AIMotionLogo state="idle" size="standard" className="mb-6" />
          <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">كيف يمكنني مساعدتك؟</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">ابدأ من هنا أو افتح أي محادثة سابقة من السجل الجانبي لمتابعة العمل داخل المساحة نفسها.</p>
        </div>
        <div className="mx-auto mt-8 max-w-2xl">
          <AssistantComposer {...props} layout="landing" />
        </div>
      </div>
    </div>
  );
}
