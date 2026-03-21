import { redirect } from "next/navigation";

/**
 * WHY:   Developer analytics has been consolidated into the grouped partners view.
 * WHAT:  Redirects the legacy developer analytics route to `/analytics/partners`.
 * HOW:   Uses a simple server redirect for backward compatibility.
 */
export default function AnalyticsDevelopersRoute() {
  redirect("/analytics/partners");
}
