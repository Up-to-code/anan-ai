import { redirect } from "next/navigation";

/**
 * WHY:   The dashboard entities route exists only for backward compatibility after the command-center consolidation.
 * WHAT:  Redirects legacy entity-summary traffic back to the rebuilt dashboard.
 * HOW:   Uses a server redirect to preserve major URL compatibility without keeping the old split view alive.
 */
export default function DashboardEntitiesRoute() {
  redirect("/dashboard");
}
