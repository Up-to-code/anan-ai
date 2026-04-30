import { createdResponse, handleRoute, readJsonBody } from "@anan/web-foundation/api";
import { bootstrapCurrentOrganizationFromBetterAuth } from "@/server/domains/auth/organizations/service";

/**
 * WHY:   Custom Better Auth organization creation still needs one app-owned bootstrap step after the org becomes active.
 * WHAT:  Validates the request body and provisions the local Convex organization profile bridge for the current org.
 * HOW:   Reads JSON from the request, delegates to the organizations domain service, and returns a 201 response on success.
 */
export async function POST(request: Request) {
  return handleRoute(async () => {
    const body = await readJsonBody<Parameters<typeof bootstrapCurrentOrganizationFromBetterAuth>[0]>(request);
    const organization = await bootstrapCurrentOrganizationFromBetterAuth(body);
    return createdResponse(organization);
  });
}
