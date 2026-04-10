"use client";

import { memo } from "react"
import { CheckCircle2, RotateCcw } from "lucide-react";

const AgApprovalFooterComponent = function AgApprovalFooter({
  approveLabel = "اعتماد التنفيذ",
  editLabel = "طلب تعديل",
  onApprove,
  onEdit,
}: {
  approveLabel?: string;
  editLabel?: string;
  onApprove?: () => void;
  onEdit?: () => void;
}) {
  return (
    <div className="flex w-full max-w-[340px] gap-3">
      <button
        type="button"
        onClick={onApprove}
        className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[color:color-mix(in_srgb,var(--workspace-highlight)_50%,transparent)] bg-[var(--workspace-highlight)] px-4 py-3 text-xs font-black tracking-[0.22em] text-[var(--primary-foreground)] transition hover:brightness-110"
      >
        <CheckCircle2 className="h-4 w-4" />
        {approveLabel}
      </button>
      <button
        type="button"
        onClick={onEdit}
        className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] px-4 py-3 text-xs font-black tracking-[0.22em] text-[var(--workspace-bubble-other-foreground)] transition hover:border-[color:color-mix(in_srgb,var(--workspace-highlight)_32%,transparent)] hover:bg-[var(--workspace-accent-soft)] hover:text-[var(--workspace-highlight)]"
      >
        <RotateCcw className="h-4 w-4" />
        {editLabel}
      </button>
    </div>
  );
}

export default memo(AgApprovalFooterComponent)
