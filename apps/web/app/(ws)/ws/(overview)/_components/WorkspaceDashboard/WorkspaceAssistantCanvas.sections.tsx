"use client";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/app/(ws)/ws/_components/ai-elements/conversation";
import WorkspaceAssistantComposer from "../../../_components/Chat/WorkspaceAssistantComposer";
import MessageRow from "../../../_components/Chat/MessageRow";
import TypingIndicator from "../../../_components/Chat/TypingIndicator";
import AgUiTurnRenderer from "../../../_components/Chat/AgUiTurnRenderer";
import { AIMotionLogo, type AIMotionState } from "../../../_components/AIMotion";
import type { AnanProThread, AnanProInputMode } from "@/server/contracts/ananPro";
import type { SessionUser } from "@/server/contracts/session";
import type { WorkspaceAudience } from "@/server/contracts/workspace";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Loader2, BrainCircuit, Target, CheckSquare, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState, type CSSProperties } from "react";

export type AssistantComposerProps = {
  audience: WorkspaceAudience;
  value: string;
  sendError: string | null;
  isSending: boolean;
  isVoiceRecording: boolean;
  isVoiceTranscribing: boolean;
  voiceProcessingPhase: "idle" | "waiting_for_speech" | "recording" | "silence_countdown" | "uploading" | "transcribing" | "sending" | "error";
  canRegenerate: boolean;
  voiceElapsedMs: number;
  voiceLevels: number[];
  onToggleVoiceRecording: () => void;
  onStopStreaming: () => void;
  onRegenerate: () => void;
  onChange: (value: string) => void;
  onSend: (message?: string, inputMode?: AnanProInputMode) => void;
  layout: "thread" | "landing";
};

type LandingViewProps = AssistantComposerProps & {
  unavailableThreadId?: string | null;
  onResetUnavailableThread?: () => void;
};

type ThreadViewProps = AssistantComposerProps & {
  user: SessionUser;
  thread: AnanProThread | null;
  isSending: boolean;
  lastAssistantMessageId: string | undefined;
  liveAssistantMotionState: AIMotionState;
  liveStageLabel: string;
};

const DEFAULT_COMPOSER_DOCK_HEIGHT = 180;
const SUGGESTION_CHIPS = [
  {
    label: "حلّل حركة السوق العقاري في الرياض هذا الأسبوع",
    icon: BrainCircuit,
    colorClass: "text-blue-500",
  },
  {
    label: "أنشئ عرض سعر لعميل مهتم بمشروع سكني",
    icon: Target,
    colorClass: "text-amber-500",
  },
  {
    label: "قارن أداء الوسطاء في فريقي خلال آخر ٣٠ يوم",
    icon: CheckSquare,
    colorClass: "text-rose-500",
  },
  {
    label: "ما هي المشاريع الجديدة القريبة من منافسينا؟",
    icon: Wand2,
    colorClass: "text-emerald-500",
  },
];

