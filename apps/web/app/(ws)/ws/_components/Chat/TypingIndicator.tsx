"use client";

import { AIMotionLogo, type AIMotionState } from "@/app/(ws)/ws/_components/AIMotion";

/**
 * WHY:   Assistant typing needs a branded presence instead of generic dots or placeholder icons.
 * WHAT:  Renders the Anan AI motion avatar with a short typing status line.
 * HOW:   Uses the compact logo variant and a supplied motion state from the local chat sequencer.
 */
export default function TypingIndicator({
  state,
  text,
}: {
  state: AIMotionState;
  text: string;
}) {
  return (
    <div className="flex min-w-0 shrink-0 gap-6">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center">
        <AIMotionLogo state={state} size="compact" />
      </div>
      <div className="min-w-[160px] bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
        {text}
      </div>
    </div>
  );
}
