import { DomainError, toErrorResponse } from "@/server/contracts/errors";
import { bootstrapCurrentOrganizationFromBetterAuth } from "@/server/domains/auth/organizations/service";

/**
 * WHY:   Custom Better Auth organization creation still needs one app-owned bootstrap step after the org becomes active.
 * WHAT:  Validates the request body and provisions the local Convex organization profile bridge for the current org.
 * HOW:   Reads JSON from the request, delegates to the organizations domain service, and returns a 201 response on success.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const organization = await bootstrapCurrentOrganizationFromBetterAuth(body);
    return Response.json(organization, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return toErrorResponse(
        new DomainError({
          code: "INVALID_REQUEST",
          message: "Request body must be valid JSON",
          status: 400,
        }),
      );
    }
    return toErrorResponse(error);
  }
}