function formatVoiceElapsed(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function VoiceStatusBanners({
  sendError,
  isVoiceRecording,
  isVoiceTranscribing,
  voiceElapsedMs,
  voiceProcessingPhase,
}: Pick<AssistantComposerProps, "sendError" | "isVoiceRecording" | "isVoiceTranscribing" | "voiceElapsedMs" | "voiceProcessingPhase">) {
  return (
    <AnimatePresence mode="wait">
      {sendError ? (
        <motion.div
          key="error"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="mb-4 rounded-3xl border border-red-100 bg-red-50/50 px-6 py-4 text-right text-sm font-bold text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400 shadow-sm"
        >
          {sendError}
        </motion.div>
      ) : null}
      {isVoiceRecording ? (
        <motion.div
          key="recording"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="mb-4 flex flex-row-reverse items-center justify-center gap-4 text-right text-[13px] font-black uppercase tracking-widest text-red-600 bg-red-50 dark:bg-red-900/10 rounded-full px-6 py-3 self-center shadow-sm"
        >
          <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-red-500" />
          {voiceProcessingPhase === "waiting_for_speech"
            ? "بانتظار صوتك..."
            : voiceProcessingPhase === "silence_countdown"
              ? "سيتم الإرسال بعد لحظة..."
              : `جاري التسجيل... ${formatVoiceElapsed(voiceElapsedMs)}`}
        </motion.div>
      ) : null}
      {(voiceProcessingPhase === "uploading" || voiceProcessingPhase === "transcribing" || isVoiceTranscribing || voiceProcessingPhase === "sending") && (
        <motion.div
          key="processing"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-4 flex flex-row-reverse items-center justify-center gap-3 text-right text-[12px] font-black uppercase tracking-[0.2em] text-slate-400"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          {voiceProcessingPhase === "uploading" && "جاري الرفع..."}
          {(voiceProcessingPhase === "transcribing" || isVoiceTranscribing) && "جاري التحليل..."}
          {voiceProcessingPhase === "sending" && "جاري الإرسال..."}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AssistantComposer(props: AssistantComposerProps) {
  return (
    <motion.div layout className="flex flex-col gap-4">
      <VoiceStatusBanners
        sendError={props.sendError}
        isVoiceRecording={props.isVoiceRecording}
        isVoiceTranscribing={props.isVoiceTranscribing}
        voiceElapsedMs={props.voiceElapsedMs}
        voiceProcessingPhase={props.voiceProcessingPhase}
      />
      <WorkspaceAssistantComposer
        audience={props.audience}
        value={props.value}
        onChange={props.onChange}
        onSend={props.onSend}
        isSending={props.isSending}
        onMicToggle={props.onToggleVoiceRecording}
        isMicRecording={props.isVoiceRecording}
        isMicProcessing={props.isVoiceTranscribing}
        voiceProcessingPhase={props.voiceProcessingPhase}
        micLevels={props.voiceLevels}
      />
    </motion.div>
  );
}

function useComposerDockHeight() {
  const composerDockRef = useRef<HTMLDivElement | null>(null);
  const [composerDockHeight, setComposerDockHeight] = useState(DEFAULT_COMPOSER_DOCK_HEIGHT);

  useEffect(() => {
    const dockElement = composerDockRef.current;
    if (!dockElement) return;

    const updateHeight = () => {
      setComposerDockHeight(dockElement.offsetHeight || DEFAULT_COMPOSER_DOCK_HEIGHT);
    };

    updateHeight();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => updateHeight());
    observer.observe(dockElement);
    return () => observer.disconnect();
  }, []);

  return { composerDockRef, composerDockHeight };
}

function AssistantSurface({
  dockSlot,
  children,
  ...props
}: AssistantComposerProps & {
  dockSlot: "landing-composer-dock" | "thread-composer-dock";
  children: React.ReactNode;
}) {
  const { composerDockRef, composerDockHeight } = useComposerDockHeight();
  const surfaceStyle = {
    ["--assistant-composer-offset" as string]: `${composerDockHeight}px`,
  } as CSSProperties;

  return (
    <LayoutGroup id="workspace-assistant-surface">
      <motion.div
        layout
        data-slot="assistant-surface"
        className="flex min-h-0 flex-1 flex-col bg-background text-slate-900 dark:text-slate-100"
        style={surfaceStyle}
      >
        <Conversation className="min-h-0 flex-1 px-6 sm:px-10 lg:px-16">
          <ConversationContent className="mx-auto w-full max-w-4xl gap-12 pt-12 pb-[calc(var(--assistant-composer-offset)+4rem)]">
            {children}
          </ConversationContent>
          <ConversationScrollButton className="bottom-[calc(env(safe-area-inset-bottom)+var(--assistant-composer-offset)+3rem)] shadow-2xl" />
        </Conversation>

        <motion.div
          ref={composerDockRef}
          layout
          data-slot={dockSlot}
          className="pointer-events-none sticky bottom-0 z-30 shrink-0 px-6 pb-[calc(env(safe-area-inset-bottom)+2.5rem)] sm:px-10 lg:px-16"
        >
          <div className="mx-auto w-full max-w-3xl pointer-events-auto">
            <AssistantComposer {...props} />
          </div>
        </motion.div>
      </motion.div>
    </LayoutGroup>
  );
}

function ThreadMessages({
  user,
  thread,
  isSending,
  lastAssistantMessageId,
  liveAssistantMotionState,
  liveStageLabel,
}: {
  user: SessionUser;
  thread: AnanProThread | null;
  isSending: boolean;
  lastAssistantMessageId: string | undefined;
  liveAssistantMotionState: AIMotionState;
  liveStageLabel: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-12">
      {thread?.messages.map((message) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        >
          <MessageRow
            isUser={message.role === "user"}
            user={user}
            content={message.content}
            isStreaming={
              message.role === "assistant" && isSending && message.id === lastAssistantMessageId
            }
            avatarState={
              message.role === "assistant"
                ? isSending && message.id === lastAssistantMessageId
                  ? liveAssistantMotionState
                  : "idle"
                : undefined
            }
          >
            {message.role === "assistant" && message.uiTurn ? (
              <div className="mt-6">
                <AgUiTurnRenderer turn={message.uiTurn} />
              </div>
            ) : null}
          </MessageRow>
        </motion.div>
      ))}
      {isSending ? (
        <div className="pt-4">
          <TypingIndicator state={liveAssistantMotionState} text={liveStageLabel} />
        </div>
      ) : null}
    </div>
  );
}

export function ThreadView({
  thread,
  lastAssistantMessageId,
  ...props
}: ThreadViewProps) {
  return (
    <AssistantSurface {...props} dockSlot="thread-composer-dock">
      <ThreadMessages
        user={props.user}
        thread={thread}
        isSending={props.isSending}
        lastAssistantMessageId={lastAssistantMessageId}
        liveAssistantMotionState={props.liveAssistantMotionState}
        liveStageLabel={props.liveStageLabel}
      />
    </AssistantSurface>
  );
}

export function LandingView(props: LandingViewProps) {
  return (
    <LayoutGroup id="workspace-assistant-surface">
      <motion.div
        data-slot="assistant-surface"
        className="flex min-h-0 flex-1 items-center justify-center bg-background px-6 py-10 sm:px-10 lg:px-16"
      >
        <motion.div
          data-slot="assistant-landing-panel"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="mx-auto flex w-full max-w-2xl flex-col items-center gap-12"
        >
          {props.unavailableThreadId ? (
            <div
              data-slot="assistant-unavailable-thread"
              className="w-full rounded-[32px] border border-amber-100 bg-amber-50/50 px-8 py-6 text-right dark:border-amber-900/20 dark:bg-amber-900/10 shadow-sm"
            >
              <p className="text-[15px] font-black text-amber-900 dark:text-amber-200 uppercase tracking-tight">
                تعذر العثور على المحادثة.
              </p>
              <div className="mt-6 flex items-center justify-end">
                <button
                  type="button"
                  onClick={props.onResetUnavailableThread}
                  className="inline-flex items-center rounded-full bg-amber-900 px-6 py-3 text-[12px] font-black uppercase tracking-widest text-white transition hover:bg-amber-800 shadow-md active:scale-95"
                >
                  بدء محادثة جديدة
                </button>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col items-center gap-6 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "backOut" }}
              className="mb-4"
            >
              <AIMotionLogo state="idle" size="standard" />
            </motion.div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-slate-50 uppercase">
              كيف يمكنني مساعدتك؟
            </h1>
            <p className="max-w-md text-[16px] font-bold leading-relaxed text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              اسألني عن السوق، العروض، أو العقارات
            </p>
          </div>

          <motion.div
            data-slot="landing-composer-dock"
            className="w-full"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          >
            <AssistantComposer {...props} />
          </motion.div>

          <motion.div
            className="grid w-full grid-cols-1 sm:grid-cols-2 gap-3 pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
            dir="rtl"
          >
            {SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => props.onSend(chip.label)}
                className="flex h-16 items-center justify-center rounded-2xl border border-slate-200/60 bg-slate-50/50 px-5 py-3 text-[13px] font-bold text-slate-600 transition-all hover:bg-slate-50 hover:shadow-sm dark:border-slate-800/60 dark:bg-slate-900/40 dark:text-slate-400 dark:hover:bg-slate-800/80 active:scale-[0.98] text-center leading-relaxed"
              >
                <span className="line-clamp-2">{chip.label}</span>
              </button>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </LayoutGroup>
  );
}
