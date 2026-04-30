import {
  resolveAuthSession,
  sanitizeAuthContext,
  type AuthSdkSessionResponse,
} from "@anan/auth-sdk/server";
import { getOptionalSessionContext } from "@/server/auth/session";

export async function getInitialAuthSdkSession(): Promise<AuthSdkSessionResponse> {
  const resolved = await getOptionalSessionContext().catch(() => null);
  const authSession = resolved
    ? resolveAuthSession({ token: resolved.token, session: resolved.context })
    : null;

  if (!authSession) {
    return {
      authenticated: false,
      context: null,
    };
  }

  return {
    authenticated: true,
    context: sanitizeAuthContext(authSession.context),
    accessToken: authSession.token,
    expiresAtMs: null,
    scopes: authSession.context.scopes,
  };
}
