import { createdResponse, handleRoute, jsonResponse, readJsonBody } from "@anan/web-foundation/api";
import { getOrganizationApiKeyHeader, getOrganizationApiKeyOrigin } from "@/app/api/org/_shared";
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
  return handleRoute(async () =>
    jsonResponse({ clients: await listOrganizationClientsByApiKey(getOrganizationApiKeyHeader(request), getOrganizationApiKeyOrigin(request)) }),
  );
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const body = await readJsonBody(request);
    return createdResponse(
      { client: await createOrganizationClientByApiKey(getOrganizationApiKeyHeader(request), body, getOrganizationApiKeyOrigin(request)) },
    );
  });
}
