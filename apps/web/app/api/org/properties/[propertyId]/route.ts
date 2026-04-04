import { toInvalidJsonResponse } from "@/app/api/_shared/errors";
import { getOrganizationApiKeyHeader, getOrganizationApiKeyOrigin } from "@/app/api/org/_shared";
import { toErrorResponse } from "@/server/contracts/errors";
import {
  deleteOrganizationPropertyByApiKey,
  updateOrganizationPropertyByApiKey,
} from "@/server/domains/auth/organizationApiKeys/service";

type OrganizationPropertyRouteProps = {
  params: Promise<{ propertyId: string }>;
};

/**
 * WHY:   Machine property integrations need item-level update and delete routes.
 * WHAT:  Updates or deletes one org-scoped property using the API key header.
 * HOW:   Resolves the route param, validates JSON when needed, and delegates to the shared domain service.
 */
export async function PATCH(request: Request, { params }: OrganizationPropertyRouteProps) {
  try {
    const body = await request.json();
    const { propertyId } = await params;
    return Response.json({ property: await updateOrganizationPropertyByApiKey(getOrganizationApiKeyHeader(request), propertyId, body, getOrganizationApiKeyOrigin(request)) });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return toInvalidJsonResponse();
    }
    return toErrorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: OrganizationPropertyRouteProps) {
  try {
    const { propertyId } = await params;
    await deleteOrganizationPropertyByApiKey(getOrganizationApiKeyHeader(request), propertyId, getOrganizationApiKeyOrigin(request));
    return Response.json({ deleted: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
