import { toErrorResponse } from "@/server/contracts/errors";
import { cancelIncomingOrganizationInvite } from "@/server/domains/organizations/service";

type IncomingInviteRouteProps = {
  params: Promise<{ inviteId: string }>;
};

/**
 * WHY:   Invite recipients need a decline path that stays behind the web gateway.
 * WHAT:  Cancels one pending incoming organization invite for the current user.
 * HOW:   Resolves the route param and delegates to the organizations domain service.
 */
export async function DELETE(_request: Request, { params }: IncomingInviteRouteProps) {
  try {
    const { inviteId } = await params;
    await cancelIncomingOrganizationInvite(inviteId);
    return new Response(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
