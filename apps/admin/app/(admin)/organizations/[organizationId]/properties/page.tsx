import OrganizationDetailPage from "@/admin_zone/pages/OrganizationDetailPage";

type OrganizationPropertiesRouteProps = {
  params: Promise<{ organizationId: string }>;
};

export default async function OrganizationPropertiesRoute({ params }: OrganizationPropertiesRouteProps) {
  const { organizationId } = await params;
  return <OrganizationDetailPage organizationKey={organizationId} tab="properties" />;
}
