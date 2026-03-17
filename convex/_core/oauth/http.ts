import { httpAction } from "../../_generated/server";
import { internalRefs } from "../../shared_logic/lib/generatedApiRefs";
import {
  ACCESS_TOKEN_TTL_MS,
  FLOW_STATE_TTL_MS,
  REFRESH_TOKEN_TTL_MS,
  formatScopeString,
} from "./constants";
import { parseBasicAuth, randomToken, sha256Base64Url, sha256Hex } from "./crypto";
import { getJwks, getOAuthIssuer, signJwt, verifyJwt } from "./jwt";
import { parseOAuthSourceApp, resolveOAuthConsentBaseUrl } from "./consentRouting";

const oauthInternal = internalRefs["shared_logic/oauth/internal"];

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

function formValue(params: URLSearchParams, key: string) {
  const value = params.get(key);
  return value?.trim() || undefined;
}

function getRequestedSourceApp(url: URL) {
  return parseOAuthSourceApp(url.searchParams.get("app") ?? url.searchParams.get("source"));
}

function getTokenFromRequest(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    throw new Error("Missing bearer token");
  }
  return header.slice("Bearer ".length).trim();
}

function getRequestFingerprint(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

async function issueTokenSet(params: {
  clientId: string;
  userId: string;
  pairwiseSubject: string;
  scopes: string[];
  accessTokenJti: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  nonce?: string | null;
}) {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const accessToken = await signJwt({
    iss: getOAuthIssuer(),
    aud: params.clientId,
    sub: params.pairwiseSubject,
    user_id: params.userId,
    jti: params.accessTokenJti,
    scope: formatScopeString(params.scopes),
    email: params.email ?? undefined,
    name: params.name ?? undefined,
    avatar: params.image ?? undefined,
    iat: nowSeconds,
    exp: nowSeconds + Math.floor(ACCESS_TOKEN_TTL_MS / 1000),
    azp: params.clientId,
  });

  const idToken = params.scopes.includes("openid")
    ? await signJwt({
        iss: getOAuthIssuer(),
        aud: params.clientId,
        sub: params.pairwiseSubject,
        iat: nowSeconds,
        exp: nowSeconds + Math.floor(ACCESS_TOKEN_TTL_MS / 1000),
        auth_time: nowSeconds,
        nonce: params.nonce ?? undefined,
        email: params.scopes.includes("email") ? params.email ?? undefined : undefined,
        email_verified: params.scopes.includes("email") ? Boolean(params.email) : undefined,
        name: params.scopes.includes("profile") ? params.name ?? undefined : undefined,
        picture: params.scopes.includes("profile") ? params.image ?? undefined : undefined,
      })
    : undefined;

  return { accessToken, idToken };
}

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
  const contentType = request.headers.get("content-type") ?? "";
  const body =
    contentType.includes("application/x-www-form-urlencoded")
      ? await request.text()
      : new URLSearchParams(await request.text()).toString();
  const params = new URLSearchParams(body);
  const basic = parseBasicAuth(request.headers.get("authorization"));
  const clientId = basic?.clientId ?? formValue(params, "client_id");
  const clientSecret = basic?.clientSecret ?? formValue(params, "client_secret");
  const grantType = formValue(params, "grant_type");

  if (!clientId || !grantType) {
    return jsonResponse({ error: "invalid_request" }, 400);
  }

  const clientSecretHash = clientSecret ? await sha256Hex(clientSecret) : undefined;

  try {
    await ctx.runMutation(oauthInternal.enforceOAuthRateLimit, {
      key: `oauth:token:${getRequestFingerprint(request)}:${clientId}`,
    });
    if (grantType === "authorization_code") {
      const code = formValue(params, "code");
      const redirectUri = formValue(params, "redirect_uri");
      const codeVerifier = formValue(params, "code_verifier");
      if (!code || !redirectUri || !codeVerifier) {
        return jsonResponse({ error: "invalid_request" }, 400);
      }

      const refreshToken = randomToken(32);
      const refreshFamilyId = randomToken(16);
      const accessTokenJti = randomToken(16);
      const exchange = await ctx.runMutation(oauthInternal.exchangeAuthorizationCode, {
        clientId,
        clientSecretHash,
        codeHash: await sha256Hex(code),
        redirectUri,
        codeVerifierChallenge: await sha256Base64Url(codeVerifier),
        accessTokenJti,
        accessTokenExpiresAt: Date.now() + ACCESS_TOKEN_TTL_MS,
        refreshTokenHash: await sha256Hex(refreshToken),
        refreshTokenExpiresAt: Date.now() + REFRESH_TOKEN_TTL_MS,
        refreshFamilyId,
        sessionId: undefined,
        now: Date.now(),
      });
      const tokens = await issueTokenSet({
        clientId,
        userId: String(exchange.userId),
        pairwiseSubject: exchange.pairwiseSubject,
        scopes: exchange.scopes,
        accessTokenJti,
        email: exchange.user.email ?? null,
        name: exchange.user.name ?? exchange.user.displayName ?? exchange.profile?.name ?? null,
        image: exchange.user.image ?? null,
        nonce: exchange.nonce,
      });

      return jsonResponse({
        access_token: tokens.accessToken,
        token_type: "Bearer",
        expires_in: Math.floor(ACCESS_TOKEN_TTL_MS / 1000),
        refresh_token: exchange.scopes.includes("offline_access") ? refreshToken : undefined,
        scope: formatScopeString(exchange.scopes),
        id_token: tokens.idToken,
      });
    }

    if (grantType === "refresh_token") {
      const refreshToken = formValue(params, "refresh_token");
      if (!refreshToken) {
        return jsonResponse({ error: "invalid_request" }, 400);
      }

      const nextRefreshToken = randomToken(32);
      const accessTokenJti = randomToken(16);
      const rotated = await ctx.runMutation(oauthInternal.rotateRefreshToken, {
        clientId,
        clientSecretHash,
        refreshTokenHash: await sha256Hex(refreshToken),
        accessTokenJti,
        accessTokenExpiresAt: Date.now() + ACCESS_TOKEN_TTL_MS,
        nextRefreshTokenHash: await sha256Hex(nextRefreshToken),
        nextRefreshTokenExpiresAt: Date.now() + REFRESH_TOKEN_TTL_MS,
        now: Date.now(),
      }) as
        | { replayDetected: true }
        | {
            replayDetected?: false;
            userId: string;
            pairwiseSubject: string;
            scopes: string[];
            user: {
              email?: string | null;
              name?: string | null;
              displayName?: string | null;
              image?: string | null;
            };
            profile?: {
              name?: string | null;
            } | null;
          };

      if (rotated.replayDetected) {
        return jsonResponse({ error: "invalid_grant", error_description: "Refresh token replay detected" }, 400);
      }

      const tokens = await issueTokenSet({
        clientId,
        userId: String(rotated.userId),
        pairwiseSubject: rotated.pairwiseSubject,
        scopes: rotated.scopes,
        accessTokenJti,
        email: rotated.user.email ?? null,
        name: rotated.user.name ?? rotated.user.displayName ?? rotated.profile?.name ?? null,
        image: rotated.user.image ?? null,
      });

      return jsonResponse({
        access_token: tokens.accessToken,
        token_type: "Bearer",
        expires_in: Math.floor(ACCESS_TOKEN_TTL_MS / 1000),
        refresh_token: nextRefreshToken,
        scope: formatScopeString(rotated.scopes),
        id_token: tokens.idToken,
      });
    }

    return jsonResponse({ error: "unsupported_grant_type" }, 400);
  } catch (error) {
    return jsonResponse({ error: "invalid_grant", error_description: (error as Error).message }, 400);
  }
});

