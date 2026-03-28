import { getOrganizationApiKeyHeader } from "@/app/api/org/_shared";
import { toErrorResponse } from "@/server/contracts/errors";
import { getOrganizationBrokerByApiKey } from "@/server/domains/auth/organizationApiKeys/service";

type OrganizationBrokerRouteProps = {
  params: Promise<{ brokerId: string }>;
};

/**
 * WHY:   Machine CRM integrations need one broker-detail lookup for relation resolution.
 * WHAT:  Returns a single broker record using the API key header.
 * HOW:   Resolves the route param and delegates to the organization API key domain service.
 */
export async function GET(request: Request, { params }: OrganizationBrokerRouteProps) {
  try {
    const { brokerId } = await params;
    return Response.json({ broker: await getOrganizationBrokerByApiKey(getOrganizationApiKeyHeader(request), brokerId) });
  } catch (error) {
    return toErrorResponse(error);
  }
}
