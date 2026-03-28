import { AgUiCardHeading, AgUiCardShell, CardContent } from "../AgUiCardPrimitives";
import type { InsightBriefCardProps } from "../types";

/**
 * WHY:   Some assistant turns need a long-form strategic note that sits between prose and structured cards.
 * WHAT:  Renders an expanded insight brief card for longer analysis or summarization.
 * HOW:   Keeps the body in a readable article-like block with enough width to feel substantial.
 */
export function InsightBriefCard(props: InsightBriefCardProps) {
  return (
    <AgUiCardShell>
      <AgUiCardHeading title={props.title} summary={props.summary} />
      <CardContent className="pt-0">
        <div className="text-[15px] leading-8 text-[var(--workspace-bubble-other-foreground)]/88 sm:text-base">
          {props.body}
        </div>
      </CardContent>
    </AgUiCardShell>
  );
}
