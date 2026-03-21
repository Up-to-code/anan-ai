import { redirect } from "next/navigation";

/**
 * WHY:   Connection analytics moved into the grouped collaboration view.
 * WHAT:  Redirects `/analytics/connections` to `/analytics/collaboration`.
 * HOW:   Uses a server redirect so older deep links still resolve.
 */
export default function AnalyticsConnectionsRoute() {
  redirect("/analytics/collaboration");
}
