import { deletedResponse, handleRoute, jsonResponse, readJsonBody } from "@anan/web-foundation/api";
import { getOrganizationApiKeyHeader, getOrganizationApiKeyOrigin } from "@/app/api/org/_shared";
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
  return handleRoute(async () => {
    const body = await readJsonBody(request);
    const { propertyId } = await params;
    return jsonResponse({ property: await updateOrganizationPropertyByApiKey(getOrganizationApiKeyHeader(request), propertyId, body, getOrganizationApiKeyOrigin(request)) });
  });
}

export async function DELETE(request: Request, { params }: OrganizationPropertyRouteProps) {
  return handleRoute(async () => {
    const { propertyId } = await params;
    await deleteOrganizationPropertyByApiKey(getOrganizationApiKeyHeader(request), propertyId, getOrganizationApiKeyOrigin(request));
    return deletedResponse();
  });
}
