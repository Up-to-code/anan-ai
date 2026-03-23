import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/client_zone/components/ui/card";
import type { AccentNoteCardProps } from "../types";

/**
 * WHY:   The mock assistant needs one lightweight emphasis card for warnings, confirmations, and directional notes.
 * WHAT:  Renders a single accent note with tone-aware icon and background.
 * HOW:   Uses restrained color accents so it supports the thread instead of dominating it.
 */
export function AccentNoteCard(props: AccentNoteCardProps) {
  const icon =
    props.tone === "success" ? (
      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
    ) : props.tone === "warning" ? (
      <AlertCircle className="h-4 w-4 text-amber-600" />
    ) : (
      <Info className="h-4 w-4 text-blue-600" />
    );

  const toneClass =
    props.tone === "success"
      ? "border-emerald-200 bg-emerald-50"
      : props.tone === "warning"
        ? "border-amber-200 bg-amber-50"
        : "border-blue-200 bg-blue-50";

  return (
    <Card className={toneClass}>
      <CardHeader>
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-sm">{props.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="text-sm leading-6 text-slate-700">{props.summary}</CardContent>
    </Card>
  );
}
