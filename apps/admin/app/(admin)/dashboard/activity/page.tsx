import { redirect } from "next/navigation";

/**
 * WHY:   The dashboard activity route now folds into the unified command-center landing page.
 * WHAT:  Redirects legacy activity-summary traffic back to `/dashboard`.
 * HOW:   Uses a lightweight server redirect instead of maintaining a duplicate view.
 */
export default function DashboardActivityRoute() {
  redirect("/dashboard");
}
