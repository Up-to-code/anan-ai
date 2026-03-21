import { redirect } from "next/navigation";

/**
 * WHY:   Property analytics is now represented by the grouped inventory view.
 * WHAT:  Redirects `/analytics/properties` to `/analytics/inventory`.
 * HOW:   Uses a server redirect to keep legacy links valid.
 */
export default function AnalyticsPropertiesRoute() {
  redirect("/analytics/inventory");
}
