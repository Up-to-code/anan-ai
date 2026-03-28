import { ArrowRight } from "lucide-react";
import { AgUiCardHeading, AgUiCardShell, CardContent, agUiInnerPanelClassName } from "../AgUiCardPrimitives";
import type { FollowupPromptCardProps } from "../types";

/**
 * WHY:   The assistant should end qualifying turns with one clear next action instead of a vague closing sentence.
 * WHAT:  Renders a follow-up prompt card with one primary directional label.
 * HOW:   Keeps the CTA textual so it stays lightweight inside the document-style thread.
 */
export function FollowupPromptCard(props: FollowupPromptCardProps) {
  return (
    <AgUiCardShell>
      <AgUiCardHeading title={props.title} summary={props.summary} />
      <CardContent className="pt-0">
        <div className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-black text-[var(--workspace-bubble-other-foreground)] ${agUiInnerPanelClassName()}`}>
          <ArrowRight className="h-4 w-4" />
          {props.actionLabel}
        </div>
      </CardContent>
    </AgUiCardShell>
  );
}
