import OrganizationDetailPage from "@/admin_zone/pages/OrganizationDetailPage";

type OrganizationMessagesRouteProps = {
  params: Promise<{ organizationId: string }>;
};

/**
 * WHY:   The messages tab should keep route concerns separate from the organization detail page orchestration.
 * WHAT:  Renders the messages-focused admin organization detail tab for the requested organization id.
 * HOW:   Resolves the dynamic route params and forwards the `organizationId` to the page module with the `messages` tab selected.
 */
export default async function OrganizationMessagesRoute({ params }: OrganizationMessagesRouteProps) {
  const { organizationId } = await params;
  return <OrganizationDetailPage organizationKey={organizationId} tab="messages" />;
}
