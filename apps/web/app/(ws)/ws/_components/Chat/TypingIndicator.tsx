"use client";

import { motion } from "framer-motion";
import { AIMotionLogo, type AIMotionState } from "../AIMotion";
import {
  WorkspaceAssistantBadgeRow,
  getWorkspaceAssistantBadges,
  resolveAssistantDirection,
} from "./WorkspaceAssistantBadges";

/**
 * WHY:   Assistant typing needs a branded presence instead of generic dots or placeholder icons.
 * WHAT:  Renders the Anan AI motion avatar with animated typing dots and an optional stage label.
 * HOW:   Uses the compact logo variant, three bouncing dots, and a soft muted label below.
 */
export default function TypingIndicator({
  state,
  text,
  activeTeamId,
  activeAgentName,
}: {
  state: AIMotionState;
  text: string;
  activeTeamId?: string | null;
  activeAgentName?: string | null;
}) {
  const direction = resolveAssistantDirection(text);
  const badges = getWorkspaceAssistantBadges({
    content: text,
    fallbackTeamId: activeTeamId,
    fallbackAgentName: activeAgentName,
  });

  return (
    <div
      className="flex min-w-0 shrink-0 items-start gap-4 bg-transparent px-0 py-2"
      dir={direction}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border/40 bg-card shadow-sm dark:bg-slate-900">
        <AIMotionLogo state={state} size="compact" />
      </div>
      <div className="flex min-w-0 flex-col gap-2 pt-0.5 text-right">
        <div className="flex flex-col gap-2">
          <WorkspaceAssistantBadgeRow badges={badges} dir={direction} />
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 pt-0.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-[var(--workspace-highlight)]"
                  animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                />
              ))}
            </div>
          </div>
        </div>
        {text ? (
          <span className="text-[14px] font-medium leading-relaxed text-slate-600 dark:text-slate-300" style={{ unicodeBidi: "plaintext" }}>
            {text}
          </span>
        ) : null}
      </div>
    </div>
  );
}
