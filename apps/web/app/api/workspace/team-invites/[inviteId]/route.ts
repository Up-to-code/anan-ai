import { cancelCurrentOrganizationInvite } from "@/server/domains/organizations/service";
import { toErrorResponse } from "@/server/contracts/errors";

type TeamInviteRouteProps = {
  params: Promise<{ inviteId: string }>;
};

/**
 * WHY:   Invite management needs a dedicated cancel endpoint that does not expose owner ids to the client.
 * WHAT:  Cancels a pending invite for the current organization.
 * HOW:   Resolves the route param and delegates to the organizations domain service.
 */
export async function DELETE(_request: Request, { params }: TeamInviteRouteProps) {
  try {
    const { inviteId } = await params;
    await cancelCurrentOrganizationInvite(inviteId);
    return new Response(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
