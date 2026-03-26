"use client";

import { useCallback, useMemo, useState } from "react";
import { ArrowUp, Loader2, Mic, Paperclip, RotateCcw, Square } from "lucide-react";
import type { WorkspaceAudience } from "@/server/contracts/workspace";
import type { UploadedFileReference } from "@/server/contracts/files";
import type { PromptInputMessage } from "@/app/(ws)/ws/_components/ai-elements/prompt-input";
import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
} from "@/app/(ws)/ws/_components/ai-elements/prompt-input";
import { cn } from "@/lib/utils";
import {
  finalizeAssistantUploads,
  getAssistantUploadUrl,
} from "@/app/(ws)/ws/(overview)/_components/WorkspaceDashboard/actions";
import { uploadBlobToStorage } from "@/app/(ws)/ws/(overview)/_components/WorkspaceDashboard/useVoiceRecorder.shared";
import type { AnanProInputMode } from "@/server/contracts/ananPro";
import WorkspaceAssistantAttachmentChips from "./WorkspaceAssistantAttachmentChips";

type WorkspaceAssistantComposerProps = {
  audience: WorkspaceAudience;
  value: string;
  onChange: (val: string) => void;
  onSend: (message?: string, inputMode?: AnanProInputMode, attachments?: UploadedFileReference[]) => void;
  isSending?: boolean;
  placeholder?: string;
  layout?: "landing" | "thread";
  onMicToggle?: () => void;
  isMicRecording?: boolean;
  isMicProcessing?: boolean;
  voiceProcessingPhase?: "idle" | "waiting_for_speech" | "recording" | "silence_countdown" | "uploading" | "transcribing" | "sending" | "error";
  micLevels?: number[];
  onStopGenerating?: () => void;
  onRegenerate?: () => void;
  canRegenerate?: boolean;
};

function resolvePlaceholder(audience: WorkspaceAudience, layout: "landing" | "thread") {
  if (audience === "developer") {
    return layout === "landing"
      ? "اسأل عنان عن مشروع جديد، ارفع برشوراً أو صورة، أو اطلب تجهيز مسودة نشر جاهزة..."
      : "اكتب طلبك أو أرفق صور المشروع والمواد التسويقية...";
  }
  if (audience === "broker") {
    return layout === "landing"
      ? "اسأل عنان عن عقار جديد، فرص السوق، أو أرفق صور الوحدة ليجهزها لك..."
      : "اكتب طلبك أو أرفق صور العقار والملفات الداعمة...";
  }
  return layout === "landing"
    ? "اكتب رسالتك أو أرفق صورة ليستخدمها المساعد داخل مساحة العمل..."
    : "اكتب رسالتك أو أرفق ملفات داعمة...";
}

function resolveHelperLabel(audience: WorkspaceAudience) {
  if (audience === "developer") {
    return "يمكنك إرسال صور وبرشورات المشاريع داخل نفس المحادثة";
  }
  if (audience === "broker") {
    return "يمكنك إرسال صور العقارات وملفات العملاء داخل نفس المحادثة";
  }
  return "يمكنك إرسال صور وملفات داعمة داخل نفس المحادثة";
}

async function uploadAssistantFiles(localFiles: PromptInputMessage["localFiles"]) {
  const rawFiles = localFiles.filter((file) => file.file instanceof File);
  if (rawFiles.length === 0) {
    return [] satisfies UploadedFileReference[];
  }

  const uploadResults = await Promise.all(
    rawFiles.map(async (file) => {
      const uploadUrlResult = await getAssistantUploadUrl();
      if (!uploadUrlResult.ok) {
        throw new Error(uploadUrlResult.error.message || "تعذر تجهيز رفع المرفقات.");
      }

      const storageId = await uploadBlobToStorage(uploadUrlResult.data.uploadUrl, file.file as File, {
        uploadFailed: `تعذر رفع الملف ${file.filename}.`,
        missingStorageId: `تعذر تجهيز الملف ${file.filename}.`,
      });

      return {
        storageId,
        name: file.filename || "ملف_بدون_اسم",
        size: file.size,
        mime: file.mediaType,
      };
    }),
  );

  const finalized = await finalizeAssistantUploads({ files: uploadResults });
  if (!finalized.ok) {
    throw new Error(finalized.error.message || "تعذر تجهيز المرفقات للإرسال.");
  }

  return finalized.data;
}

