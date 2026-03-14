"use client";

import { CheckCircle2, RotateCcw } from "lucide-react";

export default function AgApprovalFooter({
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
        className="flex flex-1 items-center justify-center gap-2 bg-slate-950 px-4 py-3 text-xs font-black tracking-[0.22em] text-white transition hover:bg-blue-700"
      >
        <CheckCircle2 className="h-4 w-4" />
        {approveLabel}
      </button>
      <button
        type="button"
        onClick={onEdit}
        className="flex flex-1 items-center justify-center gap-2 border border-slate-200 bg-white px-4 py-3 text-xs font-black tracking-[0.22em] text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
      >
        <RotateCcw className="h-4 w-4" />
        {editLabel}
      </button>
    </div>
  );
}
