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
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import type { AnanProThread, AnanProInputMode } from "@/server/contracts/ananPro";
import type { SessionUser } from "@/server/contracts/session";
import type { WorkspaceAudience } from "@/server/contracts/workspace";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { BrainCircuit, Target, CheckSquare, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { StickToBottomContext } from "use-stick-to-bottom";

export type AssistantComposerProps = {
  audience: WorkspaceAudience;
  value: string;
  sendError: string | null;
  isSending: boolean;
  isVoiceRecording: boolean;
  isVoiceTranscribing: boolean;
  voiceProcessingPhase: "idle" | "waiting_for_permission" | "waiting_for_speech" | "recording" | "silence_countdown" | "uploading" | "transcribing" | "sending" | "error";
  canRegenerate: boolean;
  activeTeamId: string | null;
  activeAgentName: string | null;
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

const DEFAULT_COMPOSER_STACK_HEIGHT = 128;
const ASSISTANT_SCROLL_BUTTON_GAP = "14px";
const ASSISTANT_CONTENT_END_GAP = "28px";

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
          role="status"
          aria-live="polite"
        >
          {sendError}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function AssistantComposer(props: AssistantComposerProps) {
  return (
    <div className="flex flex-col gap-3">
      <VoiceErrorBanner sendError={props.sendError} />
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
    </div>
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
  autoScrollSignal,
  ...props
}: AssistantComposerProps & {
  dockSlot: "landing-composer-dock" | "thread-composer-dock";
  autoScrollSignal?: string;
  children: React.ReactNode;
}) {
  const { composerStackRef, composerStackHeight } = useComposerStackHeight();
  const stickToBottomRef = useRef<StickToBottomContext | null>(null);
  const surfaceStyle = {
    ["--assistant-composer-height" as string]: `${composerStackHeight}px`,
    ["--assistant-scroll-button-gap" as string]: ASSISTANT_SCROLL_BUTTON_GAP,
    ["--assistant-content-end-gap" as string]: ASSISTANT_CONTENT_END_GAP,
  } as CSSProperties;

  useEffect(() => {
    if (!props.isSending) return;
    void stickToBottomRef.current?.scrollToBottom({
      animation: "instant",
      preserveScrollPosition: true,
    });
  }, [autoScrollSignal, props.isSending]);

  return (
    <LayoutGroup id="workspace-assistant-surface">
      <div
        data-slot="assistant-surface"
        className="assistant-composer-dock-safe-area relative flex h-full min-h-0 min-w-0 flex-1 basis-0 flex-col overflow-hidden bg-[linear-gradient(180deg,var(--workspace-canvas)_0%,color-mix(in_srgb,var(--workspace-canvas)_88%,var(--workspace-shell))_100%)] text-slate-900 dark:text-slate-100"
        style={surfaceStyle}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-[linear-gradient(to_top,color-mix(in_srgb,var(--workspace-canvas)_98%,transparent)_0%,color-mix(in_srgb,var(--workspace-canvas)_86%,transparent)_38%,transparent_100%)] backdrop-blur-sm"
        />

        <Conversation
          className="relative z-0 h-full min-h-0 flex-1 basis-0 px-4 sm:px-8 lg:px-10 xl:px-12"
          contextRef={stickToBottomRef}
        >
          <ConversationContent className="mx-auto w-full max-w-6xl justify-start gap-6 pt-5 sm:pt-6 lg:pt-6 pb-[calc(var(--assistant-composer-height)+var(--assistant-composer-dock-inset)+var(--assistant-content-end-gap))]">
            {children}
          </ConversationContent>
          <ConversationScrollButton
            alignment="center"
            className="bottom-[calc(var(--assistant-composer-height)+var(--assistant-composer-dock-inset)+var(--assistant-scroll-button-gap))] shadow-2xl"
          />
        </Conversation>

        <div
          data-slot={dockSlot}
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-4 pb-[var(--assistant-composer-dock-inset)] sm:px-8 lg:px-10 xl:px-12"
        >
          <div
            ref={composerStackRef}
            className="mx-auto w-full max-w-5xl pointer-events-auto"
            data-slot="thread-composer-shell"
          >
            <AssistantComposer {...props} />
          </div>
        </div>
      </div>
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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-3">
      {thread?.messages.map((message) => (
        <motion.div
          key={message.id}
          initial={false}
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
              <div className="mt-4 lg:mt-3">
                <AgUiTurnRenderer turn={message.uiTurn} />
              </div>
            ) : null}
          </MessageRow>
        </motion.div>
      ))}
      {isSending ? (
        <div className="pt-6">
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
  const lastMessage = thread?.messages.at(-1);
  const autoScrollSignal = [
    lastAssistantMessageId ?? "",
    thread?.messages.length ?? 0,
    lastMessage?.id ?? "",
    lastMessage?.content?.length ?? 0,
    lastMessage?.uiTurn ? "ui-turn" : "no-ui-turn",
    props.liveStageLabel,
    props.isSending ? "sending" : "idle",
  ].join(":");

  return (
    <AssistantSurface {...props} autoScrollSignal={autoScrollSignal} dockSlot="thread-composer-dock">
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
  const { locale, isRtl } = useWebLocale();
  const unavailableTitle =
    locale === "fr"
      ? "Impossible de trouver la conversation demandée."
      : locale === "en"
        ? "Could not find the requested conversation."
        : "تعذر العثور على المحادثة المطلوبة.";
  const newConversationLabel =
    locale === "fr"
      ? "Démarrer une nouvelle conversation"
      : locale === "en"
        ? "Start a new conversation"
        : "بدء محادثة جديدة";
  const landingTitle =
    locale === "fr"
      ? "Comment puis-je vous aider aujourd'hui ?"
      : locale === "en"
        ? "How can I help you today?"
        : "كيف يمكنني مساعدتك اليوم؟";
  const suggestionChips = [
    {
      label:
        locale === "fr"
          ? "Préparez une offre de prix pour un client intéressé par un projet résidentiel"
          : locale === "en"
            ? "Prepare a price offer for a client interested in a residential project"
            : "أنشئ عرض سعر لعميل مهتم بمشروع سكني",
      icon: Target,
      colorClass: "text-amber-500",
    },
    {
      label:
        locale === "fr"
          ? "Analysez le mouvement du marché immobilier à Riyad cette semaine"
          : locale === "en"
            ? "Analyze Riyadh real estate market activity this week"
            : "حلّل حركة السوق العقاري في الرياض هذا الأسبوع",
      icon: BrainCircuit,
      colorClass: "text-blue-500",
    },
    {
      label:
        locale === "fr"
          ? "Quels nouveaux projets sont proches de nos concurrents ?"
          : locale === "en"
            ? "Which new projects are close to our competitors?"
            : "ما هي المشاريع الجديدة القريبة من منافسينا؟",
      icon: Wand2,
      colorClass: "text-emerald-500",
    },
    {
      label:
        locale === "fr"
          ? "Comparez la performance des courtiers de mon équipe sur les 30 derniers jours"
          : locale === "en"
            ? "Compare my team's broker performance over the last 30 days"
            : "قارن أداء الوسطاء في فريقي خلال آخر ٣٠ يوم",
      icon: CheckSquare,
      colorClass: "text-rose-500",
    },
  ];
  return (
    <LayoutGroup id="workspace-assistant-surface">
      <motion.div
        data-slot="assistant-surface"
        className="flex min-h-0 min-w-0 flex-1 items-center justify-center bg-background px-6 py-10 sm:px-10 lg:px-16"
      >
        <motion.div
          data-slot="assistant-landing-panel"
          initial={false}
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
                {unavailableTitle}
              </p>
              <div className="mt-6 flex items-center justify-end">
                <button
                  type="button"
                  onClick={props.onResetUnavailableThread}
                  className="inline-flex items-center rounded-full bg-amber-900 px-6 py-3 text-[12px] font-black uppercase tracking-widest text-white transition hover:bg-amber-800 shadow-md active:scale-95"
                >
                  {newConversationLabel}
                </button>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col items-center gap-6 text-center pt-2">
            <motion.div
              initial={false}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "backOut" }}
              className="mb-2"
            >
              <AIMotionLogo state="idle" size="standard" />
            </motion.div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 uppercase">
              {landingTitle}
            </h1>
          </div>

          <motion.div
            data-slot="landing-composer-dock"
            className="w-full"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          >
            <AssistantComposer {...props} />
          </motion.div>

          <motion.div
            className="grid w-full grid-cols-1 sm:grid-cols-2 gap-3 pt-4"
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
            dir={isRtl ? "rtl" : "ltr"}
          >
            {suggestionChips.map((chip) => {
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
