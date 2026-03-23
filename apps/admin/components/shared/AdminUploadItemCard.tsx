import { FileText, X } from "lucide-react";

type AdminUploadItemCardProps = {
  item: {
    id: string;
    name: string;
    previewKind: "image" | "file";
    previewUrl?: string | null;
  };
  onRemove: (id: string) => void;
};

/**
 * WHY:   Upload previews should feel like real assets instead of plain filename text dumps.
 * WHAT:  Renders either an image thumbnail or a file row with a remove action.
 * HOW:   Switches on the preview kind and keeps both variants inside the same shared border treatment.
 */
export default function AdminUploadItemCard({ item, onRemove }: AdminUploadItemCardProps) {
  if (item.previewKind === "image" && item.previewUrl) {
    return (
      <div className="group relative aspect-[4/3] overflow-hidden rounded-[8px] border border-border bg-slate-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.previewUrl} alt={item.name} className="h-full w-full object-cover" />
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="absolute left-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-[8px] border border-border bg-white text-slate-500 opacity-0 transition group-hover:opacity-100 hover:bg-slate-50"
          aria-label={`إزالة ${item.name}`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-[8px] border border-border bg-slate-50 px-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-border bg-white text-slate-500">
          <FileText className="h-4 w-4" />
        </span>
        <span className="truncate text-sm font-medium text-slate-700">{item.name}</span>
      </div>
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="text-xs text-slate-500 hover:text-slate-900"
      >
        إزالة
      </button>
    </div>
  );
}
