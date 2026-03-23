import { properties } from "@/admin_zone/mocks/data";
import PropertiesPageClient from "./PropertiesPageClient";

/**
 * WHY:   The properties route should remain a thin wrapper around the mocked inventory table.
 * WHAT:  Loads the mocked property list and renders the sales-properties page.
 * HOW:   Delegates all interaction logic to the client page component.
 */
export default function SalesPropertiesPage() {
  return <PropertiesPageClient properties={properties} />;
}

