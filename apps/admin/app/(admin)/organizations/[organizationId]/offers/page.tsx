import OrganizationDetailPage from "@/admin_zone/pages/OrganizationDetailPage";

type OrganizationOffersRouteProps = {
  params: Promise<{ organizationId: string }>;
};

/**
 * WHY:   The offers tab should keep route concerns separate from the organization detail page orchestration.
 * WHAT:  Renders the offers-focused admin organization detail tab for the requested organization id.
 * HOW:   Resolves the dynamic route params and forwards the `organizationId` to the page module with the `offers` tab selected.
 */
export default async function OrganizationOffersRoute({ params }: OrganizationOffersRouteProps) {
  const { organizationId } = await params;
  return <OrganizationDetailPage organizationKey={organizationId} tab="offers" />;
}
