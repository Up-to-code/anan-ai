import UserDetailPage from "@/admin_zone/pages/UserDetailPage";

type UserOffersRouteProps = {
  params: Promise<{
    userId: string;
  }>;
};

/**
 * WHY:   The offers tab should keep route concerns separate from the user detail page orchestration.
 * WHAT:  Renders the offers-focused admin user detail tab for the requested user id.
 * HOW:   Resolves the dynamic route params and forwards the `userId` to the page module with the `offers` tab selected.
 */
export default async function UserOffersRoute({ params }: UserOffersRouteProps) {
  const { userId } = await params;
  return <UserDetailPage userKey={userId} tab="offers" />;
}
