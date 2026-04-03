import { toInvalidJsonResponse } from "@/app/api/_shared/errors";
import { getOrganizationApiKeyHeader, getOrganizationApiKeyOrigin } from "@/app/api/org/_shared";
import { toErrorResponse } from "@/server/contracts/errors";
import {
  createOrganizationClientByApiKey,
  listOrganizationClientsByApiKey,
} from "@/server/domains/auth/organizationApiKeys/service";

/**
 * WHY:   Organization API keys need a machine-readable clients collection endpoint.
 * WHAT:  Lists or creates org-scoped CRM clients using the `X-Anan-Api-Key` header.
 * HOW:   Routes reads and writes through the organization API key domain service and returns normalized errors.
 */
export async function GET(request: Request) {
  try {
    return Response.json({ clients: await listOrganizationClientsByApiKey(getOrganizationApiKeyHeader(request), getOrganizationApiKeyOrigin(request)) });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return Response.json(
      { client: await createOrganizationClientByApiKey(getOrganizationApiKeyHeader(request), body, getOrganizationApiKeyOrigin(request)) },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return toInvalidJsonResponse();
    }
    return toErrorResponse(error);
  }
}
