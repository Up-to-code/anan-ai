import { memo } from "react"
import { AgCardShell, agInnerPanelClassName } from "./AgCardShell";

/**
 * WHY:   Workspace operator answers need a compact, data-first list card instead of verbose assistant prose.
 * WHAT:  Renders a numbered list of real workspace records with optional subtitle and meta text.
 * HOW:   Uses simple stacked rows so clients, projects, and offers can share one honest presentation shape.
 */
const AgDataListComponent = function AgDataList({
  title,
  items,
  emptyLabel = "لا توجد نتائج.",
}: {
  title: string;
  items: Array<{ id: string; title: string; subtitle?: string; meta?: string }>;
  emptyLabel?: string;
}) {
  return (
    <AgCardShell className="max-w-[420px]">
      <h3 className="text-sm font-black text-[var(--workspace-bubble-other-foreground)]">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-3 text-sm font-medium text-[var(--workspace-muted)]">{emptyLabel}</p>
      ) : (
        <div className="mt-4 space-y-3" dir="rtl">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`rounded-[22px] px-4 py-3 ${agInnerPanelClassName()}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-7 min-w-7 items-center justify-center rounded-full border border-[color:color-mix(in_srgb,var(--workspace-highlight)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_12%,transparent)] text-[11px] font-black text-[var(--workspace-highlight)]">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1 text-right">
                  <div className="text-sm font-black text-[var(--workspace-bubble-other-foreground)]">{item.title}</div>
                  {item.subtitle ? (
                    <div className="mt-1 text-xs font-medium leading-6 text-[var(--workspace-muted)]">{item.subtitle}</div>
                  ) : null}
                  {item.meta ? (
                    <div className="mt-2 rounded-2xl bg-[color:color-mix(in_srgb,var(--workspace-highlight)_8%,transparent)] px-3 py-2 text-xs font-medium text-[var(--workspace-muted)]">
                      {item.meta}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AgCardShell>
  );
}

export default memo(AgDataListComponent)
