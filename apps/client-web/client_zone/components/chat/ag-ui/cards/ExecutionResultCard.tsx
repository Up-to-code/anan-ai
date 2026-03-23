import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/client_zone/components/ui/card";
import { Badge } from "@/client_zone/components/ui/badge";
import type { ExecutionResultCardProps } from "../types";

/**
 * WHY:   Some agentic turns need a generic status block for next-step readiness without introducing a special-purpose component every time.
 * WHAT:  Renders a neutral execution or status result card.
 * HOW:   Uses a small status badge plus description text and avoids decorative feedback UI.
 */
export function ExecutionResultCard(props: ExecutionResultCardProps) {
  const statusLabel = props.status === "done" ? "Ready" : props.status === "blocked" ? "Blocked" : "Info";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm">{props.title}</CardTitle>
          <Badge className="rounded-md bg-slate-100 text-slate-700">{statusLabel}</Badge>
        </div>
        <CardDescription>{props.description}</CardDescription>
      </CardHeader>
      <CardContent />
    </Card>
  );
}
