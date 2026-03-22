import { ChevronLeft, Trash2 } from "lucide-react";

type AgPropertyFormHeaderActionsProps = {
  onCancel?: () => void;
  onDelete?: () => void;
};

export function AgPropertyFormHeaderActions({
  onCancel,
  onDelete,
}: AgPropertyFormHeaderActionsProps) {
  return (
    <div className="flex flex-col items-end gap-3 sm:flex-row sm:items-center">
      {onDelete ? (
        <button
          type="button"
          onClick={onDelete}
          className="flex items-center gap-2 border border-red-200 px-4 py-3 text-xs font-black text-red-600 transition hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          حذف المشروع
        </button>
      ) : null}
      <button
        type="button"
        onClick={onCancel}
        className="flex items-center gap-2 border border-slate-200 bg-white px-5 py-3 text-xs font-black text-slate-700 transition hover:border-slate-950"
      >
        <ChevronLeft className="h-4 w-4" />
        العودة للمشروع
      </button>
    </div>
  );
}
