import { resolveAgUiTurn, type AgUiConversationTurn } from "@anan/ag-ui";

/**
 * WHY:   Agent teams need a tiny reference for the payload shape they should return to a host renderer.
 * WHAT:  Exports example AG UI turns for a handful of common Arabic prompts.
 * HOW:   Uses the package's demo resolver so docs and tests can share a consistent sample payload.
 */
export function buildExampleTurns(): AgUiConversationTurn[] {
  return [
    resolveAgUiTurn("إنشاء مشروع في الرياض"),
    resolveAgUiTurn("نشر عرض جديد"),
    resolveAgUiTurn("إرسال عرض للوسيط"),
    resolveAgUiTurn("آخر تحديث"),
  ];
}