function ComposerAttachmentButton() {
  const attachments = usePromptInputAttachments();
  return (
    <PromptInputButton
      type="button"
      onClick={() => attachments.openFileDialog()}
      className="flex h-9 items-center gap-2 rounded-full border border-border bg-background px-4 text-[13px] font-semibold text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus-visible:ring-1 focus-visible:ring-primary"
    >
      <Paperclip className="h-4 w-4" />
      <span>إرفاق</span>
    </PromptInputButton>
  );
}

function ComposerSendButton({
  isBusy,
  isUploadingAttachments,
  value,
}: {
  isBusy: boolean;
  isUploadingAttachments: boolean;
  value: string;
}) {
  const attachments = usePromptInputAttachments();
  const isDisabled = isBusy || (!value.trim() && attachments.files.length === 0);

  return (
    <PromptInputButton
      type="submit"
      disabled={isDisabled}
      aria-label="إرسال"
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-[10px] shadow-sm transition focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background",
        isDisabled
          ? "cursor-not-allowed bg-muted text-muted-foreground"
          : "bg-primary text-primary-foreground hover:scale-[1.02] hover:bg-primary/90",
      )}
    >
      {isUploadingAttachments ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
    </PromptInputButton>
  );
}

function ComposerMicMeter({ levels }: { levels: number[] }) {
  if (levels.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none flex items-end gap-0.5 rounded-full border border-red-200 bg-white px-2 py-1 shadow-sm dark:border-red-500/30 dark:bg-slate-900 dark:shadow-none">
      {levels.map((level, index) => (
        <span
          key={index}
          className="w-0.5 rounded-full bg-red-500 transition-all duration-100"
          style={{ height: `${Math.max(3, Math.round(level * 18))}px` }}
        />
      ))}
    </div>
  );
}

/**
 * WHY:   Workspace agent input should use the shared prompt-input primitives while still supporting workspace-specific uploads and voice controls.
 * WHAT:  Renders the canonical `/ws` assistant composer with text, image/file attachments, mic controls, and audience-aware copy.
 * HOW:   Uses `PromptInput` as the base form, uploads local files to assistant storage on submit, then sends normalized attachment references upstream.
 */
