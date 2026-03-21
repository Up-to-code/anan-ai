"use client";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import InstitutionalChatInput from "@/components/shared/InstitutionalChatInput";
import MessageRow from "../../../_components/Chat/MessageRow";
import TypingIndicator from "../../../_components/Chat/TypingIndicator";
import AgUiTurnRenderer from "../../../_components/Chat/AgUiTurnRenderer";
import { AIMotionLogo } from "../../../_components/AIMotion";
import type { AnanProStreamStageEvent, AnanProThread } from "@/server/contracts/ananPro";
import type { SessionUser } from "@/server/contracts/session";
import type { AIMotionState } from "@/app/(ws)/ws/_components/AIMotion";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <AnimatePresence mode="wait">
      {sendError ? (
        <motion.div
          key="error"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="mb-3 rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-700"
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
          className="mb-3 flex items-center gap-2 text-xs font-semibold text-red-600"
        >
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />
          جاري التسجيل الصوتي... {formatVoiceElapsed(voiceElapsedMs)}
        </motion.div>
      ) : null}
      {voiceProcessingPhase === "uploading" ? (
        <motion.div
          key="uploading"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-400"
        >
          <Loader2 className="h-3 w-3 animate-spin" />
          جاري رفع التسجيل الصوتي...
        </motion.div>
      ) : null}
      {voiceProcessingPhase === "transcribing" || isVoiceTranscribing ? (
        <motion.div
          key="transcribing"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-400"
        >
          <Loader2 className="h-3 w-3 animate-spin" />
          جاري تفريغ الرسالة الصوتية...
        </motion.div>
      ) : null}
      {voiceProcessingPhase === "sending" ? (
        <motion.div
          key="sending"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-400"
        >
          <Loader2 className="h-3 w-3 animate-spin" />
          جاري إرسال النص إلى المساعد...
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
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-7 pb-10">
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
    <LayoutGroup id="workspace-assistant-surface">
      <div className="flex min-h-0 flex-1 flex-col bg-[#f7f7f5]">
        <Conversation className="min-h-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <ConversationContent className="mx-auto w-full max-w-5xl gap-7 pb-40">
            <ThreadMessages
              user={props.user}
              thread={thread}
              isSending={props.isSending}
              lastAssistantMessageId={lastAssistantMessageId}
              liveAssistantMotionState={props.liveAssistantMotionState}
              liveStageLabel={props.liveStageLabel}
            />
          </ConversationContent>
          <ConversationScrollButton className="bottom-6" />
        </Conversation>
        <motion.div
          layout
          data-slot="thread-composer-dock"
          className="sticky bottom-0 z-20 shrink-0 border-t border-slate-200 bg-white px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:px-6 lg:px-8"
        >
          <div className="mx-auto w-full max-w-5xl">
            <AssistantComposer {...props} layout="thread" />
          </div>
        </motion.div>
      </div>
    </LayoutGroup>
  );
}

const SUGGESTION_CHIPS = [
  "ما هي أكثر المناطق طلبًا هذا الشهر؟",
  "أنشئ عرضًا لمشروع جديد",
  "ابحث في المشاريع المتاحة",
  "ما هو أداء وسطائي؟",
];

export function LandingView(props: AssistantComposerProps) {
  return (
    <LayoutGroup id="workspace-assistant-surface">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="flex min-h-0 flex-1 flex-col bg-[#f7f7f5]"
      >
        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <motion.div layout className="w-full max-w-5xl">
            <div className="mx-auto flex max-w-xl flex-col items-center text-center">
              <motion.div
                layout
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="mb-5"
              >
                <AIMotionLogo state="idle" size="standard" />
              </motion.div>
              <motion.h1
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
                className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl"
              >
                كيف يمكنني مساعدتك؟
              </motion.h1>
              <motion.p
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 }}
                className="mt-3 max-w-lg text-sm leading-7 text-slate-500"
              >
                ابدأ مباشرة من الأسفل. سنحافظ على نفس المساحة ونحوّلها إلى محادثة مستمرة بدون أي انقطاع.
              </motion.p>
            </div>

            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.18 }}
              className="mx-auto mt-8 max-w-3xl"
            >
              <Suggestions className="w-full justify-center">
                {SUGGESTION_CHIPS.map((chip) => (
                  <Suggestion
                    key={chip}
                    onClick={() => props.onSend(chip)}
                    suggestion={chip}
                    className="rounded-md border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                  >
                    {chip}
                  </Suggestion>
                ))}
              </Suggestions>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          layout
          data-slot="landing-composer-dock"
          className="sticky bottom-0 z-20 shrink-0 border-t border-slate-200 bg-white px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:px-6 lg:px-8"
        >
          <div className="mx-auto w-full max-w-5xl">
            <motion.div
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.12 }}
            >
              <AssistantComposer {...props} layout="landing" />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </LayoutGroup>
  );
}
