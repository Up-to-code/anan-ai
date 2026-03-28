import { AgCardShell } from "./AgCardShell";

/**
 * WHY:   The assistant should collect missing data one field at a time, not dump all fields.
 * WHAT:  Renders the next missing field as a conversational question, with a subtle remaining count.
 * HOW:   Shows only the first field prominently; remaining fields appear as a tiny counter so the user isn't overwhelmed.
 */
export default function AgFieldRequestList({
  title = "ما زالت هناك بيانات ناقصة",
  fields,
}: {
  title?: string;
  fields: string[];
}) {
  if (fields.length === 0) return null;

  const nextField = fields[0];
  const remainingCount = fields.length - 1;

  return (
    <AgCardShell className="max-w-[380px]">
      <div className="text-[10px] font-black tracking-[0.22em] text-[var(--workspace-highlight)]">جمع البيانات</div>
      <p className="mt-1.5 text-sm font-bold leading-7 text-[var(--workspace-bubble-other-foreground)]">{title}</p>
      <div className="mt-3 rounded-[22px] border border-[color:color-mix(in_srgb,var(--workspace-highlight)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_12%,transparent)] px-4 py-3 text-sm font-bold text-[var(--workspace-bubble-other-foreground)]">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--workspace-highlight)] px-2 text-[10px] font-black text-[var(--primary-foreground)]">
            1
          </span>
          <span className="flex-1 text-right">{nextField}</span>
        </div>
      </div>
      {remainingCount > 0 ? (
        <div className="mt-2 text-[11px] font-medium text-[var(--workspace-muted)]">
          + {remainingCount} معلومات أخرى سنسألك عنها لاحقًا
        </div>
      ) : null}
    </AgCardShell>
  );
}