/**
 * WHY:   OIDC clients need a scoped identity endpoint separate from token introspection.
 * WHAT:  Returns the current user's identity claims for a valid bearer token.
 * HOW:   Verifies the JWT, resolves the server-side token record, updates last-used timestamps, and filters claims by scope.
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
    const scopes = new Set(context.accessToken.scopes);
    return jsonResponse({
      sub: context.pairwiseSubject,
      ...(scopes.has("profile")
        ? {
            name: context.user.name ?? context.user.displayName ?? context.profile?.name ?? undefined,
            picture: context.user.image ?? undefined,
          }
        : {}),
      ...(scopes.has("email")
        ? {
            email: context.user.email ?? undefined,
            email_verified: Boolean(context.user.emailVerificationTime),
          }
        : {}),
    });
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

/**
 * WHY:   OAuth clients need machine-readable metadata for dynamic configuration.
 * WHAT:  Returns OAuth and OpenID discovery metadata for the Anan authorization server.
 * HOW:   Derives all endpoint URLs from the configured issuer to avoid mismatched hostnames.
 */
export const handleMetadata = httpAction(async () => {
  const issuer = getOAuthIssuer();
  return jsonResponse({
    issuer,
    authorization_endpoint: `${issuer}/authorize`,
    token_endpoint: `${issuer}/token`,
    userinfo_endpoint: `${issuer}/userinfo`,
    revocation_endpoint: `${issuer}/revoke`,
    jwks_uri: `${issuer}/jwks.json`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    subject_types_supported: ["pairwise"],
    id_token_signing_alg_values_supported: ["RS256"],
    token_endpoint_auth_methods_supported: ["none", "client_secret_basic"],
    scopes_supported: [
      "openid",
      "profile",
      "email",
      "offline_access",
      "clients:read",
      "clients:create",
      "clients:update_own",
      "clients:read_own",
      "properties:read",
      "properties:create_own",
      "properties:update_own",
      "properties:delete_own",
      "properties:read_own",
    ],
    code_challenge_methods_supported: ["S256"],
  });
});

