"use client";

import { CheckCircle2, RotateCcw } from "lucide-react";
import type { AgUiCardComponentProps } from "../protocol";

type AgApprovalFooterProps = AgUiCardComponentProps<{
  approveLabel?: string;
  editLabel?: string;
  onApprove?: () => void;
  onEdit?: () => void;
}>;

/**
 * WHY:   Structured AI actions need a consistent affordance for final approval or revision.
 * WHAT:  Renders the default approve/edit footer and dispatches host-owned action callbacks when clicked.
 * HOW:   Prefers explicit props, then falls back to the renderer action context for `approve` and `edit`.
 */
export default function AgApprovalFooter({
  approveLabel = "اعتماد التنفيذ",
  editLabel = "طلب تعديل",
  onApprove,
  onEdit,
  agUiContext,
}: AgApprovalFooterProps) {
  return (
    <div className="flex w-full max-w-[340px] gap-3">
      <button
        type="button"
        onClick={() => onApprove?.() ?? agUiContext?.dispatchAction("approve")}
        className="flex flex-1 items-center justify-center gap-2 bg-slate-950 px-4 py-3 text-xs font-black tracking-[0.22em] text-white transition hover:bg-blue-700"
      >
        <CheckCircle2 className="h-4 w-4" />
        {approveLabel}
      </button>
      <button
        type="button"
        onClick={() => onEdit?.() ?? agUiContext?.dispatchAction("edit")}
        className="flex flex-1 items-center justify-center gap-2 border border-slate-200 bg-white px-4 py-3 text-xs font-black tracking-[0.22em] text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
      >
        <RotateCcw className="h-4 w-4" />
        {editLabel}
      </button>
    </div>
  );
}
