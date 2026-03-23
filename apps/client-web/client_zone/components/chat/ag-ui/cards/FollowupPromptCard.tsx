import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/client_zone/components/ui/card";
import type { FollowupPromptCardProps } from "../types";

/**
 * WHY:   The assistant should end qualifying turns with one clear next action instead of a vague closing sentence.
 * WHAT:  Renders a follow-up prompt card with one primary directional label.
 * HOW:   Keeps the CTA textual so it stays lightweight inside the document-style thread.
 */
export function FollowupPromptCard(props: FollowupPromptCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{props.title}</CardTitle>
        <CardDescription>{props.summary}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-900">
          <ArrowRight className="h-4 w-4" />
          {props.actionLabel}
        </div>
      </CardContent>
    </Card>
  );
}
