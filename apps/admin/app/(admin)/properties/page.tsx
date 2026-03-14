import PropertiesPage from "@/admin_zone/pages/PropertiesPage";

/**
 * WHY:   The properties route should delegate all CRUD composition to the dedicated page module.
 * WHAT:  Renders the default properties tab.
 * HOW:   Hands off directly to the `PropertiesPage` orchestrator.
 */
export default function PropertiesRoute() {
  return <PropertiesPage />;
}
