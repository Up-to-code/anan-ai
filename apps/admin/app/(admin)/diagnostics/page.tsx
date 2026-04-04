import DiagnosticsPage from "@/admin_zone/pages/DiagnosticsPage";

/**
 * WHY:   Diagnostics belong inside the protected command-center area and should keep a thin route file.
 * WHAT:  Renders the admin diagnostics page.
 * HOW:   Delegates to the diagnostics page orchestrator with mock-backed admin data.
 */
export default function DiagnosticsRoute() {
  return <DiagnosticsPage />;
}
