"use client";

import Image from "next/image";
import { FileText, X } from "lucide-react";
import { usePromptInputAttachments } from "@/app/(ws)/ws/_components/ai-elements/prompt-input";

/**
 * WHY:   Pending attachments need an inline preview so users know exactly what the assistant will receive.
 * WHAT:  Renders removable chips/cards for images and files currently staged in the prompt input.
 * HOW:   Reads the local prompt-input attachment context and shows image thumbnails when possible.
 */
export default function WorkspaceAssistantAttachmentChips() {
  const attachments = usePromptInputAttachments();

  if (attachments.files.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap justify-end gap-2 border-b border-slate-100 px-4 pt-4 pb-3 sm:px-5">
      {attachments.files.map((file) => {
        const isImage = file.mediaType?.startsWith("image/");

        return (
          <div
            key={file.id}
            className="flex min-w-[170px] max-w-[240px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-sm"
          >
            <button
              type="button"
              onClick={() => attachments.remove(file.id)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
              aria-label={`Remove ${file.filename}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>

            <div className="min-w-0 flex-1 text-right">
              <div className="truncate text-sm font-semibold text-slate-900">{file.filename}</div>
              <div className="mt-0.5 text-xs text-slate-500">
                {file.size ? `${Math.max(1, Math.round(file.size / 1024))} KB` : "جاهز للإرسال"}
              </div>
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
              {isImage ? (
                <Image
                  src={file.url}
                  alt={file.filename}
                  width={48}
                  height={48}
                  unoptimized
                  loader={({ src }) => src}
                  className="h-full w-full object-cover"
                />
              ) : (
                <FileText className="h-5 w-5 text-slate-400" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
