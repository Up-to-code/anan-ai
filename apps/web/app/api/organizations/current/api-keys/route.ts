import { toInvalidJsonResponse } from "@/app/api/_shared/errors";
import { toErrorResponse } from "@/server/contracts/errors";
import {
  createCurrentOrganizationApiKeyForCurrentUser,
  listCurrentOrganizationApiKeysForCurrentUser,
} from "@/server/domains/organizationApiKeys/service";

/**
 * WHY:   Workspace settings need one gateway-owned read endpoint for organization API keys.
 * WHAT:  Lists API keys for the current organization.
 * HOW:   Delegates to the organization API key domain service and serializes normalized errors.
 */
export async function GET() {
  try {
    return Response.json(await listCurrentOrganizationApiKeysForCurrentUser());
  } catch (error) {
    return toErrorResponse(error);
  }
}

/**
 * WHY:   Managers need a self-service HTTP endpoint to create organization API keys.
 * WHAT:  Creates an API key for the current organization and returns the secret once.
 * HOW:   Parses JSON, delegates to the domain service, and keeps error handling consistent with other gateway routes.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    return Response.json(await createCurrentOrganizationApiKeyForCurrentUser(body), { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return toInvalidJsonResponse();
    }
    return toErrorResponse(error);
  }
}
