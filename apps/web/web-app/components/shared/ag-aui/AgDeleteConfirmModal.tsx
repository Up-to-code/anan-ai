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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-md bg-white shadow-[0_32px_80px_rgba(15,23,42,0.3)]">
        {/* Red top bar */}
        <div className="h-1.5 w-full bg-red-600" />

        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="shrink-0 h-12 w-12 bg-red-50 border border-red-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="text-right">
              <h2 className="text-xl font-black text-slate-950">{title}</h2>
              {description && (
                <p className="mt-2 text-sm font-medium text-slate-500 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-slate-950 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Warning note */}
        <div className="mx-8 mb-6 border border-red-100 bg-red-50 p-4">
          <p className="text-xs font-black text-red-700 text-right leading-relaxed">
            ⚠ هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع البيانات المرتبطة بهذا العنصر.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-8 pb-8">
          <button
            type="button"
            onClick={onClose}
            className="border border-slate-200 px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-600 hover:border-slate-400 hover:text-slate-950 transition"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={() => { onConfirm(); onClose(); }}
            className="border-2 border-red-600 bg-red-600 px-8 py-3 text-xs font-black uppercase tracking-[0.18em] text-white hover:bg-red-700 hover:border-red-700 transition"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
