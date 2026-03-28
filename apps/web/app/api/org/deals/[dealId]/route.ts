import { toInvalidJsonResponse } from "@/app/api/_shared/errors";
import { getOrganizationApiKeyHeader } from "@/app/api/org/_shared";
import { toErrorResponse } from "@/server/contracts/errors";
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
  try {
    const body = await request.json();
    const { dealId } = await params;
    return Response.json({ deal: await updateOrganizationDealByApiKey(getOrganizationApiKeyHeader(request), dealId, body) });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return toInvalidJsonResponse();
    }
    return toErrorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: OrganizationDealRouteProps) {
  try {
    const { dealId } = await params;
    await deleteOrganizationDealByApiKey(getOrganizationApiKeyHeader(request), dealId);
    return Response.json({ deleted: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
