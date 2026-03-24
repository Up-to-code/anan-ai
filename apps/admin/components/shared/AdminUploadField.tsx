"use client";

import { useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Film, FileText, ImagePlus } from "lucide-react";
import AdminUploadItemCard from "@/components/shared/AdminUploadItemCard";

export type AdminUploadItem = {
  id: string;
  name: string;
  previewKind: "image" | "file";
  previewUrl?: string | null;
};

type AdminUploadFieldProps = {
  title: string;
  description?: string;
  accept?: string;
  multiple?: boolean;
  previewKind: "image" | "file";
  emptyLabel: string;
  badgeLabel?: string;
  icon?: "image" | "file" | "video";
  onCountChange?: (count: number) => void;
};

function pickIcon(icon: NonNullable<AdminUploadFieldProps["icon"]>) {
  if (icon === "video") return Film;
  if (icon === "file") return FileText;
  return ImagePlus;
}

/**
 * WHY:   Asset-heavy admin forms need a realistic upload area without wiring backend storage yet.
 * WHAT:  Provides a mock upload surface with native file selection, previews, and remove actions.
 * HOW:   Stores selected files in local component state and generates object URLs for image previews only.
 */
export default function AdminUploadField({
  title,
  description,
  accept,
  multiple = true,
  previewKind,
  emptyLabel,
  badgeLabel,
  icon = "file",
  onCountChange,
}: AdminUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<AdminUploadItem[]>([]);
  const Icon = useMemo(() => pickIcon(icon), [icon]);

  function updateItems(next: AdminUploadItem[]) {
    setItems(next);
    onCountChange?.(next.length);
  }

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const next = files.map((file, index) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${index}`,
      name: file.name,
      previewKind,
      previewUrl: previewKind === "image" ? URL.createObjectURL(file) : null,
    }));

    updateItems(multiple ? [...items, ...next] : next.slice(0, 1));
    event.target.value = "";
  }

  function removeItem(id: string) {
    const target = items.find((item) => item.id === id);
    if (target?.previewUrl) {
      URL.revokeObjectURL(target.previewUrl);
    }
    updateItems(items.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-3 rounded-[8px] border border-border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm font-medium text-slate-900">{title}</div>
          {description ? <div className="text-sm leading-6 text-slate-500">{description}</div> : null}
        </div>
        {badgeLabel ? <div className="rounded-[8px] border border-border bg-slate-50 px-2.5 py-1 text-xs text-slate-600">{badgeLabel}</div> : null}
      </div>

      <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden" onChange={handleFiles} />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex min-h-28 w-full flex-col items-center justify-center gap-3 rounded-[8px] border-2 border-dashed border-border bg-slate-50 px-4 py-5 text-center text-slate-700 hover:bg-white"
      >
        <Icon className="h-5 w-5 text-slate-500" />
        <span className="text-sm font-medium">{emptyLabel}</span>
      </button>

      {items.length > 0 ? (
        <div className={previewKind === "image" ? "grid grid-cols-2 gap-3" : "space-y-2"}>
          {items.map((item) => (
            <AdminUploadItemCard key={item.id} item={item} onRemove={removeItem} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
