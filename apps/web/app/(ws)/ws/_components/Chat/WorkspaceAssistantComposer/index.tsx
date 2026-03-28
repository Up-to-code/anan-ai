"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2, Mic, Paperclip } from "lucide-react";
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

function resolvePlaceholder(audience: WorkspaceAudience) {
  if (audience === "developer") return "حلل السوق، جهز عرض سعر، أو اطلب أفكاراً لمشروعك...";
  if (audience === "broker") return "اسأل عن تقييم عقار، فرص السوق، أو أداء فريقك...";
  return "اسأل عنان عن عقار جديد، فرص السوق، أو اسحب صور الوحدة وملفات PDF هنا ليجهزها لك...";
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
  const [localSendError, setLocalSendError] = useState<string | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<PendingWorkspaceAttachment[]>([]);
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const resolvedPlaceholder = resolvePlaceholder(audience);
  const isBusy = isSending || isMicProcessing || isUploadingAttachments;
  const language = resolveComposerLanguage();

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
            throw new Error(uploadActionResult.error.message || "تعذر تجهيز رفع الملفات.");
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
        throw new Error(finalizedAction.error.message || "تعذر حفظ الملفات المرفوعة.");
      }

      return finalizedAction.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : "تعذر رفع الملفات حالياً.";
      setPendingAttachments((current) =>
        current.map((attachment) => ({ ...attachment, status: "error", error: message })),
      );
      throw error;
    } finally {
      setIsUploadingAttachments(false);
    }
  }, [pendingAttachments]);

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
      setLocalSendError(error instanceof Error ? error.message : "تعذر إرسال الرسالة.");
    }
  }, [isBusy, onChange, onSend, pendingAttachments, uploadPendingAttachments, value]);

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
      className="w-full"
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
            className="mb-4 rounded-[24px] border border-red-500/10 bg-red-50/50 backdrop-blur-xl px-6 py-4 text-right text-[13px] font-bold text-red-600 dark:bg-red-500/10 dark:text-red-400 shadow-sm mx-4"
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
                أفلت صورة أو PDF هنا لإرفاقه مع الرسالة
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
              "w-full resize-none border-0 bg-transparent px-6 py-4 pt-5 text-right text-[15px] font-medium leading-relaxed outline-none ring-0 appearance-none transition-colors",
              "text-zinc-900 placeholder:text-zinc-500/80 focus:placeholder:text-zinc-500/60",
              "dark:text-zinc-100 dark:placeholder:text-zinc-400/70 dark:focus:placeholder:text-zinc-400/50"
            )}
            style={{ minHeight: "60px", maxHeight: "200px" }}
            dir="rtl"
            rows={1}
          />
        </div>

        <div className="px-3 pb-3 pt-1 flex flex-row items-center justify-between" dir="rtl">
          <div className="flex flex-row items-center gap-2">
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
                <span className="pt-[2px]">{pendingAttachments.length > 0 ? `مرفقات (${pendingAttachments.length})` : "إرفاق"}</span>
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
                  title="تسجيل صوتي"
                >
                  {isMicProcessing || voiceProcessingPhase === "waiting_for_permission" ? (
                    <Loader2 className="h-4 w-4 animate-spin opacity-70" />
                  ) : (
                    <Mic className="h-4 w-4 opacity-70" />
                  )}
                  <span className="pt-[2px]">{isMicRecording ? "جاري التسجيل" : "صوت"}</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-row items-center gap-2" dir="ltr">
            <button
              onClick={() => void handleSubmit()}
              disabled={isBusy || !isTyping}
              aria-label="إرسال"
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
                Analyzing
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
