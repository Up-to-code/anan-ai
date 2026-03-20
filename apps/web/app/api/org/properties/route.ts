import { toInvalidJsonResponse } from "@/app/api/_shared/errors";
import { getOrganizationApiKeyHeader } from "@/app/api/org/_shared";
import { toErrorResponse } from "@/server/contracts/errors";
import {
  createOrganizationPropertyByApiKey,
  listOrganizationPropertiesByApiKey,
} from "@/server/domains/organizationApiKeys/service";

/**
 * WHY:   Organization API keys need a machine-readable properties collection endpoint.
 * WHAT:  Lists or creates org-scoped properties using the `X-Anan-Api-Key` header.
 * HOW:   Delegates reads and writes to the shared organization API key domain service.
 */
export async function GET(request: Request) {
  try {
    return Response.json({ properties: await listOrganizationPropertiesByApiKey(getOrganizationApiKeyHeader(request) ?? undefined) });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return Response.json(
      { property: await createOrganizationPropertyByApiKey(getOrganizationApiKeyHeader(request) ?? undefined, body) },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return toInvalidJsonResponse();
    }
    return toErrorResponse(error);
  }
}
