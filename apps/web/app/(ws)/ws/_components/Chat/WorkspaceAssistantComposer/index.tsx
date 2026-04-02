"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2, Paperclip } from "lucide-react";
import type { WorkspaceAudience } from "@/server/contracts/workspace";
import {
  getAttachmentValidationMessage,
  resolveComposerLanguage,
} from "@/app/(ws)/ws/_components/attachments/attachmentCopy";
import {
  COMPOSER_ATTACHMENT_ACCEPT,
  getAttachmentPresentationMeta,
  validateSupportedAttachmentFiles,
} from "@/app/(ws)/ws/_components/attachments/attachmentPresentation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { UploadedFileReference } from "@/server/contracts/files";
import { finalizeAssistantUploads, getAssistantUploadUrl } from "@/app/(ws)/ws/(overview)/_components/WorkspaceDashboard/actions";
import { uploadBlobToStorage } from "@/app/(ws)/ws/(overview)/_components/WorkspaceDashboard/useVoiceRecorder.shared";
import {
  WorkspaceAssistantAttachmentChips,
  type PendingWorkspaceAttachment,
} from "./WorkspaceAssistantAttachmentChips";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import { AIMotionLogo, type AIMotionState } from "../../AIMotion";

type WorkspaceAssistantComposerProps = {
  audience: WorkspaceAudience;
  value: string;
  onChange: (val: string) => void;
  onSend: (message?: string, inputMode?: "attachment", attachments?: UploadedFileReference[]) => void;
  isSending?: boolean;
  onMicToggle?: () => void;
  isMicRecording?: boolean;
  isMicProcessing?: boolean;
  voiceProcessingPhase?: "idle" | "waiting_for_permission" | "waiting_for_speech" | "recording" | "silence_countdown" | "uploading" | "transcribing" | "sending" | "error";
  micLevels?: number[];
  layout?: "landing" | "thread";
};

function getMicStatusLabel(
  phase: WorkspaceAssistantComposerProps["voiceProcessingPhase"],
  isRecording: boolean,
  isProcessing: boolean,
  dictionary: ReturnType<typeof useWebLocale>["dictionary"],
) {
  if (phase === "waiting_for_permission") return dictionary.assistant.preparingMic;
  if (phase === "waiting_for_speech") return dictionary.assistant.waitingForSpeech;
  if (phase === "silence_countdown") return dictionary.assistant.silenceCountdown;
  if (phase === "uploading") return dictionary.assistant.uploadingRecording;
  if (phase === "transcribing") return dictionary.assistant.analyzingRecording;
  if (phase === "sending") return dictionary.assistant.sendingMessage;
  if (phase === "error") return dictionary.assistant.recordingError;
  if (phase === "recording" || isRecording) return dictionary.assistant.recordingNow;
  if (isProcessing) return dictionary.assistant.processing;
  return dictionary.assistant.voiceTitle;
}

function getMicMotionState(
  phase: WorkspaceAssistantComposerProps["voiceProcessingPhase"],
  isRecording: boolean,
  isProcessing: boolean,
): AIMotionState {
  if (phase === "waiting_for_permission") return "loading";
  if (phase === "waiting_for_speech") return "focus";
  if (phase === "recording" || phase === "silence_countdown" || isRecording) return "matching";
  if (phase === "uploading") return "syncing";
  if (phase === "transcribing" || phase === "sending" || isProcessing) return "thinking";
  if (phase === "error") return "glitch";
  return "idle";
}

