import ComplianceRulesetsPage from "@/admin_zone/pages/ComplianceRulesetsPage";

/**
 * WHY:   Admin routes need a dedicated entry point for compliance configuration.
 * WHAT:  Mounts the compliance ruleset management page.
 * HOW:   Forwards the query string selection into the page component.
 */
export default function ComplianceRulesetsRoute({
  searchParams,
}: {
  searchParams: { selected?: string };
}) {
  return <ComplianceRulesetsPage searchParams={searchParams} />;
}
