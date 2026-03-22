"use client";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/app/(ws)/ws/_components/ai-elements/conversation";
import { Suggestion, Suggestions } from "@/app/(ws)/ws/_components/ai-elements/suggestion";
import InstitutionalChatInput from "../../../_components/Chat/InstitutionalChatInput";
import MessageRow from "../../../_components/Chat/MessageRow";
import TypingIndicator from "../../../_components/Chat/TypingIndicator";
import AgUiTurnRenderer from "../../../_components/Chat/AgUiTurnRenderer";
import { AIMotionLogo, type AIMotionState } from "../../../_components/AIMotion";
import type { AnanProThread } from "@/server/contracts/ananPro";
import type { SessionUser } from "@/server/contracts/session";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";

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
  user: SessionUser;
  thread: AnanProThread | null;
  isSending: boolean;
  lastAssistantMessageId: string | undefined;
  liveAssistantMotionState: AIMotionState;
  liveStageLabel: string;
};

const DEFAULT_COMPOSER_DOCK_HEIGHT = 208;
const SUGGESTION_CHIPS = [
  "ما هي أكثر المناطق طلبًا هذا الشهر؟",
  "أنشئ عرضًا لمشروع جديد",
  "ابحث في المشاريع المتاحة",
  "ما هو أداء وسطائي؟",
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
          جاري التسجيل الصوتي... {formatVoiceElapsed(voiceElapsedMs)}
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />
        </motion.div>
      ) : null}
      {voiceProcessingPhase === "uploading" ? (
        <motion.div
          key="uploading"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="mb-3 flex items-center justify-end gap-2 text-right text-xs font-medium text-slate-500"
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
          className="mb-3 flex items-center justify-end gap-2 text-right text-xs font-medium text-slate-500"
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
          className="mb-3 flex items-center justify-end gap-2 text-right text-xs font-medium text-slate-500"
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
        className="flex min-h-0 flex-1 flex-col bg-[#f5f3ef]"
        style={surfaceStyle}
      >
        <Conversation className="min-h-0 flex-1 px-4 sm:px-6 lg:px-8">
          <ConversationContent className="mx-auto w-full max-w-5xl gap-6 pt-6 pb-[calc(var(--assistant-composer-offset)+1.5rem)] sm:pt-8">
            {children}
          </ConversationContent>
          <ConversationScrollButton className="bottom-[calc(env(safe-area-inset-bottom)+var(--assistant-composer-offset)+1rem)]" />
        </Conversation>
        <motion.div
          ref={composerDockRef}
          layout
          data-slot={dockSlot}
          className="sticky bottom-0 z-20 shrink-0 border-t border-slate-200 bg-white px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.875rem)] sm:px-6 lg:px-8"
        >
          <div className="mx-auto w-full max-w-5xl">
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

export function LandingView(props: AssistantComposerProps) {
  return (
    <LayoutGroup id="workspace-assistant-surface">
      <motion.div
        data-slot="assistant-surface"
        className="flex min-h-0 flex-1 items-center justify-center bg-[#f5f3ef] px-4 py-6 sm:px-6 lg:px-8"
      >
        <motion.div
        data-slot="assistant-landing-panel"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="mx-auto flex w-full max-w-2xl flex-col gap-6 rounded-[8px] border border-stone-300 bg-white p-6 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.25)]"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-[8px] border border-stone-300 bg-stone-50">
            <AIMotionLogo state="idle" size="standard" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-slate-950">مساعد عنان</p>
            <p className="text-sm leading-6 text-slate-500">
              اطلب تحليلًا سريعًا، أنشئ عرضًا، أو ابدأ سؤالًا جديدًا من نفس مساحة العمل.
            </p>
          </div>
        </div>

        <div data-slot="landing-composer-dock" className="space-y-3">
          <AssistantComposer {...props} />
        </div>

        <div className="space-y-3">
          <p className="text-right text-sm font-medium text-slate-600">
            جرّب واحدة من هذه الرسائل السريعة:
          </p>
          <Suggestions className="w-full justify-end">
            {SUGGESTION_CHIPS.map((chip) => (
              <Suggestion
                key={chip}
                onClick={() => props.onSend(chip)}
                suggestion={chip}
                className="rounded-[8px] border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950"
              >
                {chip}
              </Suggestion>
            ))}
          </Suggestions>
        </div>
      </motion.div>
    </motion.div>
  </LayoutGroup>
  );
}
