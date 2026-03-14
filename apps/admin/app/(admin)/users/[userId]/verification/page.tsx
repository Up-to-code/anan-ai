import UserDetailPage from "@/admin_zone/pages/UserDetailPage";

type UserVerificationRouteProps = {
  params: Promise<{ userId: string }>;
};

export default async function UserVerificationRoute({ params }: UserVerificationRouteProps) {
  const { userId } = await params;
  return <UserDetailPage userKey={userId} tab="verification" />;
}
