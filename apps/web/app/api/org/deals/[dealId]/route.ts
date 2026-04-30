import { deletedResponse, handleRoute, jsonResponse, readJsonBody } from "@anan/web-foundation/api";
import { getOrganizationApiKeyHeader, getOrganizationApiKeyOrigin } from "@/app/api/org/_shared";
import {
  deleteOrganizationDealByApiKey,
  updateOrganizationDealByApiKey,
} from "@/server/domains/auth/organizationApiKeys/service";

type OrganizationDealRouteProps = {
  params: Promise<{ dealId: string }>;
};

/**
 * WHY:   Machine CRM integrations need item-level update and delete routes for deals.
 * WHAT:  Updates or deletes one org-scoped deal using the API key header.
 * HOW:   Resolves the route param, validates JSON when needed, and delegates to the shared domain service.
 */
export async function PATCH(request: Request, { params }: OrganizationDealRouteProps) {
  return handleRoute(async () => {
    const body = await readJsonBody(request);
    const { dealId } = await params;
    return jsonResponse({ deal: await updateOrganizationDealByApiKey(getOrganizationApiKeyHeader(request), dealId, body, getOrganizationApiKeyOrigin(request)) });
  });
}

export async function DELETE(request: Request, { params }: OrganizationDealRouteProps) {
  return handleRoute(async () => {
    const { dealId } = await params;
    await deleteOrganizationDealByApiKey(getOrganizationApiKeyHeader(request), dealId, getOrganizationApiKeyOrigin(request));
    return deletedResponse();
  });
}
