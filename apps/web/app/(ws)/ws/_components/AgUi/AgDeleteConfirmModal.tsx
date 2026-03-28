"use client";

import { AlertTriangle, X } from "lucide-react";

/**
 * WHY:   Destructive actions need a consistent, high-visibility confirmation step.
 * WHAT:  A reusable danger-confirmation modal with title, description, and confirm/cancel actions.
 * HOW:   Controlled via `open` + `onClose` + `onConfirm` props.
 */
export default function AgDeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "حذف نهائياً",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-md rounded-[28px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
        <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-6 sm:px-7">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-red-100 bg-red-50">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="text-right">
              <h2 className="text-xl font-black text-[var(--workspace-bubble-other-foreground)]">{title}</h2>
              {description && (
                <p className="mt-2 text-sm font-medium leading-relaxed text-[var(--workspace-muted)]">
                  {description}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--workspace-muted)] transition hover:bg-[var(--workspace-accent-soft)] hover:text-[var(--workspace-bubble-other-foreground)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mx-6 mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-right sm:mx-7">
          <p className="text-sm font-semibold leading-relaxed text-red-700">
            هذا الإجراء لا يمكن التراجع عنه، وسيتم حذف جميع البيانات المرتبطة بهذا العنصر.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 px-6 pb-6 sm:flex-row sm:justify-end sm:px-7">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-[color:var(--workspace-border)] px-5 py-3 text-sm font-bold text-[var(--workspace-muted)] transition hover:border-[color:color-mix(in_srgb,var(--workspace-highlight)_28%,transparent)] hover:text-[var(--workspace-bubble-other-foreground)]"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={() => { onConfirm(); onClose(); }}
            className="rounded-2xl border border-red-600 bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:border-red-700 hover:bg-red-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
