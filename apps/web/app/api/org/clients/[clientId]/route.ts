import { deletedResponse, handleRoute, jsonResponse, readJsonBody } from "@anan/web-foundation/api";
import { getOrganizationApiKeyHeader, getOrganizationApiKeyOrigin } from "@/app/api/org/_shared";
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
  return handleRoute(async () => {
    const body = await readJsonBody(request);
    const { clientId } = await params;
    return jsonResponse({ client: await updateOrganizationClientByApiKey(getOrganizationApiKeyHeader(request), clientId, body, getOrganizationApiKeyOrigin(request)) });
  });
}

export async function DELETE(request: Request, { params }: OrganizationClientRouteProps) {
  return handleRoute(async () => {
    const { clientId } = await params;
    await deleteOrganizationClientByApiKey(getOrganizationApiKeyHeader(request), clientId, getOrganizationApiKeyOrigin(request));
    return deletedResponse();
  });
}
