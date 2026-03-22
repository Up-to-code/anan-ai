"use client";

import { motion } from "framer-motion";
import { AIMotionLogo, type AIMotionState } from "../AIMotion";

/**
 * WHY:   Assistant typing needs a branded presence instead of generic dots or placeholder icons.
 * WHAT:  Renders the Anan AI motion avatar with animated typing dots and an optional stage label.
 * HOW:   Uses the compact logo variant, three bouncing dots, and a soft muted label below.
 */
export default function TypingIndicator({
  state,
  text,
}: {
  state: AIMotionState;
  text: string;
}) {
  return (
    <div
      className="flex min-w-0 shrink-0 items-start gap-3 rounded-[8px] border border-stone-300 bg-stone-50 px-4 py-3"
      dir="rtl"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-stone-300 bg-white">
        <AIMotionLogo state={state} size="compact" />
      </div>
      <div className="flex min-w-0 flex-col gap-1.5 pt-0.5 text-right">
        <div className="text-[11px] font-medium text-slate-500">Anan AI</div>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-2 w-2 rounded-full bg-slate-300"
              animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
            />
          ))}
        </div>
        {text ? (
          <span className="text-[11px] text-slate-500" style={{ unicodeBidi: "plaintext" }}>{text}</span>
        ) : null}
      </div>
    </div>
  );
}
