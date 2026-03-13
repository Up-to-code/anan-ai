import UserDetailPage from "@/admin_zone/pages/UserDetailPage";

type UserAccessRouteProps = {
  params: Promise<{
    userId: string;
  }>;
};

/**
 * WHY:   The access tab should keep route concerns separate from the user detail page orchestration.
 * WHAT:  Renders the access-focused admin user detail tab for the requested user id.
 * HOW:   Resolves the dynamic route params and forwards the `userId` to the page module with the `access` tab selected.
 */
export default async function UserAccessRoute({ params }: UserAccessRouteProps) {
  const { userId } = await params;
  return <UserDetailPage userKey={userId} tab="access" />;
}
