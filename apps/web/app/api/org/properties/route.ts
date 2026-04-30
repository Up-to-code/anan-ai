import { createdResponse, handleRoute, jsonResponse, readJsonBody } from "@anan/web-foundation/api";
import { getOrganizationApiKeyHeader, getOrganizationApiKeyOrigin } from "@/app/api/org/_shared";
import {
  createOrganizationPropertyByApiKey,
  listOrganizationPropertiesByApiKey,
} from "@/server/domains/auth/organizationApiKeys/service";

/**
 * WHY:   Organization API keys need a machine-readable properties collection endpoint.
 * WHAT:  Lists or creates org-scoped properties using the `X-Anan-Api-Key` header.
 * HOW:   Delegates reads and writes to the shared organization API key domain service.
 */
export async function GET(request: Request) {
  return handleRoute(async () =>
    jsonResponse({ properties: await listOrganizationPropertiesByApiKey(getOrganizationApiKeyHeader(request), getOrganizationApiKeyOrigin(request)) }),
  );
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const body = await readJsonBody(request);
    return createdResponse(
      { property: await createOrganizationPropertyByApiKey(getOrganizationApiKeyHeader(request), body, getOrganizationApiKeyOrigin(request)) },
    );
  });
}
