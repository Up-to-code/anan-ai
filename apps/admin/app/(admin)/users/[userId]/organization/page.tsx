import UserDetailPage from "@/admin_zone/pages/UserDetailPage";

type UserOrganizationRouteProps = {
  params: Promise<{ userId: string }>;
};

export default async function UserOrganizationRoute({ params }: UserOrganizationRouteProps) {
  const { userId } = await params;
  return <UserDetailPage userKey={userId} tab="organization" />;
}
