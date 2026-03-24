import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/client_zone/components/ui/card";
import type { InsightBriefCardProps } from "../types";

/**
 * WHY:   Some assistant turns need a long-form strategic note that sits between prose and structured cards.
 * WHAT:  Renders an expanded insight brief card for longer analysis or summarization.
 * HOW:   Keeps the body in a readable article-like block with enough width to feel substantial.
 */
export function InsightBriefCard(props: InsightBriefCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{props.title}</CardTitle>
        <CardDescription>{props.summary}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-w-[820px] text-[15px] leading-8 text-slate-700 sm:text-base">
          {props.body}
        </div>
      </CardContent>
    </Card>
  );
}
