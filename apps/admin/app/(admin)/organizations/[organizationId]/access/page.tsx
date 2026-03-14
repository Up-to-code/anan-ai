import OrganizationDetailPage from "@/admin_zone/pages/OrganizationDetailPage";

type OrganizationAccessRouteProps = {
  params: Promise<{ organizationId: string }>;
};

/**
 * WHY:   The access tab should keep route concerns separate from the organization detail page orchestration.
 * WHAT:  Renders the access-focused admin organization detail tab for the requested organization id.
 * HOW:   Resolves the dynamic route params and forwards the `organizationId` to the page module with the `access` tab selected.
 */
export default async function OrganizationAccessRoute({ params }: OrganizationAccessRouteProps) {
  const { organizationId } = await params;
  return <OrganizationDetailPage organizationKey={organizationId} tab="access" />;
}
