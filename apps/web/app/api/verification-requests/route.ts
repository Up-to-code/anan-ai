import { DomainError, toErrorResponse } from "@/server/contracts/errors";
import { createVerificationRequestForCurrentOrg } from "@/server/domains/workspace/verifications/service";

/**
 * WHY:   Verification requests should submit through a dedicated gateway route.
 * WHAT:  Accepts verification payloads and creates a verification request.
 * HOW:   Parses JSON, delegates to the domain service, and returns a 201 response on success.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createVerificationRequestForCurrentOrg(body);
    return Response.json(result, { status: 201 });
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
