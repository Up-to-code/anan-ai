import { redirect } from "next/navigation";

/**
 * WHY:   Offer analytics is now part of the grouped commercial view.
 * WHAT:  Redirects `/analytics/offers` to `/analytics/commercial`.
 * HOW:   Preserves old deep links through a lightweight server redirect.
 */
export default function AnalyticsOffersRoute() {
  redirect("/analytics/commercial");
}
