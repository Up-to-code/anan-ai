import Link from "next/link";
import { ChevronLeft, Trash2 } from "lucide-react";

type AgPropertyFormHeaderActionsProps = {
  onCancel?: () => void;
  cancelHref?: string;
  onDelete?: () => void;
};

export function AgPropertyFormHeaderActions({
  onCancel,
  cancelHref,
  onDelete,
}: AgPropertyFormHeaderActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      {onDelete ? (
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-2 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300 transition hover:border-red-500/35 hover:bg-red-500/15"
        >
          <Trash2 className="h-4 w-4" />
          حذف المشروع
        </button>
      ) : null}
      {cancelHref ? (
        <Link
          href={cancelHref}
          className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] px-5 py-3 text-sm font-bold text-[var(--workspace-bubble-other-foreground)] transition hover:border-[color:color-mix(in_srgb,var(--workspace-highlight)_32%,transparent)] hover:bg-[var(--workspace-accent-soft)]"
        >
          <ChevronLeft className="h-4 w-4" />
          العودة للمشروع
        </Link>
      ) : (
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] px-5 py-3 text-sm font-bold text-[var(--workspace-bubble-other-foreground)] transition hover:border-[color:color-mix(in_srgb,var(--workspace-highlight)_32%,transparent)] hover:bg-[var(--workspace-accent-soft)]"
        >
          <ChevronLeft className="h-4 w-4" />
          العودة للمشروع
        </button>
      )}
    </div>
  );
}
