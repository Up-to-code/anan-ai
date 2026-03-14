import UserDetailPage from "@/admin_zone/pages/UserDetailPage";

type UserActivityRouteProps = {
  params: Promise<{ userId: string }>;
};

export default async function UserActivityRoute({ params }: UserActivityRouteProps) {
  const { userId } = await params;
  return <UserDetailPage userKey={userId} tab="activity" />;
}
