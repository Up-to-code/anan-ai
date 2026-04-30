import { handleRoute, okResponse, readJsonBody } from "@anan/web-foundation/api";
import { DomainError } from "@/server/contracts/errors";
import { acceptCurrentOrganizationInvite } from "@/server/domains/auth/organizations/service";

/**
 * WHY:   Incoming invite cards need one HTTP action for the invited user to accept without exposing direct Convex calls.
 * WHAT:  Accepts a pending organization invite for the current authenticated user.
 * HOW:   Parses the invite token from JSON and delegates to the organizations domain service.
 */
export async function POST(request: Request) {
  return handleRoute(async () => {
    const body = await readJsonBody<{ token?: string }>(request);
    const token = body.token?.trim();

    if (!token) {
      throw new DomainError({
        code: "INVALID_ARGUMENT",
        message: "Invite token is required",
        status: 400,
      });
    }

    await acceptCurrentOrganizationInvite(token);
    return okResponse();
  });
}
