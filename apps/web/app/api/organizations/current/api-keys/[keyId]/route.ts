import { handleRoute, okResponse } from "@anan/web-foundation/api";
import { revokeCurrentOrganizationApiKeyForCurrentUser } from "@/server/domains/auth/organizationApiKeys/service";

type CurrentOrganizationApiKeyRouteProps = {
  params: Promise<{ keyId: string }>;
};

/**
 * WHY:   Existing internal callers still revoke current-organization API keys through the item route.
 * WHAT:  Revokes one API key belonging to the current organization for the current user.
 * HOW:   Resolves the route param and delegates to the organization API key domain service.
 */
export async function DELETE(_request: Request, { params }: CurrentOrganizationApiKeyRouteProps) {
  return handleRoute(async () => {
    const { keyId } = await params;
    await revokeCurrentOrganizationApiKeyForCurrentUser(keyId);
    return okResponse();
  });
}
