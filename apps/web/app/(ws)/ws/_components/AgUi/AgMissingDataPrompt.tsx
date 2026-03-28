/**
 * WHY:   Follow-up questions should feel like the assistant is speaking, not presenting a system prompt.
 * WHAT:  Renders a missing data question as inline conversational text with a subtle visual cue.
 * HOW:   Uses a left border accent instead of a full bordered card to stay within the conversation flow.
 */
export default function AgMissingDataPrompt({
  prompt,
}: {
  prompt: string;
}) {
  return (
    <div className="w-full max-w-[380px] border-r-2 border-[color:color-mix(in_srgb,var(--workspace-highlight)_40%,transparent)] pr-4 py-1">
      <div className="text-[10px] font-semibold tracking-wider text-[var(--workspace-highlight)]">سؤال متابعة</div>
      <p className="mt-1 text-sm font-medium leading-7 text-[var(--workspace-bubble-other-foreground)]">{prompt}</p>
    </div>
  );
}