export default function WorkspaceAssistantComposer({
  audience,
  value,
  onChange,
  onSend,
  isSending = false,
  placeholder,
  layout = "thread",
  onMicToggle,
  isMicRecording = false,
  isMicProcessing = false,
  voiceProcessingPhase = "idle",
  micLevels = [],
  onStopGenerating,
  onRegenerate,
  canRegenerate = false,
}: WorkspaceAssistantComposerProps) {
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);
  const [localSendError, setLocalSendError] = useState<string | null>(null);
  const resolvedPlaceholder = placeholder ?? resolvePlaceholder(audience, layout);
  const isLanding = layout === "landing";
  const isBusy = isSending || isMicProcessing || isUploadingAttachments;
  const isExpanded = value.length > 100 || value.includes("\n");

  const statusLabel = useMemo(() => {
    if (isUploadingAttachments) return "جارٍ رفع المرفقات...";
    if (voiceProcessingPhase === "waiting_for_speech") return "تحدث الآن...";
    if (voiceProcessingPhase === "silence_countdown") return "سيتم الإرسال تلقائياً بعد توقفك عن الكلام";
    if (voiceProcessingPhase === "uploading") return "جارٍ رفع التسجيل الصوتي...";
    if (voiceProcessingPhase === "transcribing") return "جارٍ تفريغ الرسالة الصوتية...";
    if (voiceProcessingPhase === "sending" || isSending) return "الرسالة قيد المعالجة...";
    return resolveHelperLabel(audience);
  }, [audience, isSending, isUploadingAttachments, voiceProcessingPhase]);

  const handleSubmit = useCallback(
    async (message: PromptInputMessage) => {
      const trimmedText = message.text.trim();
      const hasAttachments = message.localFiles.length > 0;
      if (!trimmedText && !hasAttachments) {
        return;
      }

      setLocalSendError(null);

      try {
        setIsUploadingAttachments(hasAttachments);
        const attachments = hasAttachments ? await uploadAssistantFiles(message.localFiles) : [];
        onSend(trimmedText, attachments.length > 0 ? "attachment" : undefined, attachments);
      } catch (error) {
        setLocalSendError(error instanceof Error ? error.message : "تعذر إرسال الرسالة الحالية.");
        throw error;
      } finally {
        setIsUploadingAttachments(false);
      }
    },
    [onSend],
  );

  return (
    <div
      className="w-full"
      data-slot="chat-input"
      data-layout={layout}
      data-workspace-slot={`workspace-assistant-composer-${layout}`}
    >
      {localSendError ? (
        <div className="mb-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {localSendError}
        </div>
      ) : null}

      <PromptInput
        accept="image/*,application/pdf"
        multiple
        maxFiles={6}
        maxFileSize={12 * 1024 * 1024}
        onError={(error) => setLocalSendError(error.message)}
        onSubmit={handleSubmit}
        className="w-full overflow-hidden rounded-[24px] border border-border bg-background p-0 shadow-sm transition-all duration-300 focus-within:border-primary/30 focus-within:shadow-md dark:shadow-none"
      >
        <WorkspaceAssistantAttachmentChips />

        <PromptInputBody>
          <PromptInputTextarea
            value={value}
            onChange={(event) => onChange(event.currentTarget.value)}
            disabled={Boolean(isMicProcessing || isUploadingAttachments)}
            placeholder={resolvedPlaceholder}
            className="min-h-[56px] w-full resize-none border-0 bg-transparent px-5 pt-4 pb-2 text-right text-[15px] font-medium leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0 dark:text-slate-100 dark:placeholder:text-slate-500"
            rows={isLanding ? 3 : 2}
            style={{ minHeight: isLanding ? "100px" : "56px" }}
            dir="rtl"
          />
        </PromptInputBody>

        <PromptInputFooter className="flex items-center justify-between px-3 pb-3 pt-1">
          <PromptInputTools className="flex flex-1 items-center gap-2">
            <ComposerAttachmentButton />

            <PromptInputButton
              type="button"
              onClick={onMicToggle}
              disabled={!onMicToggle || (isMicProcessing && !isMicRecording) || isUploadingAttachments}
              className={cn(
                "flex h-9 items-center gap-2 rounded-full border border-border bg-background px-4 text-[13px] font-semibold shadow-sm transition focus-visible:ring-1 focus-visible:ring-primary",
                isMicRecording
                  ? "border-red-500/30 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {isMicProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isMicRecording ? (
                <Square className="h-4 w-4 fill-current" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
              <span>{isMicRecording ? "إيقاف" : "صوت"}</span>
            </PromptInputButton>

            {canRegenerate && !isBusy ? (
              <PromptInputButton
                type="button"
                onClick={onRegenerate}
                className="flex h-9 items-center gap-2 rounded-full border border-border bg-background px-4 text-[13px] font-semibold text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus-visible:ring-1 focus-visible:ring-primary"
              >
                <RotateCcw className="h-4 w-4" />
                <span>إعادة</span>
              </PromptInputButton>
            ) : null}

            {isMicRecording ? <ComposerMicMeter levels={micLevels} /> : null}
          </PromptInputTools>

          <PromptInputTools className="flex shrink-0 items-center justify-end ps-2">
            {isSending ? (
              <PromptInputButton
                type="button"
                onClick={onStopGenerating}
                aria-label="إيقاف التوليد"
                className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-slate-900 text-white shadow-sm transition hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:bg-slate-100 dark:text-slate-950 dark:shadow-none dark:focus-visible:ring-offset-background"
              >
                <Square className="h-4 w-4 fill-current" />
              </PromptInputButton>
            ) : (
              <ComposerSendButton
                isBusy={isBusy}
                isUploadingAttachments={isUploadingAttachments}
                value={value}
              />
            )}
          </PromptInputTools>
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
