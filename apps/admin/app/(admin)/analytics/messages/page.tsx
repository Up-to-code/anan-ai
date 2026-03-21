import { redirect } from "next/navigation";

/**
 * WHY:   The legacy messages analytics route now belongs to the grouped engagement analytics view.
 * WHAT:  Redirects `/analytics/messages` to `/analytics/engagement`.
 * HOW:   Uses a thin server redirect to preserve old links after the IA change.
 */
export default function AnalyticsMessagesRoute() {
  redirect("/analytics/engagement");
}
