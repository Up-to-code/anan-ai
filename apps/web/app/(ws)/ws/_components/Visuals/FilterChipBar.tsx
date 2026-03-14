"use client";

import { cn } from "@/lib/utils";

export type FilterChip = {
  key: string;
  label: string;
};

/**
 * WHY:   Projects, offers, and clients all need lightweight visual filtering without falling back to form-heavy controls.
 * WHAT:  Renders a horizontal row of selectable filter chips.
 * HOW:   Delegates the active state to the parent and only emits the selected chip key on click.
 */
export default function FilterChipBar({
  chips,
  activeKey,
  onChange,
}: {
  chips: FilterChip[];
  activeKey: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onChange(chip.key)}
          className={cn(
            "relative overflow-hidden border px-4 py-2.5 text-xs font-black tracking-[0.18em] transition",
            activeKey === chip.key
              ? "border-blue-200 bg-blue-50 text-blue-700"
              : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700",
          )}
        >
          {chip.label}
          <span
            className={cn(
              "absolute inset-x-3 bottom-0 h-0.5 transition-transform duration-200",
              activeKey === chip.key ? "scale-x-100 bg-blue-600" : "scale-x-0 bg-blue-400",
            )}
          />
        </button>
      ))}
    </div>
  );
}
