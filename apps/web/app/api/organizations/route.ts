import { DomainError, toErrorResponse } from "@/server/contracts/errors";
import { createOrganizationForCurrentUser } from "@/server/domains/organizations/service";

/**
 * WHY:   Organization creation is the first business mutation exposed through the Next.js gateway.
 * WHAT:  Validates the request body and creates an organization for the current authenticated user.
 * HOW:   Reads JSON from the request, delegates to the organizations domain service, and returns a 201 response on success.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const organization = await createOrganizationForCurrentUser(body);
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
