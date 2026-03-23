import UserDetailPage from "@/admin_zone/pages/UserDetailPage";

type UserDetailRouteProps = {
  params: Promise<{
    userId: string;
  }>;
};

/**
 * WHY:   The user detail route should keep routing concerns separate from page composition.
 * WHAT:  Renders the admin user detail orchestrator for the requested user id.
 * HOW:   Resolves the dynamic route params and forwards the `userId` to the page module.
 */
export default async function UserDetailRoute({ params }: UserDetailRouteProps) {
  const { userId } = await params;
  return <UserDetailPage userId={userId} />;
}
