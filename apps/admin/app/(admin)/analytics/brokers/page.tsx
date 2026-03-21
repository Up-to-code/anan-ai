import { redirect } from "next/navigation";

/**
 * WHY:   Broker analytics has been consolidated into the grouped partners view.
 * WHAT:  Redirects the legacy broker analytics route to `/analytics/partners`.
 * HOW:   Uses a simple server redirect for backward compatibility.
 */
export default function AnalyticsBrokersRoute() {
  redirect("/analytics/partners");
}
