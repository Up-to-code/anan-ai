import { Badge } from "@/client_zone/components/ui/badge";
import { AgUiCardHeading, AgUiCardShell } from "../AgUiCardPrimitives";
import type { ExecutionResultCardProps } from "../types";

/**
 * WHY:   Some agentic turns need a generic status block for next-step readiness without introducing a special-purpose component every time.
 * WHAT:  Renders a neutral execution or status result card.
 * HOW:   Uses a small status badge plus description text and avoids decorative feedback UI.
 */
export function ExecutionResultCard(props: ExecutionResultCardProps) {
  const statusLabel = props.status === "done" ? "Ready" : props.status === "blocked" ? "Blocked" : "Info";

  return (
    <AgUiCardShell>
      <AgUiCardHeading
        title={props.title}
        summary={props.description}
        aside={<Badge>{statusLabel}</Badge>}
      />
    </AgUiCardShell>
  );
}
