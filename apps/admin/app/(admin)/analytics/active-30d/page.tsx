import { redirect } from "next/navigation";

/**
 * WHY:   Daily active-user analytics now live inside the grouped engagement section.
 * WHAT:  Redirects `/analytics/active-30d` to `/analytics/engagement`.
 * HOW:   Keeps legacy deep links alive through a server redirect.
 */
export default function AnalyticsActiveRoute() {
  redirect("/analytics/engagement");
}
