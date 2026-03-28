import VerificationsPage from "@/admin_zone/pages/VerificationsPage";

/**
 * WHY:   The admin console needs a dedicated route for the live verification queue.
 * WHAT:  Renders the verification review workspace.
 * HOW:   Delegates to the page module so routing stays thin.
 */
export default function VerificationsRoute() {
  return <VerificationsPage />;
}

