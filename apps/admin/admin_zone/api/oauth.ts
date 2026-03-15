import { requireAdminPageSession } from "@/lib/serverSession";
import type { OAuthApprovalResult, OAuthAuthorizationPrompt } from "@/server/contracts/oauth";
import { convexOAuthRepository } from "@/server/infrastructure/convex/oauthRepository";

/**
 * WHY:   Admin OAuth consent screens need a single loader that enforces admin identity and loads the flow prompt.
 * WHAT:  Returns the admin session plus the OAuth authorization prompt for the provided flow id.
 * HOW:   Resolves the admin session with a flow-aware returnTo, then delegates to the OAuth repository.
 */
export async function getOAuthAuthorizePageData(flowId: string): Promise<{
  session: Awaited<ReturnType<typeof requireAdminPageSession>>;
  preview: OAuthAuthorizationPrompt;
}> {
  const returnTo = `/oauth/authorize?flow=${encodeURIComponent(flowId)}`;
  const session = await requireAdminPageSession(returnTo);
  const preview = await convexOAuthRepository.getAuthorizationPrompt(session.token, flowId);

  return { session, preview };
}

/**
 * WHY:   Admin consent actions should reuse the same approval path as other OAuth clients.
 * WHAT:  Approves the OAuth authorization flow for the current admin session.
 * HOW:   Resolves the admin session with the flow-aware returnTo, then calls the OAuth repository.
 */
export async function approveOAuthAuthorization(flowId: string): Promise<OAuthApprovalResult> {
  const returnTo = `/oauth/authorize?flow=${encodeURIComponent(flowId)}`;
  const session = await requireAdminPageSession(returnTo);
  return convexOAuthRepository.approveAuthorization(session.token, flowId);
}
