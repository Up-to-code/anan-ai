import { toErrorResponse } from "@/server/contracts/errors";
import { revokeCurrentOrganizationApiKeyForCurrentUser } from "@/server/domains/auth/organizationApiKeys/service";

type OrganizationApiKeyRouteProps = {
  params: Promise<{ keyId: string }>;
};

/**
 * WHY:   Managers need a direct revocation endpoint for one organization API key.
 * WHAT:  Revokes the requested key for the current organization.
 * HOW:   Resolves the route param and delegates revocation to the shared domain service.
 */
export async function DELETE(_request: Request, { params }: OrganizationApiKeyRouteProps) {
  try {
    const { keyId } = await params;
    await revokeCurrentOrganizationApiKeyForCurrentUser(keyId);
    return Response.json({ revoked: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