/**
 * WHY:   JWT consumers need a public key set to validate Anan-issued tokens.
 * WHAT:  Returns the configured JWKS document.
 * HOW:   Reads the JSON value from environment through the JWT helper.
 */
export const handleJwks = httpAction(async () => jsonResponse(getJwks()));

/**
 * WHY:   Delegated scope enforcement needs real resource APIs, not only token issuance.
 * WHAT:  Lists or creates CRM clients under bearer-token scope checks.
 * HOW:   Verifies the bearer token, resolves delegated access, and uses shared OAuth resource handlers.
 */
export const handleDelegatedClients = httpAction(async (ctx, request) => {
  try {
    const token = getTokenFromRequest(request);
    const claims = await verifyJwt(token);
    const context = await ctx.runQuery(oauthInternal.getAccessTokenContext, {
      clientId: String(claims.aud),
      jti: String(claims.jti),
    });
    await ctx.runMutation(oauthInternal.touchAccessToken, {
      jti: String(claims.jti),
      now: Date.now(),
    });

    if (request.method === "GET") {
      if (!context.accessToken.scopes.includes("clients:read_own") && !context.accessToken.scopes.includes("clients:read")) {
        return jsonResponse({ error: "insufficient_scope" }, 403);
      }
      const clients = await ctx.runQuery(oauthInternal.listDelegatedClients, {
        authUserId: String(context.accessToken.userId),
      });
      return jsonResponse({ clients });
    }

    if (request.method === "POST") {
      if (!context.accessToken.scopes.includes("clients:create")) {
        return jsonResponse({ error: "insufficient_scope" }, 403);
      }
      const body = await request.json();
      const created = await ctx.runMutation(oauthInternal.createDelegatedClient, {
        authUserId: String(context.accessToken.userId),
        brokerId: context.profile?.brokerId,
        REDId: context.profile?.REDId,
        sourceClientId: String(claims.aud),
        name: String(body.name ?? ""),
        phone: typeof body.phone === "string" ? body.phone : undefined,
        email: typeof body.email === "string" ? body.email : undefined,
        notes: typeof body.notes === "string" ? body.notes : undefined,
        now: Date.now(),
      });
      return jsonResponse({ client: created }, 201);
    }

    return new Response(null, { status: 405 });
  } catch (error) {
    return jsonResponse({ error: "invalid_token", error_description: (error as Error).message }, 401);
  }
});

/**
 * WHY:   Delegated ownership scopes should protect real property data paths as well.
 * WHAT:  Lists or creates properties owned by the bearer token's broker/RED context.
 * HOW:   Verifies the token, enforces property scopes, and writes only draft records tied to the delegated owner.
 */
export const handleDelegatedProperties = httpAction(async (ctx, request) => {
  try {
    const token = getTokenFromRequest(request);
    const claims = await verifyJwt(token);
    const context = await ctx.runQuery(oauthInternal.getAccessTokenContext, {
      clientId: String(claims.aud),
      jti: String(claims.jti),
    });
    await ctx.runMutation(oauthInternal.touchAccessToken, {
      jti: String(claims.jti),
      now: Date.now(),
    });

    if (request.method === "GET") {
      if (!context.accessToken.scopes.includes("properties:read_own") && !context.accessToken.scopes.includes("properties:read")) {
        return jsonResponse({ error: "insufficient_scope" }, 403);
      }
      const properties = await ctx.runQuery(oauthInternal.listDelegatedProperties, {
        brokerId: context.profile?.brokerId,
        REDId: context.profile?.REDId,
      });
      return jsonResponse({ properties });
    }

    if (request.method === "POST") {
      if (!context.accessToken.scopes.includes("properties:create_own")) {
        return jsonResponse({ error: "insufficient_scope" }, 403);
      }
      const body = await request.json();
      const property = await ctx.runMutation(oauthInternal.createDelegatedProperty, {
        brokerId: context.profile?.brokerId,
        REDId: context.profile?.REDId,
        title: String(body.title ?? ""),
        address: String(body.address ?? ""),
        price: Number(body.price ?? 0),
        beds: Number(body.beds ?? 0),
        baths: Number(body.baths ?? 0),
        description: String(body.description ?? ""),
        area: typeof body.area === "string" ? body.area : undefined,
        location: typeof body.location === "string" ? body.location : undefined,
      });
      return jsonResponse({ property }, 201);
    }

    return new Response(null, { status: 405 });
  } catch (error) {
    return jsonResponse({ error: "invalid_token", error_description: (error as Error).message }, 401);
  }
});
