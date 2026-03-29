"use client";

import {
  ChatMessageArea as Conversation,
  ChatMessageAreaContent as ConversationContent,
  ChatMessageAreaScrollButton as ConversationScrollButton,
} from "@/components/ui/chat-message-area";
import WorkspaceAssistantComposer from "../../../_components/Chat/WorkspaceAssistantComposer";
import MessageRow from "../../../_components/Chat/MessageRow";
import TypingIndicator from "../../../_components/Chat/TypingIndicator";
import AgUiTurnRenderer from "../../../_components/Chat/AgUiTurnRenderer";
import { AIMotionLogo, type AIMotionState } from "../../../_components/AIMotion";
import type { AnanProThread, AnanProInputMode } from "@/server/contracts/ananPro";
import type { SessionUser } from "@/server/contracts/session";
import type { WorkspaceAudience } from "@/server/contracts/workspace";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Loader2, BrainCircuit, Target, CheckSquare, Wand2, Mic, Square, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState, type CSSProperties } from "react";

export type AssistantComposerProps = {
  audience: WorkspaceAudience;
  value: string;
  sendError: string | null;
  isSending: boolean;
  isVoicePanelOpen: boolean;
  isVoiceRecording: boolean;
  isVoiceTranscribing: boolean;
  voicePermissionState: "unknown" | "unsupported" | "prompt" | "granted" | "denied";
  voiceProcessingPhase: "idle" | "waiting_for_permission" | "waiting_for_speech" | "recording" | "silence_countdown" | "uploading" | "transcribing" | "sending" | "error";
  canRegenerate: boolean;
  activeTeamId: string | null;
  activeAgentName: string | null;
  voiceElapsedMs: number;
  voiceLevels: number[];
  onToggleVoiceRecording: () => void;
  onStopVoiceRecording: () => void | Promise<void>;
  onCancelVoiceRecording: () => void;
  onRequestVoicePermission: () => void | Promise<void>;
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

const DEFAULT_COMPOSER_STACK_HEIGHT = 180;
const ASSISTANT_COMPOSER_DOCK_INSET = "calc(env(safe-area-inset-bottom) + 2.5rem)";
const ASSISTANT_SCROLL_BUTTON_GAP = "5px";
const ASSISTANT_CONTENT_END_GAP = "50px";
const SUGGESTION_CHIPS = [
  {
    label: "أنشئ عرض سعر لعميل مهتم بمشروع سكني",
    icon: Target,
    colorClass: "text-amber-500",
  },
  {
    label: "حلّل حركة السوق العقاري في الرياض هذا الأسبوع",
    icon: BrainCircuit,
    colorClass: "text-blue-500",
  },
  {
    label: "ما هي المشاريع الجديدة القريبة من منافسينا؟",
    icon: Wand2,
    colorClass: "text-emerald-500",
  },
  {
    label: "قارن أداء الوسطاء في فريقي خلال آخر ٣٠ يوم",
    icon: CheckSquare,
    colorClass: "text-rose-500",
  },
];

function formatVoiceElapsed(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function VoiceErrorBanner({
  sendError,
}: Pick<AssistantComposerProps, "sendError">) {
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
    </AnimatePresence>
  );
}

function VoiceRecorderPanel(props: Pick<
  AssistantComposerProps,
  "isVoicePanelOpen" | "isVoiceRecording" | "isVoiceTranscribing" | "voicePermissionState" | "voiceProcessingPhase" | "voiceElapsedMs" | "voiceLevels" | "sendError" | "onStopVoiceRecording" | "onCancelVoiceRecording" | "onRequestVoicePermission"
>) {
  const phaseLabel =
    props.voiceProcessingPhase === "waiting_for_permission"
      ? "نجهز الميكروفون الآن"
      : props.voiceProcessingPhase === "waiting_for_speech"
        ? "بانتظار بداية الحديث"
        : props.voiceProcessingPhase === "silence_countdown"
          ? "سيتم الإرسال بعد لحظة صمت"
          : props.voiceProcessingPhase === "uploading"
            ? "نرفع التسجيل"
            : props.voiceProcessingPhase === "transcribing"
              ? "نحلل التسجيل"
              : props.voiceProcessingPhase === "sending"
                ? "نرسل الرسالة"
                : props.voiceProcessingPhase === "error"
                  ? "حدثت مشكلة في التسجيل"
                  : "جاري التسجيل";
  const isProcessing =
    props.voiceProcessingPhase === "uploading" ||
    props.voiceProcessingPhase === "transcribing" ||
    props.voiceProcessingPhase === "sending" ||
    props.isVoiceTranscribing;
  const showPermissionRetry =
    props.voiceProcessingPhase === "error" &&
    (props.voicePermissionState === "denied" || props.voicePermissionState === "prompt" || props.voicePermissionState === "unsupported");

  return (
    <AnimatePresence>
      {props.isVoicePanelOpen ? (
        <motion.div
          initial={{ opacity: 0, y: 22, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.98 }}
          transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
          className="mb-5"
          data-slot="assistant-voice-panel"
        >
          <div className="overflow-hidden rounded-[32px] border border-[color:color-mix(in_srgb,var(--workspace-highlight)_22%,var(--workspace-border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--workspace-highlight)_15%,var(--workspace-panel))_0%,var(--workspace-panel)_48%,color-mix(in_srgb,var(--workspace-highlight)_6%,transparent)_100%)] shadow-[0_22px_60px_rgba(0,0,0,0.22)]">
            <div className="flex items-start justify-between gap-4 border-b border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] px-5 py-5" dir="rtl">
              <div className="min-w-0">
                <div className="flex items-center justify-end gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:color-mix(in_srgb,var(--workspace-highlight)_18%,transparent)] text-[var(--workspace-highlight)]">
                    {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mic className="h-5 w-5" />}
                  </div>
                  <div className="text-right">
                    <p className="text-[15px] font-black text-[var(--workspace-bubble-other-foreground)]">التسجيل الصوتي</p>
                    <p className="mt-1 text-[12px] font-medium text-[var(--workspace-muted)]">{phaseLabel}</p>
                  </div>
                </div>
                {props.sendError && props.voiceProcessingPhase === "error" ? (
                  <p className="mt-3 text-[12px] font-bold text-red-500">{props.sendError}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={props.onCancelVoiceRecording}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-panel)] text-[var(--workspace-muted)] transition hover:text-[var(--workspace-bubble-other-foreground)]"
                aria-label="إغلاق لوحة التسجيل"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-5 py-5">
              <div className="rounded-[24px] border border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-sidebar)_78%,transparent)] px-4 py-4">
                <div className="flex items-end justify-between gap-4" dir="rtl">
                  <div className="min-w-0">
                    <div className="text-[28px] font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]">
                      {formatVoiceElapsed(props.voiceElapsedMs)}
                    </div>
                    <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--workspace-muted)]">
                      {props.isVoiceRecording ? "Live Input" : isProcessing ? "Processing" : "Ready"}
                    </div>
                  </div>
                  <div className="flex h-16 flex-1 items-end justify-end gap-[4px]">
                    {props.voiceLevels.map((level, index) => (
                      <motion.span
                        key={index}
                        initial={{ height: 6 }}
                        animate={{ height: Math.max(8, Math.round(level * 40)) }}
                        transition={{ type: "spring", stiffness: 340, damping: 24 }}
                        className="w-[6px] rounded-full bg-[linear-gradient(to_top,var(--workspace-highlight),color-mix(in_srgb,var(--workspace-highlight)_38%,white))]"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3" dir="rtl">
                <button
                  type="button"
                  onClick={props.onCancelVoiceRecording}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-[color:color-mix(in_srgb,var(--workspace-border)_78%,transparent)] bg-[var(--workspace-panel)] px-4 text-[12px] font-bold text-[var(--workspace-bubble-other-foreground)] transition hover:bg-[var(--workspace-elevated)]"
                >
                  إلغاء
                </button>
                <div className="flex items-center gap-2">
                  {showPermissionRetry ? (
                    <button
                      type="button"
                      onClick={() => void props.onRequestVoicePermission()}
                      className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--workspace-highlight)] px-4 text-[12px] font-black text-white shadow-md transition hover:brightness-110"
                    >
                      طلب الإذن مرة أخرى
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void props.onStopVoiceRecording()}
                    disabled={!props.isVoiceRecording}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[var(--workspace-highlight)] px-5 text-[12px] font-black text-white shadow-md transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <Square className="h-4 w-4 fill-current" />
                    إيقاف
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function AssistantComposer(props: AssistantComposerProps) {
  return (
    <motion.div layout className="flex flex-col gap-4">
      <VoiceErrorBanner sendError={props.sendError} />
      <VoiceRecorderPanel {...props} />
      <WorkspaceAssistantComposer
        audience={props.audience}
        value={props.value}
        onChange={props.onChange}
        onSend={props.onSend}
        layout={props.layout}
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

function useComposerStackHeight() {
  const composerStackRef = useRef<HTMLDivElement | null>(null);
  const [composerStackHeight, setComposerStackHeight] = useState(DEFAULT_COMPOSER_STACK_HEIGHT);

  useEffect(() => {
    const composerStackElement = composerStackRef.current;
    if (!composerStackElement) return;

    const updateHeight = () => {
      setComposerStackHeight(composerStackElement.offsetHeight || DEFAULT_COMPOSER_STACK_HEIGHT);
    };

    updateHeight();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => updateHeight());
    observer.observe(composerStackElement);
    return () => observer.disconnect();
  }, []);

  return { composerStackRef, composerStackHeight };
}

function AssistantSurface({
  dockSlot,
  children,
  ...props
}: AssistantComposerProps & {
  dockSlot: "landing-composer-dock" | "thread-composer-dock";
  children: React.ReactNode;
}) {
  const { composerStackRef, composerStackHeight } = useComposerStackHeight();
  const surfaceStyle = {
    ["--assistant-composer-height" as string]: `${composerStackHeight}px`,
    ["--assistant-composer-dock-inset" as string]: ASSISTANT_COMPOSER_DOCK_INSET,
    ["--assistant-scroll-button-gap" as string]: ASSISTANT_SCROLL_BUTTON_GAP,
    ["--assistant-content-end-gap" as string]: ASSISTANT_CONTENT_END_GAP,
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
          <ConversationContent className="mx-auto w-full max-w-4xl gap-12 pt-12 pb-[calc(var(--assistant-composer-height)+var(--assistant-composer-dock-inset)+var(--assistant-content-end-gap))]">
            {children}
          </ConversationContent>
          <ConversationScrollButton
            alignment="center"
            className="bottom-[calc(var(--assistant-composer-height)+var(--assistant-composer-dock-inset)+var(--assistant-scroll-button-gap))] shadow-2xl"
          />
        </Conversation>

        <motion.div
          layout
          data-slot={dockSlot}
          className="pointer-events-none sticky bottom-0 z-30 shrink-0 px-6 pb-[var(--assistant-composer-dock-inset)] sm:px-10 lg:px-16"
        >
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-[280px] bg-[linear-gradient(to_top,color-mix(in_srgb,var(--workspace-highlight)_10%,transparent)_0%,color-mix(in_srgb,var(--workspace-highlight)_5%,transparent)_22%,color-mix(in_srgb,var(--workspace-highlight)_2%,transparent)_48%,transparent_100%)] backdrop-blur-[1.5px]"
          />
          <div ref={composerStackRef} className="mx-auto w-full max-w-3xl pointer-events-auto" data-slot="thread-composer-shell">
            <AssistantComposer {...props} />
          </div>
        </motion.div>
      </motion.div>
    </LayoutGroup>
  );
}

function ThreadMessages({
  thread,
  isSending,
  lastAssistantMessageId,
  liveAssistantMotionState,
  liveStageLabel,
  activeTeamId,
  activeAgentName,
}: {
  thread: AnanProThread | null;
  isSending: boolean;
  lastAssistantMessageId: string | undefined;
  liveAssistantMotionState: AIMotionState;
  liveStageLabel: string;
  activeTeamId: string | null;
  activeAgentName: string | null;
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
            content={message.content}
            meta={message.meta}
            attachments={message.attachments}
            fallbackTeamId={activeTeamId}
            fallbackAgentName={activeAgentName}
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
          <TypingIndicator state={liveAssistantMotionState} text={liveStageLabel} activeTeamId={activeTeamId} activeAgentName={activeAgentName} />
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
        thread={thread}
        isSending={props.isSending}
        lastAssistantMessageId={lastAssistantMessageId}
        liveAssistantMotionState={props.liveAssistantMotionState}
        liveStageLabel={props.liveStageLabel}
        activeTeamId={props.activeTeamId}
        activeAgentName={props.activeAgentName}
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
                تعذر العثور على المحادثة المطلوبة.
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

          <div className="flex flex-col items-center gap-6 text-center pt-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "backOut" }}
              className="mb-2"
            >
              <AIMotionLogo state="idle" size="standard" />
            </motion.div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 uppercase">
              كيف يمكنني مساعدتك اليوم؟
            </h1>
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
            {SUGGESTION_CHIPS.map((chip) => {
              const Icon = chip.icon;
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => props.onSend(chip.label)}
                  className="flex h-14 w-full items-center justify-start gap-4 rounded-full border border-slate-200/60 bg-white px-5 text-[13px] font-bold transition-all hover:bg-slate-50 hover:shadow-sm dark:border-white/5 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.06] active:scale-[0.98] text-right"
                >
                  <Icon className={cn("h-[18px] w-[18px] shrink-0", chip.colorClass)} strokeWidth={2.5} />
                  <span className="truncate pt-[2px]">{chip.label}</span>
                </button>
              );
            })}
          </motion.div>
        </motion.div>
      </motion.div>
    </LayoutGroup>
  );
}