function createPendingAttachment(file: File): PendingWorkspaceAttachment {
  const meta = getAttachmentPresentationMeta(file);
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${file.name}`,
    file,
    previewUrl: meta.kind === "image" ? URL.createObjectURL(file) : null,
    status: "pending",
  };
}

function InlineMicMeter({
  levels,
  active,
}: {
  levels: number[];
  active: boolean;
}) {
  const visibleLevels = levels.length > 0 ? levels.slice(-18) : Array.from({ length: 18 }, () => 0.2);

  return (
    <div className="flex h-7 items-center gap-[3px]" aria-hidden="true">
      {visibleLevels.map((level, index) => (
        <motion.span
          key={index}
          initial={{ height: 4, opacity: 0.45 }}
          animate={{
            height: active ? Math.max(4, Math.round(level * 18)) : 6,
            opacity: active ? 1 : 0.55,
          }}
          transition={{ type: "spring", stiffness: 280, damping: 22, delay: index * 0.008 }}
          className="w-[3px] rounded-full bg-[linear-gradient(to_top,var(--workspace-highlight),color-mix(in_srgb,var(--workspace-highlight)_42%,white))]"
        />
      ))}
    </div>
  );
}

export default function WorkspaceAssistantComposer({
  audience,
  value,
  onChange,
  onSend,
  isSending = false,
  onMicToggle,
  isMicRecording = false,
  isMicProcessing = false,
  voiceProcessingPhase = "idle",
  micLevels = [],
  layout = "thread",
}: WorkspaceAssistantComposerProps) {
  const { dictionary, direction, isRtl } = useWebLocale();
  const [localSendError, setLocalSendError] = useState<string | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<PendingWorkspaceAttachment[]>([]);
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const resolvedPlaceholder =
    audience === "developer"
      ? dictionary.assistant.placeholderDeveloper
      : audience === "broker"
        ? dictionary.assistant.placeholderBroker
        : dictionary.assistant.placeholderDefault;
  const isBusy = isSending || isMicProcessing || isUploadingAttachments;
  const language = resolveComposerLanguage();
  const micMotionState = getMicMotionState(voiceProcessingPhase, isMicRecording, isMicProcessing);
  const showInlineMicState =
    isMicRecording ||
    isMicProcessing ||
    voiceProcessingPhase === "waiting_for_permission" ||
    voiceProcessingPhase === "waiting_for_speech" ||
    voiceProcessingPhase === "silence_countdown" ||
    voiceProcessingPhase === "uploading" ||
    voiceProcessingPhase === "transcribing" ||
    voiceProcessingPhase === "sending";
  const micStatusLabel = getMicStatusLabel(
    voiceProcessingPhase,
    isMicRecording,
    isMicProcessing,
    dictionary,
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentsRef = useRef<PendingWorkspaceAttachment[]>([]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [value]);

  useEffect(() => {
    attachmentsRef.current = pendingAttachments;
  }, [pendingAttachments]);

  useEffect(() => {
    return () => {
      attachmentsRef.current.forEach((attachment) => {
        if (attachment.previewUrl) {
          URL.revokeObjectURL(attachment.previewUrl);
        }
      });
    };
  }, []);

  const appendFiles = useCallback((fileList: FileList | File[]) => {
    if (isBusy) {
      return;
    }

    const files = Array.from(fileList);
    if (files.length === 0) {
      setLocalSendError(getAttachmentValidationMessage("empty_selection", language));
      return;
    }

    const validationError = validateSupportedAttachmentFiles(files);
    if (validationError) {
      setLocalSendError(validationError);
      return;
    }

    setLocalSendError(null);
    setPendingAttachments((current) => [...current, ...files.map(createPendingAttachment)]);
  }, [isBusy, language]);

  const removePendingAttachment = useCallback((attachmentId: string) => {
    setPendingAttachments((current) => {
      const next = current.filter((attachment) => attachment.id !== attachmentId);
      const removed = current.find((attachment) => attachment.id === attachmentId);
      if (removed?.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return next;
    });
  }, []);

  const uploadPendingAttachments = useCallback(async (): Promise<UploadedFileReference[]> => {
    if (pendingAttachments.length === 0) {
      return [];
    }

    setIsUploadingAttachments(true);
    setPendingAttachments((current) =>
      current.map((attachment) => ({ ...attachment, status: "uploading", error: undefined })),
    );

    try {
      const finalizedUploads = await Promise.all(
        pendingAttachments.map(async (attachment) => {
          const uploadActionResult = await getAssistantUploadUrl();
          if (!uploadActionResult.ok) {
            throw new Error(uploadActionResult.error.message || dictionary.assistant.preparingUpload);
          }

          const storageId = await uploadBlobToStorage(uploadActionResult.data.uploadUrl, attachment.file, {
            uploadFailed: `تعذر رفع الملف ${attachment.file.name}.`,
            missingStorageId: `تعذر تجهيز الملف ${attachment.file.name}.`,
          });

          return {
            storageId,
            name: attachment.file.name,
            size: attachment.file.size,
            mime: attachment.file.type || undefined,
          };
        }),
      );

      const finalizedAction = await finalizeAssistantUploads({ files: finalizedUploads });
      if (!finalizedAction.ok) {
            throw new Error(finalizedAction.error.message || dictionary.assistant.savingUploads);
      }

      return finalizedAction.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : dictionary.assistant.uploadFailed;
      setPendingAttachments((current) =>
        current.map((attachment) => ({ ...attachment, status: "error", error: message })),
      );
      throw error;
    } finally {
      setIsUploadingAttachments(false);
    }
  }, [dictionary.assistant.preparingUpload, dictionary.assistant.savingUploads, dictionary.assistant.uploadFailed, pendingAttachments]);

  const handleSubmit = useCallback(async () => {
    const trimmedText = value.trim();
    const hasAttachments = pendingAttachments.length > 0;
    if ((!trimmedText && !hasAttachments) || isBusy) return;

    setLocalSendError(null);
    try {
      const attachments = hasAttachments ? await uploadPendingAttachments() : [];
      onSend(trimmedText, attachments.length > 0 ? "attachment" : undefined, attachments);
      onChange("");
      setPendingAttachments((current) => {
        current.forEach((attachment) => {
          if (attachment.previewUrl) {
            URL.revokeObjectURL(attachment.previewUrl);
          }
        });
        return [];
      });
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      setLocalSendError(error instanceof Error ? error.message : dictionary.assistant.sendFailed);
    }
  }, [dictionary.assistant.sendFailed, isBusy, onChange, onSend, pendingAttachments, uploadPendingAttachments, value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void handleSubmit();
      }
    },
    [handleSubmit]
  );

  const isTyping = value.trim().length > 0 || pendingAttachments.length > 0;

  return (
    <div
      className="w-full pb-1"
      data-slot="chat-input"
      data-layout={layout}
      data-composer-slot="chat-input-nexus"
      onDragEnter={(event) => {
        event.preventDefault();
        if (isBusy) return;
        setIsDraggingFiles(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        if (isBusy) return;
        event.dataTransfer.dropEffect = "copy";
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        setIsDraggingFiles(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDraggingFiles(false);
        appendFiles(event.dataTransfer.files);
      }}
    >
      <AnimatePresence>
        {localSendError && (
          <motion.div 
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
            className={cn(
              "mb-4 mx-4 rounded-[24px] border border-red-500/10 bg-red-50/50 px-6 py-4 text-[13px] font-bold text-red-600 shadow-sm backdrop-blur-xl dark:bg-red-500/10 dark:text-red-400",
              isRtl ? "text-right" : "text-left",
            )}
            role="status"
            aria-live="polite"
          >
            {localSendError}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={cn(
          "relative w-full flex flex-col overflow-hidden rounded-[24px] transition-all duration-300",
          "bg-zinc-200 border border-zinc-300/80 shadow-[0_2px_15px_rgba(0,0,0,0.02)]",
          "dark:bg-zinc-800 dark:border-zinc-700 dark:shadow-[0_20px_48px_rgba(0,0,0,0.28)]",
          "focus-within:border-slate-300 dark:focus-within:border-slate-500 focus-within:shadow-xl focus-within:shadow-black/[0.03]",
          isDraggingFiles && "border-blue-400 bg-blue-50/70 shadow-xl shadow-blue-500/10 dark:border-blue-400/50 dark:bg-blue-500/10",
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={COMPOSER_ATTACHMENT_ACCEPT}
          multiple
          className="hidden"
          onChange={(event) => {
            if (event.target.files) {
              appendFiles(event.target.files);
            }
            event.target.value = "";
          }}
        />
          <WorkspaceAssistantAttachmentChips
            attachments={pendingAttachments}
            disabled={isBusy}
            onRemove={removePendingAttachment}
            direction={direction}
          />
        <AnimatePresence>
          {isDraggingFiles ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-blue-500/8 backdrop-blur-[2px]"
            >
                <div className="rounded-full border border-blue-300 bg-white px-5 py-2 text-[12px] font-black text-blue-700 shadow-sm dark:border-blue-500/30 dark:bg-slate-950 dark:text-blue-200">
                {dictionary.assistant.attach}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
        <AnimatePresence initial={false}>
          {showInlineMicState ? (
            <motion.div
              key="inline-mic-state"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mx-4 mt-4 flex items-center gap-3 rounded-[20px] border border-[color:color-mix(in_srgb,var(--workspace-highlight)_16%,var(--workspace-border))] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_8%,var(--workspace-panel))] px-4 py-3"
              dir={direction}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[color:color-mix(in_srgb,var(--workspace-highlight)_14%,transparent)]">
                <AIMotionLogo state={micMotionState} size="compact" className="scale-[0.38]" />
              </div>
              <div className={cn("min-w-0 flex-1", isRtl ? "text-right" : "text-left")}>
                <div className="text-[12px] font-black text-[var(--workspace-bubble-other-foreground)]">
                  {micStatusLabel}
                </div>
                <div className="mt-2">
                  <InlineMicMeter
                    levels={micLevels}
                    active={isMicRecording || voiceProcessingPhase === "silence_countdown"}
                  />
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
        <div className="flex flex-1 flex-col justify-center">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            disabled={isBusy}
            placeholder={resolvedPlaceholder}
            className={cn(
              "w-full resize-none border-0 bg-transparent px-6 py-4 pt-5 text-[15px] font-medium leading-relaxed outline-none ring-0 appearance-none transition-colors",
              isRtl ? "text-right" : "text-left",
              "text-zinc-900 placeholder:text-zinc-500/80 focus:placeholder:text-zinc-500/60",
              "dark:text-zinc-100 dark:placeholder:text-zinc-400/70 dark:focus:placeholder:text-zinc-400/50"
            )}
            style={{ minHeight: showInlineMicState ? "52px" : "60px", maxHeight: "200px" }}
            dir={direction}
            rows={1}
          />
        </div>

        <div className="flex flex-row items-center justify-between px-3 pb-4 pt-2" dir={direction}>
          <div className={cn("flex flex-row items-center gap-2", !isRtl && "order-2")}>
            <div className="flex flex-row items-center gap-2">
              <button
                type="button"
                className={cn(
                  "flex h-[38px] items-center justify-center gap-2 rounded-full px-4 border transition-all duration-300 active:scale-[0.98]",
                  "border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] text-[13px] font-bold text-[var(--workspace-bubble-other-foreground)] hover:bg-[var(--workspace-accent-soft)]"
                )}
                disabled={isBusy}
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4 opacity-70" />
                <span className="pt-[2px]">
                  {pendingAttachments.length > 0
                    ? `${dictionary.assistant.attach} (${pendingAttachments.length})`
                    : dictionary.assistant.attach}
                </span>
              </button>
              {onMicToggle && (
                <button
                  type="button"
                  onClick={onMicToggle}
                  disabled={isBusy && !isMicRecording}
                  className={cn(
                    "flex h-[38px] items-center justify-center gap-2 rounded-full px-4 border transition-all duration-300 active:scale-[0.98]",
                    "border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] text-[13px] font-bold text-[var(--workspace-bubble-other-foreground)] hover:bg-[var(--workspace-accent-soft)]",
                    (isMicRecording || voiceProcessingPhase === "waiting_for_permission" || isMicProcessing) &&
                      "border-[color:color-mix(in_srgb,var(--workspace-highlight)_38%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_10%,var(--workspace-panel))] text-[var(--workspace-highlight)]"
                  )}
                  title={dictionary.assistant.voiceTitle}
                >
                  <span className="flex h-4 w-4 items-center justify-center" aria-hidden="true">
                    <AIMotionLogo state={micMotionState} size="compact" className="scale-[0.3]" />
                  </span>
                  <span className="pt-[2px]">{isMicRecording ? dictionary.assistant.recordingNow : dictionary.assistant.voiceTitle}</span>
                </button>
              )}
            </div>
          </div>

          <div className={cn("flex flex-row items-center gap-2", !isRtl && "order-1")} dir="ltr">
            <button
              onClick={() => void handleSubmit()}
              disabled={isBusy || !isTyping}
              aria-label={dictionary.assistant.sendingMessage}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 active:scale-[0.95] disabled:opacity-40",
                isTyping
                  ? "bg-[var(--workspace-highlight)] text-white shadow-md hover:brightness-110"
                  : "bg-[var(--workspace-elevated)] text-[var(--workspace-muted)]"
              )}
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ArrowUp className="h-5 w-5 stroke-[2.5px]" />
              )}
            </button>

            {isBusy && !isSending && !isMicRecording && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/40 px-2"
              >
                {dictionary.assistant.processing}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
