import OrganizationDetailPage from "@/admin_zone/pages/OrganizationDetailPage";

type OrganizationMembersRouteProps = {
  params: Promise<{ organizationId: string }>;
};

export default async function OrganizationMembersRoute({ params }: OrganizationMembersRouteProps) {
  const { organizationId } = await params;
  return <OrganizationDetailPage organizationKey={organizationId} tab="members" />;
}
