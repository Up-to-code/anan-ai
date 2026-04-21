import { httpAction } from "../../_generated/server";
import { FLOW_STATE_TTL_MS } from "./constants";
import { resolveOAuthConsentBaseUrl } from "./consentRouting";
import { parseBasicAuth, sha256Hex } from "./crypto";
import { verifyJwt } from "./jwt";
import {
  formValue,
  getOauthInternal,
  getRequestFingerprint,
  getRequestedSourceApp,
  getTokenFromRequest,
  jsonResponse,
} from "./httpShared";
import {
  handleAuthorizationCodeGrant,
  handleRefreshTokenGrant,
  parseTokenRequest,
} from "./httpTokenHandlers";

const oauthInternal = getOauthInternal();

/**
 * WHY:   OAuth authorization must begin with a stable redirect into the Anan consent experience.
 * WHAT:  Validates the incoming request, persists short-lived flow state, and redirects to the web consent page.
 * HOW:   Delegates client validation to an internal query, stores the flow row, then redirects with only the flow id.
 */
export const handleAuthorize = httpAction(async (ctx, request) => {
  const url = new URL(request.url);
  const clientId = url.searchParams.get("client_id")?.trim();
  const redirectUri = url.searchParams.get("redirect_uri")?.trim();
  const responseType = url.searchParams.get("response_type")?.trim();
  const state = url.searchParams.get("state")?.trim();
  const codeChallenge = url.searchParams.get("code_challenge")?.trim();
  const codeChallengeMethod = url.searchParams.get("code_challenge_method")?.trim();

  if (!clientId || !redirectUri || !state || responseType !== "code" || !codeChallenge || codeChallengeMethod !== "S256") {
    return jsonResponse({ error: "invalid_request" }, 400);
  }

  try {
    await ctx.runMutation(oauthInternal.enforceOAuthRateLimit, {
      key: `oauth:authorize:${getRequestFingerprint(request)}:${clientId}`,
    });
    const validated = await ctx.runQuery(oauthInternal.validateAuthorizationRequest, {
      clientId,
      redirectUri,
      scope: url.searchParams.get("scope") ?? undefined,
      state,
      nonce: url.searchParams.get("nonce") ?? undefined,
      codeChallenge,
      codeChallengeMethod: "S256",
    });
    const sourceApp = getRequestedSourceApp(url) ?? "web";
    const flow = await ctx.runMutation(oauthInternal.createAuthorizationFlow, {
      ...validated,
      sourceApp,
      expiresAt: Date.now() + FLOW_STATE_TTL_MS,
      now: Date.now(),
    });
    const consentUrl = new URL("/oauth/authorize", resolveOAuthConsentBaseUrl(request, sourceApp));
    consentUrl.searchParams.set("flow", String(flow.flowId));
    return Response.redirect(consentUrl.toString(), 302);
  } catch (error) {
    return jsonResponse({ error: "invalid_request", error_description: (error as Error).message }, 400);
  }
});

/**
 * WHY:   Partner apps need standards-style token exchange and refresh behavior.
 * WHAT:  Supports authorization-code and refresh-token grants for registered Anan clients.
 * HOW:   Parses form-encoded requests, validates client auth and PKCE, and persists server-side token state.
 */
export const handleToken = httpAction(async (ctx, request) => {
  const parsed = await parseTokenRequest(request);
  if (!parsed.clientId || !parsed.grantType) {
    return jsonResponse({ error: "invalid_request" }, 400);
  }

  try {
    await ctx.runMutation(oauthInternal.enforceOAuthRateLimit, {
      key: `oauth:token:${getRequestFingerprint(request)}:${parsed.clientId}`,
    });

    if (parsed.grantType === "authorization_code") {
      return handleAuthorizationCodeGrant(ctx, {
        ...parsed,
        clientId: parsed.clientId,
        grantType: "authorization_code",
      });
    }

    if (parsed.grantType === "refresh_token") {
      return handleRefreshTokenGrant(ctx, {
        ...parsed,
        clientId: parsed.clientId,
        grantType: "refresh_token",
      });
    }

    return jsonResponse({ error: "unsupported_grant_type" }, 400);
  } catch (error) {
    return jsonResponse({ error: "invalid_grant", error_description: (error as Error).message }, 400);
  }
});

/**
 * WHY:   The legacy `/userinfo` route must fail safely now that OAuth grants belong to organizations, not user identities.
 * WHAT:  Rejects valid org-owned bearer tokens with `insufficient_scope` rather than exposing user claims.
 * HOW:   Verifies the JWT, touches token usage for audit purposes, then returns a scoped denial response.
 */
export const handleUserInfo = httpAction(async (ctx, request) => {
  try {
    await ctx.runMutation(oauthInternal.enforceOAuthRateLimit, {
      key: `oauth:userinfo:${getRequestFingerprint(request)}`,
    });
    const token = getTokenFromRequest(request);
    const claims = await verifyJwt(token);
    const clientId = String(claims.aud);
    const jti = String(claims.jti);
    const context = await ctx.runQuery(oauthInternal.getAccessTokenContext, {
      clientId,
      jti,
    });
    await ctx.runMutation(oauthInternal.touchAccessToken, {
      jti,
      now: Date.now(),
    });
    return jsonResponse({ error: "insufficient_scope" }, 403);
  } catch (error) {
    return jsonResponse({ error: "invalid_token", error_description: (error as Error).message }, 401);
  }
});

/**
 * WHY:   OAuth clients and users need a standard way to revoke long-lived refresh access.
 * WHAT:  Revokes a refresh-token family for the current client.
 * HOW:   Hashes the submitted token, validates client auth, and delegates revocation to shared OAuth storage logic.
 */
export const handleRevoke = httpAction(async (ctx, request) => {
  const params = new URLSearchParams(await request.text());
  const basic = parseBasicAuth(request.headers.get("authorization"));
  const clientId = basic?.clientId ?? formValue(params, "client_id");
  const clientSecret = basic?.clientSecret ?? formValue(params, "client_secret");
  const token = formValue(params, "token");
  if (!clientId || !token) {
    return jsonResponse({ error: "invalid_request" }, 400);
  }

  await ctx.runMutation(oauthInternal.enforceOAuthRateLimit, {
    key: `oauth:revoke:${getRequestFingerprint(request)}:${clientId}`,
  });

  await ctx.runMutation(oauthInternal.revokeRefreshTokenFamily, {
    clientId,
    clientSecretHash: clientSecret ? await sha256Hex(clientSecret) : undefined,
    refreshTokenHash: await sha256Hex(token),
    now: Date.now(),
  });
  return new Response(null, { status: 200 });
});
