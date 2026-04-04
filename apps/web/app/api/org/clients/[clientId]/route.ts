import { toInvalidJsonResponse } from "@/app/api/_shared/errors";
import { getOrganizationApiKeyHeader, getOrganizationApiKeyOrigin } from "@/app/api/org/_shared";
import { toErrorResponse } from "@/server/contracts/errors";
import {
  deleteOrganizationClientByApiKey,
  updateOrganizationClientByApiKey,
} from "@/server/domains/auth/organizationApiKeys/service";

type OrganizationClientRouteProps = {
  params: Promise<{ clientId: string }>;
};

/**
 * WHY:   Machine clients need item-level update and delete routes.
 * WHAT:  Updates or deletes one org-scoped CRM client using the API key header.
 * HOW:   Resolves the route param, delegates to the domain service, and preserves stable error serialization.
 */
export async function PATCH(request: Request, { params }: OrganizationClientRouteProps) {
  try {
    const body = await request.json();
    const { clientId } = await params;
    return Response.json({ client: await updateOrganizationClientByApiKey(getOrganizationApiKeyHeader(request), clientId, body, getOrganizationApiKeyOrigin(request)) });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return toInvalidJsonResponse();
    }
    return toErrorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: OrganizationClientRouteProps) {
  try {
    const { clientId } = await params;
    await deleteOrganizationClientByApiKey(getOrganizationApiKeyHeader(request), clientId, getOrganizationApiKeyOrigin(request));
    return Response.json({ deleted: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
