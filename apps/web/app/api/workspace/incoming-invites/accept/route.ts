import { DomainError, toErrorResponse } from "@/server/contracts/errors";
import { acceptCurrentOrganizationInvite } from "@/server/domains/organizations/service";

/**
 * WHY:   Incoming invite cards need one HTTP action for the invited user to accept without exposing direct Convex calls.
 * WHAT:  Accepts a pending organization invite for the current authenticated user.
 * HOW:   Parses the invite token from JSON and delegates to the organizations domain service.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: string };
    const token = body.token?.trim();

    if (!token) {
      throw new DomainError({
        code: "INVALID_ARGUMENT",
        message: "Invite token is required",
        status: 400,
      });
    }

    await acceptCurrentOrganizationInvite(token);
    return Response.json({ ok: true });
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
