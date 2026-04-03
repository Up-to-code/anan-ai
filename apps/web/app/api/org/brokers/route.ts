import { getOrganizationApiKeyHeader, getOrganizationApiKeyOrigin } from "@/app/api/org/_shared";
import { toErrorResponse } from "@/server/contracts/errors";
import { listOrganizationBrokersByApiKey } from "@/server/domains/auth/organizationApiKeys/service";

/**
 * WHY:   Machine integrations need a broker directory endpoint for CRM relation syncing.
 * WHAT:  Lists brokers accessible through the machine API permission model.
 * HOW:   Delegates to the organization API key domain service using the API key header.
 */
export async function GET(request: Request) {
  try {
    return Response.json({ brokers: await listOrganizationBrokersByApiKey(getOrganizationApiKeyHeader(request), getOrganizationApiKeyOrigin(request)) });
  } catch (error) {
    return toErrorResponse(error);
  }
}
