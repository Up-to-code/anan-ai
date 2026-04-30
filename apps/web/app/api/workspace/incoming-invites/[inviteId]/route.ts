import { deletedResponse, handleRoute } from "@anan/web-foundation/api";
import { cancelIncomingOrganizationInvite } from "@/server/domains/auth/organizations/service";

type IncomingInviteRouteProps = {
  params: Promise<{ inviteId: string }>;
};

/**
 * WHY:   Invite recipients need a decline path that stays behind the web gateway.
 * WHAT:  Cancels one pending incoming organization invite for the current user.
 * HOW:   Resolves the route param and delegates to the organizations domain service.
 */
export async function DELETE(_request: Request, { params }: IncomingInviteRouteProps) {
  return handleRoute(async () => {
    const { inviteId } = await params;
    await cancelIncomingOrganizationInvite(inviteId);
    return deletedResponse(null);
  });
}
