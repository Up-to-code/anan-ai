import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { AgUiCardHeading, AgUiCardShell } from "../AgUiCardPrimitives";
import type { AccentNoteCardProps } from "../types";

/**
 * WHY:   The mock assistant needs one lightweight emphasis card for warnings, confirmations, and directional notes.
 * WHAT:  Renders a single accent note with tone-aware icon and background.
 * HOW:   Uses restrained color accents so it supports the thread instead of dominating it.
 */
export function AccentNoteCard(props: AccentNoteCardProps) {
  const icon =
    props.tone === "success" ? (
      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
    ) : props.tone === "warning" ? (
      <AlertCircle className="h-4 w-4 text-amber-600" />
    ) : (
      <Info className="h-4 w-4 text-blue-600" />
    );

  const toneClass =
    props.tone === "success"
      ? "border-emerald-200/60 bg-[color:color-mix(in_srgb,#10b981_8%,var(--workspace-panel))]"
      : props.tone === "warning"
        ? "border-amber-200/60 bg-[color:color-mix(in_srgb,#f59e0b_8%,var(--workspace-panel))]"
        : "border-blue-200/60 bg-[color:color-mix(in_srgb,var(--workspace-highlight)_8%,var(--workspace-panel))]";

  return (
    <AgUiCardShell className={toneClass}>
      <AgUiCardHeading
        title={props.title}
        summary={props.summary}
        aside={
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/75">
            {icon}
          </div>
        }
      />
    </AgUiCardShell>
  );
}
