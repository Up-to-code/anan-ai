import { redirect } from "next/navigation";

/**
 * WHY:   The analytics index should land users on the new executive view by default.
 * WHAT:  Redirects `/analytics` requests to `/analytics/executive`.
 * HOW:   Uses an immediate server redirect to keep the index route thin.
 */
export default function AnalyticsIndexRoute() {
  redirect("/analytics/executive");
}
