"use client";

import type { LucideIcon } from "lucide-react";

interface ChatAction {
  key: string;
  icon: LucideIcon;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

/**
 * WHY:   Thread views need a compact row of contextual actions (share file, project, deal, etc.) above the composer.
 * WHAT:  Renders a horizontal bar of icon+label buttons for chat-level actions.
 * HOW:   Maps over action descriptors and renders accessible buttons with consistent styling.
 */
export default function ChatActionBar({ actions }: { actions: ChatAction[] }) {
  if (actions.length === 0) return null;

  return (
    <div className="flex items-center gap-1 border-t border-gray-100 px-3 py-1.5">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.key}
            type="button"
            disabled={action.disabled}
            onClick={action.onClick}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:pointer-events-none disabled:opacity-40"
          >
            <Icon className="h-4 w-4" />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
