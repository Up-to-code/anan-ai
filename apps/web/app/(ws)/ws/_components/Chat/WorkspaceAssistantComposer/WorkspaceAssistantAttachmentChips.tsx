"use client";

import { FileImage, FileText, Loader2, X } from "lucide-react";
import {
  formatAttachmentSize,
  getAttachmentPresentationMeta,
} from "@/app/(ws)/ws/_components/attachments/attachmentPresentation";
import { cn } from "@/lib/utils";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";

export type PendingWorkspaceAttachment = {
  id: string;
  file: File;
  previewUrl: string | null;
  status: "pending" | "uploading" | "error";
  error?: string;
};

/**
 * WHY:   The workspace composer needs one compact preview rail so attachments stay visible before send.
 * WHAT:  Renders pending image/PDF chips with upload state, previews when possible, and remove actions.
 * HOW:   Uses local object URLs for image thumbnails, falls back to type-aware icons for documents, and preserves long Arabic names.
 */
export function WorkspaceAssistantAttachmentChips({
  attachments,
  disabled = false,
  onRemove,
  direction = "rtl",
}: {
  attachments: PendingWorkspaceAttachment[];
  disabled?: boolean;
  onRemove: (attachmentId: string) => void;
  direction?: "rtl" | "ltr";
}) {
  const { dictionary, isRtl } = useWebLocale();
  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-slate-200/70 px-4 pb-3 pt-4 dark:border-white/10" dir={direction}>
      <div className="flex flex-wrap gap-3">
        {attachments.map((attachment) => {
          const isUploading = attachment.status === "uploading";
          const hasError = attachment.status === "error";
          const meta = getAttachmentPresentationMeta(attachment.file);
          const Icon = meta.kind === "image" ? FileImage : FileText;
          return (
            <div
              key={attachment.id}
              className={cn(
                "group relative flex w-[168px] shrink-0 flex-col overflow-hidden rounded-[20px] border bg-white dark:bg-white/[0.04]",
                hasError
                  ? "border-red-200 dark:border-red-500/20"
                  : "border-slate-200/80 dark:border-white/10",
              )}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                {attachment.previewUrl ? (
                  <>
                    {/* biome-ignore lint/performance/noImgElement: Local object URLs are preview-only and simpler than next/image here. */}
                    <img
                      src={attachment.previewUrl}
                      alt={attachment.file.name}
                      className="h-full w-full object-cover"
                    />
                  </>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-300">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-slate-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-[11px] font-black">{meta.label}</span>
                  </div>
                )}
                <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-1 text-[10px] font-black",
                      isUploading
                        ? "bg-slate-950/80 text-white"
                        : hasError
                          ? "bg-red-500/90 text-white"
                          : "bg-white/90 text-slate-700",
                    )}
                  >
                    {isUploading
                      ? dictionary.assistant.statusUploading
                      : hasError
                        ? dictionary.assistant.statusUploadFailed
                        : dictionary.assistant.statusReady}
                  </span>
                  <button
                    type="button"
                    disabled={disabled || isUploading}
                    onClick={() => onRemove(attachment.id)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/75 text-white transition hover:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={dictionary.assistant.removeAttachment.replace("{name}", attachment.file.name)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {isUploading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/35">
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  </div>
                ) : null}
              </div>
              <div className={cn("space-y-1 px-3 py-2", isRtl ? "text-right" : "text-left")}>
                <div className="line-clamp-2 break-words text-[12px] font-bold text-slate-700 dark:text-slate-200 [overflow-wrap:anywhere]">
                  {attachment.file.name}
                </div>
                {hasError ? (
                  <p className="line-clamp-2 text-[10px] font-medium leading-4 text-red-600 dark:text-red-300">
                    {attachment.error || dictionary.assistant.attachmentRetryHint}
                  </p>
                ) : (
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    {meta.label} · {formatAttachmentSize(attachment.file.size)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
