import { organizations } from "@/admin_zone/mocks/data";
import OrganizationsPageClient from "./OrganizationsPageClient";

/**
 * WHY:   The organizations route should only load the directory dataset and delegate presentation logic.
 * WHAT:  Renders the mocked organizations directory page.
 * HOW:   Passes the organization array into the client-side filtering surface.
 */
type OrganizationsPageProps = {
  tab?: string;
};

export default function OrganizationsPage(_props: OrganizationsPageProps) {
  return <OrganizationsPageClient organizations={organizations} />;
}
