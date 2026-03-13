import UserDetailPage from "@/admin_zone/pages/UserDetailPage";

type UserMessagesRouteProps = {
  params: Promise<{ userId: string }>;
};

export default async function UserMessagesRoute({ params }: UserMessagesRouteProps) {
  const { userId } = await params;
  return <UserDetailPage userKey={userId} tab="messages" />;
}
