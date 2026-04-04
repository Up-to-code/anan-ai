import ActivityPage from "@/admin_zone/pages/ActivityPage";

/**
 * WHY:   The activity route should remain a stable entrypoint for feed-first operator workflows.
 * WHAT:  Renders the admin activity page.
 * HOW:   Delegates the surface to the activity page orchestrator.
 */
export default function ActivityRoute() {
  return <ActivityPage />;
}
