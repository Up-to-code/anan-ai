import { DomainError, toErrorResponse } from "@/server/contracts/errors";
import { updateCurrentOrganizationMemberRole } from "@/server/domains/organizations/service";

type TeamMemberRouteProps = {
  params: Promise<{ membershipId: string }>;
};

/**
 * WHY:   Organization role changes should be performed through one manager-gated gateway endpoint.
 * WHAT:  Updates the role for the target organization membership.
 * HOW:   Resolves the membership id from the route and delegates validation and persistence to the domain service.
 */
export async function PATCH(request: Request, { params }: TeamMemberRouteProps) {
  try {
    const body = await request.json();
    const { membershipId } = await params;
    await updateCurrentOrganizationMemberRole(membershipId, body);
    return new Response(null, { status: 204 });
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
