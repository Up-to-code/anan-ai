import OrganizationDetailPage from "@/admin_zone/pages/OrganizationDetailPage";

type OrganizationDetailRouteProps = {
  params: Promise<{ organizationId: string }>;
};

export default async function OrganizationDetailRoute({ params }: OrganizationDetailRouteProps) {
  const { organizationId } = await params;
  return <OrganizationDetailPage organizationKey={organizationId} />;
}
