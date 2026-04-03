import { toInvalidJsonResponse } from "@/app/api/_shared/errors";
import { getOrganizationApiKeyHeader, getOrganizationApiKeyOrigin } from "@/app/api/org/_shared";
import { toErrorResponse } from "@/server/contracts/errors";
import {
  createOrganizationDealByApiKey,
  listOrganizationDealsByApiKey,
} from "@/server/domains/auth/organizationApiKeys/service";

/**
 * WHY:   Organization API keys need a machine-readable CRM deals collection endpoint.
 * WHAT:  Lists or creates org-scoped deals using the `X-Anan-Api-Key` header.
 * HOW:   Delegates reads and writes to the shared organization API key domain service.
 */
export async function GET(request: Request) {
  try {
    return Response.json({ deals: await listOrganizationDealsByApiKey(getOrganizationApiKeyHeader(request), getOrganizationApiKeyOrigin(request)) });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return Response.json(
      { deal: await createOrganizationDealByApiKey(getOrganizationApiKeyHeader(request), body, getOrganizationApiKeyOrigin(request)) },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return toInvalidJsonResponse();
    }
    return toErrorResponse(error);
  }
}
