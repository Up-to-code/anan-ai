import OrganizationDetailPage from "@/admin_zone/pages/OrganizationDetailPage";

type OrganizationVerificationRouteProps = {
  params: Promise<{ organizationId: string }>;
};

export default async function OrganizationVerificationRoute({ params }: OrganizationVerificationRouteProps) {
  const { organizationId } = await params;
  return <OrganizationDetailPage organizationKey={organizationId} tab="verification" />;
}
