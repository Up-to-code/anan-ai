"use client";

import { FileImage, FileText, X } from "lucide-react";
import {
  formatAttachmentSize,
  getAttachmentPresentationMeta,
} from "@/app/(ws)/ws/_components/attachments/attachmentPresentation";

type AttachmentLike = {
  key?: string;
  url?: string;
  name: string;
  size?: number;
  mime?: string | null;
};

/**
 * WHY:   Staged uploads should look the same across inbox sharing, offers, and assistant inputs.
 * WHAT:  Renders one attachment preview card with type icon/thumbnail, metadata, and optional remove action.
 * HOW:   Uses image thumbnails when a URL is available, falls back to file-type icons otherwise, and preserves long names.
 */
export function AttachmentStageCard({
  attachment,
  helperLabel,
  onRemove,
}: {
  attachment: AttachmentLike;
  helperLabel?: string;
  onRemove?: () => void;
}) {
  const meta = getAttachmentPresentationMeta(attachment);
  const Icon = meta.kind === "image" ? FileImage : FileText;

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white px-3 py-3 text-right dark:border-white/10 dark:bg-white/[0.04]">
      {attachment.url && meta.kind === "image" ? (
        <img
          src={attachment.url}
          alt={attachment.name}
          className="h-14 w-14 shrink-0 rounded-xl object-cover"
        />
      ) : (
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300">
          <Icon className="h-4 w-4" />
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="break-words text-sm font-black text-slate-900 [overflow-wrap:anywhere] dark:text-slate-100">
          {attachment.name}
        </div>
        <div className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          {helperLabel ?? "ملف مرتبط بمؤسسة العمل الحالية"}
        </div>
        <div className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          {meta.label}
          {attachment.size ? ` · ${formatAttachmentSize(attachment.size)}` : ""}
        </div>
      </div>

      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200/80 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-slate-100"
          aria-label={`إزالة ${attachment.name}`}
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
