import { DomainError, toErrorResponse } from "@/server/contracts/errors";
import { createCurrentOrganizationInvite } from "@/server/domains/organizations/service";
import { createOrganizationInviteInputSchema } from "@/server/contracts/organizations";

/**
 * WHY:   Organization invite creation needs one HTTP entrypoint for the workspace settings UI.
 * WHAT:  Validates the invite payload and creates a team invite against the current user's primary organization.
 * HOW:   Reuses the existing repository contract and current workspace snapshot without exposing owner ids to the client.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createOrganizationInviteInputSchema.safeParse(body);

    if (!parsed.success) {
      throw new DomainError({
        code: "INVALID_ARGUMENT",
        message: parsed.error.issues[0]?.message ?? "Invalid invite payload",
        status: 400,
      });
    }

    const inviteId = await createCurrentOrganizationInvite(parsed.data);

    return Response.json({ inviteId }, { status: 201 });
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
