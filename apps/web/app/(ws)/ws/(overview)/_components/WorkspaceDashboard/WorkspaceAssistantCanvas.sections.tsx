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
import type { AnanProThread } from "@/server/contracts/ananPro";
import type { SessionUser } from "@/server/contracts/session";
import type { UploadedFileReference } from "@/server/contracts/files";
import type { WorkspaceAudience } from "@/server/contracts/workspace";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Loader2, BrainCircuit, Target, CheckSquare, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";

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
  onSend: (message?: string, inputMode?: "text" | "voice" | "attachment", attachments?: UploadedFileReference[]) => void;
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

const DEFAULT_COMPOSER_DOCK_HEIGHT = 208;
const SUGGESTION_CHIPS = [
  {
    label: "حلّل حركة السوق العقاري في الرياض هذا الأسبوع",
    icon: BrainCircuit,
    colorClass: "text-[var(--workspace-highlight)]",
  },
  {
    label: "أنشئ عرض سعر لعميل مهتم بمشروع سكني",
    icon: Target,
    colorClass: "text-amber-400",
  },
  {
    label: "قارن أداء الوسطاء في فريقي خلال آخر ٣٠ يوم",
    icon: CheckSquare,
    colorClass: "text-rose-400",
  },
  {
    label: "ما هي المشاريع الجديدة القريبة من منافسينا؟",
    icon: Wand2,
    colorClass: "text-emerald-400",
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
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="mb-3 rounded-[8px] border border-red-100 bg-red-50 px-4 py-2.5 text-right text-sm text-red-700"
        >
          {sendError}
        </motion.div>
      ) : null}
      {isVoiceRecording ? (
        <motion.div
          key="recording"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="mb-3 flex items-center justify-end gap-2 text-right text-xs font-semibold text-red-600"
        >
          {voiceProcessingPhase === "waiting_for_speech"
            ? "الميكروفون يعمل وينتظر صوتك..."
            : voiceProcessingPhase === "silence_countdown"
              ? "تم التقاط صوتك وسيتم الإرسال بعد لحظة صمت..."
              : `جاري التسجيل الصوتي... ${formatVoiceElapsed(voiceElapsedMs)}`}
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />
        </motion.div>
      ) : null}
      {voiceProcessingPhase === "uploading" ? (
        <motion.div
          key="uploading"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="mb-3 flex items-center justify-end gap-2 text-right text-xs font-medium text-slate-500 dark:text-slate-400"
          
        >
          جاري رفع التسجيل الصوتي...
          <Loader2 className="h-3 w-3 animate-spin" />
        </motion.div>
      ) : null}
      {voiceProcessingPhase === "transcribing" || isVoiceTranscribing ? (
        <motion.div
          key="transcribing"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="mb-3 flex items-center justify-end gap-2 text-right text-xs font-medium text-[var(--workspace-muted)]"
        >
          جاري تفريغ الرسالة الصوتية...
          <Loader2 className="h-3 w-3 animate-spin" />
        </motion.div>
      ) : null}
      {voiceProcessingPhase === "sending" ? (
        <motion.div
          key="sending"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="mb-3 flex items-center justify-end gap-2 text-right text-xs font-medium text-[var(--workspace-muted)]"
        >
          جاري إرسال النص إلى المساعد...
          <Loader2 className="h-3 w-3 animate-spin" />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function AssistantComposer(props: AssistantComposerProps) {
  return (
    <motion.div layout className="flex flex-col gap-3">
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
        onStopGenerating={props.onStopStreaming}
        onRegenerate={props.onRegenerate}
        canRegenerate={props.canRegenerate}
        onMicToggle={props.onToggleVoiceRecording}
        isMicRecording={props.isVoiceRecording}
        isMicProcessing={props.isVoiceTranscribing}
        voiceProcessingPhase={props.voiceProcessingPhase}
        micLevels={props.voiceLevels}
        layout={props.layout}
      />
    </motion.div>
  );
}

function useComposerDockHeight() {
  const composerDockRef = useRef<HTMLDivElement | null>(null);
  const [composerDockHeight, setComposerDockHeight] = useState(DEFAULT_COMPOSER_DOCK_HEIGHT);

  useEffect(() => {
    const dockElement = composerDockRef.current;
    if (!dockElement) {
      return;
    }

    const updateHeight = () => {
      setComposerDockHeight(dockElement.offsetHeight || DEFAULT_COMPOSER_DOCK_HEIGHT);
    };

    updateHeight();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(() => updateHeight());
    observer.observe(dockElement);

    return () => observer.disconnect();
  }, []);

  return { composerDockRef, composerDockHeight };
}

function MessageAttachments({ attachments }: { attachments: UploadedFileReference[] | undefined }) {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap justify-end gap-2">
      {attachments.map((attachment) => {
        const isImage = attachment.mime?.startsWith("image/");
        return (
          <a
            key={attachment.key}
            href={attachment.url}
            target="_blank"
            rel="noreferrer"
            className="flex max-w-[220px] items-center gap-3 rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] px-3 py-2 text-right shadow-none"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-[var(--workspace-bubble-other-foreground)]">{attachment.name}</div>
              <div className="mt-0.5 text-xs text-[var(--workspace-muted)]">
                {typeof attachment.size === "number"
                  ? `${Math.max(1, Math.round(attachment.size / 1024))} KB`
                  : attachment.mime ?? "ملف مرفق"}
              </div>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)]">
              {isImage ? (
                <Image
                  src={attachment.url}
                  alt={attachment.name}
                  width={48}
                  height={48}
                  unoptimized
                  loader={({ src }) => src}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-[10px] font-semibold text-[var(--workspace-muted)]">FILE</div>
              )}
            </div>
          </a>
        );
      })}
    </div>
  );
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
        className="flex min-h-0 flex-1 flex-col bg-[var(--workspace-canvas)] text-[var(--workspace-bubble-other-foreground)]"
        style={surfaceStyle}
      >
        <Conversation className="min-h-0 flex-1 px-4 sm:px-6 lg:px-8">
          <ConversationContent className="mx-auto w-full max-w-5xl gap-6 pt-6 pb-[calc(var(--assistant-composer-offset)+2.5rem)] sm:pt-8">
            {children}
          </ConversationContent>
          <ConversationScrollButton className="bottom-[calc(env(safe-area-inset-bottom)+var(--assistant-composer-offset)+1.5rem)]" />
        </Conversation>
        <motion.div
          ref={composerDockRef}
          layout
          data-slot={dockSlot}
          className="sticky bottom-0 z-20 shrink-0 bg-gradient-to-t from-[var(--workspace-shell)] via-[color:color-mix(in_srgb,var(--workspace-shell)_96%,transparent)] to-transparent px-4 pt-6 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:px-6 lg:px-8"
        >
          <div className="mx-auto w-full max-w-3xl">
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
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      {thread?.messages.map((message) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
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
            {message.role === "user" ? <MessageAttachments attachments={message.attachments} /> : null}
            {message.role === "assistant" && message.uiTurn ? (
              <AgUiTurnRenderer turn={message.uiTurn} />
            ) : null}
          </MessageRow>
        </motion.div>
      ))}
      {isSending ? (
        <TypingIndicator state={liveAssistantMotionState} text={liveStageLabel} />
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
        className="flex min-h-0 flex-1 items-center justify-center bg-[var(--workspace-canvas)] px-4 py-8 sm:px-6 lg:px-8"
      >
        <motion.div
          data-slot="assistant-landing-panel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8"
        >
          {props.unavailableThreadId ? (
            <div
              data-slot="assistant-unavailable-thread"
              className="w-full max-w-2xl rounded-[8px] border border-amber-200 bg-amber-50 px-4 py-4 text-right dark:border-amber-500/30 dark:bg-amber-500/10"
            >
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                تعذر العثور على المحادثة المطلوبة أو لم تعد متاحة.
              </p>
              <div className="mt-3 flex items-center justify-end">
                <button
                  type="button"
                  onClick={props.onResetUnavailableThread}
                  className="inline-flex items-center rounded-[8px] border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-900 transition hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 dark:border-amber-500/30 dark:bg-slate-900 dark:text-amber-200 dark:hover:bg-amber-500/10"
                >
                  بدء محادثة جديدة
                </button>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col items-center gap-3 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            >
              <AIMotionLogo state="idle" size="standard" />
            </motion.div>
            <h1 className="text-xl font-semibold text-[var(--workspace-bubble-other-foreground)]">
              كيف يمكنني مساعدتك اليوم؟
            </h1>
          </div>

          <motion.div
            data-slot="landing-composer-dock"
            className="w-full max-w-2xl"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
          >
            <AssistantComposer {...props} />
          </motion.div>

          <motion.div
            className="flex w-full max-w-2xl flex-wrap items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.35, ease: "easeOut" }}
            dir="rtl"
          >
            {SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => props.onSend(chip.label)}
                className="flex items-center gap-2 rounded-full border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] px-4 py-2 text-[13px] font-medium text-[var(--workspace-muted)] transition-all hover:border-[color:color-mix(in_srgb,var(--workspace-highlight)_28%,transparent)] hover:bg-[var(--workspace-elevated)] hover:text-[var(--workspace-bubble-other-foreground)] active:scale-[0.98]"
              >
                <chip.icon className={cn("h-3.5 w-3.5 shrink-0", chip.colorClass)} />
                <span className="whitespace-nowrap">{chip.label}</span>
              </button>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </LayoutGroup>
  );
}
